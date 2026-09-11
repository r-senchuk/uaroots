# M1 implementation checklist

Mapped to [PRD §38–39](02-prd-milestone-1.md) and the owned Next.js 16 tree. Status as of 2026-09-11.

Legend: **done** / **partial** / **missing**. Production uaroute.com is still CRA until `make deploy` of `./out`.

## Product

| Item | Status | Location |
| --- | --- | --- |
| Homepage explains UARoute | done | `src/app/page.tsx` |
| Route search | done | `src/components/RouteSearch.tsx` |
| Aliases | done | `src/data/cities.ts` |
| Commercial index | done | `listResolvedRoutes("commercial")` on `/` and `/routes/` |
| Flagship route content | done | `src/app/routes/[slug]/page.tsx` |
| Inquiry widget | done | `BookingWidget` + `InquiryProvider` |

## Inquiry

| Item | Status |
| --- | --- |
| Date + phone required | done (HTML + `validateInquiry`) |
| Past date blocked in JS | done |
| Passengers 1–8 default 1 | done |
| Origin/destination from route | done |
| Desk from `deskId` | done (`koval-de`) |
| WhatsApp template + lead code | done |
| Trailing slash on page URL in message | done |
| PartnerCard WhatsApp | website + sourced claims; inquiry widget owns WhatsApp |

## Integrity

| Item | Status |
| --- | --- |
| No prices/ratings/timetables in data | done |
| Sourced Koval `claims[]` | done (`src/data/carriers.ts`, matrix 2026-09-11) |
| Editorial not in sitemap | done |
| Search does not treat editorial as bookable | done (`commercialOnly`) |
| Empty-state copy per PRD | done |
| 404 with commercial alternatives | done |

## Analytics / SEO / cutover

| Item | Status |
| --- | --- |
| `track()` events | done |
| GA4 optional env | done (`.env.example`) |
| Metadata, canonicals, JSON-LD | done |
| Sitemap from commercial data | done |
| HTML redirects for legacy paths | done |
| CloudFront 301s | deploy-time — document only |
| Domain validation at build | done (`validateCatalog` in sitemap + tests) |
| Lint | done (`eslint .`; Next 16 has no `next lint`) |
| Leftover CRA under `src/` | done (none remaining; `legacy/` only) |
| `Route Planner Pro/` | gitignored |
| View-source / browser QA | done 2026-09-11 (home search miss, flagship H1 HTML, inquiry fields, `/about/`, `/contact/` → `/about/`) |

## Mobile / a11y

Sticky CTA, labels, combobox keyboard: **done** (verified in browser 2026-09-11).

## Implementation queue (closed 2026-09-11)

Items above marked done were applied in the owned Next.js app. Re-verify in the browser after UI changes.
