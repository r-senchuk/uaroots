# Google Search Console MCP Server (`uaroute-search-console`)

FastMCP server providing read-only, property-isolated access to Google Search Console for UARoute (`sc-domain:uaroute.com`).

## Overview

- **Server Name:** `uaroute-search-console`
- **Location:** `ops/mcp/search-console/server.py`
- **Launcher:** `~/.local/bin/uaroute-search-console-mcp` (permissions `0700`)
- **CLI Client:** `ops/mcp/search-console/gsc.py`
- **Credential Path:** `~/.config/google-analytics/ga4-admin-mcp-adc.json` (reusing existing local Google OAuth Application Default Credentials)
- **Scope Enforcement:** Strictly verifies `granted_scopes == {"https://www.googleapis.com/auth/webmasters.readonly"}` before every call. Fails closed with `AUTH_REQUIRED` if the token has wider, write, or missing scopes.
- **Fail-Closed Isolation:** Defaults `GSC_ENFORCE_ISOLATION="true"` and restricts access to `GSC_ALLOWED_PROPERTIES="sc-domain:uaroute.com"`. Any call targeting an unlisted property returns `ISOLATION_BLOCKED` before network dispatch.
- **URL & Host Guardrails:** Target URLs in `inspect_url` must be `http` or `https`, belong to `uaroute.com` or `www.uaroute.com`, and have no credentials (`user:pass`), custom ports, or `#fragment` identifiers.
- **Traceback & Token Sanitization:** Error handlers sever exception tracebacks (`raise ... from None`) and ensure OAuth bearer tokens or local credential paths never appear in stdout, stderr, or structured payloads.
- **Status Envelopes:** Returns canonical tokens (`CONFIRMED`, `ZERO`, `NO_DATA`, `EMPTY`, `QUERY_ERROR`, `AUTH_REQUIRED`, `ISOLATION_BLOCKED`, `API_ERROR`).

## Exposed MCP Tools (`readOnlyHint: True`)

| Tool | Parameters | Description |
|---|---|---|
| `get_property` | `site_url?` | Verifies access and permission level (`siteOwner`) for `sc-domain:uaroute.com`. |
| `list_sitemaps` | `site_url?` | Reads submitted sitemaps (`sitemap.xml`), download timestamps, URL counts, warnings, and errors. |
| `inspect_url` | `url`, `site_url?` | Reads Google's stored index status (`is_indexed`, `verdict`, `coverageState`, `lastCrawlTime`, `pageFetchState`, `googleCanonical`, `indexingState`, `referringUrls`). Returns `NO_DATA` when the URL is unknown to Google and `CONFIRMED` when known. |
| `query_search_analytics` | `start_date`, `end_date`, `dimensions?`, `search_type="web"`, `start_row=0`, `row_limit=1000`, `page_filter?`, `query_filter?`, `site_url?` | Queries Search Analytics across allowed dimensions (`page`, `query`, `country`, `device`, `date`, `searchAppearance`) or GA4 aliases (`pagePath`, `landingPage`, `deviceCategory`), supporting both ISO `YYYY-MM-DD` and GA4 relative dates (`today`, `yesterday`, `28daysAgo`). |
| `query_pages` | `start_date`, `end_date`, `start_row=0`, `row_limit=1000`, `site_url?` | Convenience wrapper around `query_search_analytics` with `dimensions=["page"]`. |

## CLI & Direct Usage

```bash
# Verify property access
python3 ops/mcp/search-console/gsc.py property --json

# List submitted sitemaps
python3 ops/mcp/search-console/gsc.py sitemaps --json

# Inspect live URL indexation status
python3 ops/mcp/search-console/gsc.py inspect https://uaroute.com/routes/lviv-hannover/ --json

# Query search analytics by page
python3 ops/mcp/search-console/gsc.py query 2026-10-01 2026-10-31 --dimensions page --json
```

## Running Unit Tests

```bash
/Users/roman/.local/pipx/venvs/analytics-mcp/bin/python -m unittest ops/mcp/search-console/test_server.py -v
```
