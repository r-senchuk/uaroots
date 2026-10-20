---
type: Operational
title: "UARoute expanded repository contract"
description: "Preserved product constraints and task-specific navigation extracted from root AGENTS.md."
tags: [uaroute, agentic, operational, contract]
---

# UARoute — expanded repository contract

Passenger-route atlas (Ukraine → Europe). **M1: UARoute owns discovery and travel intent; the carrier owns booking. M2: a gated operator booking pilot is approved as development direction, not released.**

**POC scope (2026-10-06):** The owner's demand test includes Ukraine ↔ six German cities and manual confirmation by Koval. Read [POC goal](../../../knowledge-base.md#knowledge-base) (KB: `wiki/Operations/POC/poc-goal.md`). `commercial` means eligible published inquiry discovery, not proof of an operated/scheduled service. Selected `serviceMode: "candidate_inquiry"` pages may be indexed under constitution §40, with explicit feasibility-first copy and evidence of owner selection in the route matrix. Do not generate all candidate pairs or show carrier service claims on candidate pages. Editorial remains excluded.

**Acquisition correction (2026-10-06):** The owner prioritizes **Lviv and Ivano-Frankivsk** for passenger acquisition; Dolyna is a secondary origin, not the default marketing center. The six Dolyna pages are the initial snapshot, not an expansion constraint or evidence of higher demand. Read the [routes SEO/marketing review](../../../knowledge-base.md#knowledge-base) (KB: `wiki/Marketing/Research/routes-seo-marketing-review-2026-10-06.md`) and current [release evidence](../../../knowledge-base.md#knowledge-base) (KB: `wiki/Operations/POC/poc-status.md`). The approved increment adds two city hubs and four explicit candidates (Lviv ↔ Celle; Ivano-Frankivsk ↔ Wolfsburg); all 14×6 city pairs are selectable in both directions without automatic page generation. `src/data/discovery.ts` controls the explicit selection. City suggestions do not establish served routes or stops; use useful direction/action/context instead of country-code decoration or invented stop chains. Current contact `targetPath` is distinct from first-touch `landingPage`; do not overwrite acquisition on internal navigation.

**Acquisition clarification (2026-10-09):** Dolyna is an established local market for Koval according to the owner and is not a priority for new UARoute acquisition; do not plan a new Dolyna promo hub/campaign as the next increment. Keep useful existing pages/selection. Vyhoda/Hoshiv/Lachendorf are examples of nearby-settlement context, not a fixed coverage list. Apply useful local catchment guidance to each selected UA/DE city hub without claiming universal pickup or aliasing distinct places. First strengthen existing Lviv/Ivano-Frankivsk hubs; new Stryi/Celle/pair pages require marketing rationale, not automatic publication from an example. Read [intent, goals and requirements MR01–MR14](../../../knowledge-base.md#knowledge-base) (KB: `wiki/Marketing/Content/acquisition-intent-and-requirements-2026-10-09.md`).

Read [ADR 0002](../../../Decisions/0002-gated-operator-booking-pilot.md), [booking development strategy](../../../knowledge-base.md#knowledge-base) (KB: `wiki/Product/13-booking-pilot-development-strategy.md`), and [site details](../../../knowledge-base.md#knowledge-base) (KB: `wiki/Product/14-booking-pilot-site-details.md`) for booking work. Do not enable reservations before the documented gates pass; do not present planned APIs or inventory as implemented.

**Operator-model clarification (2026-10-08):** The owner describes one flexible Dolyna–Germany corridor with coordinated vehicles, pickup/distribution branches and regular transfers among Koval vehicles. Rare transfers to another carrier are arranged individually. The owner states a uniform per-seat fare independent of distance, currently about EUR 170; do not describe it as distance-based or a "from" price. Friday outbound is owner-reported; Tuesday return retains the initial uncertainty. Passenger city pairs (e.g. Celle → Stryi) are discovery intents, not separate fixed operated lines. See [flexible-corridor SEO research](../../../knowledge-base.md#knowledge-base) (KB: `wiki/Marketing/Research/flexible-corridor-seo-2026-10-08.md`) and [development strategy](../../../knowledge-base.md#knowledge-base) (KB: `wiki/Product/18-flexible-corridor-development-strategy.md`). Owner-reported fleet, departure days, approximate fare and uncertain terminal/return details are planning context, not verified public timetable/fare/availability. Do not promise the same vehicle or no transfers. City hubs may use useful nearby-settlement context (Dolyna: Vyhoda/Hoshiv; Celle: Lachendorf), without implying stops or pickup. Nearby settlements are distinct places, not hub aliases. Celle → Stryi remains an illustrative candidate; the October 9 acquisition clarification governs sequencing, with explicit selection/provenance and FC01–FC10 before publication; this does not automatically expand the six-city POC or publish every pair. Regular vehicle redistribution is not verified fit for the current whole-trip M2 model: BK-01 must select a genuinely stable allocation or keep inquiry-only/pivot; multi-vehicle/leg inventory requires separate scope/ADR before build.

**Nearby-place clarification (2026-10-10):** A passenger may choose the nearest available catalog city for an actual origin or destination in a smaller settlement absent from search, then privately specify the exact locality/address to Koval. Do not require a trip to the hub merely because it was selected. City hubs should describe source-backed surrounding settlements in useful Ukrainian copy for both directions; a name is geographic context, not a new city ID/alias, published direction or guaranteed pickup/drop-off. Confirm the feasible meeting/drop-off arrangement with the carrier. This supersedes the empty nearby list restriction of the initial Celle increment; preserve historical release evidence. See [Celle nearby correction](../../../knowledge-base.md#knowledge-base) (KB: `wiki/Marketing/Content/celle-nearby-discovery-correction-2026-10-10.md`).

`docs/` is eligible for version control after the owner removed its ignore rule on 2026-10-10. Generated `output/` evidence remains local. Consult it when available; do not infer deployment or completed gates when evidence is absent. Repository checks require the canonical site documentation and never depend on the separate KB. Use explicit kb checks for the vault.

Human map: [README.md](../../../../README.md); OKF discovery: [docs/index.md](../../../index.md), [document map](../../../map.md), [format profile](../../../okf-profile.md); human guide: [docs/README.md](../../../README.md). Read the relevant section index first; do not dump the whole `docs/` tree into context.

The demand POC for [uaroute.com](https://uaroute.com) and Koval was published and its live attribution path verified on 2026-10-06; dated artifact fingerprints and evidence are in [docs/Operations/POC/poc-status.md](../../../knowledge-base.md#knowledge-base) (KB: `wiki/Operations/POC/poc-status.md`). Operator receipt and completed journeys remain unverified. Use the [M1 status register](../../../knowledge-base.md#knowledge-base) (KB: `wiki/Operations/m1-implementation-checklist.md`) for other readiness dimensions; do not infer an outage from a failed fetch or assume a later repository build is deployed.

## Start here

| Task | Read first |
| --- | --- |
| Current demand strategy / outcome review | [docs/Operations/POC/next-steps.md](../../../knowledge-base.md#knowledge-base) (KB: `wiki/Operations/POC/next-steps.md`), [POC status](../../../knowledge-base.md#knowledge-base) (KB: `wiki/Operations/POC/poc-status.md`), [operator feedback](../../../knowledge-base.md#knowledge-base) (KB: `wiki/Operations/POC/operator-feedback.md`) |
| SEO implementation / evaluation | [SEO upgrade plan](../../../knowledge-base.md#knowledge-base) (KB: `wiki/Marketing/SEO/upgrade-plan-2026-10-06.md`), [EDD criteria](../../../Marketing/SEO/evaluation-contract-2026-10-06.md); local pass is distinct from live evidence |
| Product / copy / SEO | [docs/00-project-constitution.md](../../../00-project-constitution.md), then [Product](../../../Product/index.md) or [Marketing](../../../Marketing/index.md) |
| Catalog (cities, routes, carriers, desks, claims) | [src/data/AGENTS.md](../../../../src/data/AGENTS.md) |
| Inquiry / WhatsApp / desks | `src/lib/whatsapp.ts`, [docs/Operations/07-koval-integration-and-conversion.md](../../07-koval-integration-and-conversion.md) |
| Parcel idea / development | [docs/Marketing/16-parcel-service-development-strategy.md](../../../knowledge-base.md#knowledge-base) (KB: `wiki/Marketing/16-parcel-service-development-strategy.md`); secondary referral fits M1, dedicated page/form needs scope update; no parcels in passenger forms, outcome schema or M2 seat inventory |
| Analytics | `src/lib/analytics.ts` (do not invent `ctaLocation` values) |
| Booking pilot / development strategy | [docs/Product/13-booking-pilot-development-strategy.md](../../../knowledge-base.md#knowledge-base) (KB: `wiki/Product/13-booking-pilot-development-strategy.md`), [docs/Product/14-booking-pilot-site-details.md](../../../knowledge-base.md#knowledge-base) (KB: `wiki/Product/14-booking-pilot-site-details.md`), [ADR 0002](../../../Decisions/0002-gated-operator-booking-pilot.md) |
| Booking implementation / safety | [docs/Product/Booking/domain-and-api.md](../../../Product/Booking/domain-and-api.md), [implementation backlog](../../../knowledge-base.md#knowledge-base) (KB: `wiki/Product/Booking/implementation-backlog.md`) |
| Booking validation / operations | [pilot experiment](../../../knowledge-base.md#knowledge-base) (KB: `wiki/Operations/Booking/pilot-experiment.md`), [operations/release](../../../knowledge-base.md#knowledge-base) (KB: `wiki/Operations/Booking/operations-and-release.md`) |
| Stack / hosting | [docs/Decisions/0001-nextjs-static-export.md](../../../Decisions/0001-nextjs-static-export.md) |
| Cutover / old URLs | [CUTOVER.md](../../../../CUTOVER.md) |
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

Need Node 22.12+ (Node 22 line), Node 24, or Node 26+; CI follows `.nvmrc`. TypeScript 6 provides the shared compiler/API for typecheck, Next.js and ESLint; the TS7 experiment was superseded. Run focused checks during edits and `npm run check` once on a stable application candidate. Documentation/instruction-only changes use docs indexing/checks and applicable instruction tests; release scope still follows CUTOVER.md.

## Layout

- Documentation: canonical contracts remain under `docs/`; the separate local KB (see [KB guide](../../../knowledge-base.md#knowledge-base)) holds strategy, research and history; Marketing owns acquisition/content/SEO/commercial plans, Operations owns runbooks/outcomes/release evidence, Product owns requirements and implementation contracts. Research belongs in its owning domain; decisions in `docs/Decisions/`. Regenerate indexes/maps with `npm run docs:index`, then validate. Preserve historical evidence and do not invent verified metadata. No private contracts or passenger records in Git; completion needs dated evidence.
- Owned app: `src/app/`, `src/components/`, `src/data/`, `src/lib/`, `src/config/`
- Historical CRA source is absent from this checkout; do not recreate `legacy/` during routine work. Any recovered rollback source stays frozen.
- `new_design/` and `Route Planner Pro/` — gitignored Lovable specs; not a source of truth; do not deploy

Public URLs: `/`, `/routes/`, `/routes/[slug]/`, `/about/`. HTML redirects: `/contact/`, `/contacts/` → `/about/`; `/carriers/` → `/routes/`; `/packages/` → `/about/`; `/gallery/` → `/`.

## Hard rules

- User-facing copy is **Ukrainian**.
- Public carrier naming (owner decision 2026-10-20): use **перевізник**; omit surnames and carrier branding in visible copy, metadata, structured data and inquiry messages. Preserve existing technical IDs, desks, contacts, event names, referral allowlists and real destination URLs. This prepares neutral presentation; it does not establish additional connected carriers. Historical/internal partner evidence may retain actual names. For selected discovery directions, explain that the specific trip, date, places and terms require operator confirmation; do not describe the direction itself as «маршрут не підтверджено».
- A full content review must assess passenger needs, page purpose, information order, repetition and useful next steps across the site, not just replace terminology. Each section should answer a distinct visitor question; keep trip-confirmation notices near the inquiry action and use FAQs for practical planning questions.
- Do not invent prices, ratings, timetables, durations, stop lists, or availability.
- Only `commercial` routes belong in the index, sitemap, and search navigation. Editorial pages are `noindex`.
- Search uses `findRouteByCities(..., { commercialOnly: true })`.
- Directional search renders departure before arrival, preserves the selected city pair when reversing, and restricts alias suggestions to the country expected by each field. Country-only labels must not conceal the return direction.
- Attribution: retain random `ref_code` / `koval_poc` contracts. Codes identify inquiries, not unique people or journeys. Partner attribution uses current-visit memory and validated tagged navigation; no 30-day browser persistence. Elapsed travel dates without operator evidence remain unknown, never completed journeys or billing facts. Outcome admin needs its own scoped decision; it is distinct from M2 inventory.
- M1 inquiry: do not store names, phones, or travel dates. M2 enrolled reservations may store only necessary private booking data under ADR 0002 and a defined retention/deletion policy. Never send names, phones, selected travel dates, receipt credentials, or messages through `track()`.
- Do not add Lovable packages, `__lovableEvents`, or a shadcn `components/ui` dump.
- Default to Server Components. `"use client"` only for UI state, effects, or click tracking.
- UTM policy: `src/config/utm.ts` owns coherent acquisition pairs/campaigns/CTA locations. `src/config/site.ts` exports the fixed partner referral tuple and generated `/referral-contract.json`; keep receiver allowlists synchronized via reviewed artifact snapshots. Do not forward acquisition tags to Коваль, tag internal UARoute links, or collect raw `utm_content`/`utm_term`. Referral cities must be a complete opposite-country pair.
- Internal hrefs end with `/` except home `/`. Static export: `output: "export"`, `trailingSlash: true` — no Node SSR host, no `redirects()` in `next.config.ts`.
- Keep modules server-safe. Request-time SSR needs a new ADR.

## Skills

[`.agents/skills/`](../../../../.agents/skills) — Cursor, Codex, and OpenCode.

## Code review

Flag invented operational facts, English UI copy, editorial routes in index/sitemap/search, phones in `track()`, and unnecessary `"use client"`. Do not require restyling `legacy/` or a Node host.

When corrected, update the relevant canonical contract or scoped instructions and add a dated Memory record; do not grow root AGENTS.md with session history.

