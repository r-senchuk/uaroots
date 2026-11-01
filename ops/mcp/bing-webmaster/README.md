# UARoute direct Bing reporting MCP

Configured locally on 2026-11-01. Connection: `uaroute-bing` in the site's `.codex/config.toml`. The existing global `bing-webmaster` API-key registration and other sites were not changed. No commit, push, deployment or scheduled monitoring is authorized by this setup task.

## Scope and authentication

- Registered Bing property: `https://uaroute.com/`, verified through OAuth GetUserSites.
- Canonical public origin: `https://uaroute.com`; HTTP and HTTPS www homepage requests resolve to the HTTPS apex homepage.
- Page reporting accepts the canonical HTTPS apex only. The www redirect is verified, but Bing API inspection under that alias has not been established, so www page arguments remain rejected rather than silently rewritten.
- Dedicated app: UARoute Bing MCP. Microsoft documents `Webmaster.read`; the actual authorization endpoint rejected that capitalization and accepted `webmaster.read`. Its token response used the scope label `Read`. Only those read representations are accepted. No manage permission was requested.
- OAuth is account-wide read access; the server and tool surface enforce UARoute-only reporting. The credential itself is not a site-specific permission grant.
- Client secret and refresh token reside in macOS Keychain, service `uaroute-bing-mcp`, account `oauth`. Access tokens stay in process memory. Credentials are passed to the Keychain helper through stdin, never command arguments. Config contains no secrets.
- The upstream OAuth flow is handled by this STDIO server. Codex's `auth_status: unsupported` describes client-managed MCP OAuth, not a failed Bing authorization.

## Runtime and lifecycle

Uses the existing `/Users/roman/.local/pipx/venvs/analytics-mcp/bin/python` runtime and FastMCP dependency. The shared implementation was inspected but not reused unchanged because it uses an account-wide API key, exposes writes, and does not provide the required read-only OAuth boundary. This implementation uses Python's standard HTTP/JSON libraries and the existing FastMCP runtime; Keychain uses Apple's built-in Swift/Security framework.

The project registration launches source from `/Users/roman/src/github.com/r-senchuk/uaroots/ops/mcp/bing-webmaster/server.py` (promoted from the initial managed worktree setup and re-verified in the canonical repository). The checked-in configuration fragment is a local-machine example, not a portable deployment claim.

Recovery: the original project configuration is preserved locally in `output/bing-mcp-2026-11-01/project-config-before.toml` with mode 600. Restore only the `uaroute-bing` section if reverting; preserve subsequent unrelated edits. Global registration/Keychain API-key entries were not touched.

## Read tools

The server exposes 17 dedicated read-only tools across indexing, crawl diagnostics, traffic analytics, backlinks, crawl settings, and keyword search demand:

- **Core & Crawl Diagnostics**: `get_user_sites`, `get_feeds`, `get_crawl_stats`, `get_crawl_issues`, `get_crawl_settings`, `get_blocked_urls`.
- **Search Performance**: `get_rank_and_traffic_stats`, `get_query_stats`, `get_query_traffic_stats`, `get_page_stats`, `get_url_info`, `get_url_traffic_info`, `get_page_query_stats`.
- **Links & Backlinks**: `get_link_counts`, `get_url_links`.
- **Search Demand & Quotas**: `get_keyword_stats` (weekly Bing impression volumes with auto BCP-47 culture normalization for `uk-UA`, `de-DE`, etc.), `get_url_submission_quota`.

The same 17 tools form the explicit client allowlist. The transport separately permits only their fixed JSON REST methods. There is no arbitrary-method/URL tool or write/submission tool. GetUserSites strips unrelated properties and ownership verification codes.

Responses identify property, requested page, retrieval timestamp, method, returned record period, row count, and upstream truncation uncertainty. Empty traffic rows are not zero traffic; empty issues and explicit all-zero records have separate states. No local date filter or pagination is claimed. Stored URL info is not a fresh crawl. GetFeedDetails is not exposed: the published sitemap is a flat URL set with no child sitemaps, and that optional method has not been verified.

## Setup, reconnect and revocation

The approved OAuth client is already registered. For reconnecting a revoked/expired grant, run `auth.py setup` using the runtime above and visit `http://uaroute-bing.localhost:8766/authorize` in Chrome. The callback is exactly `http://uaroute-bing.localhost:8766/oauth/callback`, served by a loopback-only listener with Host/path/state validation, one-use state and a ten-minute absolute lifetime. Chrome's dotted localhost resolution was tested; the system resolver does not resolve this name, so do not substitute a different callback or route codes through production.

If the client has not been stored, `/setup` provides a local form to put the approved client ID/secret into Keychain. It does not print the credentials. Never grant new access without action-time owner approval. Tokens refresh automatically; invalid/revoked permissions fail without repeated deterministic retries. Transient API failures receive at most one retry. External redirects are refused.

To revoke, use the Bing account's app-access controls for UARoute Bing MCP, and remove only the named Keychain entry if desired. Removing the project registration alone does not revoke Microsoft's grant. Credential deletion/client deletion requires its own approval. Existing Garnebo and shared API-key access are separate.

## Verification

```sh
/Users/roman/.local/pipx/venvs/analytics-mcp/bin/python -m unittest discover -s ops/mcp/bing-webmaster -p 'test_*.py' -v
/Users/roman/.local/pipx/venvs/analytics-mcp/bin/python ops/mcp/bing-webmaster/verify_mcp.py
```

Twelve offline/security tests pass, including a disposable loopback slow-request deadline test, site/alias isolation, write restrictions, callback replay/expiry, token refresh/revocation, scope validation, error sanitization and missing-vs-zero responses. A fresh MCP process initialized, discovered exactly nine read tools, and retrieved the verified property, sitemap and stored homepage information. All nine reporting methods also succeeded live through OAuth. Independent read-only source review accepted the final authentication/isolation/configuration after two findings were fixed.

Sanitized local receipts: `output/bing-mcp-2026-11-01/oauth-live.json` and `mcp-client-verification.json`. After the owner restarted the connection, this desktop chat discovered and successfully dispatched all nine dedicated tools. Portable evidence: `ops/evidence/bing-desktop-dispatch-2026-11-01.json`.

On 2026-11-01 Bing returned one successful sitemap with 22 discovered URLs, no traffic/query/page/crawl-history rows, and an empty crawl-issue list. Stored homepage data was available, with LastCrawledDate 2026-10-12; this is not live recrawl evidence.

Sources: [Microsoft OAuth](https://learn.microsoft.com/en-us/bingwebmaster/oauth2), [JSON REST protocols](https://learn.microsoft.com/en-us/bingwebmaster/api-protocols), [Codex MCP configuration](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).
