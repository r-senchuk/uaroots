#!/usr/bin/env python3
"""Google Search Console API client and CLI for UARoute.

Read-only, property-isolated access to Google Search Console for sc-domain:uaroute.com.
Uses local ADC credentials at ~/.config/google-analytics/ga4-admin-mcp-adc.json
strictly enforcing https://www.googleapis.com/auth/webmasters.readonly.
"""
from __future__ import annotations

import argparse
from datetime import date, timedelta
import json
import os
from pathlib import Path
import re
import sys
from typing import Any
from urllib.parse import quote, urlsplit

# If google.auth is not present in the current Python environment (e.g. system python),
# automatically re-execute with the dedicated analytics-mcp virtualenv if available.
ANALYTICS_VENV_PYTHON = Path.home() / ".local/pipx/venvs/analytics-mcp/bin/python"
try:
    import google.auth
    from google.auth.transport.requests import Request
    import requests
except ImportError:
    if ANALYTICS_VENV_PYTHON.is_file() and os.access(ANALYTICS_VENV_PYTHON, os.X_OK):
        venv_root = str(ANALYTICS_VENV_PYTHON.parent.parent)
        if sys.prefix != venv_root:
            os.execv(str(ANALYTICS_VENV_PYTHON), [str(ANALYTICS_VENV_PYTHON)] + sys.argv)
    raise RuntimeError(
        "Required libraries (google-auth, requests) not found and analytics-mcp venv "
        f"is missing at {ANALYTICS_VENV_PYTHON}."
    )

ADC_PATH = Path.home() / ".config/google-analytics/ga4-admin-mcp-adc.json"
SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"
DEFAULT_PROPERTY = "sc-domain:uaroute.com"
GSC_API_BASE = "https://www.googleapis.com/webmasters/v3"
INSPECTION_API_ENDPOINT = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect"

ALLOWED_DIMENSIONS = {"date", "query", "page", "country", "device", "searchAppearance"}
ALLOWED_SEARCH_TYPES = {"web", "image", "video", "news", "discover", "googleNews"}

DIMENSION_ALIASES: dict[str, str] = {
    "date": "date",
    "query": "query",
    "page": "page",
    "pagepath": "page",
    "page_path": "page",
    "landingpage": "page",
    "landing_page": "page",
    "country": "country",
    "device": "device",
    "devicecategory": "device",
    "device_category": "device",
    "searchappearance": "searchAppearance",
    "search_appearance": "searchAppearance",
}

_RELATIVE_DAYS_RE = re.compile(r"^(\d+)daysAgo$", re.IGNORECASE)


def resolve_gsc_date(value: str, today: date | None = None) -> str:
    """Resolve an ISO YYYY-MM-DD date or GA4-compatible relative date ('today', 'yesterday', '28daysAgo')."""
    raw = (value or "").strip()
    if not raw:
        raise ValueError("Date string cannot be empty")
    ref = today or date.today()
    low = raw.lower()
    if low == "today":
        return ref.isoformat()
    if low == "yesterday":
        return (ref - timedelta(days=1)).isoformat()
    m = _RELATIVE_DAYS_RE.match(raw)
    if m:
        days = int(m.group(1))
        return (ref - timedelta(days=days)).isoformat()
    try:
        return date.fromisoformat(raw).isoformat()
    except ValueError as exc:
        raise ValueError(
            f"Invalid date format '{value}': expected YYYY-MM-DD, 'today', 'yesterday', or 'NdaysAgo' ({exc})"
        ) from None


def normalize_gsc_dimension(dim: str) -> str:
    """Normalize dimension names, including common GA4 aliases (e.g. 'pagePath' -> 'page', 'deviceCategory' -> 'device')."""
    raw = (dim or "").strip()
    if raw in ALLOWED_DIMENSIONS:
        return raw
    mapped = DIMENSION_ALIASES.get(raw.lower())
    if mapped:
        return mapped
    raise ValueError(
        f"Unsupported dimension '{dim}'. Allowed: {sorted(ALLOWED_DIMENSIONS)}"
    )


class SearchConsoleAuthError(RuntimeError):
    """Raised when authentication fails or scopes do not match."""


class SearchConsoleApiError(RuntimeError):
    """Raised when an API call fails with HTTP error details."""

    def __init__(self, message: str, status_code: int | None = None, response_text: str | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.response_text = response_text


class SearchConsoleClient:
    """Read-only client for Google Search Console API with strict scope verification."""

    _CRED_CACHE: dict[tuple[str, str], Any] = {}

    def __init__(self, adc_path: Path = ADC_PATH, scope: str = SCOPE):
        self.adc_path = Path(adc_path)
        self.scope = scope

    def _get_credentials(self) -> Any:
        if not self.adc_path.is_file():
            raise SearchConsoleAuthError(
                f"ADC credential file not found at {self.adc_path}"
            )
        cache_key = (str(self.adc_path), self.scope)
        cached = self._CRED_CACHE.get(cache_key)
        if cached is not None and getattr(cached, "valid", False) and not getattr(cached, "expired", False):
            granted = set(getattr(cached, "granted_scopes", None) or [])
            if granted == {self.scope} and getattr(cached, "token", None):
                return cached

        try:
            creds, _ = google.auth.load_credentials_from_file(
                str(self.adc_path), scopes=[self.scope]
            )
            creds.refresh(Request())
        except Exception as exc:
            raise SearchConsoleAuthError(
                f"Failed to refresh Google Search Console credentials: {type(exc).__name__}"
            ) from None

        granted = set(getattr(creds, "granted_scopes", None) or [])
        if granted != {self.scope}:
            raise SearchConsoleAuthError(
                f"Granted scopes {sorted(granted)} do not match required read-only scope {self.scope}"
            )
        self._CRED_CACHE[cache_key] = creds
        return creds

    def _request(
        self,
        method: str,
        url: str,
        params: dict[str, Any] | None = None,
        json_body: dict[str, Any] | None = None,
        timeout: int = 45,
    ) -> dict[str, Any]:
        creds = self._get_credentials()
        headers = {
            "Authorization": f"Bearer {creds.token}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
        try:
            resp = requests.request(
                method,
                url,
                params=params,
                json=json_body,
                headers=headers,
                timeout=timeout,
            )
        except Exception as exc:
            raise SearchConsoleApiError(
                f"Network transport error calling Search Console API: {type(exc).__name__}"
            ) from None

        if not resp.ok:
            error_msg = f"Search Console API returned HTTP {resp.status_code}"
            raise SearchConsoleApiError(
                error_msg,
                status_code=resp.status_code,
                response_text=resp.text,
            )

        if resp.status_code == 204 or not resp.text.strip():
            return {}
        try:
            return resp.json()
        except Exception as exc:
            raise SearchConsoleApiError(
                f"Failed to parse JSON response: {type(exc).__name__}"
            ) from None

    def list_sites(self) -> list[dict[str, Any]]:
        """List all verified sites accessible under the credentials."""
        url = f"{GSC_API_BASE}/sites"
        data = self._request("GET", url)
        return data.get("siteEntry", [])

    def get_property(self, site_url: str = DEFAULT_PROPERTY) -> dict[str, Any]:
        """Get details and permission level for a specific property."""
        encoded_site = quote(site_url, safe="")
        url = f"{GSC_API_BASE}/sites/{encoded_site}"
        return self._request("GET", url)

    def list_sitemaps(self, site_url: str = DEFAULT_PROPERTY) -> list[dict[str, Any]]:
        """List submitted sitemaps for the property."""
        encoded_site = quote(site_url, safe="")
        url = f"{GSC_API_BASE}/sites/{encoded_site}/sitemaps"
        data = self._request("GET", url)
        return data.get("sitemap", [])

    def inspect_url(
        self,
        url: str,
        site_url: str = DEFAULT_PROPERTY,
        language_code: str = "en-US",
    ) -> dict[str, Any]:
        """Inspect Google's stored index status for a canonical URL."""
        body = {
            "inspectionUrl": url,
            "siteUrl": site_url,
            "languageCode": language_code,
        }
        return self._request("POST", INSPECTION_API_ENDPOINT, json_body=body)

    def query_search_analytics(
        self,
        start_date: str,
        end_date: str,
        dimensions: list[str] | None = None,
        search_type: str = "web",
        start_row: int = 0,
        row_limit: int = 1000,
        dimension_filters: list[dict[str, Any]] | None = None,
        site_url: str = DEFAULT_PROPERTY,
    ) -> dict[str, Any]:
        """Query Search Analytics metrics within a date range."""
        resolved_start = resolve_gsc_date(start_date)
        resolved_end = resolve_gsc_date(end_date)
        s_date = date.fromisoformat(resolved_start)
        e_date = date.fromisoformat(resolved_end)
        if s_date > e_date:
            raise ValueError("start_date cannot be after end_date")

        if start_row < 0:
            raise ValueError("start_row cannot be negative")
        if not 1 <= row_limit <= 25000:
            raise ValueError("row_limit must be between 1 and 25000")

        raw_dims = dimensions or ["page"]
        dims = [normalize_gsc_dimension(d) for d in raw_dims]

        if search_type not in ALLOWED_SEARCH_TYPES:
            raise ValueError(
                f"Unsupported search_type '{search_type}'. Allowed: {sorted(ALLOWED_SEARCH_TYPES)}"
            )

        encoded_site = quote(site_url, safe="")
        url = f"{GSC_API_BASE}/sites/{encoded_site}/searchAnalytics/query"

        body: dict[str, Any] = {
            "startDate": resolved_start,
            "endDate": resolved_end,
            "dimensions": dims,
            "type": search_type,
            "startRow": start_row,
            "rowLimit": row_limit,
            "dataState": "final",
        }

        if dimension_filters:
            body["dimensionFilterGroups"] = [
                {"filters": dimension_filters}
            ]

        return self._request("POST", url, json_body=body)


def main() -> None:
    common_parser = argparse.ArgumentParser(add_help=False)
    common_parser.add_argument("--json", action="store_true", help="Output machine-readable JSON")

    parser = argparse.ArgumentParser(
        parents=[common_parser],
        description="Google Search Console CLI for UARoute (read-only)."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # sites
    subparsers.add_parser("sites", parents=[common_parser], help="List all accessible properties")

    # property
    prop_parser = subparsers.add_parser("property", parents=[common_parser], help="Get property details")
    prop_parser.add_argument(
        "--site",
        default=DEFAULT_PROPERTY,
        help=f"Target GSC property (default: {DEFAULT_PROPERTY})",
    )

    # sitemaps
    sitemaps_parser = subparsers.add_parser("sitemaps", parents=[common_parser], help="List submitted sitemaps")
    sitemaps_parser.add_argument(
        "--site",
        default=DEFAULT_PROPERTY,
        help=f"Target GSC property (default: {DEFAULT_PROPERTY})",
    )

    # inspect
    inspect_parser = subparsers.add_parser("inspect", parents=[common_parser], help="Inspect stored index status for a URL")
    inspect_parser.add_argument("url", help="Absolute canonical URL to inspect")
    inspect_parser.add_argument(
        "--site",
        default=DEFAULT_PROPERTY,
        help=f"Target GSC property (default: {DEFAULT_PROPERTY})",
    )

    # query
    query_parser = subparsers.add_parser("query", parents=[common_parser], help="Query Search Analytics metrics")
    query_parser.add_argument("start_date", help="Start date (YYYY-MM-DD or '28daysAgo', 'yesterday', 'today')")
    query_parser.add_argument("end_date", help="End date (YYYY-MM-DD or 'today', 'yesterday')")
    query_parser.add_argument(
        "--dimensions",
        nargs="+",
        default=["page"],
        help="Dimensions to group by (page, query, country, device, date, searchAppearance)",
    )
    query_parser.add_argument("--search-type", default="web", help="Search type: web, image, video, news, discover")
    query_parser.add_argument("--start-row", type=int, default=0, help="Zero-based start offset")
    query_parser.add_argument("--row-limit", type=int, default=1000, help="Row limit (1-25000)")
    query_parser.add_argument("--page-filter", help="Page URL substring filter")
    query_parser.add_argument("--query-filter", help="Search query substring filter")
    query_parser.add_argument(
        "--site",
        default=DEFAULT_PROPERTY,
        help=f"Target GSC property (default: {DEFAULT_PROPERTY})",
    )

    args = parser.parse_args()
    client = SearchConsoleClient()

    if args.command == "sites":
        sites = client.list_sites()
        if args.json:
            print(json.dumps(sites, indent=2))
        else:
            print(f"Accessible properties ({len(sites)}):")
            for s in sites:
                print(f"  - {s.get('siteUrl')} (level: {s.get('permissionLevel')})")

    elif args.command == "property":
        data = client.get_property(args.site)
        if args.json:
            print(json.dumps(data, indent=2))
        else:
            print(f"Property: {data.get('siteUrl')}")
            print(f"  Permission Level: {data.get('permissionLevel')}")

    elif args.command == "sitemaps":
        sitemaps = client.list_sitemaps(args.site)
        if args.json:
            print(json.dumps(sitemaps, indent=2))
        else:
            print(f"Sitemaps for {args.site} ({len(sitemaps)}):")
            for sm in sitemaps:
                print(f"  - {sm.get('path')}")
                print(f"      Last downloaded: {sm.get('lastDownloaded')}")
                print(f"      Errors: {sm.get('errors')}, Warnings: {sm.get('warnings')}")
                contents = sm.get("contents", [])
                for c in contents:
                    print(f"      Submitted: {c.get('submitted')}, Indexed: {c.get('indexed')} ({c.get('type')})")

    elif args.command == "inspect":
        data = client.inspect_url(args.url, site_url=args.site)
        if args.json:
            print(json.dumps(data, indent=2))
        else:
            res = data.get("inspectionResult", {})
            idx = res.get("indexStatusResult", {})
            print(f"Inspection Result for {args.url}:")
            print(f"  Verdict:         {idx.get('verdict')}")
            print(f"  Coverage State:  {idx.get('coverageState')}")
            print(f"  Last Crawl:      {idx.get('lastCrawlTime')}")
            print(f"  Page Fetch:      {idx.get('pageFetchState')}")
            print(f"  Indexing State:  {idx.get('indexingState')}")
            print(f"  Google Canonical:{idx.get('googleCanonical')}")

    elif args.command == "query":
        filters = []
        if args.page_filter:
            filters.append({"dimension": "page", "operator": "contains", "expression": args.page_filter})
        if args.query_filter:
            filters.append({"dimension": "query", "operator": "contains", "expression": args.query_filter})

        data = client.query_search_analytics(
            start_date=args.start_date,
            end_date=args.end_date,
            dimensions=args.dimensions,
            search_type=args.search_type,
            start_row=args.start_row,
            row_limit=args.row_limit,
            dimension_filters=filters or None,
            site_url=args.site,
        )
        if args.json:
            print(json.dumps(data, indent=2))
        else:
            rows = data.get("rows", [])
            print(f"Search Analytics for {args.site} ({args.start_date} to {args.end_date}): {len(rows)} row(s)")
            for r in rows[:25]:
                keys = ", ".join(r.get("keys", []))
                clicks = r.get("clicks", 0)
                impr = r.get("impressions", 0)
                ctr = r.get("ctr", 0.0) * 100
                pos = r.get("position", 0.0)
                print(f"  - [{keys}]: {clicks} clicks, {impr} impr, CTR {ctr:.1f}%, pos {pos:.1f}")


if __name__ == "__main__":
    main()
