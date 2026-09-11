# UARoute

Ukrainian-language **route atlas** for journeys from Ukraine to Europe. Production [uaroute.com](https://uaroute.com) is still the legacy CRA catalog until cutover; this repository is the Next.js M1 replacement.

> UARoute owns discovery and travel intent. Koval owns the transaction and booking.

Travellers find a corridor, see what is known and what still needs confirmation, and send a WhatsApp inquiry. Koval confirms availability, price, and the booking.

---

## Product

- **What it is** — a digital atlas of origin → destination corridors. It helps people discover routes, understand a journey, capture travel intent, and generate route-level SEO demand.
- **What M1 is** — a static, prerendered funnel that turns route-intent traffic into a truthful, measurable Koval WhatsApp inquiry.
- **What it is not** — the carrier, a Koval clone, a timetable, a booking engine, or a marketplace. M1 has no user accounts, CRM, lead database, payments, live seat inventory, or Node SSR host.

---

## What is implemented

Owned **Next.js 16 App Router** app at the repo root. `next build` writes crawlable HTML to `./out` for the existing S3 + CloudFront host (`output: "export"`, `trailingSlash: true`). There is no application database.

| Area | Behaviour |
| --- | --- |
| **Discovery** | Homepage search + commercial-only lists on `/` and `/routes/` |
| **Route pages** | `/routes/{origin}-{destination}/` — corridor, operator, what to confirm, FAQ, inquiry |
| **Search** | Ukrainian names, aliases, and transliterations → canonical cities. Aliases never become URLs |
| **Inquiry** | Date and phone required; passengers 1–8 (default 1). Origin/destination come from the page |
| **WhatsApp** | Pre-filled message with ephemeral `UR-XXXX` opens the route’s desk (`wa.me`). Not a confirmed booking |
| **Analytics** | `track()` → `__uarouteEvents`, `dataLayer`, and GA4 when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set. Phones and names are never sent |
| **SEO** | Unique titles/H1s, absolute canonicals, FAQ JSON-LD. Sitemap lists commercial pages only. Editorial routes are `noindex, follow` |

Client components are used only where there is UI state (search, inquiry, header, click tracking).

### Catalog (data, not invented facts)

Facts live in `src/data/` (`types.ts`, `cities.ts`, `routes.ts`, `carriers.ts`). Do not add prices, ratings, timetables, durations, or availability.

| Slug | Status | Desk |
| --- | --- | --- |
| `lviv-hannover` | `commercial` — indexed, listed, sitemapped | `koval-de` (Іван, `380509786330`) |
| `lviv-hamburg` | `editorial` — page exists, `noindex` | `koval-de` |
| `lviv-berlin` | `editorial` — page exists, `noindex` | `koval-de` |

Homepage search only navigates `commercial` routes (`findRouteByCities(..., { commercialOnly: true })`). Editorial city pairs show the PRD empty state. Austrian desk `koval-at` is in carrier data for later AT routes; it is not a Hannover CTA. Sourced Koval `claims[]` (matrix 2026-09-11) appear on partner cards.

### Public URLs

- Product: `/`, `/routes/`, `/routes/[slug]/`, `/about/`
- Legacy HTML redirects (meta refresh + `location.replace`): `/contact/` and `/contacts/` → `/about/`; `/carriers/` → `/routes/`; `/packages/` → `/about/`; `/gallery/` → `/`
- Generated: `/sitemap.xml`, `/robots.txt`

Static export cannot emit HTTP 301s. Real 301s belong on CloudFront at deploy time — see [CUTOVER.md](CUTOVER.md).

---

## Documentation

Treat the docs as a hierarchy. A lower-level file must not silently override a higher one. If they conflict, stop and resolve the conflict before a consequential change.

### Foundation

- [Project Constitution](docs/00-project-constitution.md)
- [Product Strategy](docs/01-product-strategy.md)

### Product

- [M1 PRD](docs/02-prd-milestone-1.md)
- [UX & Information Architecture](docs/03-ux-and-information-architecture.md)
- [Visual Design System](docs/04-visual-design-system.md)

### Content / Data

- [Content & SEO Strategy](docs/05-content-and-seo-strategy.md)
- [Data Model & Content Governance](docs/06-data-model-and-content-governance.md)

### Conversion / Technical

- [Koval Integration & Conversion](docs/07-koval-integration-and-conversion.md)
- [Analytics & Attribution](docs/08-analytics-and-attribution.md)
- [Technical Architecture](docs/09-technical-architecture.md)
- [Cutover & SEO Migration](docs/10-cutover-and-seo-migration.md)

### Research

- [Koval Site Audit](docs/research/koval-site-audit.md)
- [Legacy UARoute Audit](docs/research/legacy-uaroute-audit.md)
- [M1 route verification matrix](docs/research/m1-route-verification-matrix.md)

### Execution

- [ADR 0001 — Next.js static export](docs/decisions/0001-nextjs-static-export.md)
- [M1 implementation checklist](docs/m1-implementation-checklist.md)
- [CUTOVER.md](CUTOVER.md) — deploy and legacy URL map
- [AGENTS.md](AGENTS.md) — instructions for Cursor, Codex, OpenCode, and other coding agents (skills in `.agents/skills/`)

---

## Architecture at a glance

```text
Search / Social / Direct
          ↓
       UARoute
          ↓
 Route discovery / intent
          ↓
 WhatsApp inquiry
          ↓
        Koval
          ↓
 Booking / transaction
```

Typed route data in `src/data/` drives pages, search, desks, sitemap, and analytics context. The inquiry payload is assembled in the browser and sent by the user through WhatsApp. Koval site links carry UTM parameters (`src/config/site.ts`); WhatsApp messages do not.

---

## Stack

- Next.js 16 App Router, TypeScript, React 19
- Tailwind CSS v4 (`src/app/globals.css`); IBM Plex Sans/Mono and Playfair Display via `next/font`
- Static export: `output: "export"`, `trailingSlash: true`, `images.unoptimized: true`
- Catalog: `src/data/`
- Inquiry: `src/lib/whatsapp.ts`
- SEO helpers: `src/lib/seo.ts`
- Analytics façade: `src/lib/analytics.ts`
- Catalog check: `src/lib/validate-catalog.ts` (Vitest + `sitemap.ts` at build)
- Tests: Vitest (`src/data/queries.test.ts`, `src/lib/whatsapp.test.ts`, `src/lib/validate-catalog.test.ts`)
- Lint: `eslint .` (Next.js 16 no longer ships `next lint`)
- Quality gate: `npm run check` (typecheck, lint, test, validate, build, inspect `./out`)
- Deploy: `scripts/deploy.sh` (hashed assets first, revalidate HTML/RSC `.txt`, CloudFront invalidation)

---

## Repository map

| Path | Role |
| --- | --- |
| `src/app/` | App Router pages, layout, `sitemap.ts`, `robots.ts`, `globals.css` |
| `src/components/` | Product UI; `src/components/brand/` for atlas graphics |
| `src/data/` | Cities, routes, carriers, queries |
| `src/lib/` | WhatsApp inquiry, SEO, analytics, catalog validation, `cn` |
| `legacy/` | Frozen CRA rollback of the live site |
| `src/config/site.ts` | Domain, absolute URLs, UTM for partner links |
| `docs/` | Product, architecture, and research source of truth |

Do not add Lovable packages, `__lovableEvents`, or a shadcn `components/ui` dump.

---

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
npm test
npm run lint
npm run typecheck
npm run check        # typecheck, lint, test, validate, build, inspect ./out
npm start            # serve ./out (same files S3 would get)
make deploy          # npm run check && ./scripts/deploy.sh
```

Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` (see `.env.example`) before a production build if GA4 should receive `track()` events.

Local `make deploy` and GitHub Actions on `main` both call `scripts/deploy.sh`. Required for upload:

- AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`)
- `CLOUDFRONT_DISTRIBUTION_ID`

The script matches Next.js 16 production caching on S3: hashed `/_next/static` is immutable; HTML and RSC `.txt` payloads always revalidate; new chunks upload before HTML; CloudFront `/*` is invalidated. Push to `main` runs the same path after CI; pull requests only run `npm run check`.

After UI changes, verify home search, a route inquiry, and `/about/` in the browser, and check view-source for the Ukrainian H1 on a route page.

---

## Constraints

- User-facing copy is Ukrainian.
- Do not invent prices, ratings, timetables, durations, stop lists, or availability. Unknown facts are omitted or listed under “what to confirm”.
- Only `commercial` routes belong in the public index and sitemap.
- Do not store names, phones, or travel dates. Do not put phones in URLs or analytics.
- Do not hard-code Koval into generic route components; routes reference `carrierIds[]` and `deskId`.
