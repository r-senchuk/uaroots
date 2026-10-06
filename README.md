# UARoute

Ukrainian-language **route atlas** for journeys from Ukraine to Europe. The demand POC was published on UARoute and Koval on 2026-10-06; the live search/contact attribution path passed browser checks. Dated deployment fingerprints and limitations are in [POC status](docs/Operations/POC/poc-status.md). Operator-received inquiries and completed passenger journeys remain unverified; commercial readiness is tracked separately in the [M1 status register](docs/Operations/m1-implementation-checklist.md).

> M1: UARoute owns discovery and travel intent; Koval owns booking. M2: an operator-controlled reservation pilot is approved as the next gated development direction.

The [booking development strategy](docs/Product/13-booking-pilot-development-strategy.md), [site details](docs/Product/14-booking-pilot-site-details.md), and [ADR 0002](docs/Decisions/0002-gated-operator-booking-pilot.md) define that pilot. The booking API, live inventory, and driver login are planned, not released. Next.js static export and S3/CloudFront remain; Lambda and DynamoDB are introduced only for real reservations after operator/safety/privacy gates.

Travellers select either direction, see sourced corridor information or a labelled candidate feasibility inquiry, and contact Koval. Koval first confirms feasibility and then conditions such as date, pickup, price and seats. Completed passenger journeys are the immediate demand-test outcome, still unverified. Follow the [current next-step strategy](docs/Operations/POC/next-steps.md).

---

## Product

- **What it is** — a digital atlas of origin → destination corridors. It helps people discover routes, understand a journey, capture travel intent, and generate route-level SEO demand.
- **What M1 is** — a static, prerendered funnel that turns route-intent traffic into a truthful, measurable Koval WhatsApp inquiry.
- **What it is not** — the carrier, a Koval clone, a timetable, a booking engine, or a marketplace. M1 has no user accounts, CRM, lead database, payments, live seat inventory, or Node SSR host.

---

## Repository implementation snapshot

The feature descriptions below document the repository implementation. Production acceptance is scoped to the dated [POC evidence](docs/Operations/POC/poc-status.md); it does not establish commercial readiness. The historical implementation review is dated 2026-09-11; other readiness dimensions remain in the [M1 status register](docs/Operations/m1-implementation-checklist.md) and [First-Income Development Backlog](docs/Marketing/12-first-income-development-backlog.md).

Owned **Next.js 16 App Router** app at the repo root. `next build` writes crawlable HTML to `./out` for the existing S3 + CloudFront host (`output: "export"`, `trailingSlash: true`). There is no application database.

| Area | Behaviour |
| --- | --- |
| **Discovery** | Homepage search + commercial-only lists on `/` and `/routes/` |
| **Sharing** | Commercial route pages share the canonical route URL through native sharing or clipboard/selectable-link fallback; no traveler data |
| **Route pages** | `/routes/{origin}-{destination}/` — corridor, operator, what to confirm, FAQ, inquiry |
| **Search** | Ukrainian names, aliases, and transliterations → canonical cities. Aliases never become URLs |
| **Inquiry** | Date and phone required; passengers 1–8 (default 1). Origin/destination come from the page |
| **WhatsApp** | Pre-filled message with ephemeral random `UR-…` opens the route’s desk (`wa.me`). Not a confirmed booking |
| **Analytics** | `track()` supports `__uarouteEvents`, `dataLayer`, and optional GA4. Runtime allowlist, failure isolation and initial-source capture verified locally; external GA delivery remains unverified. See [POC status](docs/Operations/POC/poc-status.md) |
| **SEO** | Unique titles/H1s, absolute canonicals and page structured data. Visible FAQs do not claim FAQ rich results. Sitemap lists commercial pages only. Editorial routes are `noindex, follow` |

Client components are used only where there is UI state (search, inquiry, header, click tracking).

### Catalog (data, not invented facts)

Facts live in `src/data/` (`types.ts`, `cities.ts`, `routes.ts`, `carriers.ts`). Do not add prices, ratings, timetables, durations, or availability.

| Published group | Discovery / indexing eligibility | Evidence |
| --- | --- | --- |
| Existing `lviv-hannover` | Commercial sourced inquiry page, listed and in sitemap. | Catalog and route verification matrix; no live seat inventory. |
| Ten selected candidate pages | Commercial `candidate_inquiry`, explicitly feasibility-first; listed and in sitemap. | [Explicit selection](src/data/discovery.ts) and [release record](docs/Operations/POC/releases/discovery-2026-10-06.json). |
| Lviv/Ivano-Frankivsk city hubs | Useful origin/direction pages, published and in sitemap. | Same dated release record. |
| Hamburg/Berlin editorial pages | `noindex`, excluded from search navigation/index/sitemap. | Catalog/inspector rules. |

All 14 Ukrainian × 6 German city choices work in both directions: ten candidate combinations open their selected pages; 158 open inline feasibility inquiries, without generating URLs or service claims. The existing commercial-only route lookup remains. German destinations are Schwerin, Lüneburg, Lübeck, Celle, Wolfsburg and Braunschweig; Lviv/Ivano-Frankivsk take acquisition priority and Dolyna is secondary. Actual Google indexing is unverified. Carrier operational claims are suppressed on candidates; a city choice is not a scheduled stop or an operated service.

### Public URLs

- Product: `/`, `/routes/`, `/routes/[slug]/`, `/cities/lviv/`, `/cities/ivano-frankivsk/`, `/about/`, `/privacy/`, `/imprint/`
- Legacy HTML redirects (meta refresh + `location.replace`): `/contact/` and `/contacts/` → `/about/`; `/carriers/` → `/routes/`; `/packages/` → `/about/`; `/gallery/` → `/`
- Generated: `/sitemap.xml`, `/robots.txt`

Static export cannot emit HTTP 301s. Real 301s belong on CloudFront at deploy time — see [CUTOVER.md](CUTOVER.md).

---

## Documentation

`docs/` is a local, unversioned knowledge vault. Links into it require the local vault; a Git checkout does not include those documents. CI checks the repository and validates the vault only when it is present. Generated reports in `output/` are also local.

For immediate execution use [Demand POC next steps](docs/Operations/POC/next-steps.md): outcome feedback, search evidence, durable release preservation and one acquisition cohort.

Start with the [OKF bundle index](docs/index.md), [section map](docs/map.md) and [human guide](docs/README.md): they separate Marketing, Operations, Product, architectural decisions, plans and evidence. For M2, use the [domain/API contract](docs/Product/Booking/domain-and-api.md), [implementation backlog](docs/Product/Booking/implementation-backlog.md), [pilot scorecard](docs/Operations/Booking/pilot-experiment.md), and [release runbook](docs/Operations/Booking/operations-and-release.md). All M2 tasks remain open.

Treat the docs as a hierarchy. A lower-level file must not silently override a higher one. If they conflict, stop and resolve the conflict before a consequential change.

### Foundation

- [Project Constitution](docs/00-project-constitution.md)
- [Product Strategy](docs/Product/01-product-strategy.md)

### Product

- [M1 PRD](docs/Product/02-prd-milestone-1.md)
- [UX & Information Architecture](docs/Product/03-ux-and-information-architecture.md)
- [Visual Design System](docs/Product/04-visual-design-system.md)

### Content / Data

- [Content & SEO Strategy](docs/Marketing/05-content-and-seo-strategy.md)
- [Marketing Development Strategy](docs/Marketing/15-marketing-development-strategy.md) — passenger/provider audiences, messages, SEO campaigns, tools and a phased acquisition plan
- [Data Model & Content Governance](docs/Product/06-data-model-and-content-governance.md)

### Conversion / Technical

- [Koval Integration & Conversion](docs/Operations/07-koval-integration-and-conversion.md)
- [Analytics & Attribution](docs/Marketing/08-analytics-and-attribution.md)
- [Technical Architecture](docs/Product/09-technical-architecture.md)
- [Cutover & SEO Migration](docs/Operations/10-cutover-and-seo-migration.md)

### Research

- [Koval Site Audit](docs/Operations/Research/koval-site-audit.md)
- [Legacy UARoute Audit](docs/Operations/Research/legacy-uaroute-audit.md)
- [M1 route verification matrix](docs/Operations/Research/m1-route-verification-matrix.md)
- [Booking strategy investigation](docs/Product/Research/booking-pilot-strategy-review.md) — both supplied plans, Booksy lessons, sources and unresolved assumptions
- [Marketing development-plan review](docs/Marketing/Research/marketing-development-plan-review-2026-10-06.md) — acquisition priorities, plan gaps and source evidence

### Execution

- [Revenue Validation and Provider Expansion Plan](docs/Marketing/11-revenue-validation-plan.md) — commercial sequence and first-payment criteria
- [First-Income Development Backlog](docs/Marketing/12-first-income-development-backlog.md) — conditional commercial tasks and historical engineering acceptance; current demand work follows DP-01–DP-08
- [Gated Booking Pilot Development Strategy](docs/Product/13-booking-pilot-development-strategy.md) — phases, AWS architecture, economics, and stop/pivot rules
- [Booking Pilot Site Details](docs/Product/14-booking-pilot-site-details.md) — guest/driver journeys, URLs, and truthful release states
- [ADR 0002 — Gated operator booking pilot](docs/Decisions/0002-gated-operator-booking-pilot.md)
- [ADR 0001 — Next.js static export](docs/Decisions/0001-nextjs-static-export.md)
- [M1 implementation checklist](docs/Operations/m1-implementation-checklist.md)
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
- Tailwind CSS v4 (`src/app/globals.css`); self-hosted licensed IBM Plex Sans/Mono and Playfair Display subsets
- Static export: `output: "export"`, `trailingSlash: true`, `images.unoptimized: true`
- Catalog: `src/data/`
- Inquiry: `src/lib/whatsapp.ts`
- SEO helpers: `src/lib/seo.ts`
- Analytics façade: `src/lib/analytics.ts`
- Catalog check: `src/lib/validate-catalog.ts` (Vitest + `sitemap.ts` at build)
- Tests: Vitest (`src/data/queries.test.ts`, `src/lib/whatsapp.test.ts`, `src/lib/validate-catalog.test.ts`)
- Lint: `eslint .` (Next.js 16 no longer ships `next lint`)
- Quality gate: `npm run check` (documentation links, typecheck, lint, test, validate, build, inspect `./out`)
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
| `docs/` | [Knowledge map](docs/README.md), stable numbered plans, research and accepted decisions |
| `docs/Product/Booking/` | Planned M2 domain/API, implementation tasks, experiments and release procedures |
| `docs/Templates/` | Evidence-note template; no passenger/private business records |
| `output/` | Preserved local release/rollback/QA artifacts and manual QA PDF; generated bundles excluded from lint, not runtime source |
| `scripts/check-docs.mjs` | Dependency-free local Markdown file-link checks |

Do not add Lovable packages, `__lovableEvents`, or a shadcn `components/ui` dump.

---

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
npm test
npm run lint
npm run typecheck
npm run docs:check   # local documentation file links
npm run check        # docs, typecheck, lint, test, validate, build, inspect ./out
npm start            # serve ./out (same files S3 would get)
make deploy          # npm run check && ./scripts/deploy.sh
```

`npm start` uses the pinned local `serve` development dependency after `npm ci`; it does not download an executable at startup. Build `out/` first with `npm run build`.

Optional GA requires `NEXT_PUBLIC_ANALYTICS_ENABLED=true`, a valid `NEXT_PUBLIC_GA_MEASUREMENT_ID` and explicit visitor consent. It defaults off. Before enabling production collection, audit the GA property’s Enhanced Measurement settings (especially outbound clicks/form events) so automatic Google events cannot collect the WhatsApp message URL, phone or selected date; inspect real network payloads separately from local facade tests.

The supported production build uses Webpack. Turbopack's CSS worker needs a loopback port that this execution sandbox forbids (including the escalated attempt); `npm run build:turbopack` remains available to retest it. Fonts require no remote build fetch. Run `npm run poc:browser` with Playwright available via `PLAYWRIGHT_MODULE_PATH` and optionally `PLAYWRIGHT_EXECUTABLE_PATH`; the harness fulfills exported files locally without opening WhatsApp. Outcome input and counting rules: [operator feedback](docs/Operations/POC/operator-feedback.md).

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
- M1 inquiry details stay transient. M2 may store necessary private reservation records only under ADR 0002 and an exact retention/deletion policy. No names, phones, selected dates, or receipt credentials in public URLs or analytics.
- Do not hard-code Koval into generic route components; routes reference `carrierIds[]` and `deskId`.
