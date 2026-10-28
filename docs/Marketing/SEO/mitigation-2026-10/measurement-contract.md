---
type: Specification
title: "S06-A — Measurement and privacy diagnosis"
description: "Production-scoped GA4 evidence, attribution/privacy decision and exact matched-unit reporting recipes."
tags: [uaroute, seo, analytics, privacy]
---

# S06-A — Measurement and privacy diagnosis

Observed **28 October 2026**, read-only preparation for [SG-07](../mitigation-spec-2026-10-27.md). **Ready with explicit unknowns; NO CODE CHANGE.** No current attribution/privacy defect was reproduced. Historical `direct / direct` rows do not justify reimplementing normalization. This result closes the S06-A preparation decision; performance remains the separately owned S06-B artifact.

Authority: [constitution](../../../00-project-constitution.md), [analytics contract](../../08-analytics-and-attribution.md), [repository contract](../../../Operations/Agentic/Operational/repository-contract.md), [S06 brief](../mitigation-sessions-2026-10-27.md) and [S01 baseline](search-baseline.md). The GA4 reporting skill was applied. Its older public carrier-name examples yield to the constitution's 20 October neutral-copy decision; technical IDs/event names remain unchanged.

Evidence: [sanitized summary](../../../../ops/evidence/seo-mitigation-execution-2026-10-28/measurement/summary.json), [exact API requests](../../../../ops/evidence/seo-mitigation-execution-2026-10-28/measurement/report-recipes.json). Raw tool envelopes and local test logs are private under `output/seo-mitigation-execution-2026-10-28-private/measurement/`; no raw passenger/referrer/query/message material was requested. Raw captures are not linked as canonical Git dependencies.

## Identity, provenance and eligible dates

Workspace `.codex/config.toml` was read before provider calls: `GA4_ENFORCE_ISOLATION=true`; allowed/default property both `557859031`. Current scoped Admin readbacks returned **UARoute — Production**, property `557859031`, timezone **Europe/Warsaw**, currency **PLN**; web stream `16060537484`, measurement ID `G-PMXHF9YT7V`, default URI `https://uaroute.com`. These metadata confirm identity, not complete collection. No account discovery across other projects or account writes were performed.

Source normalization is commit `c71e4cfc1822824e8bb977f9d6db7312f3b9b88f`, authored **21 October 2026 13:58:11 +02:00**. Git ancestry confirms it is included in `dac7e98735eabfdda8abb7df37fb6e59428b22be`; the [24 October release receipt](../../../../ops/evidence/production-release-2026-10-24.json) documents successful publication/live checks and verification at **19:44:30.523 UTC**. This establishes deployed inclusion by that receipt, not the earliest normalization deployment date.

The [27 October calendar release](../../../../ops/evidence/production-calendar-release-2026-10-27.json), `ff1e4d095e96cab9f5c75cbf19854f532d6273b9`, verified at **21:12:27.977 UTC**, is a later inquiry-focus fix. Do not use that release date as the normalization date. No full settled post-calendar-release day exists at collection on 28 October, approximately 10:15–10:17 UTC.

Final clean available query window: **25 October–25 October 2026 inclusive**, in **Europe/Warsaw**. It is the full day after the documented 24 October publication, and its close is more than 48 hours before collection. The 26th has fewer than 48 elapsed hours since local midnight; the 24th overlaps publication. All requests use the explicit property and absolute dates, with limit 50 and offset 0. No current partial day or realtime report is used.

## Current readbacks and completeness

| Report | Dimensions / unit | Filter | Returned result |
| --- | --- | --- | --- |
| Final acquisition | `sessionSourceMedium`, `sessionDefaultChannelGroup`; sessions, engaged sessions, users | Exact `hostName=uaroute.com` | **NO_DATA**, 0 returned rows |
| Final event inventory | `eventName`; event count | Same host | **NO_DATA**, 0 returned rows |
| Final handoff union candidate | No dimensions; sessions/users/event count | Same host AND `eventName IN [whatsapp_click, koval_site_click]` | **NO_DATA**, 0 returned rows |
| Final site denominator | No dimensions; sessions/users | Same host | **NO_DATA**, 0 returned rows |
| Host contamination inventory | `hostName`; sessions/event count | No hostname filter, same dates/property | **NO_DATA**, 0 returned rows |

Every final historical envelope explicitly reports `sampled=false`, `other_row_data_loss=false`, `thresholding_applied=false`; pagination returned 0 of 0 rows, `has_more=false`. Quota telemetry was present, with substantial remaining counters; no quota/permission failure occurred. These statements describe the reported envelopes, not a guarantee that every visitor or unconsented action was collected. No absent report or empty row set is translated into a numeric zero.

Exploratory requests are preserved to make date selection auditable:

- **24–26 October** production-host acquisition returned **3 sessions, 1 engaged session, 3 users**, all `(direct) / (none)` / Direct. Excluded as the final cohort because the 26th is too recent.
- **24–25 October** returned **1 session, 0 engaged sessions, 1 user**, likewise normalized Direct. Its event inventory returned one each of `first_visit`, `page_view`, `session_start` and `user_engagement`; the union request returned NO_DATA. Excluded as a clean post-release cohort because the 24th overlaps publication.
- Those nonempty exploratory envelopes report no sampling, other-row loss or thresholding, with all rows returned. They show that normalized Direct labels occur in processed property data. They do not prove fresh non-direct acquisition ingestion, real passenger identity, complete absence of defects, or causality of a particular release.

No repeat requests are needed until a useful settled cohort exists. The final window's absence of rows does not justify collector/account changes or a traffic/conversion failure claim.

## Source and privacy diagnosis

Source reviewed: `src/lib/analytics.ts`, `src/config/utm.ts`, `src/components/AnalyticsAttribution.tsx`, `AnalyticsScripts.tsx`, `AnalyticsConsent.tsx`, `src/lib/analytics-consent.ts`, `google-consent.ts`, and the four focused test files below. These analytics files had no working-tree edits in this diagnosis; unrelated application changes remain owned by other work.

| Suspected issue | Expected and observed evidence | Decision |
| --- | --- | --- |
| Historical direct/direct causes current Unassigned | Local acquisition remains `direct/direct`; provider boundary changes the complete pair to `(direct)/(none)`. Existing test verifies both GTM and optional direct gtag transport. Exploratory processed rows contain normalized Direct. Final clean cohort is empty. | **No change.** Current defect not reproduced; post-fix non-direct and latest-release reporting remain unknown. Do not rewrite historical data. |
| First touch overwritten by current inquiry | `captureLandingAttribution()` retains canonical first touch in memory; current `targetPath` is independently sanitized. Existing navigation tests pass. | **No change.** Preserve distinction; no storage extension. |
| Passenger data or request IDs reach provider | Runtime context allowlists exclude phone/date/message/raw queries. Local QA can retain safe opaque inquiry IDs, but `emitToProvider()` removes `leadId`; provider referrer is empty, page location canonical except validated initial Google click ID. Existing tests pass. | **No change.** Local buffer is not a passenger store; never add raw values to track calls or evidence. |
| Consent/provider readiness replays prior actions or duplicates views | Scripts render only after configured analytics consent; actions before consent/readiness are not replayed; only current page/route views flush once. Withdrawal closes transport synchronously, clears accessible GA cookies and reloads. Advertising consent stays denied. | **No change.** Fresh unit coverage passes; no new live provider/compiled browser run is claimed. |
| Missing AI referrer family warrants speculative mapping | Source recognizes ChatGPT (`chatgpt.com`) and Gemini (`gemini.google.com`), with exact-host/subdomain matching and spoof protections; Google variants and Bing are organic. Other valid external hosts become `unknown/referral`, empty/self referrer becomes direct. | **No change.** No observed family justifies an addition. Unknown/referrerless traffic is not relabeled AI; raw referrers are not added to analytics. |
| Production-host traffic necessarily excludes tests | Hostname only separates hosts. Owner/internal/Tag Assistant activity can still use production hostname; this cohort returns no host inventory rows. No registered debug/test custom dimension was observed. | **Unknown contamination.** No identity-level exclusion can be derived from these aggregates. Do not discard all Direct or assume the hostname filter cleans everything. |

The current registered custom definitions were read from this exact property: `customEvent:source`, `medium`, `campaign`, `landingPage`, `origin`, `destination`, `routeId`, `routeStatus`, `resultCount`, `ctaLocation`, `conversionType`. No custom metrics returned. `targetPath`, `leadId`, debug flags or raw referrers are not assumed to be registered. Registration alone does not establish populated values or compatibility in every query.

Fresh local validation: **33/33 tests in 4/4 files passed** under **Node 22.23.3**, Vitest **5.0.3**; the same focused tests also passed under available Node **24.21.0**. Files: `analytics.test.ts`, `analytics-provider.test.ts`, `analytics-consent.test.ts`, `google-consent.test.ts`. Mocked globals/sinks send no collectors or handoffs. This establishes source behavior under unit fixtures, not Google ingestion, compiled production execution or operator receipt. No build or browser was run by S06-A.

## Reporting contract and exact recipes

The [request artifact](../../../../ops/evidence/seo-mitigation-execution-2026-10-28/measurement/report-recipes.json) contains executable scoped `run_report` arguments for the final five queries. Replace only both absolute dates together for the next authorized settled window; keep property, hostname, units, cohort and completeness recording explicit. Compare equal-duration inclusive periods only after checking release/exposure dates and consent/test contamination.

1. **Acquisition:** dimensions `sessionSourceMedium`, `sessionDefaultChannelGroup`; metrics `sessions`, `engagedSessions`, `totalUsers`; exact production host. Report returned channel rows as observed. Native session attribution and event-scoped custom source/medium are different scopes; a difference needs diagnosis, not automatic overwrite.
2. **Event/intent volume:** dimensions `eventName`; metric `eventCount`; exact production host. Report `booking_intent` separately as validated interaction; report each handoff event as outbound action volume. Missing rows remain NO_DATA. Event counts never form a session conversion numerator.
3. **Candidate union numerator:** no dimensions; metrics `sessions`, `totalUsers`, `eventCount`; AND exact host with the event-name OR list. Avoid splitting the union by `eventName`. Accepted query shape does not alone validate session deduplication. Current empty response leaves empirical deduplication **unknown**.
4. **Site denominator:** no dimensions; `sessions`, `totalUsers`; identical host/date/cohort. This measures consented measured production-site sessions/users, not all visitors. A narrower “discovery sessions” denominator requires a separately specified session population that also contains the numerator. Do not silently divide a contact population by a page-event denominator.
5. **Handoff session rate (conditional):** validated distinct handoff sessions ÷ all sessions in the same eligible population. Numerator/denominator must share property, dates, timezone, host and inclusion/exclusion rules; every numerator session must belong to the denominator. No rate is published here: the numerator and denominator returned NO_DATA, and overlap deduplication has not been validated.
6. **User rate (separate, conditional):** distinct users with handoff ÷ distinct users in the identical cohort. Do not sum users across dates/pages/channels/events or substitute users for sessions. Do not average row-level rates, engagement averages, CTR or positions; obtain appropriate aggregate totals or weighted components from the relevant endpoint.
7. **AI-referral sessions:** the acquisition recipe can show `chatgpt / referral` or `gemini / referral` when returned. An optional exact session-source/medium filter can isolate those two pairs. Event-scoped `customEvent:source`/`medium` may inspect bounded first-touch labels with event counts, after compatibility validation; it does not become a native session metric by relabeling it. Other AI sources may be unobservable under the current bounded mapping; absence of rows cannot establish zero AI use.

### Required deduplication validation before a rate

Retain the no-dimension OR report and compare it with an independently validated same-cohort session union in an already authorized read-only exploration/export, if available. The validation cohort needs overlap: at least one eligible session that triggers both handoff types, and repeated clicks in a session. Expected: that session counts once; extra clicks increase event volume only. Separate per-event counts are diagnostics, never additive session totals. Record the source, exact eligible population and overlap evidence; query acceptance, an empty report, or an arithmetic inequality alone does not prove union semantics.

Do not generate synthetic production analytics to create overlap, request new visitor IDs/exports/storage, register new fields, enable collectors or mutate key events to force this check. If the present connector cannot expose the required independent overlap evidence, keep the rate unknown. The existing `run_funnel_report` endpoint is a different ordered-user question; it is not a substitute for a same-session OR union.

### Privacy-safe browser verification for S08/S09 when affected

Use a disposable isolated browser context, the exact frozen candidate and existing interception harness patterns; coordinate browser ownership. Serve candidate assets locally or through intercepted fulfillment. Register catch-all blocking before first navigation: fulfill only approved local/cached assets, abort all real collectors, carrier URLs, WhatsApp URLs and other external requests/popups. Intercepted official-provider execution needs an already reviewed cached provider fixture; an empty fake script cannot establish compiled-provider behavior.

Use disposable canaries, never passenger records. Check no provider/cookies before consent; current-view-only flush once after readiness; no pre-consent action replay; synchronous refusal/withdrawal; all advertising signals denied; one provider path. Validate direct normalization, approved organic/referral/manual/paid labels, unknown/spoofed hosts, first touch versus target path, no phone/date/message/request-code/raw query/referrer in telemetry, and complete opposite-country referral pairs. Inspect storage and blocked payloads privately, write only sanitized assertions/counts to tracked evidence. No real inquiry is sent and no signed-in browser is controlled.

## Search, AI and operator outcomes remain separate

S01 holds dated Search Console evidence; its native Search reporting timezone remains **Pacific Time**, while GA4 uses **Europe/Warsaw**. Do not shift either report to suggest day-level equivalence. Property-level impressions are not page-level query demand; no average-of-averages or joined person-level funnel is justified.

This diagnosis does not assert current availability or contents of dedicated AI reports. Google AI impressions, Bing citation counts, observable AI-referral sessions, outbound handoffs and carrier-confirmed aggregate receipts/journeys are separate measures with different coverage. S01's uninspected provider fields stay unknown; a referral session is not an impression/citation, a handoff is not a sent/received message, and a booking outcome needs authorized operator evidence. No current AI report feature claim required a new product-availability assertion.

S07 may plan the copy/design increment with **no analytics edits**. Reopen measurement code only for a reproduced current expected/actual mismatch, tied to candidate and intercepted evidence, with exact affected source and regression cases. Provider access gaps, missing/empty rows, low volume and unknown outcomes are reporting limitations, not application defects or reasons to broaden collection.

