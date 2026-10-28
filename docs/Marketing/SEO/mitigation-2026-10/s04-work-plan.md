---
type: Research
title: "S04 — Ukrainian copy production and editorial acceptance plan"
description: "Execution-ready work order for seven complete page-copy records, 157 claim dispositions, supporting content and three corrected community drafts."
tags: [uaroute, seo, s04, copywriting, planning]
---

# S04 work plan

**Prepared:** 2026-10-27. **Status:** plan only; copy production has not started. Source HEAD for this plan: `624196a` (full immutable revision is recorded by Git). The completed [S03 architecture](page-architecture.md) controls page intent, content destinations, metadata decisions, links and supporting edits. This plan implements SG-04/SG-06 and the [S04 session contract](../mitigation-sessions-2026-10-27.md); it does not reopen S03 architecture.

## Outcome and owned files

Produce a complete Ukrainian copy package that S05 can design and S07/S08 can implement without inventing text, facts, destinations or field decisions. Include retained values as exact text, not “unchanged”, “as above” or a reference requiring the implementer to write copy. The copy package is final for editorial handoff only; deployment is a later gate.

| Owned deliverable | Required contents |
|---|---|
| `content-package.md` in this directory | Seven complete page records; shared copy; guide/About/imprint decisions; all source-field and claim reconciliations; exact source labels, captions/alt where used; implementation dependencies and input revisions. |
| `editorial-review.md` in this directory | Dated review scope/identity, checks/results, correction history, actual coverage denominators, exclusions, final artifact hashes and S05/S07 handoff. |
| [Existing community drafts](../community-placements-2026-10-25.md) | Correct all three drafts and their audience/link/status labels in place; preserve dated submission observations as history. Do not create a duplicate campaign document. |

Application/source files, typed catalog, shared carrier data, route eligibility, contacts, form behavior, schema types and dependencies are outside S04. No posts, messages, indexing requests, account changes, commits or publication are included in S04 execution. This planning session starts no worker or hosted run; any later dispatch follows its separately authorized limits.

## Frozen inputs and inventory

Before writing, record current HEAD, staged/unstaged/untracked files privately and preserve unrelated work. Read root/scoped instructions, the constitution and relevant repository/passenger contracts. Recheck these hashes; reconcile material drift rather than silently substituting source revisions.

| Input | SHA-256 |
|---|---|
| [Architecture](page-architecture.md) | `1fddb37481c3be4ec5f8744fbbc702a357d5e71c71f654a50e3f2d1638a8445b` |
| [Claims ledger](claims-ledger.md) | `9644a3ede2e4773063c63cb7966bcfb21b1ff1055dfbdccf201ff140977d063b` |
| [Passenger needs](passenger-needs.md) | `60c763a9f43b7f0db06e5ab2279d582c1cf8a3f2e7decf11ac69e32d3828d3fd` |

Also read the [search baseline](search-baseline.md), [S03 claim routing](../../../../ops/evidence/seo-s03-completion-2026-10-27/claim-routing.json), [S03 completion](../../../../ops/evidence/seo-s03-completion-2026-10-27/completion.json), and current relevant source: route/hub fields, page templates, action helpers, shared carrier block, metadata/schema builders, bicycle guide, About/imprint, captions and business disclosures. These establish current text and propagation, not new operational verification or a deployed commit match.

**Coverage universe:** 157 distinct exact-field IDs in the current ledger, excluding C01–C16 aliases from the denominator. The S03 routing record contains 126 route/hub/nearby/guide/shared/schema IDs; the remaining 31 IDs are assigned in the architecture’s About/operator/metadata/community crosswalk. Enumerate the actual IDs before drafting. Reconcile every ID, including retained and deferred claims; do not count grouped notation or aliases as completed individual records.

## Execution sequence

| Step | Work and completion gate |
|---|---|
| 1. Inventory and bind | Save input hashes and enumerate all 157 IDs plus non-claim interface fields. Make a field inventory for each of seven URLs and all shared/support surfaces. No new facts. |
| 2. Shared copy and risky claims | Write reusable action, role, illustrative-caption and website-alternative text. Resolve all rewrite/remove/await dispositions first, including numeric buffer, nearby routing/pickup, Celle stops, return wording and unsupported carrier panel. Review these before surrounding prose. |
| 3. Five route records | Draft Hannover, Lviv→Celle, Celle→Lviv, IF→Wolfsburg and Wolfsburg→IF in that order. Follow S03 stable keys, direction-specific jobs and source-field merges. Keep titles/SEO fields exact. Supply each route’s complete reading text and field decisions. |
| 4. Two hub records | Draft Lviv then IF: retained intro/metadata, selection, actual-locality explanation, separate departure/return text, all eight nearby entries, existing route cards, all FAQ/resource coverage and website alternative. Card descriptions reuse corrected route descriptions. |
| 5. Support and distribution | Review guide/About/imprint/shared text; give exact retained or revised text. Correct all three existing placement drafts, affiliation disclosures, destinations and truthful status labels. |
| 6. Consolidated review | Read complete Ukrainian pages and drafts, then independently compare claims/fields/links against frozen inputs. Correct one consolidated findings list; repeat only affected checks until no blocking findings remain. Record actual reviewer identity/capacity, not a fabricated native speaker, carrier or human study. |
| 7. Freeze and hand off | Run documentation checks; record accepted copy/community hashes and remaining exclusions. S05 gets exact copy and section keys; S07 gets source-field/consumer mappings and no-change constraints. Stop before design/code/publication. |

A copywriter owns the three deliverables during production. The coordinator owns acceptance and integration. If a specialist is used, give explicit file ownership and preservation instructions; do not allow multiple writers to edit the same files concurrently. A second editorial pass is required, but no particular provider or extra paid dispatch is authorized by this plan.

## Copy-package structure and record format

Use one package, organized as: revision/scope; shared copy; seven page records; support surfaces; 157-row claim reconciliation; field completeness and needs mapping; implementation dependencies; exclusions/handoff. Stable keys come from S03, including its defined subkeys. New purely editorial child keys may identify paragraphs, but must not introduce a new content job or destination.

Each copy record contains:

| Field | Requirement |
|---|---|
| Page URL / shared affected pages | Exact existing URL or explicit shared affected-page list. |
| Content key and source field | S03 key plus current file/object field; identify all merged original fields. |
| Original text and action | Exact original text; retain/rewrite/remove/move. Before/after is mandatory for risky changes. |
| Final Ukrainian text | Exact usable text, including kept values. A removed/excluded claim has no public replacement unless one is explicitly supplied. |
| Claims and support | Exact claim IDs, original disposition, source reference and support limitation. Mark nonfactual interface text as such rather than invent a source. |
| Propagation and review | Affected visible/card/JSON-LD/metadata consumers, reviewer result and any exclusion. |

For each page include metadata title/description, H1, introduction, practical sections, confirmation questions, FAQs or their merged destination coverage, action/helper/fallback labels, exact resource anchors, nearby material where applicable, relevant captions/alt and no-change entries. Read final page text in its S03 information order; do not leave it as disconnected replacement fragments.

For every ledger ID supply one reconciliation row: original disposition → final editorial action → destination key(s) → source/limitation → reviewer decision. A `keep` claim merged into another paragraph retains its semantic coverage; map both originals to that destination rather than silently deleting one. `await evidence` remains explicitly excluded/deferred, never “verified by rewriting”.

## Fixed editorial decisions

- Preserve seven URLs and their H1s/titles/SEO fields under S03. Rewrite only the three specified route descriptions and other ledger-directed fields; keep `route.description` separate from `seo.description`. Describe JSON-LD/card propagation, without changing source code.
- Add the exact five planned guide links at `lh-questions`, `lc-questions`, `cl-baggage-transfer`, `iw-baggage-transfer`, `wi-baggage-transfer`. Keep existing hub-guide links. Routes get a short bicycle feasibility question/link; the guide owns detail.
- Primary WhatsApp retains current date/phone requirements and user review/send. Carrier website is the visible alternative without either field, including unknown date/no WhatsApp. Copy must not imply receipt, reservation, new contact channel or response time.
- Selecting a nearby catalog city does not require travel to that hub. Preserve locality names/content keys; feasibility can be refused. No geographic source proves pickup, stops, route coverage or convenience.
- Remove the 1–2-hour clause; keep useful connection-planning advice without a number or guaranteed wait. Preserve useful landmarks/districts only within ledger limits and as proposed places, never established stops.
- Exclude OP-1–OP-4 and OP-service from included public copy pending current support; keep technical OP-desk identity/contact/referral URL. Candidate pages retain inquiry-only carrier text. S07 chooses the rendering mechanism; S04 does not alter shared carrier records.
- Preserve legal operator identity and public carrier-neutral «перевізник». Do not fabricate multiple connected carriers, expert authorship, reviews, current operations or legal verification.
- Preserve existing public source/review dates as historical. Record this editorial pass’s actual date in the review document; do not automatically turn it into public `dateModified`, `lastmod`, carrier verification or author qualification. New unsupported dates/identity are omitted.

## Three placement contracts

| Draft | Audience / exact destination / corrections |
|---|---|
| 1 | Outbound Lviv/actual-locality planning. Keep `https://uaroute.com/cities/lviv/?utm_source=telegram&utm_medium=social&utm_campaign=route_launch`. Rewrite P1-2’s unsupported convenience implication; preserve truthful affiliation. |
| 2 | Outbound IF/actual-locality planning. Keep `https://uaroute.com/cities/ivano-frankivsk/?utm_source=telegram&utm_medium=social&utm_campaign=route_launch`. Rewrite P2-2’s pickup-on-the-way implication; no requirement to travel to selected hub. |
| 3 | Return to Lviv/actual locality. Use `https://uaroute.com/cities/lviv/?utm_source=facebook&utm_medium=social&utm_campaign=route_launch`. Rewrite P3-1–P3-4 coherently; remove Hannover-arrival audience, outbound route destination, direct-service and carrier-plurality implications. |

Update stale “reviewed/approved/verified channels” language so it does not claim a new channel check, publication permission or current acceptance before the pass. At completion distinguish editorially reviewed draft from actually published content. Preserve historical indexing observations/instructions clearly as historical, not current authorization or completed indexing outcomes. Do not submit URLs or contact groups.

## Acceptance and review record

| Gate | Required evidence / blocking condition |
|---|---|
| S04-01 — complete pages | 7/7 full page records with all inventoried fields, retained exact values, S03 keys and distinct outbound/return reading text. No placeholders or unresolved wording. |
| S04-02 — claims | 157/157 exact IDs reconciled, plus original C aliases mapped without double counting. All rewrite/remove/await decisions honored; unjustified changes to keep claims block freeze. |
| S04-03 — passenger coverage | N01–N12 mapped to final copy keys or intentional source-backed exclusion. Preserve evidence classes; no demand/interview invention. |
| S04-04 — links/support | 5/5 route-guide additions, retained graph, guide/About/imprint/shared fields accounted for; all destinations and anchor purposes match. |
| S04-05 — distribution | 3/3 corrected drafts, consistent direction/audience/destination/UTMs and affiliation; accurate draft status; no publication. |
| S04-06 — Ukrainian editorial pass | Natural wording, neutral carrier, useful specificity, compact repetition, readable question/answer flow and consistent terminology. Record findings and resolutions; do not claim human/native review unless it occurred. |
| S04-07 — dates/metadata | Separate retained metadata and rewritten visible descriptions; correct propagation, truthful identity/date exclusions, no new schema types or invented fresh verification. |
| S04-08 — scope/revisions | Complete diff restricted to owned copy documents plus coordinator navigation/log/evidence/handoff updates; source/application unchanged; hashes frozen and documentation checks pass. |

These gates implement AC01/AC02/AC03/AC12/AC14 and prepare AC05/AC06/AC08/AC09 obligations; they do not pass downstream export, browser/privacy or release checks. Run `npm run docs:index`, `npm run docs:check` and `git diff --check`; inspect local file targets and any anchors separately. Check external source support from the ledger; open a primary source only when a new assertion or a material support gap requires it. Missing access means unknown, not false or permission to generalize. No application build or KB checks unless their actual scope changes.

Record coverage denominators and accepted package/community hashes in `editorial-review.md`. Operational facts, GSC page/query exports, AI/Bing visibility and genuine publication-date decisions remain explicit exclusions. They do not block truthful copy; unresolved wording, claim contradiction, direction mismatch or an incomplete field inventory does.

## Launch instruction

Execute S04 only using this plan, the completed S03 architecture and frozen S02 ledger. Read current source for exact retained text. Produce the complete Ukrainian `content-package.md`, review it in `editorial-review.md`, and correct the existing three community drafts. Reconcile all 157 exact claim IDs and all twelve needs. Preserve S03 intents/links, product behavior, technical identities and evidence limitations. Do not write application/catalog code or publish/contact/submit anything. Report the completed fields, checks, exclusions, artifact hashes and precise S05/S07 handoff.
