---
type: Specification
title: "S05 — responsive design handoff"
description: "Exact-copy layout, shared component and state contract for the seven existing priority pages and support surfaces."
tags: [uaroute, seo, s05, design, handoff]
---

# S05 design handoff

Prepared 2026-10-28. **Design contract ready with explicit unknowns.** This is a proposal for S07 preparation and S08 implementation. Browser fit, true zoom, interactions, application acceptance and human usability are not claimed by this document. The coordinator records independent preview results and final board hashes separately. Read the [execution status](execution-status.md) for the whole-session conclusion; this contract alone does not close S05.

Base HEAD `15725cba20f4f83475f0df8241e66f31836ce1d4`. Preserve the eight existing application-file changes matching calendar-fix release `ff1e4d0` and all other contributors' files. Source inspection uses the current working tree, including those fixes; it is not a Git-HEAD-only or production browser comparison. The [baseline record](../../../../ops/evidence/seo-mitigation-execution-2026-10-28/baseline.json) owns the gate evidence. No application, catalog, URL, dependency, account or release change is part of S05.

## Authority and fixed copy

Use the [constitution §42](../../../00-project-constitution.md#42-existing-page-acquisition-and-conversion-priority-2026-10-24), [passenger contract](../../../Product/passenger-discovery-conversion-spec-2026-10-22.md), [S05 work plan](s05-work-plan.md), [accepted S03 architecture](page-architecture.md), [accepted S04 copy](content-package.md) and [editorial review](editorial-review.md). The final source of strings is [copy-records.json](../../../../ops/evidence/seo-s04-2026-10-27/copy-records.json), not a rephrased board heading. Render `records[key].heading/text/items/links` exactly, plus page metadata H1 and retained links. Preserve historical source dates; do not create reviewed/updated/author dates from the design date.

The older visual/UX documents still contain named-carrier examples, next/font and alternative font directions, and a practical-information-first sequence. Their dated examples are superseded by neutral public naming, actual local font source, passenger U02 action-first order and this frozen copy. This is a documented historical mismatch, not permission to override Level 1. No current Level 1 contradiction was found in this bounded design.

No service verification marks, timetables, fares, availability, direct/same-vehicle promises, pickup pins, reviews, badges or new trust panels. A city/nearby name is geography and private planning context. Keep the current technical IDs, desks, contacts, referral URLs and allowlists. Hannover reverse gains no URL; IF↔Hannover stays inline inquiry.

## Inventory and baseline versus proposal

All dimensions below are CSS pixels at root 16px unless a relative unit is explicit. Source values are code-inspected, not measured screenshots. Proposed values are encoded in [board.css](design-assets/board.css); future reviewers must measure the rendered candidate. This is a bounded hierarchy/readability proposal, not a proven conversion uplift.

| Component / source | Current source | Proposed / retained |
|---|---|---|
| Header / Footer | Header min-height72, wraps; existing mobile menu; footer grid gap40/64, py56 | Reuse actual components and menu behavior. Header remains in first-screen measurement. Board header is a compact schematic reference, not replacement navigation. Footer legal/privacy/operator links retained, actionable links ≥44 high. |
| `globals.css` shell | `container-page` max78rem=1248 incl20 side padding; reading42rem=672 | Retain shell; 375 content335, 360 content320, 320 content280; 1280/1440 max1248 incl40 gutters, content1208. Reading max672. No fixed-width page or clipped overflow. |
| Fonts / colour | Local Playfair Display + IBM Plex Sans/Mono; warm paper/ink/navy; corners2–10 | Retain exact local font files and source tokens; board imports existing fonts by relative local path. No font download/CDN. Functional copy Sans, headings Display500, Mono only optional metadata. Boards radius3, rules1, no new shadows/palette. |
| Type | body16/1.7, small15/1.65; H1 clamp36–68 line1; H2 clamp24–34; caption11, meta12 | Body/action16; explanation/source/error/label ≥14/1.6; optional existing decorative11 remains optional only. Board H1 mobile36/1.08, ≥768 48/1.06; H2 26/1.18 then30. Narrow H1 is an explicit proposal to contain longest real copy, not global home display change. |
| JourneyActions | mt16, gap12, min-height48, wrapping; date-free site action | Keep mechanics and exact labels. Mobile grid one column gap10, padding12×16, target≥44 (button48). ≥640 two equal available columns, max672; wrapped label grows height. Helper below actions14. |
| Route hero/form | Early actions and conditions already exist; lg grid left+380, hero gap24 | Keep early access. `.route-layout` DOM early→one form→detail. At ≥1024 left fluid + right320–380 gap32. No sidebar at768. Form placed right beside beginning, never after FAQ in mobile DOM. |
| BookingWidget / CandidateInquiry | Current date+passengers+phone; h48; gap20; candidate p12→24; route p20/24 | One form per current surface; proposal card p16 mobile then24≥768; date/count split only≥640, full phone. Field labels14, controls16/48, error14. Unique existing IDs/provider/anchor retained. No extra state machine. |
| Route practical / image | Main starts generic 4:3 illustration, then practical, FAQ, related | Move illustration after useful practical/FAQ/related links, before sharing/secondary panel as space permits. Keep all accepted useful text. Captions/source meaning14; retained alt/caption exact. No new image. |
| RouteSearch | Direction and priority choices, expected-country selectors, inline result, cards | Preserve search logic, fields, reversal and current result semantics. Compact hub hero16px top/bottom then search; no tall image hero. Search field/control≥44, body16. No new labels/URLs. |
| NearbyPlaces | Existing four source-backed examples per priority hub, two columns≥640 | Preserve8/8 examples and conditional guidance; single column mobile, two≥640 gap20/p20. CTA to focusable search heading. Geography source labels/dates14; no stop symbols. |
| Faq / RelatedRoutes | Existing details/summary; links to commercial pages | Reuse native disclosure and existing link semantics. Summary≥44; open answer body16. Merged S03 answers occur once. Route return/other links after unique guidance. |
| PartnerCard | `inquiryOnly` branch already supports shared.role; default may render claims/VerifiedMark | Use bounded inquiry-only presentation for all five mitigation routes, retaining neutral name/site. OP-1–OP-4/OP-service excluded. Do not globally delete shared data/claims. S07 names exact consumer changes. |
| Consent / sticky | Existing section/fixed privacy panel; sticky anchor passed + input-focus-hidden + measured height | Preserve behavior. Raise necessary text to14; no new modal semantics or focus trap invented by design. Sticky same submit path; full occupied height and safe-area accounted. |

## Responsive dimensions and reading order

| Viewport | Exact proposed rule / later measurement |
|---|---|
| 360×800 / 375×812 | Single column; gutter20; section vertical28; hero16 top/24 bottom, H1 margins16; action margin16/gap10. No hero min-height. 375 primary action entire bounds must fit first812 after actual Header and normal load, consent closed. Long IF/Wolfsburg must wrap without shrinking body. If not, reduce optional spacing/decoration before revisiting type; do not omit frozen text. |
| 768 | Shell inner728. Route early/form/detail remain stacked. H1 48; H2 30; sections32; form p24. Form controls can date/count split because inner width≥640 breakpoint. Cards two columns. Search may use two equal columns; reading still≤672. |
| ≥1024 | Shell inner≥984. Route columns `minmax(0,1fr) minmax(320px,380px)` gap32, available left≥572 when right380. Form inner332 at p24/right380. Explicit actual-copy fit is still required; no breakpoint proves fit. Early row1col1, form row1–2col2, detail row2col1. DOM/tab early→form→detail. Form is not position:sticky. |
| 1280×900 / 1440×900 | Shell1248 incl40 padding, inner1208; left796/right380/gap32. Prose≤672; actions≤672. At1440 shell outer space96 per side, content begins116. At1280 outer16, content36. H1 remains48 on these boards; home display unchanged. Hub3 cards only≥1024; IF2 cards remain2. |
| 320 CSS-pixel reflow | Real layout width320, inner280; `min-width:0`, fieldset min-inline-size0, full controls, wrap anywhere only where needed. No overflow-x:hidden to hide failure, no horizontal scroller, no text clipping/truncation. Measure scrollWidth, readable labels, all targets. This is distinct from zoom. |
| Native browser200% | Use browser zoom200%, record CSS viewport and physical screen; verify keyboard path, focus/errors/consent, controls and sticky. Do not represent resize, CSS zoom, transform, device scale or screenshot downscaling as native zoom. Not run by design author. |

Source/proposed coordinates are specifications; the actual first-screen action bottom, font loading, rendered widths/heights and overflow belong to independent preview QA. Board annotations must remain after primary material so they do not inflate the passenger first screen. Board browser measurements cannot establish actual app Header/menu behavior.

## Page / key / component map

Route fixed sequence: breadcrumb/H1 + `*-intro` → JourneyActions + `shared.contact-alternative` → compact confirmation items → BookingWidget `*-inquiry` → distinct practical keys in S03 order → unique retained FAQ → reverse/related/hub links → illustrative image/caption → sharing/secondary contact. The keys identify copy responsibilities, not a requirement for one new section per record. For Hannover/Celle the `*-questions` items are the compact confirmation list near the action; their bicycle paragraph/link can remain in practical questions once, without repeating the items/answer. The other three baggage keys render unique practical copy once; existing compact confirmation items stay current.

Hub fixed sequence: H1+intro → selection+actual-locality explanation beside/within selection → existing RouteSearch → nearby examples+return-to-search → outbound/return planning → route cards+distinctFAQ/resources → contact alternative+related hubs. No anchor or header offset changes without focus QA. Empty/missing operational data stays a question, never a visual service promise.

| URL | Template / exact frozen keys | Specific stress / unchanged relation |
|---|---|---|
| `/routes/lviv-hannover/` | route: `lh-intro`, `lh-arrival-locality`, `lh-independent-onward`, `lh-lviv-first-leg`, `lh-questions`, `lh-actual-locality`, `lh-changed-plan`, `lh-inquiry` | Primary Hannover; no reverse page. Retain every `retained_links`/source link and exact label from record. |
| `/routes/lviv-celle/` | route: `lc-intro`, `lc-arrival-locality`, `lc-arrival-orientation`, `lc-lviv-first-leg`, `lc-questions`, `lc-locality-changes`, `lc-inquiry` | Outbound Celle; reverse cl retained. Retain every `retained_links`/source link and exact label from record. |
| `/routes/celle-lviv/` | route: `cl-intro`, `cl-meeting-locality`, `cl-lviv-arrival`, `cl-independent-onward`, `cl-baggage-transfer`, `cl-locality-changes`, `cl-inquiry` | Return content stress; correct private meeting place. Retain every `retained_links`/source link and exact label from record. |
| `/routes/ivano-frankivsk-wolfsburg/` | route: `iw-intro`, `iw-arrival-locality`, `iw-shared-departure`, `iw-baggage-transfer`, `iw-locality-changes`, `iw-inquiry` | Long heading/outbound; reverse wi. Retain every `retained_links`/source link and exact label from record. |
| `/routes/wolfsburg-ivano-frankivsk/` | route: `wi-intro`, `wi-meeting-locality`, `wi-arrival-coordination`, `wi-independent-onward`, `wi-baggage-transfer`, `wi-locality-changes`, `wi-inquiry` | Long heading/return; no duplicate FAQ. Retain every `retained_links`/source link and exact label from record. |
| `/cities/lviv/` | hub: `lv-intro`, `lv-select`, `lv-actual-locality`, `lv-outbound-return.outbound`, `lv-outbound-return.return`, `lv-nearby-examples.lviv-zhovkva`, `lv-nearby-examples.lviv-yavoriv`, `lv-nearby-examples.lviv-zolochiv`, `lv-nearby-examples.lviv-sambir`, `lv-route-cards`, `lv-faq-resources.faq1`, `lv-faq-resources.faq2`, `lv-faq-resources.faq3`, `lv-faq-resources.faq4`, `lv-faq-resources.faq5`, `lv-faq-resources.resource1`, `lv-contact-alternative` | Three route cards/four nearby examples. Retain every `retained_links`/source link and exact label from record. |
| `/cities/ivano-frankivsk/` | hub: `if-intro`, `if-select`, `if-actual-locality`, `if-outbound-return.outbound`, `if-outbound-return.return`, `if-nearby-examples.if-kolomyia`, `if-nearby-examples.if-tysmenytsia`, `if-nearby-examples.if-rogatyn`, `if-nearby-examples.if-bohorodchany`, `if-route-cards`, `if-faq-resources.faq1`, `if-faq-resources.faq2`, `if-faq-resources.faq3`, `if-faq-resources.faq4`, `if-faq-resources.faq5`, `if-faq-resources.resource1`, `if-contact-alternative` | Two route cards/four nearby examples; Hannover inline only. Retain every `retained_links`/source link and exact label from record. |

Seven-page coverage is 5 routes + 2 hubs; required guide/support/home references are additional surfaces, not new priority URLs. Metadata title/description/H1/canonical are frozen, including distinctions between route visible intro and metadata description. `data-copy-key` is the exact record key, `data-copy-field` one of heading/text/items/links; parent page has `data-page-url`. Shared record keys use their literal dotted names.

## Guide, support and regression expectations

| Surface | Exact source mapping / layout |
|---|---|
| Bicycle guide | `support.guide` metadata/retained_navigation and `guide.intro`, `guide.faq1–3`, `guide.customs`, `guide.handoff`. Reading672; single column at375/768/1440, source link14, native FAQ≥44. Existing separate bicycle CTA stays separate; no route-date/phone form added. Preserve historical Article dates/organization identity without new author/review claims. Customs text remains frozen context, not newly verified legal advice. |
| Route→bicycle | Exactly five guide links: `lh-questions`, `lc-questions`, `cl-baggage-transfer`, `iw-baggage-transfer`, `wi-baggage-transfer`; keep exact label/destination. No sixth invented link or repeated FAQ. |
| About | All `support.about.keys`, including shared.role, exact operator distinction, privacy, photo and pilot. Reading672; principles can2 columns≥640, title/intro retained; no new badge/authority. |
| Imprint | All `support.imprint.keys`; factual UARoute legal operator is separate from transport provider. Email/address wrap, source legal copy16, legal/privacy links≥44; no transport office or carrier assertion inferred. |
| Shared trust/Footer | Retain existing operator/privacy navigation and neutral shared.role/caption; necessary explanations≥14. Do not render excluded carrier claims or VerifiedMark as proof. |
| Home / routes index | Regression reference using exact current source text, current search, Header/Footer, action and list patterns. No home rewrite or new route list. Proposed H1/hero spacing scoped to mitigation templates; do not alter global type-display. Changes to reused form/helper/source controls require regression at375/768/1440 and 360/1280 wraps. |

The existing accepted [Hannover375 board](design-assets/hannover-route-375.html) remains immutable history and has no font request. It represents one initial state only. Responsive workers create separate route/hub/guide/support boards using this contract; full artifact inventory and measured fit are frozen by the coordinator after all boards arrive. See [design asset inventory](design-assets/index.md). No missing board is implied accepted by this contract.

## Shared board authoring contract

`body.board`, `main.page-shell`, `.site-header`, `.hero`, `.lede`, `.actions > .action.primary/.secondary`, `.route-layout > .route-early + .inquiry + .route-detail`, `.prose-section`, `.reading`, `.resource`, `.cards > .card`, `.field-row`, `.field`, `.hint`, `.source`, `.caption`, `.error`, `.annotation`, `.footer`. `.cards.three` means three≥1024; default cards two≥640. `.search-grid` becomes two≥768. Classes propose styles only; S08 retains React/shared utilities instead of shipping this standalone stylesheet.

Each board labels `data-template=route|hub|guide|support|home`, exact page URL, copy revision, proposed viewport/rules; `data-copy-key` and `data-copy-field` bind actual strings. State examples label `data-state`. Local resources only; external/application destinations are recorded in annotations and replaced by local explanatory anchors in boards. Disabled form illustrations and type=button prevent actual handoffs. Do not put a real outbound URL on a clickable board action. No JavaScript or collector request. Local bundled font requests are expected; when serving boards, serve repository source assets read-only. There is no network font/image requirement.

## Complete state contract

The [state board](design-assets/states.html) illustrates all rows below with exact frozen labels and current source consent text. Static states are inert examples; they cannot pass keyboard, native calendar, referral or analytics acceptance.

| State IDs | Required behavior / focus and acceptance owner |
|---|---|
| route-initial / no-desk | With desk, WhatsApp primary + visible website; without desk, existing website primary, no broken WhatsApp/form. Initial action bound measured at375×812 and1440×900 separately from consent. |
| form-invalid / form-valid | Retain all8 validation messages from retained_interface validation.1–8. Missing/past/invalid date focuses h2 of sole form, instant scroll + preventScroll. Passenger error select, phone error phone; keep current error associations. Valid submit builds current desk message for passenger review/send, not receipt/booking. |
| unknown-date | Visible site link independent of validation, no date/phone required; no new WhatsApp path or alternative form. |
| search-published / search-inline / search-unsupported | Published existing page vs eligible inline vs honest fallback. Preserve pair on reversal and expected countries; changing pair clears stale form. IF↔Hannover stays inline, no Hannover reverse URL. Same-country/incomplete messages remain exact current RouteSearch strings. Fallback site has no incomplete pair. |
| sticky-before / sticky-after | Hidden until anchor.bottom<=0; mobile current lg:hidden; after visible uses same submit. Measure ResizeObserver height into --inquiry-sticky-height/body padding; safe-area included; enough footer clearance. Moving layout changes anchor geometry and requires runtime retest. |
| sticky-keyboard / sticky-fallback | Focus input/select/textarea hides sticky; mobile keyboard never obscures error/action. No-desk sticky uses website. Native date picker opens only direct user tap, never early CTA/error focus/automatic scrolling. Preserve released calendar fix. |
| consent-open / consent-closed | Current AnalyticsConsent text and choices unchanged; configured first choice fixedbottom z50 max75dvh scrollable, desktop width≤576; reopened settings in flow. Do not dismiss to force AC06. Preserve heading/return focus, visible choices and contact independence; no new modal/focus-trap claim. |
| baseline-motion | Baseline site href without JS; hydration gates submit; no-consent contact available; existing analytics policy remains. Reduced-motion no animation-only signal, scrolling instant/auto; still visible focus. |
| faq-locality | Distinct native FAQ summaries≥44; merged answer once. Nearby CTA reaches visible focusable search heading below header. No locality marker implies stop/coverage; changed plans require new agreement. |

**Keyboard order:** Header/navigation → breadcrumb → primary early action → website alternative → form heading then date/count/phone/submit in DOM → guidance/resource links → FAQ summaries → reverse/related links → secondary material/Footer/privacy. Early action goes to heading, not date. No positive tabindex. Focus2px navy offset3. Target min44×44, including icons and legal links. Do not use colour alone for errors; text + aria association retained.

Contrast pairs to measure: ink/paper, ink/surface, muted/paper, muted/surface, on-navy/navy, destructive/paper and destructive/card. Source palette remains fixed. Measure text≥4.5:1, focus/control contrast separately. Font file loading must be confirmed before measurements. This author does not claim rendered contrast/browser measurements; coordinator evidence records method and values. Dark mode is retained in application, not redesigned by these light-mode boards; affected dark states require implementation contrast QA.

## S07 / S08 transfer and acceptance

| Owner | Concrete transfer / oracle |
|---|---|
| S07 | Bind frozen4 hashes, final board/CSS/handoff/contract hashes and measured review. Map exact keys to existing route/hub/support consumers, metadata/JSON-LD/card description consumers, no duplicate merged answers. Name minimal file edits and inquiry-only PartnerCard consumer dependency. Choose scoped utility overrides, not global home type change. Resolve missing preview defects before manifest acceptance; preserve calendar fix. Combine S06 measurement decisions; S05 does not replace them. |
| S08 | Sole application owner after S07 readiness. Read local version-specific Next.js guide; retain npm/TS6/static export and server-default boundaries. Implement approved scope in source, not by shipping board HTML. Reuse inquiry/search/referral state/IDs/desk/contact/attribution. Actual tests/intercepted browser QA on same export; stable npm check once per repository contract. |
| S09 | Independent candidate verification; S05 screenshots cannot pass runtime/static HTML/privacy/referral requirements. Reproduce relevant failures only; no competing implementation. |

Mitigation AC04: real keyboard/error/focus/sticky/reflow/nativezoom; AC05: staticHTML/canonical/H1/schema/true dates; AC07: commercial search/reversal/published-inline-fallback; AC08: complete pair/desk/site without fields; AC09: privacy/consent/firsttouch vs currenttarget; AC11: comparable lab before/after and affected accessibility evidence under S06/S07; investigate material regressions. Passenger AC06/07/08/09/10/11/14 remain their more specific oracles. External handoffs and collectors intercepted before disposable input; no carrier message. Board fit cannot prove runtime, performance, delivery or release.

## Prepared human usability protocol — NOT RUN

Use the existing passenger contract S01–S07 with 5–8 new people, no coaching: S01 organic entry to Lviv→Hannover, recognize the pair/usefulness/contact before FAQ; S02 find Lviv→Hannover from home/index through normal selection; S03 select Lviv→Wolfsburg without a standalone page and see the eligible inline inquiry; S04 reverse Wolfsburg/Lviv while retaining cities and expected countries; S05 choose the Schwerin card on the Lviv overview, return to search and focus the next action; S06 find the carrier site with unknown date/no WhatsApp and no validation; S07 use the nearest available city for a missing locality and explain private actual-place confirmation without mandatory travel to the hub. Pair-change and valid-form regressions remain required implementation checks in addition to these exact human scenarios. Intercept handoffs/collectors and use disposable inputs. Recruitment or contact is outside this design task.

For each participant/scenario record success, first wrong click, blocking difficulty and answers to who is responsible / what opens / whether a seat is reserved. Acceptance: no unresolved blocking search/contact issue or false booking understanding; correct and retest observed failures. Current participant count0, sessions0, resultsnone. This qualitative protocol supports no statistical conversion uplift claim.

## Explicit unknowns and freeze boundary

Browser-rendered fit, font load, action coordinates,320 reflow, native200% zoom, keyboard/nativecalendar/consent/sticky behavior, dark-mode affected contrast, runtime referral/analytics/staticexport and usability are not verified by this design author. Missing operational evidence remains excluded; no need to invent it to fill whitespace. Current provider visibility data/AI performance and human/native-speaker/carrier review remain outside this design conclusion.

The machine-readable [design contract](../../../../ops/evidence/seo-mitigation-execution-2026-10-28/design-contract.json) binds this author’s owned artifacts and exact copy. Coordinator final verification owns all later-produced boards and acceptance status; after any artifact changes, recompute final hashes. There is no self-referential hash in the handoff. No commit, publication, account operation or application build was performed in this design task.

## Independent-review correction — control boundaries

The source input token is retained as palette provenance, but proposed input borders use existing navy (`--navy`) instead of `--input`. The original source-tone boundary did not meet the proposed 3:1 control-boundary requirement. This is a local design exception using an existing color, not a new palette or a claim that current application controls were revalidated. Final text, boundary and focus ratios are bound to final board styles in independent evidence.

## Independent-review correction — early hub search

The final hub boards place H1 and exact intro first, then the short selection heading, direction controls in two equal mobile columns (10px gap), two full-width stacked city fields on mobile and the primary search action. Full selection explanation and actual-locality guidance follow immediately, retaining every frozen key once. This supersedes the earlier order that put long explanations before the search controls. It preserves search behavior; S08 must apply the hierarchy using the actual RouteSearch component, not replace its autocomplete with demonstration selects. Initial viewport geometry is measured in final preview evidence and must be rechecked on the implemented application.

Final hub fit correction: mobile header uses the current wordmark/menu row rather than stacking desktop navigation; optional hero spacing is compacted. Direction buttons remain in two columns, city fields stack below 640px, and input/select font size is explicitly 16px to avoid inheriting 14px label typography. No selected locality may be clipped by a native dropdown arrow. This supersedes any intermediate board annotation describing two mobile city-field columns.
