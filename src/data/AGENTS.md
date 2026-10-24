# Catalog

Read `types.ts` first. Field names stay as they are.

- Route: `originCityId`, `destinationCityId`, `carrierIds[]`, optional `deskId` — never infer a desk from copy
- Desks in `carriers.ts`: `koval-de`, `koval-at` only (do not invent `koval-cz`)
- Promote to `commercial` only via dated selection evidence; see [KB guide](../../docs/knowledge-base.md#knowledge-base). The external matrix is unavailable in this checkout; do not reconstruct it
- POC exception under constitution §40: selected `serviceMode: "candidate_inquiry"` commercial records identify an owner-approved inquiry path, not a verified operated service. Record selection evidence in the matrix, use feasibility-first copy, suppress operational claims, and avoid generating the 14×6 candidates. Editorial rules still apply.
- Route copy describes confirmation of a specific trip and its terms, not denial of a selected direction. Use neutral «перевізник» in public names and Ukrainian text; omit surnames/branding. Preserve IDs, contacts, source/referral URLs and classifications; no additional connected carriers are implied.
- `claims[]`: `sourceUrl` + `lastVerifiedAt`, or leave empty
- City `aliases`: search-only, never URLs
- Acquisition priority is Lviv/Ivano-Frankivsk. Preserve fourteen Ukrainian and six German candidate IDs; discovery additionally includes commercial endpoints (seven German cities including Hannover). There are four hubs and eleven published candidate-inquiry pairs. Existing Celle → Stryi page is preserved per owner clarification 2026-10-23 and current canonical catalog/tests. This does not establish operated service or authorize additional pairs. New publication requires dated selection evidence; never reconstruct the missing matrix.


Then `npm run validate`.

## Analytics (GA4)

When querying Google Analytics via the GA4 MCP for this project, always use the following designated UARoute production property. Do not query other accounts or properties you may have access to.
- **Account ID**: `411128490`
- **Property ID**: `557859031`
- **Stream ID**: `16060537484`
- **Measurement ID**: `G-PMXHF9YT7V`

## Google Ads (Production)

Verified production advertising configuration under MCC:
- **Manager Account (MCC)**: `127-345-5194` (Crew Bravo)
- **Advertiser Account (CID)**: `525-602-4115` (UARoute)
- **Status**: `ENABLED`
- **Currency & Time Zone**: `PLN` / `Europe/Warsaw`
- **Manager Link ID**: `6682389034` (`ACTIVE`)
- **Billing Setup ID**: `8647326357` (`APPROVED`)
- **Google Tag Destination**: Connected to live `G-PMXHF9YT7V` / `GT-WF8DFBPC`
- **Live Spend**: Observed `0.00 PLN` (0 active campaigns). Campaigns default to `PAUSED` and require explicit owner launch authorization.
- **Direct GA4 Link**: `properties/557859031/googleAdsLinks/16154598951` to `525-602-4115` (`adsPersonalizationEnabled: false`).
- **Conversion Tracking**: Configured and verified in client `525-602-4115`: actions `whatsapp_click` (`7854727825`) and `koval_site_click` (`7854727828`) are `ENABLED`, `CONTACT`, Secondary (`primary_for_goal: false`), default value `0.0` (no monetary value), `ONE_PER_CLICK`, `always_use_default_value: true` (read-only observation2026-10-24). Current mutable settings and dated evidence are in [the state register](../../ops/agent-state.json); do not infer immutability from one API error. Client-side browser checks verified outgoing payloads only; Google delivery/attribution and operator receipt remain unverified.

