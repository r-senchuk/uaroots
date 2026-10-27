---
type: Research
title: "S01 — Seven-page SEO and GEO evidence baseline"
description: "Dated Search Console, public HTTP and AI visibility evidence for the seven October 2026 priority URLs, with explicit access gaps."
tags: [uaroute, seo, geo, evidence, mitigation]
---

# S01 — Seven-page SEO and GEO evidence baseline

**Prepared:** 27 October 2026 (Europe/Warsaw). **Status:** research handoff; no provider/account writes, URL submissions, publication, or application edits. **Scope:** exactly seven priority URLs from the current mitigation contract. This report distinguishes fresh observations, dated owner transcriptions, cached public-page content, and local source inspection. Missing evidence is **unknown**, never zero.

## Executive readout

- The saved 27 October audit records an earlier direct crawl with healthy HTTP, canonical, title/H1 and internal-link checks across 22 sitemap pages. It is useful as historical site-wide evidence, but its URLs/results were not independently re-fetched in this session and it does not replace the seven-row register below.
- Fresh read-only HTTPS checks on 27 October returned HTTP 200 for all seven pages, `robots.txt` and `sitemap.xml`. All seven are listed in the 22-URL sitemap, have one H1, a matching self-canonical and no robots meta directive; robots.txt allows all user agents. Each has an incoming link in the seven-page set. This is public HTTP/HTML evidence, not proof of Google indexing or Google-selected canonical.
- Fresh signed-in GSC URL Inspection transcription (27 Oct, Europe/Warsaw observation; crawl display timezone not labelled) shows five pages indexed with Google-selected canonical matching the inspected URL. Both Wolfsburg directions are “Discovered – currently not indexed” with crawl/canonical fields N/A. These are stored inspection results, not live tests. Prior Oct 26 request observations remain historical; no new requests were made.
- The saved October 27 GA4 property report (27 Sep–24 Oct inclusive, Europe/Warsaw) recorded one `google / organic` session and no organic handoff event among the returned rows. These figures are not a verified production passenger cohort and cannot establish current or total search traffic. The requested Search Console comparison was read at property/query level; page, country and device breakdowns remain unknown after browser access was disabled.
- A Google AI report link was visible, but its data and inclusion setting were not inspected. Bing property access was not established. Their values are unknown. Product/report documentation exists; that does not establish that this property has visible report data.
- Page actions: retain the seven paths and current eligibility while evidence is gathered; investigate eligibility/canonical only after current GSC or HTTP evidence identifies a defect; improve content based on the separate claims/page-architecture work; consider snippet experiments only with settled page/query exposure; otherwise await evidence. Do not request recrawls again by habit.

## Seven-URL register

| Priority URL | Indexed state / reason | HTTP, robots, declared and selected canonical | Last crawl / sitemap / referrer evidence | Ordinary Search exposure | AI exposure | Next action and confidence |
|---|---|---|---|---|---|---|
| [`/routes/lviv-hannover/`](https://uaroute.com/routes/lviv-hannover/) | GSC (27 Oct transcription): on Google; “Page is indexed.” | HTTP 200; crawl allowed, fetch successful; no robots meta. Declared canonical self; Google canonical “Inspected URL”. | Googlebot smartphone; last crawl display Oct 26, 2026, 2:47:10 PM (UI timezone unlabeled). Sitemap shows “Temporary processing error”. GSC referrers: Braunschweig–Dolyna route and `/contact`; priority-set referrer: Lviv hub. | Page/query/country/device comparison **unknown: page breakdown interrupted**. | Google AI report impressions/setting and Bing metrics **unknown**. | **Retain; improve content** under S02/S03. No indexing intervention indicated. |
| [`/cities/lviv/`](https://uaroute.com/cities/lviv/) | GSC (27 Oct transcription): on Google; “Page is indexed.” | HTTP 200; crawl allowed, fetch successful; no robots meta. Declared canonical self; Google canonical “Inspected URL”. | Googlebot smartphone; crawl display Oct 20, 2026, 9:21:10 PM (UI timezone unlabeled). Sitemap shows “Temporary processing error”. GSC referrer: Celle–Lviv; priority-set links include Hannover and both Celle pages. | Comparison **unknown: page breakdown interrupted**. | Google/Bing exposure **unknown**. | **Retain; improve hub content** under S02/S03. No indexing intervention indicated. |
| [`/cities/ivano-frankivsk/`](https://uaroute.com/cities/ivano-frankivsk/) | GSC (27 Oct transcription): on Google; “Page is indexed.” | HTTP 200; crawl allowed, fetch successful; no robots meta. Declared canonical self; Google canonical “Inspected URL”. | Googlebot smartphone; crawl display Oct 20, 2026, 9:23:08 PM (UI timezone unlabeled). Sitemap shows `https://uaroute.com/sitemap.xml`. GSC reported no referring pages; this does not prove there are no inbound links (live crawl found priority-set links). | Comparison **unknown: page breakdown interrupted**. | Google/Bing exposure **unknown**. | **Retain; improve hub content** under S02/S03. No indexing intervention indicated. |
| [`/routes/lviv-celle/`](https://uaroute.com/routes/lviv-celle/) | GSC (27 Oct transcription): on Google; “Page is indexed.” | HTTP 200; crawl allowed, fetch successful; no robots meta. Declared canonical self; Google canonical “Inspected URL”. | Googlebot smartphone; crawl display Oct 26, 2026, 2:47:09 PM (UI timezone unlabeled). Sitemap shows “Temporary processing error”. GSC referrer: `/privacy/`; priority-set links include Lviv hub, Hannover and reverse route. | Comparison **unknown: page breakdown interrupted**. | Google/Bing exposure **unknown**. | **Retain; improve direction-specific content** under S02/S03. No indexing intervention indicated. |
| [`/routes/celle-lviv/`](https://uaroute.com/routes/celle-lviv/) | GSC (27 Oct transcription): on Google; “Page is indexed.” | HTTP 200; crawl allowed, fetch successful; no robots meta. Declared canonical self; Google canonical “Inspected URL”. | Googlebot smartphone; crawl display Oct 21, 2026, 8:34:28 PM (UI timezone unlabeled). Sitemap shows `https://uaroute.com/sitemap.xml`. GSC referrer: Dolyna–Braunschweig; priority-set referrer: Lviv hub. | Comparison **unknown: page breakdown interrupted**. | Google/Bing exposure **unknown**. | **Retain; improve reverse-direction content** under S02/S03. No cross-canonical inference from shared city pair. |
| [`/routes/ivano-frankivsk-wolfsburg/`](https://uaroute.com/routes/ivano-frankivsk-wolfsburg/) | GSC (27 Oct transcription): not on Google; “Discovered – currently not indexed.” | HTTP 200; public robots allow and no robots meta; no recorded Google fetch/crawl (N/A, not proof no request ever occurred). GSC crawl, declared canonical, selected canonical and permission fields N/A. | Last crawl N/A; sitemap lists URL. GSC referrer: Dolyna–Braunschweig; live priority-set referrer: reverse Wolfsburg page and IF hub. | Comparison **unknown: page breakdown interrupted**. | Google/Bing exposure **unknown**. | **Retain eligibility; investigate discovery/indexing evidence and content after S03.** Do not request indexing. Current state is discovered, not unknown-to-Google. |
| [`/routes/wolfsburg-ivano-frankivsk/`](https://uaroute.com/routes/wolfsburg-ivano-frankivsk/) | GSC (27 Oct transcription): not on Google; “Discovered – currently not indexed.” | HTTP 200; public robots allow and no robots meta; no recorded Google fetch/crawl (N/A, not proof no request ever occurred). GSC crawl, declared canonical, selected canonical and permission fields N/A. | Last crawl N/A; sitemap lists URL. GSC referrer: Dolyna–Braunschweig; live priority-set referrer: forward Wolfsburg page and IF hub. | Comparison **unknown: page breakdown interrupted**. | Google/Bing exposure **unknown**. | **Retain eligibility; investigate discovery/indexing evidence and content after S03.** Do not request indexing. Current state is discovered, not unknown-to-Google. |

### Source and date qualifications

1. **October 27 indexing:** source is the coordinator signed-in Chrome UI transcription in [`gsc-inspections.json`](../../../../ops/evidence/seo-s01-s02-2026-10-27/gsc-inspections.json), not a raw export or live test. It records all seven pages, crawl result, canonical and sitemap fields as shown. Crawl display timezone is unlabeled and retained without conversion. Temporary sitemap-processing errors shown on three inspections are per-URL UI observations, not proof of invalid sitemap. “No referring pages” is not proof of no inbound links.
2. **October 24 sitemap:** state-register transcription says submitted `https://uaroute.com/sitemap.xml` showed Success and 22 discovered pages; last read 23 Oct. This is site-level evidence only, not evidence that each of these seven URLs is present or indexed.
3. **October 27 saved audit:** `wiki/Marketing/SEO/audit-2026-10-27.md` and its evidence addendum describe an earlier direct crawl of 22 sitemap URLs. The audit reported successful HTTP and self-canonicals then. Its session was not repeated for this handoff, so it does not populate current row-level fields. The historic audit’s six-URL recommendation is superseded by the current seven-URL contract.
4. **Fresh fetch:** read-only `curl -L` checks on 27 Oct received HTTP 200 for all seven exact HTTPS URLs, `robots.txt` and sitemap; no redirect was followed for requested forms. Each page had one title, H1, `lang="uk"`, matching self-canonical and no robots meta. Sitemap contained 22 URLs and all seven. Evidence, response headers and bodies are in the assigned output folder; [`public-http.json`](../../../../ops/evidence/seo-s01-s02-2026-10-27/public-http.json) hashes each retrieved page body.
5. **Web fetcher:** it separately opened a cached Lviv hub page (marked crawled two weeks before access) and missed other URLs. Its old branded copy is not adopted as current wording; fresh HTTP and the owner-approved neutral-copy decision govern.
6. **Local inspection:** repository source confirms metadata builders and link sources. No build/export or production-source/deployment match was made for this assignment.

## Ordinary search and AI measurements

### Ordinary Google Search

Requested windows retained: **27 September–24 October 2026** versus **30 August–26 September 2026**, both 28 inclusive days, Search type **Web**, property **sc-domain:uaroute.com**. Daily reporting uses **Pacific Time**, not observer Europe/Warsaw; see [Google date semantics](https://developers.google.com/webmaster-tools/v1/searchanalytics/query). No preliminary warning was observed for these dates; a final export was not obtained, so revisions remain possible. Last-update label: “4 hours ago”. No date shift was justified by the observed UI.

| Property aggregate | Current | Previous |
|---|---:|---:|
| Clicks | 0 | 0 |
| Impressions | 100 | 3 |
| CTR | 0% | 0% |
| Average position | 54 | 4 |

These are directly transcribed property aggregates, not summed page rows. Different query mixes and tiny prior exposure do not establish a ranking decline. No averages were averaged. [Sanitized UI transcription](../../../../ops/evidence/seo-s01-s02-2026-10-27/gsc-performance.json).

| Visible property query | Current impressions | Previous impressions | Current average position |
|---|---:|---:|---:|
| львів ганновер | 18 | 0 | 48.2 |
| автобус львів ганновер | 17 | 0 | 62.4 |
| львів ганновер автобус | 16 | 0 | 67 |
| львов ганновер | 14 | 0 | 66.6 |
| автобус львов ганновер | 11 | 0 | 67.1 |
| ганновер львів | 2 | 0 | 54.5 |
| маршрути | 1 | 0 | 36 |
| львов ганновер автобус | 1 | 0 | 66 |

All eight visible rows show 0 clicks in both periods and 0% displayed CTR. Prior query position displayed 0 with no impressions; treat that as unavailable, not rank zero. These are **unfiltered property queries**, not page-attributed demand. Missing/anonymized queries cannot be interpreted as zero demand or reconstructed by subtracting aggregates. A small return-query signal does not authorize a reverse Hannover page.

**Access interruption:** on resume, browser tool reported local browser use disabled in Work settings. Page table was still loading at the last successful observation. Thus page-level clicks/impressions/CTR/position remain explicitly unknown for **7/7 URLs**; page-query, country and device breakdowns are also unknown. The report chart's accessibility date label was malformed (“Invalid Date”/1970), while selected dates, URL filters and metric cards matched the requested periods; no chart-day values were used. Smallest remaining export: Pages for both windows, then query/country/device tables filtered to each priority page with exposure; include selected filters, completeness and PT dates. No authentication/settings changes or GSC Wizard retry.

The saved audit's GA4 report is a distinct analytics source: property 557859031; 27 Sep–24 Oct; Europe/Warsaw; one returned `google / organic` session, with one engaged session. Its accompanying event report showed no returned organic handoff row. The calls had no hostname filter and represent returned consented analytics rows, not all visits or passenger inquiries. Do not turn these counts into a current Search ranking, traffic, conversion-rate, or demand claim.

### Google Search generative AI

Google's official [AI features guidance](https://developers.google.com/search/docs/appearance/ai-features) says the ordinary Search technical and content requirements apply; eligibility for AI Overviews/AI Mode requires the page to be indexed and eligible for a snippet, but serving is not guaranteed. Google says AI-feature traffic is included in the overall Search Console Performance report (Web search type). This describes the product, not UARoute's observed visibility.

The official [Generative AI performance report documentation](https://support.google.com/webmasters/answer/16984139) says the dedicated report covers impressions for AI Overviews and AI Mode, grouped by supported dimensions such as page, country, device and date; report availability can still depend on property access and sufficient impressions. It does not state that this view supplies a separate page-level AI click/conversion count. For UARoute, the Google AI report navigation link was **observed** in ordinary Search performance; the report contents and inclusion setting were **not inspected**; impressions are **unknown**. Do not report zero, absence of citations, or a missing report without a direct property check.

### Bing and other AI referral signals

Bing announced [AI Performance in Webmaster Tools](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/) as a public-preview dashboard of citation counts, average cited pages, grounding-query samples and cited-page activity across supported Microsoft AI surfaces. The official announcement cautions that citation activity does not identify ranking/placement and query phrases are samples. Bing's [October 2026 Topics Portfolio beta announcement](https://blogs.bing.com/webmaster/2026/10/introducing-topics-portfolio-beta-in-ai-performance/) describes additional grouped topic opportunities when data is sufficient. Neither account/property access nor any UARoute-specific citation or topic value was available in this session. Values are **unknown**.

Keep these measures distinct: Google AI Search impressions; Bing AI citations; observable AI-referral sessions in analytics; and handoffs. None can be substituted for another. No fixed prompt sampling or live citation claims were made here.

## Page decisions and handoff to S03

| Page group | Decision now | Evidence needed to change it |
|---|---|---|
| Hannover + Lviv/Celle + IF/Wolfsburg directions | **Retain eligibility and paths. Improve content** using the existing seven-page plan and verified claims. No evidence supports adding a new URL, changing route status, or automatic reverse-direction canonical consolidation. | S02 claims/source ledger; S03 intent architecture. For eligibility repair, fresh HTTP/GSC URL Inspection with status, reason and selected canonical. For query-specific metadata experiments, settled Search Console page/query exposure for both comparable windows. |
| Lviv and Ivano-Frankivsk hubs | **Retain; improve hub discovery and practical guidance** under S02/S03. Both hubs have fresh stored GSC indexed results and current public HTML evidence. | Fresh GSC/HTTP for index facts; S02/S03 for content actions. |
| All seven | **Consider a snippet experiment only conditionally.** Preserve current titles by default. No page-specific CTR opportunity or winning title can be claimed without settled impressions/query mix and a sufficiently useful comparison. | Page/query-level clicks, impressions, CTR, position, query mix, exact timezone, comparable date ranges and report completeness. |

### Contradictions, gaps, and minimum useful export

- The saved audit's six-page baseline suggestion conflicts with the higher-authority seven-page register in the 27 Oct mitigation specification. Use seven, including Lviv–Hannover and the reverse directional pages.
- Existing October 26 transcription is partial. In particular, `wolfsburg-ivano-frankivsk` is not in that record; `ivano-frankivsk-wolfsburg` is transcribed “unknown to Google,” not proven currently absent.
- Earlier saved audit claims about all 22 pages being healthy are historical site-wide results, not seven current URL inspection records. The 22-page sitemap success is not seven indexed outcomes.
- Remaining Search Console handoff: the page and page-filtered query/country/device exports described above, plus Google AI report impressions and inclusion-setting readback. Seven stored inspections are already captured; repeat only before a dependent action, not to refill completed fields.
- Minimum useful Bing handoff: dated AI Performance view/export for cited pages, citation counts, supported grounding-query sample, selected date window and report limitations; label Topics Portfolio availability separately. If no report is exposed, record that the UI/property did not expose it at that time, rather than zero citations.
- Safe work can continue without these fields: factual correction and distinct page planning. Indexing repair decisions and data-dependent snippet tests should wait for their corresponding evidence.

## Official references

- Google, [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) — eligibility, established requirements and aggregate Web-search reporting.
- Google, [Generative AI performance report (Search)](https://support.google.com/webmasters/answer/16984139) — report metrics, dimensions, availability and limits.
- Google, [Optimizing your website for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) — original, people-first content and standard SEO practices; no special GEO schema/file requirement.
- Bing, [AI Performance public preview](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/) — citation metrics, sampled grounding queries and interpretation limits.
- Bing, [Topics Portfolio beta](https://blogs.bing.com/webmaster/2026/10/introducing-topics-portfolio-beta-in-ai-performance/) — topic grouping feature announcement, not evidence of property access.

No implementation, account changes, indexing submissions, publication or external handoff were performed. S01 status: **ready with explicit unknowns**. Source HEAD: `41c538149bd715a97c961ee6ca9db0fc6eac0a21`; source is not asserted to be the deployed revision.

## Integrated S03 handoff — accepted revision 2026-10-27

S01 and S02 are **ready with explicit unknowns**. Preserve the seven existing URL intents, Lviv/Ivano-Frankivsk priority, useful geography, separate return journeys, carrier confirmation and date/WhatsApp-free alternatives. No eligibility or URL changes are supported by this research.

Evidence-backed priorities: correct the unsupported 1–2-hour buffer, nearby-place routing/pickup implications, Celle stop/schedule implications, and community direct-service/plural-carrier/return-link wording before S04. Hold the four Hannover carrier assertions and generic service description pending current support, or omit them. Apply corrections consistently to visible copy, metadata and JSON-LD. The ledger contains recommended Ukrainian wording, not approved publication copy.

Both Wolfsburg directions warrant monitoring/investigation of discovery and indexing; current HTTP eligibility alone does not establish an indexing defect. Snippet experiments and demand-based prioritization remain hypotheses until page/query exports exist. No interviews, actual pickup coverage or current carrier terms were established. Source-access limitations do not prove claims false.

S03 should deliver a seven-page intent/coverage matrix and route each claim ID to preserve/rewrite/omit/await evidence. S04 then drafts Ukrainian copy against that matrix; design and Next.js implementation follow their existing session gates. Data-dependent experiments wait for missing exports; safe factual corrections need not wait.

Artifact revisions used (SHA-256):

- `claims-ledger.md`: `9644a3ede2e4773063c63cb7966bcfb21b1ff1055dfbdccf201ff140977d063b`
- `passenger-needs.md`: `60c763a9f43b7f0db06e5ab2279d582c1cf8a3f2e7decf11ac69e32d3828d3fd`
- `passenger-evidence.md`: `3498b45393d3d7715a91a1069492a037bf6b54da18c38a0157b4d2e10dfdcf0a`

Source HEAD: `41c538149bd715a97c961ee6ca9db0fc6eac0a21`. Evidence and execution provenance: [experience report](./session-experience.md), [run ledger](../../../../ops/evidence/seo-s01-s02-2026-10-27/run-ledger.json).
