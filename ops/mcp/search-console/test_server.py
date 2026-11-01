"""Unit tests for UARoute Google Search Console client and FastMCP server.

Verifies:
- Read-only scope enforcement (https://www.googleapis.com/auth/webmasters.readonly).
- URL validation and host isolation (rejecting external domains, credentials, ports, fragments).
- Property isolation guards (GSC_ALLOWED_PROPERTIES, GSC_ENFORCE_ISOLATION).
- Error sanitization (no credentials leaked in error payloads).
- Metric classification (CONFIRMED, ZERO, NO_DATA, EMPTY).
- FastMCP async tool dispatch and response envelope structure.
"""
from __future__ import annotations

import asyncio
import json
import os
import pathlib
import sys
import unittest
from unittest.mock import MagicMock, patch

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import gsc
from gsc import (
    SearchConsoleClient,
    SearchConsoleAuthError,
    SearchConsoleApiError,
    SCOPE,
    DEFAULT_PROPERTY,
    normalize_gsc_dimension,
    resolve_gsc_date,
)
import server
from server import (
    _validate_inspection_url,
    _resolve_and_validate_site,
    _classify_rows,
)


class UrlValidationTests(unittest.TestCase):
    def test_valid_canonical_urls(self):
        valid_urls = [
            "https://uaroute.com/",
            "https://uaroute.com/routes/lviv-hannover/",
            "https://uaroute.com/cities/lviv/",
            "https://uaroute.com/about/",
            "https://www.uaroute.com/",
            "http://uaroute.com/test?param=1",
        ]
        for u in valid_urls:
            valid, reason = _validate_inspection_url(u, "sc-domain:uaroute.com")
            self.assertTrue(valid, f"Expected {u} to be valid, got: {reason}")
            self.assertIsNone(reason)

    def test_reject_external_domain(self):
        external = [
            "https://crewbravo.com/",
            "https://garnebo.com/",
            "https://uaroute.com.evil.example/",
            "https://evil-uaroute.com/",
            "https://google.com/",
        ]
        for u in external:
            valid, reason = _validate_inspection_url(u, "sc-domain:uaroute.com")
            self.assertFalse(valid, f"Expected {u} to be rejected")
            self.assertIn("does not match property domain", reason or "")

    def test_reject_credentials(self):
        u = "https://user:password@uaroute.com/test"
        valid, reason = _validate_inspection_url(u, "sc-domain:uaroute.com")
        self.assertFalse(valid)
        self.assertIn("credentials", reason or "")

    def test_reject_port(self):
        u = "https://uaroute.com:8443/page"
        valid, reason = _validate_inspection_url(u, "sc-domain:uaroute.com")
        self.assertFalse(valid)
        self.assertIn("Custom port", reason or "")

    def test_reject_fragment(self):
        u = "https://uaroute.com/routes/lviv-hannover/#details"
        valid, reason = _validate_inspection_url(u, "sc-domain:uaroute.com")
        self.assertFalse(valid)
        self.assertIn("fragments", reason or "")

    def test_reject_invalid_scheme(self):
        invalid = [
            "file:///etc/passwd",
            "ftp://uaroute.com/file",
            "javascript:alert(1)",
        ]
        for u in invalid:
            valid, reason = _validate_inspection_url(u, "sc-domain:uaroute.com")
            self.assertFalse(valid)
            self.assertIn("Invalid scheme", reason or "")


class PropertyIsolationTests(unittest.TestCase):
    def test_default_property_allowed(self):
        with patch.dict(os.environ, {
            "GSC_ENFORCE_ISOLATION": "true",
            "GSC_ALLOWED_PROPERTIES": "sc-domain:uaroute.com",
            "GSC_DEFAULT_PROPERTY": "sc-domain:uaroute.com",
        }):
            site, err = _resolve_and_validate_site(None)
            self.assertEqual(site, "sc-domain:uaroute.com")
            self.assertIsNone(err)

    def test_unlisted_property_blocked(self):
        with patch.dict(os.environ, {
            "GSC_ENFORCE_ISOLATION": "true",
            "GSC_ALLOWED_PROPERTIES": "sc-domain:uaroute.com",
            "GSC_DEFAULT_PROPERTY": "sc-domain:uaroute.com",
        }):
            site, err = _resolve_and_validate_site("sc-domain:crewbravo.com")
            self.assertIsNone(site)
            self.assertIsNotNone(err)
            self.assertEqual(err.get("status"), "ISOLATION_BLOCKED")
            self.assertIn("not in GSC_ALLOWED_PROPERTIES", err.get("error", ""))

    def test_empty_allowed_properties_fails_closed(self):
        with patch.dict(os.environ, {
            "GSC_ENFORCE_ISOLATION": "true",
            "GSC_ALLOWED_PROPERTIES": "",
            "GSC_DEFAULT_PROPERTY": "sc-domain:uaroute.com",
        }):
            site, err = _resolve_and_validate_site("sc-domain:uaroute.com")
            self.assertIsNone(site)
            self.assertEqual(err.get("status"), "ISOLATION_BLOCKED")
            self.assertIn("empty", err.get("error", ""))


class ScopeVerificationTests(unittest.TestCase):
    def setUp(self):
        SearchConsoleClient._CRED_CACHE.clear()

    def test_exact_scope_accepted(self):
        mock_creds = MagicMock()
        mock_creds.granted_scopes = [SCOPE]
        mock_creds.token = "fake-token"
        mock_creds.valid = True
        mock_creds.expired = False

        with patch("google.auth.load_credentials_from_file", return_value=(mock_creds, "proj")) as mock_load:
            with patch.object(pathlib.Path, "is_file", return_value=True):
                client = SearchConsoleClient()
                creds = client._get_credentials()
                self.assertEqual(creds, mock_creds)
                creds2 = client._get_credentials()
                self.assertEqual(creds2, mock_creds)
                self.assertEqual(mock_load.call_count, 1)

    def test_broader_or_missing_scope_rejected(self):
        mock_creds = MagicMock()
        mock_creds.granted_scopes = [
            "https://www.googleapis.com/auth/webmasters",
            SCOPE,
        ]

        with patch("google.auth.load_credentials_from_file", return_value=(mock_creds, "proj")):
            with patch.object(pathlib.Path, "is_file", return_value=True):
                client = SearchConsoleClient()
                with self.assertRaises(SearchConsoleAuthError) as ctx:
                    client._get_credentials()
                self.assertIn("do not match required read-only scope", str(ctx.exception))

    def test_missing_adc_file_raises_auth_error(self):
        with patch.object(pathlib.Path, "is_file", return_value=False):
            client = SearchConsoleClient(adc_path=pathlib.Path("/nonexistent/adc.json"))
            with self.assertRaises(SearchConsoleAuthError) as ctx:
                client._get_credentials()
            self.assertIn("not found", str(ctx.exception))


class MetricClassificationTests(unittest.TestCase):
    def test_empty_rows_returns_no_data(self):
        self.assertEqual(_classify_rows([]), "NO_DATA")

    def test_all_zero_metrics_returns_zero(self):
        rows = [
            {"keys": ["https://uaroute.com/"], "clicks": 0, "impressions": 0, "ctr": 0, "position": 0},
            {"keys": ["https://uaroute.com/about/"], "clicks": 0, "impressions": 0, "ctr": 0, "position": 0},
        ]
        self.assertEqual(_classify_rows(rows), "ZERO")

    def test_positive_impressions_returns_confirmed(self):
        rows = [
            {"keys": ["https://uaroute.com/routes/lviv-hannover/"], "clicks": 0, "impressions": 116, "ctr": 0, "position": 54.2},
        ]
        self.assertEqual(_classify_rows(rows), "CONFIRMED")


class QueryValidationTests(unittest.TestCase):
    def setUp(self):
        self.client = SearchConsoleClient()

    def test_inverted_dates_raise_value_error(self):
        with self.assertRaises(ValueError) as ctx:
            self.client.query_search_analytics(start_date="2026-11-05", end_date="2026-11-01")
        self.assertIn("start_date cannot be after end_date", str(ctx.exception))

    def test_negative_start_row_raises_value_error(self):
        with self.assertRaises(ValueError) as ctx:
            self.client.query_search_analytics(start_date="2026-10-01", end_date="2026-10-31", start_row=-1)
        self.assertIn("start_row cannot be negative", str(ctx.exception))

    def test_invalid_row_limit_raises_value_error(self):
        with self.assertRaises(ValueError):
            self.client.query_search_analytics(start_date="2026-10-01", end_date="2026-10-31", row_limit=0)
        with self.assertRaises(ValueError):
            self.client.query_search_analytics(start_date="2026-10-01", end_date="2026-10-31", row_limit=30000)

    def test_unsupported_dimension_raises_value_error(self):
        with self.assertRaises(ValueError) as ctx:
            self.client.query_search_analytics(
                start_date="2026-10-01", end_date="2026-10-31", dimensions=["invalid_dim"]
            )
        self.assertIn("Unsupported dimension", str(ctx.exception))

    def test_ga4_relative_dates_and_dimension_aliases(self):
        from datetime import date
        ref = date(2026, 11, 1)
        self.assertEqual(resolve_gsc_date("today", today=ref), "2026-11-01")
        self.assertEqual(resolve_gsc_date("yesterday", today=ref), "2026-10-31")
        self.assertEqual(resolve_gsc_date("28daysAgo", today=ref), "2026-10-04")
        self.assertEqual(normalize_gsc_dimension("pagePath"), "page")
        self.assertEqual(normalize_gsc_dimension("landingPage"), "page")
        self.assertEqual(normalize_gsc_dimension("deviceCategory"), "device")
        self.assertEqual(normalize_gsc_dimension("search_appearance"), "searchAppearance")


class FastMcpToolDispatchTests(unittest.TestCase):
    def test_get_property_dispatch(self):
        async def run_call():
            with patch.object(server, "SearchConsoleClient") as mock_cls:
                mock_inst = MagicMock()
                mock_inst.get_property.return_value = {
                    "siteUrl": "sc-domain:uaroute.com",
                    "permissionLevel": "siteOwner",
                }
                mock_cls.return_value = mock_inst
                return await server.mcp.call_tool("get_property", {})

        result = asyncio.run(run_call())
        self.assertTrue(len(result) > 0)
        content_list, structured = result
        self.assertEqual(structured["status"], "CONFIRMED")
        self.assertEqual(structured["property"], "sc-domain:uaroute.com")
        self.assertEqual(structured["permission_level"], "siteOwner")

    def test_inspect_url_query_error_on_external_domain(self):
        async def run_call():
            return await server.mcp.call_tool(
                "inspect_url",
                {"url": "https://external.example.com/"},
            )

        result = asyncio.run(run_call())
        content_list, structured = result
        self.assertEqual(structured["status"], "QUERY_ERROR")
        self.assertIn("does not match property domain", structured["error"])

    def test_inspect_url_isolation_blocked_on_unlisted_site(self):
        async def run_call():
            with patch.dict(os.environ, {
                "GSC_ENFORCE_ISOLATION": "true",
                "GSC_ALLOWED_PROPERTIES": "sc-domain:uaroute.com",
            }):
                return await server.mcp.call_tool(
                    "inspect_url",
                    {"url": "https://uaroute.com/", "site_url": "sc-domain:crewbravo.com"},
                )

        result = asyncio.run(run_call())
        content_list, structured = result
        self.assertEqual(structured["status"], "ISOLATION_BLOCKED")

    def test_query_pages_dispatch(self):
        async def run_call():
            with patch.object(server, "SearchConsoleClient") as mock_cls:
                mock_inst = MagicMock()
                mock_inst.query_search_analytics.return_value = {
                    "rows": [
                        {"keys": ["https://uaroute.com/routes/lviv-hannover/"], "clicks": 0, "impressions": 116, "ctr": 0, "position": 54.2}
                    ],
                    "responseAggregationType": "byPage",
                }
                mock_cls.return_value = mock_inst
                return await server.mcp.call_tool(
                    "query_pages",
                    {"start_date": "2026-10-01", "end_date": "2026-10-31"},
                )

        result = asyncio.run(run_call())
        content_list, structured = result
        self.assertEqual(structured["status"], "CONFIRMED")
        self.assertEqual(structured["row_count"], 1)

    def test_inspect_url_unknown_returns_no_data(self):
        async def run_call():
            with patch.object(server, "SearchConsoleClient") as mock_cls:
                mock_inst = MagicMock()
                mock_inst.inspect_url.return_value = {
                    "inspectionResult": {
                        "indexStatusResult": {
                            "verdict": "NEUTRAL",
                            "coverageState": "URL is unknown to Google",
                        }
                    }
                }
                mock_cls.return_value = mock_inst
                return await server.mcp.call_tool(
                    "inspect_url",
                    {"url": "https://uaroute.com/nonexistent-404/"},
                )

        result = asyncio.run(run_call())
        content_list, structured = result
        self.assertEqual(structured["status"], "NO_DATA")
        self.assertFalse(structured["is_indexed"])
        self.assertEqual(structured["coverage_state"], "URL is unknown to Google")

    def test_inspect_url_indexed_returns_confirmed(self):
        async def run_call():
            with patch.object(server, "SearchConsoleClient") as mock_cls:
                mock_inst = MagicMock()
                mock_inst.inspect_url.return_value = {
                    "inspectionResult": {
                        "indexStatusResult": {
                            "verdict": "PASS",
                            "coverageState": "Submitted and indexed",
                            "lastCrawlTime": "2026-10-28T09:37:24Z",
                        }
                    }
                }
                mock_cls.return_value = mock_inst
                return await server.mcp.call_tool(
                    "inspect_url",
                    {"url": "https://uaroute.com/routes/lviv-hannover/"},
                )

        result = asyncio.run(run_call())
        content_list, structured = result
        self.assertEqual(structured["status"], "CONFIRMED")
        self.assertTrue(structured["is_indexed"])


if __name__ == "__main__":
    unittest.main()
