# UARoute

Passenger-route atlas (Ukraine → Europe). **M1: UARoute owns discovery and travel intent; Koval owns booking. M2: a gated operator booking pilot is approved as development direction, not released.**

**POC scope (2026-10-06):** The owner's demand test includes Ukraine ↔ six German cities and manual confirmation by Koval. Read [POC goal](docs/Operations/POC/poc-goal.md). `commercial` means eligible published inquiry discovery, not proof of an operated/scheduled service. Selected `serviceMode: "candidate_inquiry"` pages may be indexed under constitution §40, with explicit feasibility-first copy and evidence of owner selection in the route matrix. Do not generate all candidate pairs or show carrier service claims on candidate pages. Editorial remains excluded.

**Acquisition correction (2026-10-06):** The owner prioritizes **Lviv and Ivano-Frankivsk** for passenger acquisition; Dolyna is a secondary origin, not the default marketing center. The six Dolyna pages are the initial snapshot, not an expansion constraint or evidence of higher demand. Read the [routes SEO/marketing review](docs/Marketing/Research/routes-seo-marketing-review-2026-10-06.md) and current [release evidence](docs/Operations/POC/poc-status.md). The approved increment adds two city hubs and four explicit candidates (Lviv ↔ Celle; Ivano-Frankivsk ↔ Wolfsburg); all 14×6 city pairs are selectable in both directions without automatic page generation. `src/data/discovery.ts` controls the explicit selection. City suggestions do not establish served routes or stops; use useful direction/action/context instead of country-code decoration or invented stop chains. Current contact `targetPath` is distinct from first-touch `landingPage`; do not overwrite acquisition on internal navigation.

Read [ADR 0002](docs/Decisions/0002-gated-operator-booking-pilot.md), [booking development strategy](docs/Product/13-booking-pilot-development-strategy.md), and [site details](docs/Product/14-booking-pilot-site-details.md) for booking work. Do not enable reservations before the documented gates pass; do not present planned APIs or inventory as implemented.

`docs/` is a local, Git-ignored vault, not included in a fresh checkout. Consult it when available; do not infer deployment or completed gates when evidence is absent. Repository checks skip vault validation only when `docs/` is absent.

Human map: [README.md](README.md); OKF discovery: [docs/index.md](docs/index.md), [document map](docs/map.md), [format profile](docs/okf-profile.md); human guide: [docs/README.md](docs/README.md). Read the relevant section index first; do not dump the whole `docs/` tree into context.

The demand POC for [uaroute.com](https://uaroute.com) and Koval was published and its live attribution path verified on 2026-10-06; dated artifact fingerprints and evidence are in [docs/Operations/POC/poc-status.md](docs/Operations/POC/poc-status.md). Operator receipt and completed journeys remain unverified. Use the [M1 status register](docs/Operations/m1-implementation-checklist.md) for other readiness dimensions; do not infer an outage from a failed fetch or assume a later repository build is deployed.

## Start here

| Task | Read first |
| --- | --- |
| Current demand strategy / outcome review | [docs/Operations/POC/next-steps.md](docs/Operations/POC/next-steps.md), [POC status](docs/Operations/POC/poc-status.md), [operator feedback](docs/Operations/POC/operator-feedback.md) |
| SEO implementation / evaluation | [SEO upgrade plan](docs/Marketing/SEO/upgrade-plan-2026-10-06.md), [EDD criteria](docs/Marketing/SEO/evaluation-contract-2026-10-06.md); local pass is distinct from live evidence |
| Product / copy / SEO | [docs/00-project-constitution.md](docs/00-project-constitution.md), then [Product](docs/Product/index.md) or [Marketing](docs/Marketing/index.md) |
| Catalog (cities, routes, carriers, desks, claims) | [src/data/AGENTS.md](src/data/AGENTS.md) |
| Inquiry / WhatsApp / desks | `src/lib/whatsapp.ts`, [docs/Operations/07-koval-integration-and-conversion.md](docs/Operations/07-koval-integration-and-conversion.md) |
| Parcel idea / development | [docs/Marketing/16-parcel-service-development-strategy.md](docs/Marketing/16-parcel-service-development-strategy.md); secondary referral fits M1, dedicated page/form needs scope update; no parcels in passenger forms, outcome schema or M2 seat inventory |
| Analytics | `src/lib/analytics.ts` (do not invent `ctaLocation` values) |
| Booking pilot / development strategy | [docs/Product/13-booking-pilot-development-strategy.md](docs/Product/13-booking-pilot-development-strategy.md), [docs/Product/14-booking-pilot-site-details.md](docs/Product/14-booking-pilot-site-details.md), [ADR 0002](docs/Decisions/0002-gated-operator-booking-pilot.md) |
| Booking implementation / safety | [docs/Product/Booking/domain-and-api.md](docs/Product/Booking/domain-and-api.md), [implementation backlog](docs/Product/Booking/implementation-backlog.md) |
| Booking validation / operations | [pilot experiment](docs/Operations/Booking/pilot-experiment.md), [operations/release](docs/Operations/Booking/operations-and-release.md) |
| Stack / hosting | [docs/Decisions/0001-nextjs-static-export.md](docs/Decisions/0001-nextjs-static-export.md) |
| Cutover / old URLs | [CUTOVER.md](CUTOVER.md) |
| UI verification | skill `verify-pages` |

If a lower-level doc conflicts with the constitution, stop. Do not silently override Level 1.

## Commands

```bash
npm run dev          # http://localhost:3000
npm test
npm run lint         # eslint .  (Next 16 has no next lint)
npm run typecheck
npm run docs:check   # Markdown links, OKF structure and navigation freshness
npm run docs:index   # regenerate OKF indexes and document map
npm run check        # docs, typecheck, lint, test, validate, build, inspect ./out
make deploy          # apply reviewed artifact, no rebuild; explicit manifest/recovery gates in CUTOVER.md
```

Need Node ≥ 20.9. Run the smallest check that covers the edit; `npm run check` before calling a slice done.

## Layout

- Vault: OKF v0.2 concepts under `docs/`; Marketing owns acquisition/content/SEO/commercial plans, Operations owns runbooks/outcomes/release evidence, Product owns requirements and implementation contracts. Research belongs in its owning domain; decisions in `docs/Decisions/`. Regenerate indexes/maps with `npm run docs:index`, then validate. Preserve historical evidence and do not invent verified metadata. No private contracts or passenger records in Git; completion needs dated evidence.
- Owned app: `src/app/`, `src/components/`, `src/data/`, `src/lib/`, `src/config/`
- Frozen CRA: `legacy/` — do not restyle or “port” it
- `new_design/` and `Route Planner Pro/` — gitignored Lovable specs; not a source of truth; do not deploy

Public URLs: `/`, `/routes/`, `/routes/[slug]/`, `/about/`. HTML redirects: `/contact/`, `/contacts/` → `/about/`; `/carriers/` → `/routes/`; `/packages/` → `/about/`; `/gallery/` → `/`.

## Hard rules

- User-facing copy is **Ukrainian**.
- Public carrier naming: **Коваль** or **перевізник Коваль**. Keep technical IDs and real URLs unchanged. For selected discovery directions, explain that the specific trip, date, places and terms require operator confirmation; do not describe the direction itself as «маршрут не підтверджено».
- A full content review must assess passenger needs, page purpose, information order, repetition and useful next steps across the site, not just replace terminology. Each section should answer a distinct visitor question; keep trip-confirmation notices near the inquiry action and use FAQs for practical planning questions.
- Do not invent prices, ratings, timetables, durations, stop lists, or availability.
- Only `commercial` routes belong in the index, sitemap, and search navigation. Editorial pages are `noindex`.
- Search uses `findRouteByCities(..., { commercialOnly: true })`.
- Directional search renders departure before arrival, preserves the selected city pair when reversing, and restricts alias suggestions to the country expected by each field. Country-only labels must not conceal the return direction.
- M1 inquiry: do not store names, phones, or travel dates. M2 enrolled reservations may store only necessary private booking data under ADR 0002 and a defined retention/deletion policy. Never send names, phones, selected travel dates, receipt credentials, or messages through `track()`.
- Do not add Lovable packages, `__lovableEvents`, or a shadcn `components/ui` dump.
- Default to Server Components. `"use client"` only for UI state, effects, or click tracking.
- Internal hrefs end with `/` except home `/`. Static export: `output: "export"`, `trailingSlash: true` — no Node SSR host, no `redirects()` in `next.config.ts`.
- Keep modules server-safe. Request-time SSR needs a new ADR.

## Skills

[`.agents/skills/`](.agents/skills) — Cursor, Codex, and OpenCode.

## Code review

Flag invented operational facts, English UI copy, editorial routes in index/sitemap/search, phones in `track()`, and unnecessary `"use client"`. Do not require restyling `legacy/` or a Node host.

When corrected, update this file (or [src/data/AGENTS.md](src/data/AGENTS.md) for catalog).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
