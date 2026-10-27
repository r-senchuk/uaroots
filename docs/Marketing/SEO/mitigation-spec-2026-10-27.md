---
type: Specification
title: "SEO and GEO mitigation — technical delivery specification"
description: "Evidence-led existing-page content, UX, metadata, measurement and verification requirements for a prepared Next.js implementation."
tags: [uaroute, seo, geo, acquisition, content, implementation]
---

# SEO and GEO mitigation specification

**Prepared:** 27 October 2026. **Status:** specification and preparation plan; no application implementation or publication claimed. Owner requested saved results, detailed mitigation and individual preparatory sessions, with actual implementation by a Next.js expert. This document defines that work; it does not launch sessions or authorize external changes.

Authority: [constitution](../../00-project-constitution.md), especially §§6, 8–10, 40 and 42; [existing acquisition work order](priority-acquisition-increment-2026-10-24.md); [passenger discovery contract](../../Product/passenger-discovery-conversion-spec-2026-10-22.md); [analytics contract](../08-analytics-and-attribution.md); [working agreement](../../Operations/Agentic/Operational/working-agreement.md). This specification details the next bounded increment, rather than replacing those contracts. Research: [KB guide](../../knowledge-base.md#knowledge-base), record `wiki/Marketing/SEO/audit-2026-10-27.md`. Execution: [session briefs](mitigation-sessions-2026-10-27.md).

## 1. Intended outcome and scope

A Ukrainian-speaking passenger arriving on an existing priority page should understand its direction, find useful locally relevant preparation information, choose the correct city pair, and reach the carrier through the existing private inquiry flow. The page must not suggest a confirmed service, pickup, timetable, fare or seat reservation. Search engines and AI systems should be able to retrieve the same factual text users see.

### Delivery lanes

| Lane | Pages and responsibilities | Scope |
| --- | --- | --- |
| Observed-search | `/routes/lviv-hannover/`, supported by Lviv hub/index links | First content lane under constitution §42; confirm dated search evidence before choosing query-specific changes. No automatic reverse page. |
| Priority origins | `/cities/lviv/`, `/cities/ivano-frankivsk/` | Improve city selection, nearby-place explanation, departure/return guidance, concise hierarchy and existing route links. |
| Priority pairs | `/routes/lviv-celle/`, `/routes/celle-lviv/`, `/routes/ivano-frankivsk-wolfsburg/`, `/routes/wolfsburg-ivano-frankivsk/` | Direction-specific preparation value, truthful snippets, source labels and coherent actions. |
| Supporting trust/guide | `/about/`, `/imprint/`, `/guides/perevezennya-velosypeda/` | Only provenance, editorial-method and useful guide changes supported by the content package. No speculative legal rewrite. |
| Shared-template regression | Home, route index, all currently published route pages and city hubs | Protect existing selection, layout, metadata, links and fallback behavior. Touch nonpriority copy only for the same reproduced factual defect or necessary template consistency. |
| Distribution preparation | Existing three-placement draft | Correct misleading/directionally mismatched wording and prepare usable approved-enum links; no sending or posting. |

Not in scope: new city/route IDs, new indexable routes/guides, alias expansion, translations, carrier onboarding, operator facts without evidence, reservations/M2, payments, backend/server hosting, new analytics vendor/events/storage, dependency upgrades, tracking/account changes, purchased links, advertising activation, mass outreach, or mandatory llms.txt/FAQ-schema projects. A newly justified scope change needs its own decision; it cannot be hidden in implementation.

## 2. Baseline, limits and contradictions

The 27 October direct crawl found 22 sitemap URLs returning 200, matching self-canonicals, unique titles/descriptions, one H1 and `lang="uk"`; sampled editorial pages were noindex and sampled nonexistent documents/resources returned 404. Sampled canonical and five legacy redirects were correct. Internal page links in the crawled set had no missing targets or orphan pages. Preserve these successes; do not rebuild working SEO machinery merely because it appears in an audit checklist. The number 22 is an observed snapshot, not a new invariant overriding later authorized catalog state.

Source at audit: `265888a`; deployment identity was not fully matched to that source. Ivano-Frankivsk ↔ Hannover is explicitly an inline inquiry pair; standalone pages do not exist by design. There is no discovered missing-page defect to fix there.

GA4 property 557859031 for September 27–October 24 returned one Google-organic session and mostly nonstandard direct/direct attribution. Calls had no hostname filter. Consent and test contamination prevent interpreting the counts as total passenger demand. Current source already normalizes direct/direct at the provider boundary. Historical counts alone do not justify another fix.

GSC connector access failed for inactive subscription; do not buy a subscription or broaden credentials. The [state register](../../../ops/agent-state.json) contains October 26 owner-reported indexing observations and earlier sitemap evidence. Preserve their dates and weaker transcription provenance. Retrieve fresh evidence only where needed for a decision; unavailable current indexing is unknown, not a reversal of the historical observation.

The saved audit suggested six-URL inspection and favored four pair pages before Hannover. **This contract follows the higher-level seven-URL register and Hannover lane in constitution §42.** Historical June/October SEO contracts with fixed older URL counts do not define today's expected export.

The [community draft](community-placements-2026-10-25.md) includes “довіднику прямих рейсів” and plural-carrier implications, and sends a return-oriented audience to an outbound Hannover page. Its “reviewed” label does not override the constitution. Mark the affected text unsuitable for publication until S04 corrects it. Do not claim direct services or create a reverse route to make the draft fit.

The design contract records older font preferences alongside shipped fonts. This increment preserves the existing brand and deployed typography; no font migration or redesign is inferred. Escalate only a concrete proposed change that conflicts with authority.

## 3. Principles and decision method

1. **Evidence before specificity.** Classify each material statement as geographic fact, editorial advice, verified operational fact, owner-reported context, unknown, or proposal. A city website supports geography, not carrier stops or capacity. Source review dates describe an actual check, not freshness by assertion.
2. **Passenger utility before page volume.** Answer a real planning question with a useful next step. No word-count, FAQ-count, keyword-density or exact-match quotas. Shared advice may remain where helpful; repetitive filler is not differentiation.
3. **Existing pages first.** Improve Hannover and priority hubs/pairs. Keep IDs, paths, classification, eligibility and crawlable graph. Do not produce every selectable pair as an SEO page.
4. **One truthful product boundary.** UARoute prepares discovery/intent; the carrier confirms the trip and terms. Public transport references and landmarks are not stops. Nearby-city selection is not a requirement to travel to that city. Use neutral «перевізник» without implying several connected carriers.
5. **Same content for people and crawlers.** Static HTML contains essential information, source labels and ordinary links. No cloaking, hidden AI copy, or special agent-only booking assertions. Structured data must describe visible facts.
6. **Privacy by preservation.** No names, phones, dates, message content, credentials or inquiry codes in analytics/storage/public URLs. Preserve current-visit acquisition, first touch and target path semantics; do not introduce new collection to make measurement easier.
7. **Design refines the journey.** Compact excessive scaffolding, prioritize actionable content and preserve readable typography. Do not force every action above an arbitrary fold by shrinking text or duplicating forms.
8. **Measured claims stay proportional.** HTTP eligibility ≠ indexing ≠ exposure ≠ consented visit ≠ handoff ≠ received inquiry ≠ completed journey. Lab performance ≠ field performance; an AI citation sample ≠ universal ranking.
9. **Conditional changes remain conditional.** An absent report, old timestamp or generic recommendation is not a reproduced defect. Record “retain/no change” with reasoning where the existing implementation meets the need.
10. **One implementation owner.** Specialists prepare reviewed artifacts; the Next.js expert integrates accepted copy/design into source. Parallel preparation must use separate files; no simultaneous edits of shared production templates.

## 4. Requirements and implementation approach

### SG-01 — Evidence and index baseline

Create a seven-URL register using the exact priority set in section 1 (Hannover, two hubs, four pairs). Fields: observation time/timezone, evidence method, HTTP status, robots eligibility, declared canonical, Google-selected canonical, indexing result/reason, last crawl, sitemap processing, referring-page evidence if available, recommended action and uncertainty. Keep raw provider exports separate from session transcriptions. Extend to the guide only for a specific changed-page need.

Collect settled GSC page/query/country/device data for a 28-day window ending at least two days before retrieval and comparable prior dates when available; label partial data. Preserve source timezone. Inspect Google Search generative AI inclusion and the dedicated AI-impressions report where available; Bing AI Performance/Topics Portfolio is optional if connected. Do not infer absence from report thresholds. No request-indexing, sitemap submissions, IndexNow changes or provider writes during baseline preparation.

**Acceptance:** all seven rows have either dated evidence or explicit unknown with the access condition. Missing data blocks ranking claims and data-dependent title experiments, not safe factual corrections or existing-page preparation.

### SG-02 — Claims and sources

Build a statement-level ledger: claim ID, page/section, exact current wording, classification, source URL and supporting passage/summary, checked date, what the source does not establish, disposition (keep/rewrite/remove/await evidence), and replacement constraints. Scope first includes the unsourced Lviv–Hannover 1–2 hour connection buffer, nearby-place routing/proximity implications, repeated transport-confirmation statements, and the community draft.

Remove the numeric buffer unless adequate evidence supports its actual use; ask passengers to agree the connection margin for their circumstances. Rewrite nearby guidance to request feasibility without suggesting a route through a particular town/exit. Preserve useful geographic context and IDs. Source any immigration/customs advice from competent authorities or link users to current official information without making individualized determinations. No carrier contact is initiated by a research brief.

**Acceptance:** every retained operational statement has appropriate evidence; unsupported claims are removed or converted into explicit questions. Unknown facts do not get invented to fill a design.

### SG-03 — Intent and page architecture

Create a page matrix with primary passenger intent, distinguishing question, supported query evidence versus hypothesis, title/H1/description intent, unique sections, shared sections, sources, outgoing/incoming canonical links, primary action and reverse-path behavior. Preserve useful existing titles unless data or inaccurate wording justifies change. Include existing page and inline-inquiry destinations; do not invent URLs from pairs.

Hannover is the first observed-search lane. Hubs handle broad origin/return discovery; pair pages handle directional preparation; the bicycle guide handles that specific planning concern. Do not consolidate reverse-direction pages or set cross-canonicals without evidence of truly duplicate intent and a separate reviewed decision. Repetition alone is not demonstrated cannibalization.

**Acceptance:** all seven priority URLs have distinct jobs and a deliberate internal-link graph; no new indexed URL is needed to deliver the package.

### SG-04 — Final Ukrainian copy package

Supply implementation-ready copy by URL and stable section key: metadata, heading, introduction, practical sections, source anchors, nearby guidance, FAQs, CTA/support text, editorial dates/identity, alt/caption text where changing. Include “retain” entries for unchanged fields so the implementer does not improvise. Map claim IDs to every new factual sentence and record deliberate deletions/moves. No public carrier surname/branding; existing operator legal identity remains factual and is not confused with the transport carrier.

Use natural Ukrainian, clear direction and distinct purpose per section. Keep trip confirmation close to the action without repeating the same warning in every block. Retain practical unknowns honestly; do not describe an owner-selected direction itself as unconfirmed. Source anchors should identify the actual resource, rather than all saying “джерело”.

For the bicycle guide, use real editorial responsibility and visible reviewed/updated dates only after actual review. Align Article data with visible identity/date facts; do not invent an expert author. Improve existing content, not an automatic new guide collection. Rewrite three distribution drafts with correct direction, affiliation disclosure and existing allowed UTM tuples; check the existing draft before creating duplicates.

**Acceptance:** a second pass checks native-language coherence, source support, terminology, repetition, direction and transport boundary. Copy has no unresolved placeholders and is versioned for design/implementation. This review is not legal certification or carrier service verification.

### SG-05 — UX and design handoff

Read [visual design](../../Product/04-visual-design-system.md), [UX architecture](../../Product/03-ux-and-information-architecture.md) and the current components before proposing changes. Deliver annotated layouts with real copy for home regression, hub, route and guide templates, plus changed trust sections. Provide 360/375px mobile, 768px intermediate and 1280/1440px desktop states; also specify 320 CSS-pixel reflow and true browser 200% zoom checks. Record existing component/token reuse and exceptions.

Hub hypothesis: reduce introductory vertical space and expose destination selection sooner while preserving explanatory text. Route hypothesis: show useful practical content before the large generic illustration. Compare with current layout; these are not proven conversion improvements. Keep one inquiry form, existing validation/focus behavior, visible carrier-site alternative without phone/date, and truthful WhatsApp handoff. Avoid decorative images displacing action or suggesting actual vehicles/stops.

Specify keyboard order, visible focus, clear input labels/errors, ≥44px actionable targets, contrast, sticky-action overlap, safe-area behavior, reduced motion, image purpose/alt/crop and optional/no-JS states. Use existing assets by default; new photos require provenance/rights and an explicit purpose. No brand redesign, font upgrade or dependency library by convenience.

**Acceptance:** desktop/mobile design uses final copy and maps every changed block to a component/state; no core action is obscured. Unchanged interactions are explicitly preserved. Human 5–8-person usability can be prepared independently; do not label it completed without participants/results.

### SG-06 — Metadata, entities and freshness

Reuse `buildMetadata`, `breadcrumbLd`, `routePageLd`, `cityHubCollectionLd` and current JSON-LD serialization. Preserve one visible H1, absolute self-canonical, `uk` page language, Ukrainian metadata, trailing-slash internal links and editorial noindex/sitemap exclusions. Titles explain page purpose; no prices, timetables, “direct” claims or availability without verified support. Social previews should remain representative and illustrative where applicable.

Maintain the current truthful WebSite/WebPage/CollectionPage/Place/publisher model. If improving entity clarity, reuse stable IDs and validate that publisher/author identities are real and visible. Never substitute BusTrip, Offer, AggregateRating, fake LocalBusiness offices, or special “AI schema” to chase eligibility. FAQ markup is not a Google rich-result objective.

Optional minimal data extension: route-level editorial review metadata only if copy requirements justify visible dates. Prefer one typed object with distinct `reviewedAt` and `contentUpdatedAt`, using existing city-hub conventions. Claim verification dates remain separate. Use the same real content-change source for visible modified date and sitemap `lastmod`; do not update dates on every build or turn a review date into a content update. Omit unavailable dates rather than fake them. Decision and affected tests belong in S07 before editing types.

**Acceptance:** generated HTML, metadata/schema and sitemap agree; URL set and route eligibility match an independently specified expected baseline; no date/author invented. Existing low-priority missing social images on legal pages are optional, not release blockers.

### SG-07 — Measurement and attribution

Use explicit GA4 property 557859031 and verified workspace isolation. Inspect production-host dimensions/filters and settled post-normalization dates before comparing sources. Save bounded aggregate raw readbacks when available; label manual transcription. Separate QA/internal/Tag Assistant activity where demonstrable, without assuming all unidentified direct traffic is fake or that one exclusion cleans everything. No retroactive historical correction is assumed.

Preserve event names and their meaning: `booking_intent` is validated interaction; `whatsapp_click`/`koval_site_click` are outbound actions. Define handoff rate with matched, deduplicated session units; verify API aggregation or mark unknown. No event-count/session-rate shortcut or sum of overlapping users. Keep native GSC timezone and GA4 Europe/Warsaw windows explicit when comparing.

AI visibility has three separate measures: Google AI impressions/Bing citations, observable AI referral sessions, and deduplicated handoffs. Unknown/referrerless visits are not relabeled as AI. Audit the existing allowlisted referrer mapping; add a family only if observed evidence justifies a bounded separately reviewed change. Do not introduce speculative event fields, raw referrers, visitor IDs or new collection.

**Acceptance:** preparation yields a report recipe and either “no code change” or a reproduced, scoped defect plus test cases. No provider settings, consent mode, account configuration, new event registration or subscription changes are included. Client payload tests do not establish provider receipt.

### SG-08 — Performance and accessibility

Collect a comparable mobile lab baseline for home, Lviv hub, Hannover route and the guide if modified; use the same build mode, viewport, throttle, tool/version and consent state for before/after. Use three comparable runs and the median for changed templates, not one arbitrary score. Capture diagnostic resource/layout evidence before optimizing images/fonts/JS. Do not infer a performance defect from framework choice or an HTML byte count.

Field targets when evidence exists: p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1. Missing CrUX remains unknown and does not block a safe content release. A repeated >10% AND >200ms lab LCP increase, >0.02 CLS increase, or newly reproduced severe accessibility/interaction defect is an investigation trigger, not a universal Google threshold. Resolve cause or explain measurement variance before accepting the changed candidate. Lab INP proxies do not establish field INP.

**Acceptance:** no reproducible critical regression, readable keyboard/mobile/zoom behavior, evidence tied to candidate. Actual touch, screen-reader and native-zoom tests are distinguished from emulation and source inspection.

## 5. Technical ownership and likely file map

Exact changes are decided in S07; this map is an inspection boundary, not permission to edit everything listed.

| Concern | Existing paths | Approach |
| --- | --- | --- |
| Route/hub content | `src/data/routes.ts`, `src/data/city-hubs.ts`, `src/data/types.ts` | Keep typed source of truth; use edit-catalog skill; no classifications/IDs/desks changed. |
| Page hierarchy | `src/app/routes/[slug]/page.tsx`, `src/app/cities/[slug]/page.tsx` | Server-render copy; reuse components; move blocks without duplicating inquiry state. |
| Shared content/actions | `src/components/NearbyPlaces.tsx`, `src/components/Faq.tsx`, `src/components/RouteSearch.tsx`, `src/components/JourneyActions.tsx`, inquiry components | Minimal presentation changes; existing events and routing contracts retained. |
| Guide/trust | `src/app/guides/perevezennya-velosypeda/page.tsx`, `src/app/about/page.tsx`, `src/app/imprint/page.tsx` | Render approved factual copy/provenance; no invented credentials or legal reclassification. |
| Metadata and dates | `src/lib/seo.ts`, `src/lib/json-ld.ts`, `src/app/sitemap.ts`, `src/app/robots.ts` | Reuse builders; change only an identified requirement; robots currently permits crawling. |
| Styling/images | `src/app/globals.css`, existing assets and component classes | Preserve tokens/brand; avoid global changes for local spacing. |
| Conditional measurement | `src/lib/analytics.ts`, relevant provider/consent components and tests | No edit unless S06 reproduces a current defect; preserve privacy/security contracts. |
| Verification | Existing catalog/SEO/export/analytics tests and `scripts/inspect-out.mjs`, `scripts/poc-browser.mjs`, `scripts/attribution-browser.mjs` | Update independent expectations for intentional changes; reuse harnesses rather than adding duplicate test infrastructure. |

Use npm, TypeScript 6 and the installed Next.js version; static export to S3/CloudFront, Server Components by default, Client Components only where interactions require them. Read relevant installed guides under `node_modules/next/dist/docs/` before coding (static exports, metadata, images, server/client boundaries, navigation). Generic specialist defaults for pnpm, TS7, next-intl or newer Next/Tailwind versions **do not apply**. Node 22 follows `.nvmrc`; do not silently substitute a different runtime for release acceptance.

No new server runtime, runtime API, fetch-dependent public content, client-only article body, package upgrade, permanent redirect redesign, automatic sitemap submission or CDN policy change is required by this specification.

## 6. Acceptance matrix

Statuses: `pass-local`, `pass-live`, `unknown`, `fail`, `not-applicable` with reason. Bind results to source SHA/dirty diff, export fingerprint, runtime and configuration. A plan/review approval is not an execution result.

| ID | Oracle | Blocking point |
| --- | --- | --- |
| AC01 | Claims ledger covers changed material facts; source supports scope; unsupported specificity removed | Copy freeze and implementation |
| AC02 | Seven-URL intent/copy matrix complete; Hannover and priority origins preserved; no new URLs/eligibility | Readiness |
| AC03 | Ukrainian copy coherent, neutral carrier, no operational/booking promises; correct direction | Readiness and QA |
| AC04 | Design uses final copy; one form; readable controls; keyboard/focus/zoom/reflow; no sticky overlap | Implementation QA |
| AC05 | Static HTML includes content and links, one H1/canonical; schema visible/truthful; no false dates | Local export QA |
| AC06 | Expected sitemap exact set; editorial excluded; existing canonicals/redirects/404 preserved | Local; affected live checks at release |
| AC07 | Search uses commercial-only lookup, expected-country aliases, pair-preserving reversal, published/inline/fallback distinction | Affected browser regression |
| AC08 | Complete opposite-country referral pairs, existing desks/allowlists, carrier-site path without phone/date | Affected browser and contract regression |
| AC09 | Synthetic phone/date/message/code absent in telemetry/storage; consent and first-touch/current-target behavior preserved | Privacy QA; zero tolerance for new leakage |
| AC10 | Focused tests + one stable `npm run check`; affected fixture expectations remain independent | Implementation completion |
| AC11 | Comparable lab before/after and affected accessibility evidence; material regressions investigated | Changed-template QA; missing field data allowed as unknown |
| AC12 | Seven indexing rows and measurement limitations recorded honestly; no ranking/ROI claims from unavailable data | Research acceptance; not a safe-copy release veto |
| AC13 | Candidate source/export, CI, recovery and live document consistency under CUTOVER | Authorized deployment only |
| AC14 | Corrected distribution package matches page direction and disclosure; no unsupported direct/multiple-carrier claim | Before any separately authorized posting |
| AC15 | Four-week observation plan separates visibility, consented traffic, handoffs, private aggregate receipt/journeys | Delivery handoff; outcomes may remain unknown |

Core behavioral fixtures: Lviv→Hannover published page; Hannover→Lviv existing fallback, not invented reverse page; Lviv↔Celle and IF↔Wolfsburg published directions; Celle→Stryi existing page; Lviv↔Wolfsburg inline; IF↔Hannover owner-selected inline; unsupported pair fallback; same-country rejection; expected-country aliases; editorial exclusion. Read source before execution if scope changed since this record. Preserve receiver contracts without contacting the carrier.

Before any synthetic inquiry interaction, intercept all collectors and operator handoffs. Never send a QA message. When interception is unavailable, mark interaction unverified and continue read-only checks. If changed flow acceptance cannot be verified, do not label that candidate ready for release.

Preparation docs use `npm run docs:index` and `npm run docs:check`; KB documents use explicitly configured `kb:index`/`kb:check`. Application implementation runs focused checks, then one stable `npm run check`. Repeat broad checks only for changed dependencies/failures, not once per specialist. Keep shared build directories sequential. Node24 compatibility testing is added only when the actual runtime/release change calls for it.

## 7. Readiness and delivery gates

**G0 — Reconciled evidence:** baseline and source ledger exist; contradictions/unknowns are explicit. No requirement to purchase tools or resolve all search access before content work.

**G1 — Content and design freeze:** page matrix, complete Ukrainian copy, reviewed factual ledger, real-copy layouts and state behavior agree. Retain/defer decisions are explicit. A disagreement requiring a new product/operational claim blocks only that claim/change.

**G2 — Next.js implementation-ready:** expert maps accepted artifacts to exact files/components/data fields, defines independent tests, classifies measurement work as no-change or reproduced defect, and records available runtime/tooling. No unresolved public copy or layout decisions are delegated implicitly to the implementer.

**G3 — Local candidate accepted:** expert implementation plus independent review meets applicable ACs. Known absent GSC/CrUX evidence is not misreported as a pass or used to block unrelated fixes. New factual, privacy, routing and severe accessibility defects block release.

**G4 — Published and verified:** requires separately authorized commit/push/deployment as applicable; follow [CUTOVER](../../../CUTOVER.md), prefer GitHub Actions/OIDC, immutable artifact promotion and recovery. Do not claim publication from a source diff, build or old state-register receipt.

**G5 — Learning:** after actual approved release/distribution start, review weekly for an initial four-week window. Extend when exposure is insufficient. No guaranteed uplift or automatic expansion. Distinguish operator-provided aggregate outcomes from click telemetry. Further distribution uses corrected drafts and its own authorization.

No automated reminders, new chats, outreach or paid tools are created by this plan. Session definitions and dependencies are in the [execution handoff](mitigation-sessions-2026-10-27.md).

## 8. Decision record and reporting

Every session closes with: role/tool identity; inputs and versions; scope/owned files; findings versus assumptions; decisions and unresolved questions; validation performed/not performed; next dependency; local/committed/deployed status. Record facts with observation dates and keep old evidence intact. Update the portable state register only for changed handoff/current observations, not by copying the full report or rewriting old dates.

Publication readiness does not depend on optional cosmetic social previews, all seven URLs being indexed, a specific AI citation, an arbitrary Lighthouse score or completed commercial outcomes. It does depend on truthful content, working inquiry behavior, privacy, accessible changed UI, coherent static output, appropriate checks and release authorization.

Primary researched guidance: [Google AI optimization](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [Google AI inclusion](https://support.google.com/webmasters/answer/16908024), [Google AI impressions](https://support.google.com/webmasters/answer/16984139), [Bing Topics Portfolio](https://blogs.bing.com/webmaster/2026/10/introducing-topics-portfolio-beta-in-ai-performance/), [OpenAI crawler distinctions](https://developers.openai.com/api/docs/bots), [Google documentation updates](https://developers.google.com/search/updates), [Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds). These were consulted in the October 27 audit; recheck mutable provider functionality before relying on it in a later session.
