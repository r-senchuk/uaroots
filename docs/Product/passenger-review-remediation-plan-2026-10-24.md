---
type: Specification
title: "UARoute — план усунення зауважень passenger review"
description: "Послідовність виправлень reflow, навігації, referral mapping, контентних контрактів і семантики форм із вимогами перевірки."
status: draft
tags: [uaroute, nextjs, accessibility, inquiry, implementation]
---

# План реалізації після перевіреного review

Дата плану: 2026-10-24. **Локальну реалізацію P1–P5 завершено координатором 2026-10-24 за прямим дорученням власника без Vibe/Luna.** Мета — закрити підтверджені R1–R5 та опрацювати E1–E3 без розширення транспортної матриці чи зміни ієрархії дій.

Підстави: [чинна специфікація](passenger-discovery-conversion-spec-2026-10-22.md), [робоча угода](../Operations/Agentic/Operational/working-agreement.md), [контентний контракт](06-data-model-and-content-governance.md), [конституція](../00-project-constitution.md). Локальні докази review: `output/passenger-review-2026-10-24/REVIEW.md`, `verification-manifest.json`, `zoom-geometry.json`, `navigation-fonts.json`, `browser-probe.json`. Output є допоміжним локальним evidence, не залежністю docs-check або CI.

## 1. Вихідний стан та обмеження

- HEAD `c71e4cfc1822824e8bb977f9d6db7312f3b9b88f`, main, незакомічений implementation candidate та сторонні dirty docs/tooling.
- Source fingerprint перевіреного кандидата: `22ed9822f0df97b8fe59e78aa54a8e41f98d92eaae86384e0ba039414b7e7da6`.
- Review export fingerprint: `1971d5f4bd0b759066a645853981ba532d656e31686d8c3aba6e7b380c139dc6`. Не підміняти ним попередній export2026-10-23: build IDs і hashes різні.
- Node22.13.1, точні lockfile dependencies, Next16.4.0 у `/private/tmp/uaroute-review-20261024`. Root node_modules має Next16.3.8: він не є runtime для acceptance. Раніша тимчасова копія вже відсутня.
- Новий review:67 focused tests +2 contract probes PASS; build/inspect PASS.24 normal viewport cases PASS. Zoom layout і navigation targets мають відкриті проблеми.
- Runtime M1: Next App Router/static export, npm, TypeScript6. Не додавати backend, dependencies або production server.
- WhatsApp primary за перевіреного desk; website prominent/independent без date/phone; no-desk website primary. Referral generators, allowlists, first-touch/current targetPath та telemetry privacy незмінні.
- Результат майбутньої реалізації — перевірений локальний diff/export. Commit/push/merge/deploy/публікація/реклама не входять.
- Попередній бюджет6 запусків Vibe вичерпаний. План не авторизує додатковий inference. Не відновлювати старі запуски. За окремого нового бюджету делегувати тільки один із наведених bounded пакетів, із точними актуальними inputs і незалежним review.

## 2. Рішення, які фіксуємо до реалізації

| Тема | Рішення плану |
|---|---|
| «Целле ↔ Україна» | Правильний підпис, не змінювати на «Німеччина». |
| `text-sm` | Не замінювати масово: перевірені labels/explanations14–15px. Виправляти конкретні11px functional links. |
| FAQ між URL | Однакові корисні питання дозволені. Немає вимоги унікального набору для кожного маршруту або ліміту40 символів. |
| FAQ count | Прибрати hard floor4 для candidate routes.3–5 — редакторський орієнтир, а не наказ доповнювати текст. Валідність items/питань перевіряти незалежно від кількості. |
| Missing desk / publication | Зберегти fail-closed catalog gate для published commercial routes. UI fallback — defensive state, тестований у fixture. Публікація website-only catalog routes є окремим продуктовим рішенням. |
| Form validation | Наявний `validateInquiry` залишається єдиним джерелом помилок. Native form semantics додаються без другого набору повідомлень чи conversion handlers. |
| Zoom acceptance | Перевіряти і document overflow, і bounds/обрізання важливих controls.200% не вимагає first-screen CTA, але вимагає читабельного reflow та досяжної дії. |
| Доступність | Конкретні перевірки AC07/AC14 обов’язкові; WCAG certificate не є gate. Screen-reader/native browser zoom мають окремо названий фактичний статус. |

Зазначені рішення не змінюють конституцію, eligibility чи operational truthfulness. Якщо буде виявлено вищий чинний контракт із протилежною вимогою — зафіксувати конфлікт до редагування відповідного правила.

## 3. Архітектура виправлень

Зберегти Server Components у route/city/home pages. CSS-reflow, існуючі client event handlers і невеликі локальні hooks достатні. Не перетворювати page tree на Client Component; не дублювати форму для mobile/desktop.

Header уже клієнтський, тому вимірювання його змінної висоти, якщо потрібне, лишається там. Sticky продовжує використовувати InquiryProvider. BookingWidget і CandidateInquiry отримають семантичні forms без зміни data model, URL генераторів або способу надсилання.

`src/app/globals.css` змінювати лише для обґрунтованих scroll offsets/спільної утиліти, якщо локальних classes недостатньо. Не змінювати глобальні `type-label` або base font задля кількох посилань. Не приховувати overflow як спосіб «виправити» test.

## 4. Пакети робіт і залежності

Послідовність: **P0 → P1 → P2 → P3 → P4 → P5 → P6**. Це залежні increments одного кандидата; не потрібні окремі hosted workers чи паралельне редагування спільного harness.

| Пакет | Мета | Знахідки | Залежність |
|---|---|---|---|
| P0 | Freeze inputs та відтворювані failing checks | Evidence gaps | До source edits |
| P1 | Reflow, видимі controls, читабельна навігація | R1/R2 | P0 |
| P2 | Коректний generic referral placement | R3 | P0, інтеграція після P1 |
| P3 | Узгоджені FAQ/desk/instruction contracts | R4/R5, no-desk policy | P0 |
| P4 | Нативне keyboard submit без подвійних events | E1 | P1, P3 policy |
| P5 | Коротші тексти та змістовний FAQ review | E2/E3 | P3/P4 |
| P6 | Stable check, exact export/browser, delivery | AC01–AC16 /18 audit findings | P1–P5 |

### P0. Freeze і контрольні відтворення

**Файли:** тільки task-scoped evidence та disposable copy; source не змінювати.

1. Зняти HEAD/branch/dirty manifest і hashes. Перевірити актуальність даних цього плану, зберегти source diff та сторонні dirty inputs.
2. Підготувати owned copy з повними актуальними dirty/untracked implementation inputs. Не використовувати лише Git HEAD. Залежності встановлювати всередині copy за lockfile, scripts disabled, offline після явного cache preparation; без external symlink. Наявний `packageManager` не додавати задля generic helper.
3. Node22; локальні Next guides читати з installed16.4.0 перед framework-related changes. Не переносити repo на TS7/pnpm чи іншу версію Next.
4. Перенести review reproductions у підтримуваний browser harness:24 normal cases, settled200% layout, functional font/target checks, generic homepage placement, keyboard Enter route/inline.
5. Не вимагати PASS від regression checks на відомо зламаному baseline. Записати очікувані failures і hashes. Тести мають перевіряти поведінку, не наявність класу `min-w-0`.

**Validation IDs:** `P0-baseline`, `P0-runtime`, `P0-reproductions`.

### P1. Reflow та функціональна навігація

**Основні owned paths:**
- `src/components/Header.tsx`
- `src/components/JourneyActions.tsx`
- `src/components/StickyBookingBar.tsx`
- `src/app/routes/[slug]/page.tsx` — лише constraints/clearance
- `src/app/page.tsx` — target/типографіка «Усі напрямки»
- `scripts/passenger-browser.mjs`

**Умовні paths, додати до frozen contract тільки за необхідності:** `src/components/brand/Logo.tsx`, `src/app/globals.css`, `src/components/KovalReferralLink.tsx` — лише layout/text wrapping; referral behavior не змінювати. Перед редагуванням перевірити, чи достатньо локальних classes.

**Конкретні дії:**
1. Header: прибрати припущення про fixed single-row72px на будь-якій ефективній ширині. Зменшити зайві проміжки, дозволити reflow/другий рядок за тісного layout; menu target має залишатися≥44px і не стискатися. Зберегти звичайний компактний header при375px/100%.
2. Повний wordmark не повинен витісняти menu. Спочатку перевірити wrap; compact brand treatment допустимий лише для тісного контейнера, без приховування навігації чи зменшення meaningful text. Не покладатися лише на viewport media queries: CSS zoom може стискати layout інакше.
3. Якщо висота header стане динамічною, перевірити offsets для date/search-heading/validation focus. За потреби один `ResizeObserver` в існуючому Header встановлює локальну CSS height variable з SSR fallback; cleanup не лишає stale значення. Не вводити другу scroll систему й не дублювати offsets через одночасні надмірні scroll-padding/margin.
4. Route grid/children: прибрати min-content expansion за допомогою shrinkable tracks/`min-w-0` у точці, де вимірювання показує переповнення. Не «лікувати» hero тільки `overflow-hidden`.
5. JourneyActions: links fit container, label може переноситися; `min-height` замість fixed height для багаторядкової дії, icon не витісняє текст. Не обрізати WhatsApp/site label і не зменшувати font.
6. Sticky: shrinkable/full-width action; за потреби caption і action розташовуються вертикально. Прибрати fixed-height/shrink-0 комбінації, які роблять label ширшим за контейнер. Продовжити shared submit/no-desk referral, focus hiding, existing appearance after form та safe-area.
7. Перевірити bottom clearance останнього контенту з фактичною висотою sticky. Спершу CSS-layout/reserve, вимірювана height variable лише якщо потрібна для довгого label. Не додавати глобальні вимірювання без доказу потреби.
8. Header functional links —≥14px, не `type-label`11px. Homepage «Усі напрямки» —≥14px та target≥44×44px; декоративні metadata не змінювати.

**Acceptance:**
- На360/375px при100%/200%: menu/hero/site/sticky bounds у viewport, немає document overflow, обрізання чи overlap. Перевірка зверху, після форми та з відкритим FAQ.
- Після zoom/resize: fonts ready +щонайменше2 animation frames; не робити вимір одразу після style assignment. Перевіряти всі потрібні states, не лише top viewport.
- На normal375×812/1440×900 для12 commercial routes головна дія повністю на першому екрані. Consent dialog тестувати окремо, не видаляти.
- Date/search target/focus не сховані під header. Sticky не накриває поля, FAQ чи останній контент; no-desk label також fit.
- За наявності supported tooling виконати окремий native browser zoom/reflow check; CSS zoom не називати ним. Якщо native unavailable — явно UNVERIFIED, не підміняти deviceScaleFactor.

**Validation IDs:** `P1-normal-24`, `P1-zoom-bounds`, `P1-font-targets`, `P1-focus-clearance`, `P1-sticky`, `P1-native-zoom-status`.

### P2. Generic referral mapping

**Owned paths:** `src/components/RouteSearch.tsx`, `src/lib/passenger-conversion.test.ts`, `scripts/passenger-browser.mjs`; `src/config/site.ts` лише як reference. За потреби новий focused test `src/lib/search-referral.test.ts`.

- Замінити hardcoded `content="site_route_index"` загального fallback на дозволене значення, похідне від поточного placement: `site_${ctaLocation}`.
- Зберегти event ctaLocation, canonical current targetPath і незалежний first touch. Route/inline hero/candidate mappings не змінювати.
- Generic href не отримує overview city або unknown pair, acquisition tags чи PII. Website host/UTM allowlists не розширювати.

**Acceptance:** homepage unknown→`site_hero`; route index/city generic→`site_route_index`; fixed tuple та usable baseline href. При selection/reversal попередня pair не просочується в generic link. Keyboard/middle click, consent refusal та optional attribution failure не ламають навігацію. Expected strings у тестах незалежні від production expression.

**Validation IDs:** `P2-placement`, `P2-generic-negative`, `P2-referral-regression`.

### P3. FAQ contracts та canonical instruction examples

**Owned paths:**
- `src/lib/validate-catalog.ts`
- `src/lib/validate-catalog.test.ts`
- `docs/Product/06-data-model-and-content-governance.md`
- `src/data/AGENTS.md` — тільки clarification, сторонні GA4/Ads sections byte-preserved
- `.agents/skills/verify-pages/SKILL.md`
- цей plan — статус виконання лише після доказів, не заднім числом

**FAQ policy:**
- Видалити candidate-only вимогу `faq.length>=4`. Не замінювати її новою вимогою «усі URL унікальні» або hard maximum5.
- `faq` лишається масивом; кожен item має непорожні trimmed question/answer. Явні дублікати питань усередині одного FAQ відхиляються після простого нормалізування пробілів/регістру. Не використовувати LLM/semantic scoring в CI.
- Немає жорсткого minimum для доповнення «водою»: якщо окремої корисної відповіді немає, FAQ може бути коротшим/порожнім, а renderer вже вміє не показувати порожній блок. Candidate publication quality забезпечують окремі чинні constraints і редакторський review; не скасовувати practicalContent/provenance requirement.
-3–5 — редакторський орієнтир C05. У цьому пакеті наявні4 FAQ не переписуються лише заради нового validator.
- Не послаблювати IDs/statuses/selected-pairs/desk/corridor/source/security gates. Negative fixtures зберегти.

**Desk policy:** задокументувати чинний fail-closed commercial catalog gate і defensive component fallback. Додати незалежні тести: current catalog PASS; missing commercial desk fail; route-prop no-desk UI показує website без полів. Не робити no-desk published route для проходження browser тесту.

**Skill:** Celle→Stryi має вести на чинний `/routes/celle-stryi/`; застарілий inline example замінити. Інший unpublished eligible pair вибирати за актуальним каталогом та explicit expected set; не відновлювати missing matrix.

**Acceptance:** arrays0/1/3/4 коректних items не відхиляються лише через count; malformed/blank/duplicate-question fixtures відхиляються. Незалежні catalog membership/provenance negatives лишаються. No-desk publication gate та UI fallback відрізняються явно. Canonical example та route tests узгоджені.

**Validation IDs:** `P3-faq-shape`, `P3-catalog-negative`, `P3-desk-policy`, `P3-instruction-links`.

### P4. Семантичні route/inline forms і Enter

**Owned paths:** `src/components/BookingWidget.tsx`, `src/components/CandidateInquiry.tsx`, `src/components/inquiry.tsx` лише за необхідності спільної validation/focus корекції, `src/lib/passenger-conversion.test.ts`, `scripts/passenger-browser.mjs`, `scripts/poc-browser.mjs` якщо selectors потребують точного оновлення. За потреби один малий shared hydration hook із заздалегідь визначеним path.

1. За desk рендерити одну `<form noValidate>` з `onSubmit`: спочатку `preventDefault()`, потім чинний `submit`/`validateInquiry`.
2. Primary submit button — `type="submit"`; прибрати старий submit-onClick, щоб Enter/click не створювали подвійного handoff/events. Не додавати ручні keydown handlers для імітації submit.
3. `noValidate` дозволяє чинній custom validation керувати текстом помилок/focus. Зберегти required/min/ARIA; browser-native tooltip не має конкурувати з існуючими errors.
4. CandidateInquiry знаходиться поза закритою search form. Заборонені nested forms та повторна mobile form. Зберегти useId, field IDs, route key/state reset.
5. Sticky button лишається `type="button"` і викликає той самий provider submit. Website links не викликають submit і не читають поля.
6. No-desk state рендерить website без validating fields/submit form.
7. Захистити no-JS/pre-hydration: submit disabled до hydration; website baseline придатний завжди. Не додавати passenger `name` query fields, form GET/POST action чи server action. Перевірити Enter без JS: немає navigation із phone/date і зовнішнього повідомлення. Наявні client callbacks не є дозволом на native GET fallback.
8. Зберегти важливий focus при validation; reduced motion без smooth scroll. Passenger count помилки мають логічний focus, якщо out-of-range fixture тестується.

**Acceptance:** валідний Enter у date/phone і активація кнопки дають однаковий single submit path; invalid date/phone/count не відкриває handoff; рівно один booking_intent/whatsapp_click у перехопленому контексті; anchor0 conversion events. No JS/pre-hydration немає GET/POST PII. Route changes і pair changes скидають state/errors.

**Validation IDs:** `P4-native-submit`, `P4-invalid-focus`, `P4-once-events`, `P4-nojs-privacy`, `P4-reset`.

### P5. Короткі тексти та evidence-based FAQ review

**Owned paths:** `src/app/page.tsx` — вступ; `src/components/BookingWidget.tsx`, `src/components/CandidateInquiry.tsx` — пояснення; `src/data/routes.ts` і `src/data/city-hubs.ts` тільки якщо source-backed content review доведе потрібну зміну; `docs/Product/passenger-content-claims-review-2026-10-23.md` — датоване доповнення; relevant content/inspector fixtures.

- Головна: прибрати проміжне «дізнайтеся, що запитати…». Зберегти Львів/Івано-Франківськ, обидва напрямки та простий наступний крок.
- Приклад, не автоматичний literal test: «Зі Львова, Івано-Франківська та інших міст — до Німеччини й назад. Оберіть міста, щоб звернутися до перевізника».
- У формі лишити один опис WhatsApp-механізму та одне пояснення відсутності reservation. «Цей напрямок потребує підтвердження» замінити на підтвердження конкретної поїздки/дати.
- Для кожного FAQ записати коротку матрицю: проблема пасажира → де вже є відповідь → рішення залишити/скоротити/об’єднати/додати за джерелом. Почати з Lviv→Hannover, Lviv↔Celle, IF↔Wolfsburg.
- Generic useful FAQ між URL дозволений; не додавати штучні city names і не дублювати practicalContent про вокзали. За відсутності нової корисної теми існуючий набір можна залишити — це явне завершене редакторське рішення.
- Editorial records зберігають окремий зміст/відсутність commercial inquiry. Жодних нових stops, driver promises, bicycle policy, numeric customs summaries чи service guarantees.
- Не змінювати географічні джерела/дати, щоб видати редактуру за повторну перевірку. Content-review dates і sitemap lastmod узгодити лише для реально змінених hub content.

**Acceptance:** короткий вступ, окрема функція кожного абзацу/FAQ; site alternative без дати/телефону; neutral Ukrainian; claims register має рішення для змінених сильних тверджень. Existing IDs/route records/hub lists/referral values unchanged. Typography/layout gates P1 повторити для змінених рядків.

**Validation IDs:** `P5-editorial`, `P5-claims-negative`, `P5-content-export`.

### P6. Стабільний кандидат та приймання

**Owned paths:** relevant tests/harness/inspector та task-scoped report. Не редагувати source лише для green evidence.

1. Під час P1–P5 запускати відповідні focused tests. Зібрати повний стабільний source fingerprint після останнього source edit.
2. Docs-only зміни: `npm run docs:index`, `npm run docs:check`, relevant instruction checks. Оновлені indexes/maps не є перевіркою фактів.
3. Один `npm run check` на стабільному application candidate під Node22. Повтор лише після material source/test failure/correction, що його виправдовує.
4. Визначити hash нового export і конфігурацію; всі final production browser checks виконати саме на ньому. Не використовувати root out невідомого походження.
5. Порівняти source bytes main/copy перед інтеграцією; preserve unrelated dirt. Патчі й інтеграція ручні/перевірені, не auto-apply worker output.

## 5. Browser matrix та fixture strategy

Перед будь-яким synthetic input: routing усіх external collectors/handoffs до local fixture/abort, `window.open` interception, service workers blocked. No consent не вимикає commercial flow.

| Група | Мінімальне покриття |
|---|---|
| Normal first screen |12 current commercial routes×375×812/1440×900; all primary bounds |
| Reflow |360/375/1440,100%/200%, top/form/FAQ/footer/sticky; fonts ready+2RAF; document widths AND control/text bounds |
| Navigation |Header open/close, links≥14px/targets≥44px, keyboard/focus; long labels |
| Search |Lviv→Hannover; unmatched/reverse Hannover не inline; Lviv↔Wolfsburg; UA/DE hub cards both directions; reset results/fields/errors |
| Submit |Enter field/button, mouse submit, sticky; empty/past date, invalid phone, integer counts1–8 та0/9/noninteger negatives |
| Events/privacy |One valid submission→one intended event pair/handoff; anchor no conversion; date/phone/message absent from analytics/storage/referral URL |
| Attribution |Hero/index/city generic content; route pair current/complete, first-touch separate; keyboard/middle-click baseline |
| No JS |Usable website href, no passenger form GET/POST, no misleading validating no-desk action |
| Consent |Refusal flow works; dialog separately does not get removed for first-screen assertion |
| Accessibility |FAQ native details keyboard, visible focus, reduced motion, sampled relevant contrast≥4.5:1; broader audit status named |

**No-desk hydrated fixture:** actual BookingWidget/JourneyActions/InquiryProvider/Sticky composition with copied resolved route `deskId: undefined`, без зміни catalog. Для browser hydration створити fixture route тільки в окремій owned disposable Next copy, `noindex`; production source/routes/sitemap не чіпати. Перевірити website primary, no fields/form/submit, baseline href, scroll/sticky website action без validation. Artifact fixture має окремий hash й чітку назву. Final production build робиться з copy без цього fixture route, а inspector перевіряє відсутність fixture URL/маркера/asset у кінцевому export. SSR-only fixture не видавати за hydrated browser check.

**Receiver:** повторно перевірити31 file hashes dated local snapshot; browser handoff лише локально. PASS означає сумісність з цим snapshot; current production/операторські receipts не доведені. Немає snapshot — зовнішня dependency UNVERIFIED, не вигадувати PASS.

## 6. Закриття review findings

| Review item | Закривається | Необхідний доказ |
|---|---|---|
| R1 zoom layout | P1/P6 | Settled zoom screenshots +menu/hero/sticky bounds/clearance |
| R2 navigation fonts/target | P1/P6 | Computed sizes/bounds і keyboard |
| R3 generic placement | P2/P6 | Independent URL expectations +captured event context |
| R4 FAQ hard count | P3/P5 | Shape/negative fixtures, редакторська матриця |
| R5 stale skill | P3 | Canonical example/presentation test +instruction link check |
| E1 native submit | P4 | Route+inline Enter, no duplicates, no-JS privacy |
| E2 copy repetition | P5 | Changed text/export review без role/status loss |
| E3 FAQ usefulness | P5 | Explicit per-question decision; no forced cross-page uniqueness |
| Missing-desk policy ambiguity | P3/P6 | Publication gate unchanged +hydrated defensive fixture, boundaries documented |
| Broader WCAG/real phones | Separate follow-up | Реальна перевірка; не «сертифікат відсутній» як substitute finding |

AC07/AC14 лишаються відкритими до P1/P6 PASS. AC08/AC10 уточнюються після P4/P2. AC15 закривається редакторською перевіркою, не grep/кількістю питань. Решту AC01–AC16 перевіряти на регресії, не вважати успішними автоматично через старий report.

## 7. Delivery і межі готовності

Майбутній результат має містити reviewed diff, source/export/config hashes, runtime/dependency record, command statuses, desktop/mobile/zoom screenshots, interactive evidence, AC01–AC16 і18-finding coverage, окремі fixture/receiver boundaries, attribution виконавців та cleanup/retained workspace status. Кожний increment: execution → automated verification → coordinator decision.

Оновити локальний resume checkpoint і delivery report після фактичної реалізації. Старі failures та review не переписувати як PASS заднім числом; дати посилання на нове уточнення. Новий план не є доказом виправлення.

**Pending поза технічним закриттям:**5–8 нових людей для comprehension/task testing; актуальний зовнішній receiver; operator receipt/confirmed journeys; live traffic/conversion outcomes. Немає підстав стверджувати uplift. Publication лишається окремим scope.


## 8. Фактичне локальне виконання — 2026-10-24

P1–P5 реалізовано; вимірювання додатково локалізували min-content expansion полів форми, довгих назв у RouteList та напису WhatsApp при200%. Виправлено локальні constraints/перенесення, без зменшення шрифтів або приховування overflow. Header і sticky вимірюють власну висоту для focus offsets/резерву місця. Практичний контент/пари/джерела/desk/allowlists/package manifests не змінено. Корисні чинні FAQ залишено після окремої редакторської матриці в claims register.

P6: Node22.13.1/Next16.4.0,168 tests, повний check/build/inspect/SEO artifact PASS. Фінальний export:32 acceptance checks (включно з24 normal first-screen cases),22 наскрізні regression flows PASS. Hydrated no-desk fixture має окрему збірку й перевірку. Датований snapshot приймача перевірено за31 hash; це не підтвердження production приймача. Результати прив’язані до локальних manifest/diff у `output/passenger-remediation-2026-10-24/` і не потрібні для CI.

Історичні збої збережені: stale diagnostic probe у disposable copy, переповнення довгого напису, незавершені browser-прогони. Чинні негативні перевірки не послаблено. Після останньої source-корекції повний check виконано повторно; browser acceptance стосується саме його export. Зміни журналювання/безпечного обмеження browser cleanup окремо перевірено lint.

Залишаються pending: native browser zoom/реальні пристрої/screen readers поза заявленим обсягом CSS zoom,5–8-person testing, актуальний production receiver та operational outcomes. Один regression browser не підтвердив завершення graceful close за10s; context закрито, примусового видалення немає. Попередні worker worktrees не змінювалися. Технічне приймання стосується перевіреного локального обсягу, без сертифікації WCAG чи conversion uplift. Commit/push/публікації не було.


## 9. Production checkpoint —24 жовтня2026

Після локального приймання власник окремо авторизував push і deployment. Passenger baseline опубліковано як `dac7e98735eabfdda8abb7df37fb6e59428b22be`; CI40124363351 і deployment40124595922 завершилися success. Датований [портативний receipt](../../ops/evidence/production-release-2026-10-24.json) містить artifact/recovery hashes та live acceptance. Попередній local-only статус цього плану описує етап до публікації, а не поточний production. Подальший напрям — [актуалізована стратегія](development-strategy-2026-10-24.md); usability, native zoom і реальні downstream outcomes не оголошуються завершеними.
