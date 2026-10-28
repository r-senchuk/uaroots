# R2 — later iPhone Chrome test

**Preparation ready with explicit unknowns. Every device result is NOT RUN.** The owner chose instructions for a later physical-device test. This assignment created no preview, exposed no server, controlled no UI and changed no accounts. It does not clear S10 or establish publication.

## Identify the candidate before testing

The coordinator supplies an already authorized, access-controlled HTTPS preview reachable from the actual iPhone, backed only by `output/seo-mitigation-execution-2026-10-28-private/implementation/candidate/out/`. Do not expose the repository, private evidence, environment files or a development server. Preview setup/exposure is a separate action; this document does not authorize it.

Use [R1 inventory](../r1/inventory.md) and [identity](../r1/identity.json). Before the later session, the coordinator must recheck the exact export against all 258 entries, reject extras, and bind the served preview bytes to that manifest. Record preview URL, verification receipt/time and the matching source/export identities in [the blank receipt](results-template.json):

| Identity | Accepted value |
| --- | --- |
| Source manifest SHA-256, 167 selected files | `3c114ad623fd49d791eea58ea2210170801e45613fb557ad4fdf0313c3cae29e` |
| Export manifest SHA-256, 258 files | `40a5db56e1a7ae1aa8b6d06ebabf05f3d1adde1229dc2c25517adfaa89636572` |
| Manifest directory | `output/seo-mitigation-execution-2026-10-28-private/implementation/` |

HEAD `15725cba20f4f83475f0df8241e66f31836ce1d4` alone does not identify this dirty candidate. Repository-root `out/` differs from the accepted export. The older deployed site/calendar hotfix, screenshots, design boards and mobile emulation cannot serve as this candidate or pass this physical-device test. If a new CI build/export replaces it, reconcile the changed identities and affected acceptance first.

Before navigation, the preview operator must verify blocking of every external collector and carrier/operator handoff, including external navigation/app launches, while allowing the candidate's required first-party assets to hydrate. Record the isolation method and confirmation; do not claim disabled analytics alone proves every external path is blocked. If isolation or candidate identity is unavailable, leave the affected interaction NOT RUN. Do not work around this by using production. Do not enter names, phone numbers, dates, credentials or messages; do not use autofill, follow a carrier link, open WhatsApp or submit a valid inquiry. Cancel the calendar without selecting a date and leave the phone empty. Screenshots/recordings must contain no private notifications, contacts, credentials or personal URLs.

## On the actual iPhone

Record iPhone model, exact iOS and Chrome versions, orientation/display settings, tester and timestamp. Open the supplied preview in Chrome with no restored form/autofill values; confirm the recorded candidate verification applies to this URL. Start at `/routes/lviv-hannover/`. Wait for controls to enable. Keep date and phone blank throughout.

1. **Early action:** tap the early `Уточнити поїздку в WhatsApp` action above the form. Expect the sole form heading `Уточнити поїздку` to come into view without a calendar, keyboard, crash or return to the home screen. Heading focus is the expected behavior; scrolling alone does not prove focus. If the coordinator has an available approved inspector, record `activeElement` as the H2; otherwise leave the focus observation explicitly unverified.
2. **Blank invalid submit:** tap the enabled form action with both fields blank. Expect `Вкажіть дату поїздки.` and `Вкажіть номер телефону для зв'язку.` to remain readable, the heading in view/focused, no automatic calendar/keyboard and no outgoing handoff. Record focus evidence separately as in step 1. Do not supply data to reach a successful submit.
3. **Direct date activation:** tap the date input itself. Expect the native date picker to open only on that direct action, remain usable and dismiss/cancel without a crash. Cancel without selecting a value; check the date remains blank. Record the actual native UI and dismissal behavior rather than assuming a specific iOS button label.
4. **Mobile keyboard:** tap the empty phone input without typing or accepting autofill. Check the telephone keyboard opens, the label/control remain reachable, and the floating action does not cover the focused control. Dismiss with the available iOS control or a non-input area. Expect normal scrolling and usable form/actions afterward; record any stuck overlay, jump or accidental calendar opening.
5. **Sticky + consent:** scroll until the form is above the viewport and the mobile `Уточнити поїздку` bar appears. With the fields still blank, tap it and expect the same safe errors/heading behavior as step 2. Open privacy/consent preferences using the page control, check dialog text and close/reject controls remain reachable above the sticky bar and iPhone safe area, then close/reject without granting analytics. Revisit the phone field and dismiss its keyboard; the sticky bar should not obstruct a focused input, consent action or core navigation. Record both consent-open and consent-closed states.
6. **Return navigation:** use an internal page link to leave the route for `/routes/`, then Chrome Back. Confirm the same candidate route loads, scrolling/navigation and the early action still work, and returning does not automatically launch a calendar/keyboard or crash. Record observed restored state; do not assume values or scroll position must persist. Repeat the early-action/direct-date/cancel sequence once after returning if safe.

For each step record PASS/FAIL only after actual execution, the exact page and a short observation/evidence reference. Record blocked/unavailable portions as NOT RUN with a reason. Stop on a crash, candidate mismatch, unexpected external launch or loss of isolation; preserve a sanitized observation for the coordinator, who owns fixes and re-verification. Do not change the candidate to make a test pass.

## Applicability and remaining unknowns

These checks close the named real-iOS calendar/mobile-keyboard dependency under [S09](../../../../docs/Marketing/SEO/mitigation-2026-10/acceptance-review.md), AC04/AC11 and [the handoff](../../../../docs/Marketing/SEO/mitigation-2026-10/next-stage-handoff.md). The existing [specification](../../../../docs/Marketing/SEO/mitigation-spec-2026-10-27.md) requires truthful separation of actual touch, screen-reader and native zoom evidence; a reproduced severe interaction/accessibility defect must return for review. R4 applies existing requirements to the resulting receipt. This preparation does not waive applicable checks or create additional release gates.

Screen-reader review remains separately NOT RUN: a later accessibility reviewer records actual device/VoiceOver version, heading/label/error announcements, focus/order and dialog return behavior if performed. Do not infer those results from visual scrolling or the desktop receipt. The independent 5–8-person human usability study is also NOT RUN; it can be prepared separately and is not a newly imposed universal release gate. Existing desktop native 200% zoom/native-select evidence remains historical evidence for this exact candidate, not a new R2 result. Provider delivery, field/search/AI metrics, carrier receipt and production behavior remain outside this device session.

Sources read: root AGENTS.md; repository verify-pages skill; R1 inventory/identity; S09 acceptance and native application receipt; next-stage handoff; applicable specification and working-agreement passages. No physical-device, screen-reader or human-study result was obtained.
