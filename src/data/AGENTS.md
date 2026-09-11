# Catalog

Read `types.ts` first. Field names stay as they are.

- Route: `originCityId`, `destinationCityId`, `carrierIds[]`, optional `deskId` — never infer a desk from copy
- Desks in `carriers.ts`: `koval-de`, `koval-at` only (do not invent `koval-cz`)
- Promote to `commercial` only via [docs/research/m1-route-verification-matrix.md](../../docs/research/m1-route-verification-matrix.md)
- `claims[]`: `sourceUrl` + `lastVerifiedAt`, or leave empty
- City `aliases`: search-only, never URLs

Then `npm run validate`.
