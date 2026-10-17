---
type: "Plan"
title: "UARoute — pre-consent measurement options and execution gates"
description: "Dated assessment of GA4 cookieless measurement, EU/Polish constraints, aggregate alternatives and conditional EDD implementation."
tags: ["uaroute", "product", "analytics", "consent", "edd"]
---

# Pre-consent measurement options and execution gates

Date: 2026-10-07. Status: proposed; no change to site collection, GTM publication or production Variables. Read with the [current measurement specification](../knowledge-base.md#knowledge-base) (KB: `wiki/Marketing/gtm-ga4-measurement-spec-2026-10-07.md`), [activation specification](gtm-ga4-activation-spec-2026-10-07.md) and [implemented consent bridge](../knowledge-base.md#knowledge-base) (KB: `wiki/Operations/Analytics/Privacy/consent-adaptation-2026-10-07.md`). Existing Basic mode remains authoritative until an approved amendment records a different decision. This proposal is not legal approval or proof of live collection.

## Findings and business value

Google supports Advanced Consent Mode: Google tags load under denied defaults and send cookieless consent/activity measurements before approval and after refusal. With analytics storage denied, GA4 does not read/write first-party analytics cookies. This can include event-related pings; it is not full identified session tracking. Transport still discloses information to Google, including browser request metadata. Cookieless must not be described as anonymous or automatically consent-exempt. [Google overview](https://developers.google.com/tag-platform/security/concepts/consent-mode).

Behavioral modeling requires Advanced mode, at least 1,000 denied-storage events daily for seven days, and at least 1,000 daily consented users on seven of the previous 28 days. Meeting these conditions does not guarantee eligibility. Low-volume UARoute POC benefit is therefore uncertain; no recent production-volume audit has established eligibility. Denied pings are not guaranteed to appear as useful observed reports. [Google modeling prerequisites](https://support.google.com/analytics/answer/11161109?hl=en).

Polish PKE Article 399 covers storage/access on terminal equipment, with necessity exceptions for transmission and a user-requested service. EDPB guidance extends the technical scope beyond cookies to other tracking techniques and requires a case-specific exemption assessment. A GDPR legitimate-interest assessment does not itself override a terminal-access consent requirement. Neither these sources nor Google's documentation establishes an exemption for UARoute's proposed GA4 payloads. A French audience-measurement exemption cannot simply be imported into Poland. [Polish PKE](https://eli.gov.pl/api/acts/DU/2024/1221/text.html), [EDPB final guidance](https://www.edpb.europa.eu/system/files/documents/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf), [CNIL analytics guidance and national variation](https://www.cnil.fr/fr/node/677).

## Options and recommendation

| Option | Information available | Decision |
| --- | --- | --- |
| Current Basic GA4 | Consented page views, searches and contact intents; coverage incomplete | Retain and finish current live activation gates |
| GSC plus existing aggregate hosting metrics | Search impressions/clicks and request/error/traffic trends; not exact people or a joined funnel | Prepare now using read-only aggregate sources; no new browser beacon |
| New first-party cookieless counter | Potential anonymous page/action aggregates under a separately assessed design | Separate scope/architecture/privacy task; not automatically exempt |
| Advanced GA4 | Denied-state pings and potentially modeled reporting | Conditional prototype only after case-specific legal and benefit gates |

Recommended first increment: combine consented GA4 with GSC and existing CloudFront/CloudWatch aggregate metrics in separate reporting panels. Infrastructure counters include bots, assets and repeat requests; label them accordingly. GSC covers Google search, not all acquisition. Do not claim either equals total visitors or divide consented conversions by an incompatible denominator. Do not enable new raw access logs or import raw logs into GA4 in this increment.

## Ordered work packages

1. **Baseline and decision dossier.** Verify currently deployed flag/container version and reporting availability. Audit aggregate GA4 volumes through MCP without exporting user identifiers. Record missing-data status, business questions and whether modeling thresholds are remotely plausible. Inventory existing hosting aggregates. Do not assume local source is deployed.
2. **Aggregate reporting increment.** Define a weekly view: GSC impressions/clicks and page queries; consented GA4 searches/contact intents; hosting requests/errors; separately operator-received/confirmed outcomes. Display periods, coverage and incompatible denominators. No cross-source person matching. Existing server logs remain personal-data processing where applicable; assess retention/access before repurposing them.
3. **Legal/configuration gate for Advanced mode.** Record the exact device accesses, outgoing fields/recipients, GDPR basis and necessity/exemption assessment for relevant jurisdictions, transfer/vendor terms, retention and objection/withdrawal semantics. Decide whether collection after explicit refusal is supportable. Finalize truthful Ukrainian banner/policy text before enabling any pre-consent transmission. If the gate fails, stop this branch and retain Basic mode.
4. **Bounded prototype, only if approved.** Introduce an explicit public build mode (`basic` default, `advanced` opt-in) separate from the global enable flag. Keep one provider. Register the GTM consent callback before container initialization even when choice is unknown/denied. Apply all-four denied defaults before any Google configuration or event. The current `AnalyticsScripts` consent gate, `syncGoogleConsent` accepted-only registration, application event consent guard and `ga-disable-*` behavior require deliberate redesign together; removing one guard is insufficient.
5. **Narrow event and template policy.** Proposed denied-state experiment begins with canonical `page_view` and consent-state pings only. No search text, city-pair search context, contact clicks, passenger counts, UTM context, request codes, identifiers, form fields or messages in denied-state application payloads. Do not send earlier interactions after acceptance. Google-generated fields must also be inspected; application allowlisting cannot prove SDK minimization. Keep ads states denied, Signals and enhanced measurement off, manual page views and sanitized URL/referrer. Keep URL passthrough off. Evaluate ads data redaction defensively; it is not a general GA4 anonymization mechanism. [Google implementation guide](https://developers.google.com/tag-platform/security/guides/consent).
6. **Review GTM consent checks precisely.** Advanced denied-state page measurement cannot use the existing additional `analytics_storage` requirement, which blocks those tags entirely. Review a dedicated minimal page-view path using Google built-in consent behavior; retain explicit additional analytics consent on every richer application event tag. Never blanket-remove consent requirements. Determine whether a shared Google configuration is sufficient during Preview; preserve `send_page_view:false` and zero duplicate automatic views. Do not set `analytics_storage:granted` for unknown/refused users.
7. **State transitions and release.** In true Advanced mode, refusal continues only the approved denied-state pings; acceptance permits the consented event path. Withdrawal immediately closes richer events, updates denied state, deletes accessible analytics cookies and restarts the document with the approved denied behavior. This differs from today's complete collection stop and must be reflected in the notice. If the product instead promises zero collection after refusal, design that as a separate hybrid, not as an equivalent full Advanced implementation or guaranteed modeling eligibility. Preserve disabled and Basic CI artifacts/container versions for rollback. Prototype on isolated synthetic traffic, then publish/promote only after acceptance.

## EDD evaluation contract

All criteria require dated PASS/FAIL/UNKNOWN evidence. Mock tests verify application behavior; actual network/storage inspection verifies Google behavior. No test WhatsApp message is sent.

| ID | Pass criterion | Verification |
| --- | --- | --- |
| PC01 | Mode defaults to Basic; global off overrides both modes | Unit tests, inspected build settings and disabled network run |
| PC02 | Approved assessment and truthful notices cover unknown, refusal and withdrawal | Dated legal/configuration decision; no inferred exemption |
| PC03 | Denied defaults precede every Google config/event; ads always denied | Real Tag Assistant consent timeline; throttled-load and returning-user tests |
| PC04 | Unknown/refused states neither read nor write persistent analytics identifiers | Clean and previously consented profiles; cookie/storage access instrumentation plus request inspection, not cookie absence alone |
| PC05 | Denied payloads match the approved minimal field inventory | Inspect every request including browser metadata and SDK-generated events; query/PII canaries; fail on unexplained fields |
| PC06 | Richer app events remain blocked until approval; no historical replay | Search/contact actions before/after approval; actual network payloads |
| PC07 | SPA page views are canonical and delivered once per approved navigation | Home/route/return tests, provider race and duplicate checks |
| PC08 | Withdrawal/expiry/cross-tab changes enforce the chosen policy immediately | Consent API ordering, cleanup, subsequent payloads, reload and storage-unavailable cases |
| PC09 | No user/session/outcome counts claimed from raw pings or incompatible populations | Reporting review, eligibility/status readback and explicit coverage labels |
| PC10 | Release and recovery are reproducible; business UX remains intact | Full repository checks, mobile/keyboard search/inquiry smoke, reviewed CI SHA/artifact, live verification and Basic/off rollback evidence |

Definition of done for current planning: documented options and gates, linked sources, indexed plan. Definition of done for future Advanced implementation additionally requires PC01–PC10; this plan does not enable that branch.
