---
type: "Specification"
title: "GTM and GA4 activation — implementation and release gates"
description: "Digital-marketing implementation task: event fidelity, consented GTM/GA4 activation, key events, six reports, EDD and recoverable release."
tags: ["uaroute", "product", "analytics", "release", "edd"]
---

# GTM and GA4 activation — implementation and release gates

Date: 2026-10-07. Owner: Roman; implementation and release: UARoute maintainer; reporting: digital marketing owner. Updated as a digital-marketing implementation task against Google documentation checked on 2026-10-07. Status: specified, not executed; production collection is not approved by this document alone. This specification operationalizes the [measurement contract](../knowledge-base.md#knowledge-base) (KB: `wiki/Marketing/gtm-ga4-measurement-spec-2026-10-07.md`), preserving its privacy gates and M1 booking boundary. [Configuration audit](../knowledge-base.md#knowledge-base) (KB: `wiki/Operations/Analytics/ga4-configuration-audit-2026-10-07.md`) establishes account configuration, not active production receipt.

## Goal and scope

The [Node.js, Next.js SSG and SEO execution plan](../knowledge-base.md#knowledge-base) (KB: `wiki/Product/gtm-ga4-execution-plan-2026-10-07.md`) translates this task into P0–P7 dependencies and X01–X09 technical evaluation. Its source review identifies the blocked-harness/readiness mismatch, explicit CI trigger requirement and disabled-candidate versus recovery-bundle distinction; resolve those before enabled promotion.

Deploy a recoverable, consented single-provider integration, then measure useful searches and contact intents. No passenger data, inquiry codes, selected dates or messages go to Google. No Ads, remarketing, cross-domain identity, automatic form/outbound collection, reservations or operator CRM. Коваль retains its independent property, consent and release ownership. An intent event does not prove a sent message, received inquiry or completed trip.

## Baseline and deployment readiness

Verified IDs: property 557859031, stream 16060537484, GA4 G-PMXHF9YT7V, GTM GTM-WD2F63V5. Account/privacy settings and ten event-scoped dimensions are verified through MCP/browser. Local .env, .env.example and repository Variables supply the IDs with activation false. GTM takes precedence over direct GA4. The provider remains behind explicit visitor consent.

At the start of this review main was one commit ahead of origin/main: integration commit 6fc413a. It and the public configuration/release-guidance update were subsequently pushed in 1045abdb2e6ee84b9ce54e1e6101194386bbf5d2. The [disabled deployment readiness record](../knowledge-base.md#knowledge-base) (KB: `wiki/Operations/Analytics/Releases/deployment-readiness-2026-10-07.md`) contains the current Actions candidate evaluation. Local full npm run check passed and disabled-release dry-run passed for 233 files, manifest fingerprint ba094ad0e941a163ff5a3b641e2b8bf801e031acc8e58d8789b544c0af2ceef7. This local fingerprint is not an eligible Actions promotion candidate and must not be used as though it identified a successful CI run.

Existing production Actions tooling has dated successful deployment/recovery evidence in the [Actions acceptance](../knowledge-base.md#knowledge-base) (KB: `wiki/Operations/github-actions-production-acceptance-2026-10-07.md`). No fresh AWS authentication, production backup or current candidate was verified in this preparation. Each deployment repeats those gates. Full staging CloudFront rollback rehearsal remains an independently open reliability criterion.

## Ordered implementation steps

1. **Freeze the baseline.** Review source, IDs, consent template and accepted workspace export together. Commit only the intended slice, push it and obtain successful main CI. Record full SHA, run ID, public settings, artifact and edge hashes. Keep activation false. Inspect the independently downloaded artifact, not just current GitHub Variables; confirm no Google provider requests on the disabled build.
2. **Close privacy and business-flow evidence.** Use synthetic canaries and blocked external destinations. Capture actual requests for unknown/declined consent; accepted arrival; repeated readiness; SPA navigation and return; sparse envelope resets; form entry/validation/contact clicks; withdrawal/reacceptance; unavailable storage; blocked provider. Verify both directions and country restrictions. Do not send a WhatsApp message. Add regressions only for actual uncovered behavior or failures. Re-run npm run check after changes.
3. **Review GTM as executable configuration.** Confirm exactly the approved consent initialization, Google configuration and allowlisted event tag; no raw Page URL/Referrer, form scraping or automatic link/history tags. Verify required analytics_storage, denied advertising states, narrow template permissions and safe canonical fallback. Preview actual payloads and GA4 DebugView receipt. Save export fingerprint and version evidence; never publish an empty container as a substitute.
4. **Deploy the disabled baseline if needed.** Promote its exact successful CI artifact through manual Actions with fresh independently retrieved recovery and completed invalidation. Verify search, inquiry validation, redirects, 404s and referral JSON. This proves release/recovery transport without enabling collection; it does not close Google live-receipt acceptance.
5. **Prepare the controlled activation candidate.** Once pre-release privacy gates pass, publish the reviewed GTM version and record version/export hash. Change only the activation Variable to true for a new main CI build. Record the resolved three build settings alongside the authenticated run/SHA/hashes. Inspect the resulting artifact; do not rebuild at promotion. Retain the reviewed disabled artifact and its recovery identity as the immediate site fallback. Account IDs are public; do not embed credentials or GTM preview tokens in evidence.
6. **Promote and verify live measurement.** Use the existing scoped Actions deployment workflow. Complete backup retrieval, upload verification and invalidation. Test production declined and accepted sessions with Tag Assistant/DebugView, canonical payloads and single-provider behavior; repeat essential business smoke. Query only property 557859031 through MCP for stream mapping and actual realtime receipt; processed reports may be empty and are not an automatic failure. Label synthetic verification traffic in evidence and exclude it from demand conclusions. Never infer business receipt from analytics.
7. **Deliver useful reporting.** Save reproducible definitions for acquisition/landing views, city-pair searches, route interest and contact intents by placement. Use registered customEvent dimensions, explicit periods/timezone and defined denominators. Show event ratios separately from user funnels; report repeat events, consent/blocked coverage limitations and unavailable coverage honestly. Consent coverage is not measurable from GA4 alone. Key events, if configured, label whatsapp_click and koval_site_click as contact intents. Operational received/confirmed/travelled figures remain separate.
8. **Record acceptance and watch the first period.** Save dated gate results, live container version, Actions identities, receipt evidence and fallback recovery hash in Operations. Review first processed reporting after data becomes available without assuming a fixed delay proves missing traffic. Update the site plan and setup register with actual status. Acquisition still requires feasible routes, operator reporting and real received inquiry.

## EDD evaluation and evidence

Use the original A1–A12 identifiers; this table defines the remaining work, not replacement privacy standards. Every row is PASS, FAIL or UNKNOWN with a dated evidence link. A partial browser observation is UNKNOWN for the uncovered cases.

| Gate | Required result | Current evidence / remaining work |
| --- | --- | --- |
| A1 | Correct owner, country and separate IDs; sharing off | Verified account/configuration audit |
| A2 | False/missing/malformed config fails closed | Unit/full-check and disabled export pass; verify actual downloaded CI artifact |
| A3 | No Google requests before consent or after decline | Complete request capture still required |
| A4–A5 | One current arrival view; SPA/return/readiness do not duplicate or replay actions | Preview/unit evidence partial; complete return and repeated-signal traces |
| A6 | One provider; sparse events carry no stale fields | Unit and reviewed preview evidence; retain independent payload trace |
| A7 | Actual hits omit every private canary and raw URL/referrer | Route query/hash preview partial; complete form/contact-action matrix |
| A8 | Withdrawal blocks collection and reloads safely; unavailable storage works | Withdrawal preview partial; storage-unavailable trace required |
| A9 | Search/reversal/inquiry work with consent denied and provider blocked | Complete blocked-provider and keyboard/mobile business checks |
| A10 | Enhanced Measurement off; ad denials and narrow template verified | Account settings verified; exact published version/export required |
| A11 | Authenticated CI identity, reviewed settings/bytes, retrieved recovery, invalidation and live acceptance | Existing release tooling proven; new configuration candidate and live receipt required |
| A12 | Reproducible reports separate intent from outcomes and state coverage limits | Dimensions verified; saved report definitions and operational reconciliation pending |

Before any enabled production promotion, A1–A10 and the pre-release portion of A11 must pass. The controlled activation is the verification step for A11's live measurement portion; it is not declared accepted until that evidence passes. Stop or recover immediately on a failed live privacy/provider/business check. This makes the original A11 release sequence explicit without treating local checks as live evidence.

## Recovery and stop conditions

Any privacy leakage, duplicate-provider behavior, unexpected advertising consent or broken passenger flow stops promotion or triggers recovery. Setting the GitHub flag false affects only a new build and is not an immediate shutdown of deployed code. Restore the reviewed disabled site artifact through the existing recovery workflow, wait for invalidation and verify clean denied/disabled sessions. Retain the known-good GTM version/export so a container error can also be reverted and reverified. Container changes can affect already deployed clients; do not change tags during a site acceptance run.

Do not declare deployment ready when the CI candidate, recovery retrieval or reviewed hashes are missing. Do not declare analytics enabled from a successful build, GTM publication or an empty processed report. Completion requires live single-provider privacy evidence plus actual GA4 receipt; A12 reporting readiness is reported independently.

## Marketing decisions this implementation must support

The primary question is which measured acquisition source, landing page and directional city pair produces contact intent. This supports choosing one acquisition cohort, improving an unhelpful landing page, fixing a search miss and prioritizing useful route content. It does not establish passenger acquisition cost, commission, incremental demand or confirmed travel without separate cost/outcome evidence.

Read the [marketing strategy](../knowledge-base.md#knowledge-base) (KB: `wiki/Marketing/15-marketing-development-strategy.md`), [UTM strategy](../knowledge-base.md#knowledge-base) (KB: `wiki/Marketing/utm-strategy-2026-10-07.md`) and [cohort plan](../knowledge-base.md#knowledge-base) (KB: `wiki/Marketing/passenger-cohort-pilot-2026-10-07.md`). Prioritize Львів and Івано-Франківськ, both directions and the six selected German cities; no automatic SEO-page expansion. Review the first complete reporting week as a baseline, then one bottleneck/one proposed change per weekly review. No arbitrary target conversion rate is introduced without baseline and operational feasibility.

## Current-source gaps to resolve

This is an implementation task, not a request to reinstall accounts or duplicate the already shipped adapter.

1. RouteSearch emits origin/destination and optional routeSlug, but not resultCount or matchedRouteId although the adapter already supports them. Add resultCount=1 for an explicit commercial page match and 0 when no page matches, plus matchedRouteId only for a match. A zero does not mean the trip is impossible: the candidate inquiry fallback may still be eligible. Report this as **published page match**, not carrier availability. Keep zero-result fallback distinct in the report notes; do not add free-text searches or new city pairs.
2. booking_intent and the external contact event fire consecutively on the same valid inquiry submission. Preserve this behavior/name for compatibility, but label booking_intent **valid inquiry submission intent**. It does not measure form opening, form start or an independent preparation step. Do not build a form-start-to-submit funnel from it or count both events as two inquiries. Any future form-start/error taxonomy is a separate decision, not necessary for activation.
3. Audit that public page_title reflects the current SPA page if emitted/used; no field values enter titles. Use canonical page paths as the required reporting key, so title omissions do not require inventing a title parameter. The current routeStatus describes catalog publication, not confirmed service or available seats.
4. Validate every tag-mapped field against the application schema and actual emitted value. Reuse the existing ten custom dimensions; add only an event-scoped resultCount dimension with a bounded 0/1 vocabulary if needed for the search report. Do not register routeSlug alongside routeId or event_timestamp as a dimension. No historical data backfill is promised.
5. Acquisition reports use customEvent:source/medium/campaign/landingPage as **first touch within the current document/SPA context**. Because raw referrer and tagged page URLs are deliberately removed, native GA4 Traffic acquisition and attribution reports must not be assumed to reproduce this application attribution. Do not introduce raw URLs, longer-lived attribution or standard campaign-field overrides merely to make a default report look populated.

## Event and key-event contract

Keep the seven approved event names. Google may also generate standard first_visit, session_start and user_engagement after consent; these are not additional application funnel steps. Never emit purchase, generate_lead, reservation_confirmed or travelled for a click.

| Event | Required marketing meaning | Context and exclusions |
| --- | --- | --- |
| page_view | One current published page arrival | Canonical current page plus bounded document acquisition; no prior-page replay |
| route_view | One direction detail arrival | Public routeId, origin, destination where available; catalog status is not feasibility |
| route_search_completed | Valid cross-country search submitted | origin, destination, page-match resultCount 0/1; matchedRouteId only on match; no free-text alias |
| booking_intent | Valid inquiry submission intent | Same submit as the external action; not form start, sent inquiry or reservation |
| whatsapp_click | Attempt to open the prepared WhatsApp contact | Existing ctaLocation, conversionType and public direction; never href/message/phone/date/code |
| koval_site_click | Attempt to open a partner referral | Existing placement/direction and conversionType; not partner arrival or operator receipt |
| related_route_click | Interest in another direction/page | Approved public source/target catalog IDs; no implied booking |

Designate whatsapp_click and koval_site_click as GA4 key events, counted **once per session per event type**. Keep raw eventCount for repeat-click diagnostics. Their combined keyEvents count is not a unique-session or unique-passenger total: the same session can use both channels. Leave booking_intent unmarked to avoid double-counting the same valid submit. Use sessionKeyEventRate only with the precise event filter and scope supported by GA4; verify compatibility before saving a query. No monetary key-event value or revenue is assigned. Google distinguishes per-event and per-session key-event counting; this choice is a UARoute reporting decision, not a substitute for operator outcomes. [Counting methods](https://support.google.com/analytics/answer/13366706?hl=en).

## Reports to deliver, not just configure tags

Save each definition with name, business question, period, timezone, filters, dimensions, metrics, denominator, exclusions, source and one reproducible query/export. Verify metric/dimension compatibility through MCP/API metadata and checkCompatibility where exposed; use GA4 UI if a MCP feature is unavailable. A saved specification with no actual compatible execution is not report acceptance.

The existing shared MCP has a previously reproduced advanced-funnel response-classification gap. R5 must use a verified funnel response or the native GA4 exploration UI; a wrapper's NO_DATA label alone cannot establish an empty funnel. Do not alter shared credentials, other projects' properties or the MCP adapter as part of this site activation task. Preserve actual property-only dispatch evidence and query/result provenance.

| Report | Required breakdown / measurement | Decision supported |
| --- | --- | --- |
| R1 — Consented acquisition and landing pages | page_view eventCount by custom source, medium, campaign, landingPage; current-page views by canonical path separately | Which entry context deserves attention; distinguish first landing from later navigation |
| R2 — Direction search and page matches | route_search_completed eventCount by origin, destination, resultCount; unknown/missing result values listed | Which pairs generate interest and lack an explicit page; zero is not unavailable transport |
| R3 — Route interest | route_view eventCount by routeId, origin, destination and bounded source | Prioritize useful direction content and both return/forward messages |
| R4 — Contact intent | whatsapp_click and koval_site_click separately by CTA, direction and source; raw count and properly scoped key-event measure | Identify useful contact placements; no sent/received claims |
| R5 — Observed user path | Optional closed user funnel page_view → route_view → either contact event, allowing intervening events; separate search-to-contact path | Diagnose measured navigation drop-off; not every visitor must search or visit a route detail |
| R6 — Data quality and business reconciliation | Missing required dimensions, duplicates, unknown acquisition, synthetic/debug exclusions, receipt gaps and separate operator aggregates | Establish whether the preceding reports can support a decision |

Use eventCount for bounded event-scoped acquisition breakdowns; do not silently sum totalUsers across rows or treat custom first-touch fields as lifetime user acquisition. Do not sum different funnels or treat a missing step as a failed booking. Direct arrivals and candidate fallback inquiry flows remain valid alternative paths. For event ratios, report contact-action events divided by relevant page/route-view events with matching period and scope; repeated actions can exceed 100%. For user/session rates, use a correctly scoped deduplicated report, not event-count division. Small samples are descriptive and do not prove causality.

Reporting period defaults to the last completed Warsaw calendar week, with a same-length prior period only when available. Two-month event/user retention limits exploration history; it does not erase standard aggregate reporting. [Google retention guidance](https://support.google.com/analytics/answer/7667196?hl=en). Realtime/DebugView verifies arrival, not processed-report completeness. Return NO_DATA/UNKNOWN honestly, inspect processing metadata and recheck when data is available; do not fabricate populated reports or a fixed receipt SLA.

No total-visitor or consent-rate denominator is available from this consented-only GA4 collection. Display **consented, unblocked observed traffic; total coverage unknown**. GSC impressions/clicks and operator aggregates have different populations; show them alongside with periods and limits, never join them by passenger identity or present them as a single exact conversion funnel. Save only aggregate reports; no user/client/session identifiers in exported marketing evidence.

## QA traffic, consent UX and performance

Use GTM Preview/debug traffic only for synthetic verification. Keep debug mode off in the normal production configuration. Inspect existing data filters before any change; begin a developer filter in Testing if used, verify its selection, and do not activate permanent exclusion without separate owner approval. Until a tested exclusion exists, report synthetic time windows and their contamination explicitly. Do not assume adding debug_mode alone removes test events. Google notes that active filters permanently affect incoming data. [Data filters](https://support.google.com/analytics/answer/13296761?hl=en).

Consent UX must retain Ukrainian copy, clear accept/decline, keyboard focus and an accessible way to withdraw. No banner interaction blocks search or inquiry. Reuse the current consent implementation; do not add a CMP dependency solely because Google documents CMP options. Consent storage is separate from acquisition storage. Document actual localStorage/cookie purpose and expiry after accepted collection; two-month server retention is not a cookie expiry setting. No automatic decision to shorten/extend Google cookie lifetime is made here.

Record before/after requests, application JS cost and representative mobile business interaction. Zero Google requests is required before consent; once accepted, the integration must cause no uncaught errors, duplicate providers, heavy new dependencies or interaction regression. A measured new performance problem requires correction; no fabricated Lighthouse improvement or consent-denied tracking is accepted as optimization.

## Assignable implementation task

**Task: Enable consented UARoute demand measurement end to end.** Read this specification, the measurement contract and current Operations evidence first. Start from the verified disabled candidate; retain its exact recovery identity. Do not repeat account creation or assume drafts are published.

| Work package | Responsibility / files | Deliverable |
| --- | --- | --- |
| T1 — Baseline and event fidelity | Developer: src/lib/analytics.ts/tests, src/components/RouteSearch.tsx and analytics components only as failures require | Bounded page-match result fields; documented actual submit semantics; minimal meaningful regression checks |
| T2 — Consent and payload acceptance | Developer/QA: existing consent/provider code and scripts/poc-browser.mjs; use verify-pages after UI/flow edits | Completed A2–A9 browser/request evidence with synthetic inputs and blocked real sends |
| T3 — Container and property setup | Measurement implementer: existing UARoute GTM/GA4 only | Reviewed narrow template/tags, published version/export, audited settings, two intent key events, useful dimensions |
| T4 — Recoverable release | Release maintainer: existing CI/deploy/rollback workflows and manifests; no AWS permission expansion | Successful enabled CI, authenticated downloaded-candidate review, fresh recovery, completed invalidation and A11 live acceptance |
| T5 — Marketing reporting | Digital marketing owner with read-only MCP and GA4 UI fallback | R1–R6 saved definitions/compatible calls, first baseline or honest no-data state, operator/outcome limitations |
| T6 — Handoff and operating review | Maintainer + marketing owner | Dated Operations acceptance, current site-plan status, version/run/hash/recovery pointers and first weekly review task |

Do not revert unrelated work. Do not alter the receiver site in this task; report any receiver dependency separately. Tests and real Google verification are different deliverables. Store implementation contracts in Product, reporting requirements in the existing Marketing measurement spec, and dated evidence in Operations/Analytics. docs remains ignored; regenerate OKF indexes and validate. Run npm run check before marking implementation complete.

## Additional marketing EDD criteria

These supplement A1–A12; none certifies a completed passenger journey.

| ID | Pass criterion | Evidence |
| --- | --- | --- |
| M01 | Existing seven application events have accurate meanings and public bounded context | Source-to-event table plus inspected actual payloads; submit events not counted as independent stages |
| M02 | Search match fields distinguish explicit page match 1 from no page match 0 in both directions | Match and candidate-fallback cases; no same-country search telemetry or raw aliases |
| M03 | Exactly two contact-intent key events use documented once-per-session counting | GA4 settings snapshot/API readback; repeat raw counts remain available; no monetary value |
| M04 | Required R1–R4/R6 have compatible saved definitions and reproducible executions, or explicit data-unavailable evidence; optional R5 is executed or explicitly deferred | Definition/query/result registry; custom/native attribution scope disclosed |
| M05 | No misleading totals or conversion rates | Review of denominators, channel union/deduplication, repeated clicks and alternate visitor paths |
| M06 | QA traffic is identified and production debug mode is off | Preview/settings/request evidence; filter state documented without unapproved permanent exclusion |
| M07 | Privacy and business UX remain intact on mobile/desktop | Consent controls, withdrawal, no-provider business smoke, actual cookie/storage inventory and performance comparison |
| M08 | A marketing owner can operate the weekly review independently | Aggregate baseline, missing-data register, one decision/next test and separate operator evidence |

Definition of done: A1–A11 live acceptance, A12/M01–M08 reporting acceptance, reproducible source/config/release evidence and verified recovery readiness. Report incomplete operational reconciliation separately rather than claiming fully enabled commercial attribution. This task definition does not publish a container, activate tracking or send real messages by itself.

## October 2026 practice review and source decisions

Primary Google documentation was checked on 2026-10-07. This is a dated implementation choice for UARoute, not a claim that every default Google setting is suitable or that consent configuration alone certifies legal compliance.

| Guidance | UARoute decision |
| --- | --- |
| [Basic versus Advanced Consent Mode](https://developers.google.com/tag-platform/security/concepts/consent-mode) | Basic: no Google collection before agreement; do not introduce denied-state cookieless pings |
| [GTM consent APIs](https://developers.google.com/tag-platform/tag-manager/templates/consent-apis) | Narrow custom template uses default/update APIs; no Custom HTML consent queue |
| [SPA measurement](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications) | Preserve manual app-owned page views; validate navigation/return in DebugView; automatic history tracking stays off to avoid duplicates |
| [Avoiding PII](https://support.google.com/analytics/answer/6366371?hl=en) | Sanitization and actual-hit inspection are primary controls; no URL redaction-only substitute |
| [Custom dimension best practices](https://support.google.com/analytics/answer/14240153?hl=en) | Reuse useful bounded event dimensions; no personal/request/time identifiers or duplicate route definitions |
| [Key events](https://support.google.com/analytics/answer/12844695?hl=en) and [counting methods](https://support.google.com/analytics/answer/13366706?hl=en) | Mark contact intent, not sale/booking; define counting and effective configuration date |
| [Data API reports](https://developers.google.com/analytics/devguides/reporting/data/v1/basics) and [quotas](https://developers.google.com/analytics/devguides/reporting/data/v1/quotas) | Prefer small aggregate compatible reports; bounded dates/rows, deliberate pagination and quota-aware retries; no unbounded polling |

Ads links, enhanced conversions, Google Signals, server-side GTM, BigQuery export, paid campaign activation, native campaign override mapping and cross-domain linking are deferred. They require an actual business question, cost/privacy review and their own scope; they are not prerequisites for making the current demand reports useful.
