---
type: Research
title: "S05 — responsive UX/UI design execution plan"
description: "Real-copy design work order, viewport and interaction matrix, component reuse and acceptance for the existing UARoute templates."
tags: [uaroute, seo, s05, ux, responsive, planning]
---

# S05 work plan

**Prepared:** 2026-10-27. **Status:** plan; design production and browser fit verification have not run. S04 was reverified against current source and frozen hashes before preparing this plan. Its [editorial review](editorial-review.md) remains accepted with explicit unknowns. S05 creates design artifacts; S07 turns the accepted handoff into the file-level implementation order and S08 owns application code.

## Inputs and completion target

Use the [completed architecture](page-architecture.md), [final Ukrainian copy](content-package.md), [exact copy records](../../../../ops/evidence/seo-s04-2026-10-27/copy-records.json), [S04 field coverage](../../../../ops/evidence/seo-s04-2026-10-27/field-coverage.json), [visual system](../../../Product/04-visual-design-system.md), [UX contract](../../../Product/03-ux-and-information-architecture.md) and [passenger contract](../../../Product/passenger-discovery-conversion-spec-2026-10-22.md). Current contracts and source override older UX notes describing unverified transfer operations. No operation, fare, stop or additional carrier can enter through visual treatment.

| Frozen input | SHA-256 |
|---|---|
| S03 architecture | `1fddb37481c3be4ec5f8744fbbc702a357d5e71c71f654a50e3f2d1638a8445b` |
| S04 content package | `3823d1bede46a27bc1a61a6c2f307c1db6702e89ace011d12b32cbfeb6d57fae` |
| S04 editorial review | `4ddebaf8524f7162443198045b48cd88c95fd90bfad5e6cd5788a99e50cec9d0` |
| Exact copy records | `0b84743d3a3ac5fddfb15e6a035b4322d4e4b2b786d5a760238a80acb68dc419` |

Recheck hashes and record actual HEAD/dirty scope before S05 execution. Preserve the pre-existing partial Hannover draft as history; use the full S04 package. Missing page-level demand/AI reporting does not block design. No fresh research or paid design service is required.

**Deliverables:** `design-handoff.md` in this directory and a bounded `design-assets/` directory containing linked standalone HTML/CSS boards or SVG/PNG exports, using exact S04 Ukrainian text. A standalone board is a design preview, never a replacement application. No app source, routes, catalog, shared carrier records, dependencies or account configuration changes. No commits, posts or release implied.

The handoff must specify component-level changes, measured proposed spacing/width/type settings, reading/focus order, responsive rules, all states and copy-key mapping. A moodboard or attractive screenshot alone is insufficient. Distinguish designed, preview-rendered and application-verified results.

## Current baseline and governing decisions

Source inspection shows `container-page` has a 78rem maximum and 1.25rem side padding, with `container-reading` at 42rem. Existing `type-body` is 16px and `type-body-small` 15px. Display/body/mono families are Playfair Display and IBM Plex Sans/Mono via local `src/assets/fonts/fonts.css`; an older design document describes next/font, so inspect actual source rather than reintroduce that implementation. Retain fonts, colors and atlas identity; no new font/token palette or brand redesign.

The route template already has early JourneyActions/conditions and a single form. Its large illustration precedes practical material in the main column; test moving that decorative material after useful guidance. The hub already has intro → city selection → nearby → preparation/cards/FAQ; test reducing intro spacing, without deleting necessary text or changing search. These are hierarchy hypotheses, not proven conversion improvements or an instruction to restart the redesign.

The current sticky bar appears when the observed inquiry anchor has passed above the viewport, is hidden while an input/select/textarea is focused, updates its occupied height, and uses existing submit/fallback logic. Retain those semantics. Design annotations must consider that moving the form changes the anchor geometry. No new conversion event, second form or alternate sticky state machine.

## Work sequence and ownership

| Step | Work / exit condition |
|---|---|
| 1. Capture baseline | Inspect current components and a matching local static preview if available. Record source/export identity and viewport per capture. If only public deployment is available, label it separately and do not assert it matches source. No external handoff or analytics traffic from QA. |
| 2. Inventory reuse | Map Header/Footer, RouteSearch, JourneyActions, BookingWidget/CandidateInquiry, StickyBookingBar, NearbyPlaces, Faq, RelatedRoutes, PartnerCard, image/caption and current layout/type utilities. Record retained versus changed elements and actual CSS values. |
| 3. Small-screen layout | Compose exact-copy route and hub boards at 360/375px, including long IF/Wolfsburg headings, both directions, real source labels and unknown-date alternative. Show actions before practical content; preserve one form. |
| 4. Scale layouts | Produce 768px and 1280/1440px rules and boards, retaining reading/focus order even when the form sits beside content. Add guide/support/home-regression boards below. |
| 5. State annotations | Complete state matrix, keyboard/focus/error cases, sticky visibility/occlusion, consent, no-JS and reduced-motion notes. Use fixed S04 wording; route any wording defect back to S04 with a precise correction, not an unrecorded design rewrite. |
| 6. Review and freeze | Check all seven copy variants against the selected template, resolve one consolidated findings list, then freeze design/copy hashes. Prepare S07/S08 acceptance instructions and the existing 5–8-person usability protocol; do not claim participants/results. |

One designer owns `design-handoff.md` and design assets during production; the coordinator independently verifies and integrates. A specialist may assist when execution is explicitly delegated. No workers or Vibe starts are launched by this planning session.

## Template and board coverage

| Surface | Required proposed treatment / real-copy coverage |
|---|---|
| Route | Breadcrumbs → pair/H1 + intro → primary WhatsApp and website alternative → compact confirmation topics → one form → unique practical material/merged questions → reverse/related links → secondary imagery/sharing. On desktop the form may be adjacent in a two-column grid; DOM/focus sequence stays useful. Source image remains illustrative, not a stop/vehicle proof. |
| Route variants | Hannover is the primary board. Use longest IF↔Wolfsburg heading as wrap stress case and Celle→Lviv as return-content stress case; a fit/coverage register accounts for all five routes and their exact section keys, links and merged FAQ coverage. No generic text substitution. |
| Two hubs | Compact exact intro, early city selection, actual-locality explanation, departure/return guidance, eight conditional nearby examples, current cards/FAQ/resources and contact alternative. Board for Lviv; IF variant demonstrates two cards versus Lviv's three and its longer text. Preserve selected pair/reversal, city-card semantics and inline results. |
| Bicycle guide | Reading-width layout with exact FAQs, customs source and the separate existing bicycle CTA. Do not add route-form mandatory date/phone behavior. Five route-to-guide links must remain visible in their fixed S03 sections. |
| About/imprint/shared trust | Preserve operator disclosure, privacy links and neutral carrier distinction. Annotate unchanged versus affected shared blocks; no badges, reviews, source-verification marks for excluded operational claims, or invented expertise. No new trust panel. |
| Home/index regression | Current search/header/footer/action templates with representative exact existing source copy; identify shared changes that could affect them. No new home copy, route list, navigation or acquisition experiment. |

Produce annotated boards for hub, route, guide and affected support/shared surfaces at 375, 768 and 1440px, plus 360 and 1280px wrap checks. Home/index are regression references unless shared changes alter them. Add a compact variant gallery for the remaining priority page text. Each board labels source/copy revision, viewport, proposed dimensions and copy keys; no cropped screenshot may hide overflow or missing text.

## Responsive and accessibility acceptance

| Case | Design requirement / later implementation oracle |
|---|---|
| 360×800 and 375×812 | Single column, full labels/buttons wrap, minimum 44px actionable targets. Primary action is visible in the first 375×812 viewport without consent overlay, per passenger AC06; preserve readability rather than shrink type to force a fit. |
| 768px | Explicit intermediate rule: stack form until actual available columns fit its inputs and real heading. Avoid a narrow desktop sidebar by assuming a breakpoint alone proves fit. |
| 1280×900 and 1440×900 | Define container, prose and form widths/gaps, aligned actions and reading order. Reuse existing shells/type utilities; proposed exceptions list exact values and reason. |
| 320 CSS-pixel reflow | No horizontal page scroll, clipping or required sideways interaction; long Ukrainian text, source links and controls fit. A screenshot scaled down is not reflow evidence. |
| True browser 200% zoom | Test native zoom, keyboard focus and visible error text separately from viewport resize. Record both effective viewport and zoom; no tiny fixed type or concealed actions. |
| Typography/contrast | Main copy/actions/helpers use normal readable body type; important explanations at least 14px. Existing 11px mono only for optional decoration, never required source/date/confirmation meaning. Measure proposed text contrast ≥4.5:1 and UI/focus contrast as applicable; no unmeasured “WCAG compliant” claim. |
| Focus/keyboard | Logical tab order; visible focus; nearby CTA reaches visible focusable search heading below header; early WhatsApp focuses the sole existing form without submit/event. Accordion/selector/reverse behavior retained. |
| Media | Existing asset, exact alt/caption and provenance; illustration follows useful information on small screens. No new operational-looking photo; no network image dependency. |

Skill examples of fixed tall heroes, generic max widths, Italian/English text or “75% mobile” are not project requirements. Use actual UARoute tokens and real Ukrainian copy. Do not add min-height that pushes the inquiry action down merely to match a generic template.

## Interaction/state matrix

| State | Required annotation and preserved behavior |
|---|---|
| Initial route / no verified desk | Normal primary WhatsApp plus secondary website; with no desk show existing website fallback, not a broken WhatsApp action. Exact labels from S04. |
| Form invalid / valid | Empty/past/invalid date, invalid phone and passenger count outside 1–8 keep current messages and focus. Valid submit opens prepared text for user review/send; no design claim of received inquiry/booking. External handoffs intercepted in later checks. |
| Unknown date / no WhatsApp | Website link is visible and independent of validation; no new date-free WhatsApp path, contact field or hidden requirement. |
| Search published / inline / unsupported | Existing published pair opens current page; eligible unpublished pair uses inline inquiry; unsupported/same-country states retain honest fallback. Pair reversal preserves cities and expected countries. IF↔Hannover remains inline; Hannover reverse does not become a route. |
| Sticky before / after anchor | Show hidden-before, visible-after, input-focus-hidden and no-desk fallback states, safe-area occupied height and footer/content clearance. Existing sticky submit uses same validation; no new form/submit path. |
| Mobile keyboard / consent dialog | No fixed element covers input/error/action; sticky hidden during input focus. Consent stays independently usable and is not dismissed for a screenshot. Show dialog-open and closed states. |
| No JS / no consent / reduced motion | Baseline website link remains usable; no analytics dependency for contact. Preserve no-consent journey. Scroll/focus transition respects reduced motion; design no motion-only cue. |
| FAQ / locality / changed plans | Only distinct retained questions; merged answers appear once. Nearby names remain geography with private feasibility question; no marker/icon/map implies a confirmed stop. |

## Acceptance and downstream handoff

S05 passes when: exact-copy boards cover required templates/viewports; 7/7 priority variants map to components; all state rows have annotations; source/existing/proposed dimensions and reused tokens are explicit; 320px and 200% checks are distinguished; actions are clear and unobscured; excluded claims do not reappear visually; final artifact hashes bind the frozen S04 copy. Report measured preview fit separately from implementation acceptance. A design preview cannot pass runtime referral, analytics, static export or actual mobile-browser behavior.

Run documentation navigation/link checks on the handoff/assets. No application build in design-only work. If a local interactive preview is used, intercept collectors and operator handoffs before synthetic QA. Do not contact carriers or send messages. Record any browser/tool limitation as unverified; do not substitute screenshots for interactions. Human usability remains prepared, not executed, until actual participants/results exist.

S07 receives: exact accepted design/copy hashes, board inventory, component/section/state map, CSS/layout proposals and exceptions, one-form/focus/anchor/sticky constraints, image reuse, contrast/overflow findings and remaining implementation checks (AC04/05/07/08/09/11). S08 implements only the accepted manifest. Publication, commits and provider operations retain separate authorization.

**Launch:** Execute S05 only from this plan and frozen S03/S04. Inspect the current UI/source, author annotated real-copy responsive boards and `design-handoff.md`, review state/accessibility/variant coverage, and hand off exact revisions to S07. Preserve existing branding and inquiry behavior; do not edit production code or invent copy/service imagery.
