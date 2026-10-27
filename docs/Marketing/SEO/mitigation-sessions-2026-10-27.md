---
type: Operational
title: "SEO and GEO mitigation — individual agentic session briefs"
description: "Dependency-ordered specialist preparation, Next.js implementation, independent verification and conditional release/learning sessions."
tags: [uaroute, seo, geo, agents, planning, handoff]
---

# Individual session plan

**Prepared:** 27 October 2026. **Status:** all sessions defined, none launched by this document. The owner requested preparation for final implementation by a Next.js expert. This is a reusable launch/handoff plan, not an instruction to create chats, agents, automations or external actions automatically.

Controlling requirements: [technical specification](mitigation-spec-2026-10-27.md), [existing acquisition work order](priority-acquisition-increment-2026-10-24.md), [working agreement](../../Operations/Agentic/Operational/working-agreement.md). Read the specification once per session, then only the relevant inputs below. Keep the [state register](../../../ops/agent-state.json) for compact continuity; research is in the [KB](../../knowledge-base.md#knowledge-base), `wiki/Marketing/SEO/audit-2026-10-27.md`.

## 1. Sequence and concurrency

| Session | Role | Starts after | Result |
| --- | --- | --- | --- |
| S01 | SEO/GEO evidence analyst | This plan | Seven-URL search/index/AI baseline or explicit access gaps |
| S02 | Fact-checker and passenger research editor | This plan | Claim ledger, corrections and evidence-supported planning needs |
| S03 | SEO/content architect | S01 and S02, allowing documented nonblocking data gaps | Seven-page intent architecture and internal-link/content brief |
| S04 | Ukrainian copywriter and factual editor | S03 + S02 ledger | Complete final copy, metadata and corrected distribution drafts |
| S05 | UX/UI designer | S03; final freeze after S04 | Real-copy responsive design and interaction-state handoff |
| S06 | Measurement and performance engineer | This plan; use S01 observations when available | Reproduction-based measurement plan, baseline and privacy-safe test recipes |
| S07 | Next.js expert, technical preparation | S04 + S05 + S06 | Implementation-ready file map, decisions, test oracles and frozen manifest |
| S08 | **Next.js expert, implementation owner** | S07 passes readiness | One integrated local application candidate |
| S09 | Independent verification reviewer | S08 | Accepted candidate or bounded defect list returned to S08 |
| S10 | Release engineer | S09 + actual release authorization | Immutable authorized publication and live verification |
| S11 | Distribution editor/operator | S04 + corrected pages live + posting authorization | At most three appropriate manual placements with factual logs |
| S12 | SEO/GEO outcome analyst | Release/exposure dates actually exist | Weekly observations and initial four-week decision |

Preparation can run S01/S02/S06 independently if parallel work is explicitly launched and each owns separate files. S03 follows evidence; S04 and S05 exchange one consolidated review round, with more only for unresolved defects. S07 checks integration, not another open-ended rewrite. S08 is the sole production-code writer. S09 returns corrections to S08 rather than creating a competing implementation. S10 and S11 are conditional external phases; S12 is a planned review, not a scheduled automation.

If unavailable GSC/CrUX data persists, label those fields unknown and continue safe research/copy/design. Do not hold the whole chain behind a subscription or a ranking report. Do not implement a measurement fix without a reproduced current issue. No promised numeric growth, completion date or token budget is implied.

## 2. Shared launch contract

Use the following preamble with each session's launch prompt:

> Work only on the named session in `docs/Marketing/SEO/mitigation-sessions-2026-10-27.md`, applying `mitigation-spec-2026-10-27.md` and higher-level project contracts. Record branch/HEAD, dirty scope, input artifact versions and actual tool availability first. You share this codebase with other contributors. Preserve their changes. Edit only your assigned files and adapt to existing work. Do not revert unrelated changes. Scope is preparation unless the session explicitly owns implementation; the current user instruction still governs authorization. Do not commit, push, deploy, change accounts or send messages without applicable user authorization. Close with concrete artifacts, verification, unknowns and the next dependency; do not claim planned work was executed.

Use a single portable preparation directory in the site: `docs/Marketing/SEO/mitigation-2026-10/` (called **D** below). These are ordinary version-control-eligible handoff documents, not a new tooling framework. Create only the files owned by the active session and let `docs:index` generate navigation. Raw captures/traces remain in ignored `output/seo-geo-mitigation-2026-10/`; durable dated research belongs in the configured KB. Preparation artifacts must summarize essential decisions so the implementer does not require raw output or the optional vault.

Each artifact includes YAML metadata, scope/status, date, input references, source-versus-live distinction, decisions and requirement IDs. Each session result identifies `ready`, `ready-with-explicit-unknowns`, or `blocked` for its own dependent work. A blocker names the missing evidence/decision and the smallest resolution; it does not silently expand scope.

**Common acceptance:** correct links and generated indexes; no new operational facts/authority, passenger records, credentials or private transcripts; one bounded summary. Documentation-only sessions run docs indexing/checks, not full builds. KB edits additionally use explicit `UAROUTE_KB_ROOT` and KB checks. Only S08 performs the stable broad application check; S09 reuses tied evidence and reruns checks only where needed for independent verification/new defects.

## 3. S01 — Search, index and AI-discovery evidence

**Role:** SEO/GEO analyst. **Mode:** read-only external research; writes only `D/search-baseline.md` and sanitized supporting evidence within its own output folder.

**Inputs:** spec SG-01; seven-URL list in existing acquisition work order; current state-register GSC entries; saved October 27 audit and evidence addendum. Use site-audit skill only if the connector is available; do not retry an unchanged subscription failure or purchase access. Prefer existing authorized direct GSC access/owner exports as fallback.

**Work:** inspect the seven priority URLs and preserve previous dated observations. Record HTTP/robots/canonical/indexed reason/last crawl/sitemap state and source confidence. Gather settled page/query/country/device data and comparable previous period if available. Inspect Google AI inclusion and impressions and Bing citations/topic data only where account access exists. Separate query hypotheses from measured demand, and explain whether each page needs an indexing fix, content work or no action. Preserve the Hannover lane even if fresh data is inaccessible. Do not use `site:` result counts as coverage proof.

**Output schema:** URL; observed date; method/raw evidence reference or transcription label; indexed state; reason; declared/selected canonical; last crawl; sitemap evidence; ordinary search exposure; AI exposure; next action; confidence/access limitation. Include exact dates/timezones, filters and completeness of reports.

**Done:** seven rows with evidence or explicit unknown; page-specific recommendations; no recrawl requests, settings changes or invented opportunity scores. Unknown visibility does not prevent S03 using existing intent and approved priority.

**Launch prompt:** “Execute S01 only: prepare the seven-URL SEO/GEO baseline for UARoute. Reuse dated observations without calling them current, obtain fresh evidence where accessible, and produce `D/search-baseline.md`. Do not submit URLs, mutate accounts or buy a connector. Hand off evidence and query hypotheses separately to S03.”

## 4. S02 — Claims, source verification and passenger needs

**Role:** factual editor/researcher. **Mode:** read-only site/source/web; writes only `D/claims-ledger.md` and `D/passenger-needs.md`.

**Inputs:** SG-02; current route/hub/guide content, source links, `src/data/AGENTS.md`, existing claims-review contract and community draft. Read source contents rather than trusting a nearby citation. Use current primary authorities for any customs/legal topic; avoid individualized advice.

**Work:** check unsourced 1–2 hour connection advice, proximity-based pickup implications, landmarks/transfer language, dates and operational claims. Distinguish geography, editorial guidance, verified service and unknowns. Inventory genuine passenger questions by direction: actual locality, connection planning, baggage, bicycle, return and contacting without a known date. Do not invent interviews, operator confirmations or findings from hypothetical passengers. Prepare questions for any missing human evidence without contacting anyone.

**Outputs:** claim-ID ledger with exact wording, current location, evidence scope, confidence and keep/rewrite/remove disposition; evidence-backed user-needs list; specific prohibited assumptions; official resources usable by copywriting. Include the misleading community placement as a correction item.

**Done:** every changed factual claim has a disposition; safe alternatives exist where evidence is absent; neither all nearby place names nor useful shared advice are removed mechanically.

**Launch prompt:** “Execute S02 only: build the claims ledger and passenger-needs brief for the existing priority pages and bicycle guide. Resolve the identified connection-time and pickup implications using sources or conservative rewrites. Do not edit application copy or contact carriers. Deliver exact constraints and source support for S03/S04.”

## 5. S03 — SEO/content architecture

**Role:** SEO strategist/content architect. **Mode:** documents only; owns `D/page-architecture.md`.

**Inputs:** S01/S02; SG-03; constitution §42; current route/hub/schema/link implementations. Fresh keyword data is optional; no external-tool repair is part of this session.

**Work:** map primary and supporting intent for Hannover, two hubs and four directional pages. Define which content is unique, shared, moved, retained or removed. Map inbound/outbound links to real existing URLs; pair selection alone never becomes a page. Identify changes supported by evidence versus experiments requiring sufficient exposure. Define the guide/trust support and exclude irrelevant broad blog topics. Preserve current title where no reason to change exists.

**Outputs:** per-URL table with intent, audience/direction, headline purpose, introduction promise, section order, unique usefulness, sources, canonical links, action/fallback, metadata brief and acceptance IDs. Include a URL-preservation list and an explicit no-new-pages decision. Identify any data-dependent title test as deferred if S01 lacks exposure.

**Done:** no competing page purposes or unsupported service promises; all seven URLs and supporting edits assigned; S04 can write without making SEO architecture decisions.

**Launch prompt:** “Execute S03 only: turn S01/S02 into an existing-page SEO/content architecture, prioritizing Lviv–Hannover and the two origin hubs. Deliver a complete seven-page matrix and crawlable internal-link plan in `D/page-architecture.md`, with query evidence separated from hypotheses and no new published routes.”

## 6. S04 — Ukrainian copywriting and editorial review

**Role:** Ukrainian copywriter with factual editing responsibility. **Mode:** documents only; owns `D/content-package.md`, `D/editorial-review.md` and revisions to the existing community-placement draft where necessary to remove its publication-ready misrepresentation.

**Inputs:** S02 claim IDs, S03 architecture, SG-04/SG-06, existing public terminology/identity contracts. Use actual Ukrainian copy in the handoff, not English placeholders or instructions to “add useful content”.

**Work:** produce final metadata/headings/intros/practical text/nearby explanations/FAQs/actions/source labels and relevant guide/trust edits, each keyed to page and section. Use retain/change/delete/move decisions and before/after for risky claims. Avoid repetitive warnings, generic filler and forced keywords. Keep date/phone-free carrier-site alternative clear. Do not treat the public carrier-neutral rule as a ban on the site's factual legal-operator identity. Review every source-backed statement and direction after the writing pass.

**Distribution correction:** inspect all three existing drafts, remove direct-service/plural-carrier implications, match the return-focused message to an existing suitable destination (or rewrite its intent), preserve affiliate disclosure and approved UTM enums. Do not create Hannover→Lviv as a workaround. Label ready-to-review versus actually published truthfully.

**Done:** final copy covers every changed field, claims map is complete, real review/date/author information is available or intentionally omitted, no placeholders, no unsupported comparisons/prices/stops. Record a consolidated editorial pass and hand off the exact revision to S05. No posts or messages sent.

**Launch prompt:** “Execute S04 only: write the complete Ukrainian content package from the accepted architecture and claim ledger, then perform a factual/terminology/direction review. Correct the existing misleading community drafts without publishing them. Give S05/S07 exact final copy and retain/delete/move decisions; do not edit TSX or catalog files.”

## 7. S05 — UX, visual hierarchy and responsive design

**Role:** UX/UI designer. **Mode:** inspect current UI and author design artifacts; owns `D/design-handoff.md` plus small linked design assets under `D/design-assets/`. No production source edits.

**Inputs:** S03/S04; SG-05; current visual/UX contracts and relevant manual QA scenarios. Use mobile-first-layout, floating-sticky-ui or visual-design-audit skills only as relevant; repository rules override generic framework/design assumptions.

**Work:** propose bounded improvements to search visibility on hubs and practical-content placement on routes using final copy. Preserve atlas identity, current tokens/fonts and one inquiry form. Specify mobile/intermediate/desktop layouts, actual text wrapping, focus/error/empty states, sticky transitions and external-link explanations. Label illustrative media honestly. Provide component-level spacing/layout changes and acceptance notes, not merely moodboards or screenshots. Prepare the existing 5–8-person usability protocol; participant recruitment/contact is not implied.

**Outputs:** annotated real-copy layouts, before/after rationale, component/state mapping, responsive and accessibility table, retained interactions, image purpose/rights/provenance if any new asset is proposed, and unresolved decisions. Use stable local images/docs rather than requiring a paid design service.

**Done:** S04 final copy fits without tiny text/overflow; actions are clear and unobscured; keyboard/reflow/zoom requirements are specified; no brand redesign or unsupported operational imagery. Final layout revision references the exact copy revision.

**Launch prompt:** “Execute S05 only: design the bounded hub/route/guide hierarchy improvements with S04's real Ukrainian copy. Produce an implementable responsive/component handoff, preserving existing branding and inquiry behavior. Annotate mobile, desktop, keyboard, zoom and sticky states; do not modify application code or invent service imagery.”

## 8. S06 — Measurement, privacy and performance diagnosis

**Role:** analytics/performance engineer. **Mode:** read-only external/provider inspection and intercepted local diagnostics; owns `D/measurement-contract.md`, `D/performance-baseline.md` and its bounded output evidence. No application/account edits.

**Inputs:** SG-07/SG-08; GA4 reporting skill; analytics contract; current normalization source and deployment provenance; S01 when available. Confirm property 557859031 and isolation before provider calls.

**Work:** inspect settled post-fix production-host reports and test contamination; verify source/live distinction before calling direct/direct an active bug. Define matched-unit handoff metrics and exact query recipes with completeness limits. Separate AI impressions/citations from referrer sessions and actual carrier outcomes. Check existing allowlists rather than adding every AI domain speculatively. Establish comparable mobile performance baseline and a privacy-safe browser test plan; no synthetic collector or operator traffic leaves the harness.

**Outputs:** each suspected defect has reproduction, current expected/actual, affected source and bounded remedy or “no change”. Report recipes specify analytical unit/date/timezone/filter/aggregation. Performance record specifies candidate, build mode, tool/version, viewport/throttle/consent, three-run median and diagnostic evidence. Unknown field vitals stay unknown.

**Done:** S07 knows precisely whether analytics code is needed. No new vendor/events/storage/account settings or global configuration. Missing CrUX or provider report does not manufacture a failing performance score.

**Launch prompt:** “Execute S06 only: diagnose current measurement quality and establish a comparable performance baseline. Confirm whether historical direct/direct rows still represent a current production defect. Deliver exact reporting/test recipes and justified code-change candidates or no-change decisions. Preserve consent, zero-PII telemetry and external-handoff interception.”

## 9. S07 — Next.js implementation-readiness review

**Role:** Next.js expert; use the available `nexter` specialist for this scope when delegating is explicitly launched. **Mode:** read-only application review; owns `D/implementation-plan.md` and `D/readiness-manifest.md`.

**Inputs:** completed S04/S05/S06 plus S03; SG requirements and AC01–AC15; scoped AGENTS and installed Next docs. Repository npm/TS6/static export/current versions override a generic specialist's pnpm/TS7/i18n defaults.

**Work:** inspect exact components/types/test coverage; map every accepted change to files and requirement IDs. Decide whether route editorial dates need a minimal type extension, how visible provenance/schema/sitemap share truthful dates, and whether any analytics correction is justified. Prefer existing helpers/components; avoid new dependencies. Confirm Node22 and browser/verification availability without installing globally or changing account permissions. Define independent expected URL/schema/behavior fixtures before implementation; do not merely mirror production helpers.

**Outputs:** file ownership map; implementation order; migration/compatibility decision (normally none); focused test plan; immutable input list with content/design versions or hashes; included/deferred work; contradiction/unknown register; G2 decision. Essential final decisions must be readable from site docs without the KB or transient chat.

**Done:** no unresolved copy/layout/operational facts remain in the included package. Record blockers narrowly; absent search exposure may defer a title experiment without blocking safe copy. Resolve a mismatch with one consolidated feedback packet to its owning preparation session.

**Launch prompt:** “Execute S07 only as the Next.js expert: review the frozen copy, design and diagnostics against the installed application, then write the exact implementation/test plan and readiness manifest. Keep npm, TypeScript 6, static export and current dependencies. Do not implement yet; return a concrete G2 decision and file-level work order for S08.”

## 10. S08 — Final Next.js implementation

**Role:** **Next.js expert, sole implementation owner**. **Mode:** local code changes when this implementation session is requested. Owns only the files listed in the accepted S07 plan plus their dependent tests/fixtures and a completion record `D/implementation-result.md`.

**Inputs:** G2-passing manifest; exact final copy/design; current repo baseline; relevant installed Next docs. Recheck source drift since S07 before editing. Use edit-catalog and verify-pages skills where applicable. Do not improvise new copy, redesign the product or implement deferred measurement guesses.

**Work order:** apply typed content/provenance changes; integrate layout and accessibility; align metadata/schema/freshness; implement only proven measurement corrections; update independent affected tests/export expectations; run focused checks; freeze the candidate; run one stable `npm run check`; execute affected intercepted browser/visual flows and comparable performance checks on that candidate. Keep builds sequential in shared output directories. No real inquiry sends.

**Required regressions:** published/inline/unsupported pair distinctions including IF↔Hannover inline; reverse pair/country preservation; editorial exclusion; carrier-site fallback without date/phone; one form and Enter/validation/focus behavior if affected; no passenger canaries in telemetry/storage; first-touch versus target path and complete referral pairs. Preserve existing security fixes and receiver contract.

**Done:** source/export identity, runtime, changed files, test results, screenshot/trace references, before/after diagnostics and unknowns captured. Local pass does not mean committed/deployed. Return all material blockers; do not relax acceptance to force a pass.

**Launch prompt:** “Execute S08 as the Next.js implementation expert using the accepted S07 manifest. Implement only the approved copy/design/technical changes and dependent tests. Preserve the static architecture, catalog/referral identities and privacy contracts. Run focused checks, one stable full check and affected intercepted browser verification. Deliver a local candidate and evidence for independent S09; no commit/push/deployment unless separately authorized.”

## 11. S09 — Independent acceptance review

**Role:** reviewer independent of implementation reasoning; a separate session, not a claim of current completed review. **Mode:** read-only candidate inspection/tests; owns `D/acceptance-review.md` and its evidence. No parallel production-code edits.

**Inputs:** spec AC01–AC15; frozen preparation manifest; implementation diff and same-candidate evidence. Use verification skills as relevant. Reuse complete tied check results rather than rerunning every build automatically.

**Work:** inspect factual/source support and Ukrainian copy; verify real-copy layout against design; test changed keyboard/mobile/reflow behavior; inspect static content, metadata, schema, links and sitemap; verify inquiry/privacy boundaries with intercepted handoffs. Independently spot-check high-risk tests and expected oracles. Distinguish missing native-device/human usability execution from browser emulation. Audit any numeric performance conclusion against comparable runs.

**Output:** AC-by-AC pass-local/fail/unknown/not-applicable table, exact candidate, prioritized concrete defects, acceptance recommendation and release prerequisites. A defect includes page/state/steps/expected/actual and whether it blocks this scope.

**Done:** no unresolved factual/privacy/routing/severe accessibility defects. Return a consolidated correction batch to S08 if needed; re-review affected changes and repeat broader tests only when justified. Human usability unknown is disclosed without inventing participation.

**Launch prompt:** “Execute S09 only: independently verify the frozen S08 candidate against the mitigation specification and accepted preparation artifacts. Test the highest-risk changed behavior safely and inspect the actual static output. Produce AC-by-AC evidence and a bounded defect list or local acceptance; do not change implementation or equate local acceptance with deployment.”

## 12. S10 — Authorized release and live verification

**Role:** release engineer. **Mode:** preparation is read-only; commit/push/deployment requires actual user authorization covering those actions. Owns a dated release receipt and corresponding state-register update.

**Inputs:** S09 accepted candidate, current [CUTOVER](../../../CUTOVER.md), actual repository/release policy and immutable artifact identity. Older approvals/evidence are not generalized to this new release. Prepare the complete reviewable release package before asking for any missing final authorization.

**Work:** verify CI/build identity, artifact completeness and recoverability; prefer existing Actions/OIDC; preserve old assets/recovery; publish only authorized candidate; read back representative changed pages plus canonicals/robots/sitemap/redirects/404 and consent/inquiry boundaries without live QA sends. Record deployment timestamp separately from content update dates. Request indexing only when separately authorized and a fresh inspection justifies it; do not duplicate recent requests blindly.

**Done:** source/export/CI/deployment/recovery fingerprints and actual live checks recorded. Unknown indexing/provider receipt/operator outcomes remain unknown. If release is not authorized, stop at a ready release package; do not label the work published.

**Launch prompt:** “Execute S10 within the release authorization actually provided: prepare and verify the S09 candidate for immutable Actions/OIDC publication under CUTOVER, then publish only if authorized and perform bounded live readback. Record recovery and exact candidate identity; do not activate Ads, change accounts or send carrier inquiries.”

## 13. S11 — Conditional community distribution

**Role:** distribution editor/operator. **Mode:** read-only channel review and final draft preparation; sending/posting requires explicit user instruction for recipients/destinations. Owns a nonpersonal placement log and final corrected drafts, not application code.

**Inputs:** S04 corrected drafts, [existing placement package](community-placements-2026-10-25.md), actual S10 live destinations and channel rules. Do not duplicate already published placements; check existing dated logs first.

**Work:** confirm audience/direction/page match for one Lviv-focused, one IF-focused and one destination/return-focused placement; verify rules and affiliation disclosure; preserve existing UTM enums and privacy. If authorized, publish manually within the approved scope, then verify saved/public state and record evidence. No bulk messaging, bought links, scraping, invented testimonials or implied direct services. Channel membership alone is not permission to post.

**Done:** three reviewed placements at most, each tagged prepared/published/blocked with actual date/link/exposure evidence when known. Do not record passenger data or treat views as inquiries. If sending is not authorized, deliver ready drafts only.

**Launch prompt:** “Execute S11 only: verify and finalize the three corrected community placements against the now-live pages and audience rules. Publish only within an explicit current instruction naming the destinations; otherwise return ready drafts. Log actual exposure and publication separately from GA4 or carrier outcomes.”

## 14. S12 — Four-week learning and next increment

**Role:** SEO/GEO outcome analyst. **Mode:** bounded read-only reports; owns dated KB review(s) and a concise next recommendation. This plan does not create a recurring automation.

**Inputs:** actual release and placement dates, S01/S06 baselines, fresh scoped provider access, aggregate operator outcomes only if supplied through an authorized privacy-safe process. Do not contact the carrier automatically.

**Work:** review weekly over an initial four-week window after release/exposure start. Compare equivalent settled dates and changes in index/exposure/query mix before attributing CTR changes to titles. Examine production-host consented visits, deduplicated handoff sessions and private aggregate receipts/journeys separately. Track Google AI impressions and Bing citations where available; use a small stable Ukrainian prompt sample only as qualitative error/citation evidence, recording date/system/URL and selection limits.

**Decision rules:** fix eligibility if current evidence shows exclusion; improve relevance when exposure/intent mismatch is supported; test snippets only with enough comparable impressions; investigate contact friction when qualified visits do not progress; distinguish handoff from receipt if conversations remain unverified. Low exposure leads to a longer observation window, not a fabricated failure or automatic new route pages. No Ads spend or M2 expansion follows automatically.

**Done:** retained/changed/deferred recommendations with evidence and uncertainty; no unsupported ROI/citation-share claims or guaranteed uplift; next bounded work order and state handoff updated. Preserve external-action gates.

**Launch prompt:** “Execute S12 for the explicitly selected observation window: evaluate the released mitigation using settled, scoped search/AI/GA4 evidence and supplied aggregate outcomes. Separate technical publication, visibility, consented visits, handoffs and fulfilled journeys. Recommend a bounded next increment or longer observation; do not launch campaigns, create pages or schedule automation.”

## 15. First next session and handoff checklist

Start with **S01**, while S02 and S06 can be independently prepared if the user launches parallel work. S01 should first reconcile October 26 indexing evidence with currently accessible sources; it must not re-submit the already requested URLs by habit. S02 can proceed if GSC remains unavailable. Final application work starts only at S08 after S07's implementation-ready package.

Before S08, the implementer must have: seven-page architecture; claim ledger; complete Ukrainian copy and editorial review; real-copy responsive design/state map; measurement no-change/defect decisions; comparable baseline or explicit tooling limits; exact file plan; independent acceptance fixtures; frozen input revisions and residual unknowns. A missing commercial fact defaults to omission or a question, never a fabricated placeholder.

No new custom agent definition, skill framework, external service, repository, account change or paid subscription is required to execute these sessions. Roles describe expertise; they do not assert that a named custom agent already exists or authorize spawning it.
