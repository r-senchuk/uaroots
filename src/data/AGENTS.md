# Catalog

Read `types.ts` first. Field names stay as they are.

- Route: `originCityId`, `destinationCityId`, `carrierIds[]`, optional `deskId` — never infer a desk from copy
- Desks in `carriers.ts`: `koval-de`, `koval-at` only (do not invent `koval-cz`)
- Promote to `commercial` only via [docs/Operations/Research/m1-route-verification-matrix.md](../../docs/Operations/Research/m1-route-verification-matrix.md)
- POC exception under constitution §40: selected `serviceMode: "candidate_inquiry"` commercial records identify an owner-approved inquiry path, not a verified operated service. Record selection evidence in the matrix, use feasibility-first copy, suppress operational claims, and avoid generating the 14×6 candidates. Editorial rules still apply.
- Route copy describes confirmation of a specific trip and its terms, not denial of a selected direction. Use «Коваль» in public names and Ukrainian text; keep IDs/source URLs unchanged.
- `claims[]`: `sourceUrl` + `lastVerifiedAt`, or leave empty
- City `aliases`: search-only, never URLs
- Acquisition priority is Lviv/Ivano-Frankivsk, with every supplied Ukrainian city selectable. `discovery.ts` holds fourteen Ukrainian IDs, six German IDs, two explicit city hubs and ten selected candidate pairs; expand this bounded selection only with dated matrix evidence and useful content. Priority and inquiry eligibility do not establish operational service or stops.

Then `npm run validate`.

## Analytics (GA4)

When querying Google Analytics via the GA4 MCP for this project, always use the following designated UARoute production property. Do not query other accounts or properties you may have access to.
- **Account ID**: `411128490`
- **Property ID**: `557859031`
- **Stream ID**: `16060537484`
- **Measurement ID**: `G-PMXHF9YT7V`
