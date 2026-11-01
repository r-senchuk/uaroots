"""Read-only, property-isolated Google Search Console FastMCP server for UARoute.

Provides programmatic inspection and search analytics for UARoute
(sc-domain:uaroute.com). Enforces read-only scope and fail-closed isolation.
"""
from __future__ import annotations

from datetime import date
import os
import pathlib
import sys
from typing import Any
from urllib.parse import urlsplit

_HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(_HERE))

from gsc import (
    SearchConsoleClient,
    SearchConsoleAuthError,
    SearchConsoleApiError,
    ALLOWED_DIMENSIONS,
    ALLOWED_SEARCH_TYPES,
    DEFAULT_PROPERTY,
    normalize_gsc_dimension,
    resolve_gsc_date,
)
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("uaroute-search-console")


def _get_isolation_config() -> tuple[bool, set[str], str]:
    enforce = os.environ.get("GSC_ENFORCE_ISOLATION", "true").lower() in ("true", "1", "yes")
    allowed_raw = os.environ.get("GSC_ALLOWED_PROPERTIES", DEFAULT_PROPERTY).strip()
    allowed = {p.strip() for p in allowed_raw.split(",") if p.strip()} if allowed_raw else set()
    default_prop = os.environ.get("GSC_DEFAULT_PROPERTY", DEFAULT_PROPERTY).strip() or DEFAULT_PROPERTY
    return enforce, allowed, default_prop


def _resolve_and_validate_site(site_url: str | None) -> tuple[str | None, dict[str, Any] | None]:
    enforce, allowed, default_prop = _get_isolation_config()
    target = (site_url or default_prop).strip()

    if enforce:
        if not allowed:
            return None, {
                "status": "ISOLATION_BLOCKED",
                "error": "Property isolation is enabled but GSC_ALLOWED_PROPERTIES is empty.",
            }
        if target not in allowed:
            return None, {
                "status": "ISOLATION_BLOCKED",
                "site_url": target,
                "allowed_properties": sorted(allowed),
                "error": f"Target property '{target}' is not in GSC_ALLOWED_PROPERTIES.",
            }

    return target, None


def _validate_inspection_url(url: str, site_property: str) -> tuple[bool, str | None]:
    """Validate that the URL belongs to the allowed site origin and has no unsafe parts."""
    try:
        parts = urlsplit(url)
    except Exception as exc:
        return False, f"Malformed URL: {exc}"

    if parts.scheme not in ("http", "https"):
        return False, f"Invalid scheme '{parts.scheme}'. Only http and https are permitted."

    if parts.username or parts.password:
        return False, "URL credentials (user:pass) are not permitted."

    if parts.port:
        return False, f"Custom port '{parts.port}' is not permitted."

    if parts.fragment:
        return False, "URL fragments (#...) are not permitted in inspection targets."

    hostname = (parts.hostname or "").lower()
    if not hostname:
        return False, "URL must contain a valid hostname."

    # Extract base domain from site property
    if site_property.startswith("sc-domain:"):
        domain = site_property[len("sc-domain:"):].lower()
        valid_hosts = {domain, f"www.{domain}"}
    else:
        try:
            site_parts = urlsplit(site_property)
            domain = (site_parts.hostname or "").lower()
            valid_hosts = {domain} if domain else set()
        except Exception:
            valid_hosts = set()

    if hostname not in valid_hosts:
        return False, f"Host '{hostname}' does not match property domain '{domain}'."

    return True, None


def _classify_rows(rows: list[dict[str, Any]]) -> str:
    if not rows:
        return "NO_DATA"
    metric_keys = ("clicks", "impressions", "ctr", "position")
    has_nonzero = False
    for r in rows:
        for k in metric_keys:
            val = r.get(k)
            if val is not None and val > 0:
                has_nonzero = True
                break
        if has_nonzero:
            break
    return "CONFIRMED" if has_nonzero else "ZERO"


def _handle_exception(exc: Exception) -> dict[str, Any]:
    if isinstance(exc, SearchConsoleAuthError):
        return {"status": "AUTH_REQUIRED", "error": str(exc)}
    if isinstance(exc, SearchConsoleApiError):
        return {
            "status": "API_ERROR",
            "http_status": exc.status_code,
            "error": str(exc),
        }
    if isinstance(exc, ValueError):
        return {"status": "QUERY_ERROR", "error": str(exc)}
    return {"status": "API_ERROR", "error_type": type(exc).__name__, "error": str(exc)}


# ==============================================================================
# Read-Only Inspection Tools
# ==============================================================================

@mcp.tool(annotations={"readOnlyHint": True, "destructiveHint": False})
def get_property(site_url: str | None = None) -> dict[str, Any]:
    """Verify access and permission level for the pinned UARoute Search Console property.

    Args:
        site_url: Property identifier (defaults to GSC_DEFAULT_PROPERTY / sc-domain:uaroute.com).
    """
    site, err = _resolve_and_validate_site(site_url)
    if err:
        return err

    try:
        client = SearchConsoleClient()
        data = client.get_property(site)
        return {
            "status": "CONFIRMED",
            "property": site,
            "permission_level": data.get("permissionLevel"),
            "data": data,
        }
    except Exception as exc:
        return _handle_exception(exc)


@mcp.tool(annotations={"readOnlyHint": True, "destructiveHint": False})
def list_sitemaps(site_url: str | None = None) -> dict[str, Any]:
    """Read submitted sitemaps, download status, submitted URL counts, and errors.

    Args:
        site_url: Property identifier (defaults to GSC_DEFAULT_PROPERTY).
    """
    site, err = _resolve_and_validate_site(site_url)
    if err:
        return err

    try:
        client = SearchConsoleClient()
        sitemaps = client.list_sitemaps(site)
        status = "CONFIRMED" if sitemaps else "EMPTY"
        return {
            "status": status,
            "property": site,
            "count": len(sitemaps),
            "sitemaps": sitemaps,
        }
    except Exception as exc:
        return _handle_exception(exc)


@mcp.tool(annotations={"readOnlyHint": True, "destructiveHint": False})
def inspect_url(url: str, site_url: str | None = None) -> dict[str, Any]:
    """Read Google's stored index status for a canonical route (does not request indexing or crawl).

    Args:
        url: The absolute canonical URL to inspect (e.g. 'https://uaroute.com/routes/lviv-hannover/').
        site_url: Property identifier (defaults to GSC_DEFAULT_PROPERTY).
    """
    site, err = _resolve_and_validate_site(site_url)
    if err:
        return err

    valid, reason = _validate_inspection_url(url, site)
    if not valid:
        return {
            "status": "QUERY_ERROR",
            "url": url,
            "property": site,
            "error": reason,
        }

    try:
        client = SearchConsoleClient()
        data = client.inspect_url(url=url, site_url=site)
        result = data.get("inspectionResult", {})
        idx_status = result.get("indexStatusResult", {})

        verdict = idx_status.get("verdict")
        coverage_state = idx_status.get("coverageState")
        last_crawl_time = idx_status.get("lastCrawlTime")
        is_unknown = (
            coverage_state == "URL is unknown to Google"
            or (not last_crawl_time and verdict in (None, "NEUTRAL", "VERDICT_UNSPECIFIED"))
        )
        status = "NO_DATA" if is_unknown else "CONFIRMED"

        return {
            "status": status,
            "property": site,
            "url": url,
            "is_indexed": verdict == "PASS",
            "verdict": verdict,
            "coverage_state": coverage_state,
            "last_crawl_time": last_crawl_time,
            "page_fetch_state": idx_status.get("pageFetchState"),
            "google_canonical": idx_status.get("googleCanonical"),
            "indexing_state": idx_status.get("indexingState"),
            "referring_urls": idx_status.get("referringUrls", []),
            "inspection_result_link": result.get("inspectionResultLink"),
            "raw_result": data,
        }
    except Exception as exc:
        return _handle_exception(exc)


@mcp.tool(annotations={"readOnlyHint": True, "destructiveHint": False})
def query_search_analytics(
    start_date: str,
    end_date: str,
    dimensions: list[str] | None = None,
    search_type: str = "web",
    start_row: int = 0,
    row_limit: int = 1000,
    page_filter: str | None = None,
    query_filter: str | None = None,
    site_url: str | None = None,
) -> dict[str, Any]:
    """Query Search Analytics metrics (clicks, impressions, ctr, position) with dimension filtering.

    Args:
        start_date: Start date in YYYY-MM-DD or GA4 relative format ('today', 'yesterday', '28daysAgo').
        end_date: End date in YYYY-MM-DD or GA4 relative format ('today', 'yesterday', '28daysAgo').
        dimensions: List of dimensions from ('page', 'query', 'country', 'device', 'date', 'searchAppearance') or GA4 aliases ('pagePath', 'landingPage', 'deviceCategory').
        search_type: Search type from ('web', 'image', 'video', 'news', 'discover').
        start_row: Pagination 0-based offset.
        row_limit: Maximum rows to return (1-25000).
        page_filter: Substring filter for page URL.
        query_filter: Substring filter for query text.
        site_url: Property identifier (defaults to GSC_DEFAULT_PROPERTY).
    """
    site, err = _resolve_and_validate_site(site_url)
    if err:
        return err

    filters = []
    if page_filter:
        filters.append({"dimension": "page", "operator": "contains", "expression": page_filter})
    if query_filter:
        filters.append({"dimension": "query", "operator": "contains", "expression": query_filter})

    try:
        resolved_start = resolve_gsc_date(start_date)
        resolved_end = resolve_gsc_date(end_date)
        norm_dims = [normalize_gsc_dimension(d) for d in (dimensions or ["page"])]
        client = SearchConsoleClient()
        data = client.query_search_analytics(
            start_date=resolved_start,
            end_date=resolved_end,
            dimensions=norm_dims,
            search_type=search_type,
            start_row=start_row,
            row_limit=row_limit,
            dimension_filters=filters or None,
            site_url=site,
        )
        rows = data.get("rows", [])
        status = _classify_rows(rows)
        return {
            "status": status,
            "property": site,
            "start_date": resolved_start,
            "end_date": resolved_end,
            "dimensions": norm_dims,
            "row_count": len(rows),
            "rows": rows,
            "response_aggregation_type": data.get("responseAggregationType"),
        }
    except Exception as exc:
        return _handle_exception(exc)


@mcp.tool(annotations={"readOnlyHint": True, "destructiveHint": False})
def query_pages(
    start_date: str,
    end_date: str,
    start_row: int = 0,
    row_limit: int = 1000,
    site_url: str | None = None,
) -> dict[str, Any]:
    """Convenience alias for query_search_analytics with dimensions=['page'].

    Args:
        start_date: Start date in YYYY-MM-DD format.
        end_date: End date in YYYY-MM-DD format.
        start_row: Pagination 0-based offset.
        row_limit: Maximum rows to return (1-25000).
        site_url: Property identifier (defaults to GSC_DEFAULT_PROPERTY).
    """
    return query_search_analytics(
        start_date=start_date,
        end_date=end_date,
        dimensions=["page"],
        start_row=start_row,
        row_limit=row_limit,
        site_url=site_url,
    )


if __name__ == "__main__":
    mcp.run(transport="stdio")
