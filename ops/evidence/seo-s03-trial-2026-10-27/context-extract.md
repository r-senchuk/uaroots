# Coordinator-produced frozen S03 evidence extract

Observed 2026-10-27. Context-only, quoted input; not a delivery reference. Source HEAD d6bbff2a6b12a6d6f065ae00b81c11bad0ef3e74. Baseline clean. No deployment match or fresh public research. Condensation: plan sections2–3 and all12 passenger rows verbatim; ledger index omits exact wording but keeps fields/support/dispositions/constraints; headings extracted.

## Authority
# UARoute

Ukrainian passenger discovery atlas. **M1: UARoute owns discovery/intent; the carrier owns booking.** M2 is a gated development direction, not a released reservation service.

## Non-negotiable

- Ukrainian public copy; use neutral «перевізник», without surnames or carrier branding (owner decision 2026-10-20). Keep existing technical IDs, contacts and referral URLs; do not imply additional carriers are already connected. Never invent service, prices, schedules, stops or availability. `commercial` means published inquiry eligibility, not proof of operated service; editorial pages are `noindex` and excluded from search/index/sitemap.
- Keep Lviv/Ivano-Frankivsk acquisition priority. City-pair selection is not automatic page publication. Nearby settlements may be actual origins/destinations represented by the nearest selectable city; passengers privately specify the exact place, and the carrier confirms feasibility. Names are not aliases or coverage promises.
- Preserve city/route IDs, desks, classifications, referral allowlists and security changes. Search uses `findRouteByCities(..., { commercialOnly: true })`; reversing preserves the pair and expected countries.
- M1 stores no passenger names, phones or travel dates; never send those, credentials or messages to `track()`. Preserve first-touch acquisition separately from current `targetPath`, complete opposite-country referral pairs, and current-visit attribution.
- npm, TypeScript 6, Next.js static export to S3/CloudFront; no Node production server. Server Components by default; internal hrefs end in `/` except home. No dependency upgrades, account/global configuration changes or publication implied by a local edit.
- Preserve unrelated dirty files. Local tests use disposable fixtures; external collectors/handoffs must be intercepted. Commit/push/deployment require user authorization, which persists within its stated scope. Prefer GitHub Actions/OIDC for authorized deployment; follow [CUTOVER.md](CUTOVER.md).


WhatsApp primary, carrier-site alternative without date/phone; retain one form, desks, IDs, referrals, validation and tracking. S05 owns layout, S08 implementation. No S04/community edits. No new pages, reverse Hannover URL or Wolfsburg hub. IF↔Hannover inline only. Keep titles by default.

## Proposed architecture and claims
 S03 — proposed seven-page intent matrix

These are proposed content decisions for S03 to confirm. Section order describes information priority, not a design mandate to relocate the inquiry form. S05 decides layout using real copy and preserves one form. All route H1s below are existing titles; both hub headings are also retained. Demand beyond the limited property query evidence is a hypothesis, not a researched passenger finding.

| Page | Primary intent, audience and distinct job | H1 / introduction purpose | Proposed useful section sequence and evidence |
|---|---|---|---|
| `/routes/lviv-hannover/` | Ukraine → Germany; someone already considering Hannover. Prepare this specific outbound inquiry, while the Lviv hub handles broader selection. Hannover query forms occur in the unfiltered property report; attribution to this page is unknown. | Retain **Львів → Ганновер**. Explain preparation for departure, desired arrival place and baggage; replace the introduction's implied exact stop. | Desired Hannover locality/address → independent onward public-transport resource → first-leg arrival at Lviv if relevant → questions about the trip → changed plans/actual-locality FAQ → inquiry. S1 supports general transit resources, not the asserted Hbf–ZOB relationship; omit that assertion unless exact support is obtained. Remove the 1–2-hour precision. |
| `/cities/lviv/` | Both directions; select a German city or plan a return to Lviv/actual locality. Own city selection and regional context; avoid reproducing each pair page's full advice. Indexed observation is evidence of status, not measured hub demand. | Retain **Поїздки зі Львова до Німеччини та назад**. Keep the selection/return promise and inquiry purpose. | Select direction/city → what to state about actual locality → departure versus return guidance → short examples for Жовква/Яворів/Золочів/Самбір → existing route cards → practical FAQ/resources/contact alternative. S4/S5 supply independent planning resources; S6 does not establish routing or pickup. |
| `/cities/ivano-frankivsk/` | Both directions; select Germany destination or return to IF/actual locality. Own regional choice and return coordination; the Wolfsburg pages answer the specific directional questions. No page-demand measurement. | Retain **Поїздки з Івано-Франківська до Німеччини та назад**. Keep preparation and selection explicit. | Select direction/city → actual locality → departure versus return/meeting arrangements → Коломия/Тисмениця/Рогатин/Богородчани examples → existing Wolfsburg cards → FAQ/train-resource/contact alternative. S5/S6; proximity never proves convenient pickup or a route through a town. |
| `/routes/lviv-celle/` | Ukraine → Germany; prepare arrival in Celle plus any independent first leg to Lviv. Distinct from returning to Ukraine and from broad Lviv selection. Intent follows current content/contracts; page query evidence unknown. | Retain **Львів → Целле**. Rewrite the introduction to ask about feasibility and desired arrival locality, without a preset station/old-town stop or schedule. | Desired Celle locality/landmark → separate arrival orientation resource → first-leg arrangements at Lviv → inquiry questions → actual-locality/changed-plan FAQ → return-page link. S2 supports city orientation; both practical paragraph and stop-like FAQ require rewriting. |
| `/routes/celle-lviv/` | Germany → Ukraine; describe a proposed meeting place in Celle and prepare onward travel after Lviv. This is not the outbound text with city names swapped. | Retain **Целле → Львів**. Remove any implication that the carrier guarantees a train connection; distinguish desired arrival from independently arranged onward travel. | Celle locality/address for feasibility → agreed arrival information for Lviv → independent onward transport after arrangements are known → baggage/transfer questions → changed plans/actual-locality FAQ → outbound-page link. S2/S5 only within geographic/planning scope. |
| `/routes/ivano-frankivsk-wolfsburg/` | Ukraine → Germany; prepare a shared departure if relevant and identify the desired Wolfsburg district/address. Useful content hypothesis supported by existing copy, not demand research. | Retain **Івано-Франківськ → Вольфсбург** and existing introduction subject to editorial coherence review. | Desired Wolfsburg district/address → what a group should agree before departure from IF → baggage/transfer questions → exact-locality/changed-plan FAQ → return-page link. S3 supports Fallersleben/Vorsfelde as districts, never coverage. Existing shared-departure advice remains conditional. |
| `/routes/wolfsburg-ivano-frankivsk/` | Germany → Ukraine; propose a Wolfsburg meeting locality and coordinate arrival with people meeting the passenger in IF. Do not promise notification or an alternative stop. | Retain **Вольфсбург → Івано-Франківськ** and existing introduction subject to editorial review. | Proposed Wolfsburg district/address → information to agree before telling people meeting the passenger → onward travel if relevant → baggage/transfer questions → actual-locality/changed-plan FAQ → outbound-page link. S3 supports districts; rewrite FAQ1 so both acceptance and refusal remain possible. |

### Actions, links and metadata by page

The route action is the existing private inquiry journey, with passenger review/send through WhatsApp and the visible carrier-site alternative available without a date/phone. The hub action is existing city-pair selection, with its carrier-site contact alternative. S04 writes labels/explanations; it does not change validation, desks, handoffs or tracking. `R` below means that route action; `H` means the hub action.

| Page | Preserve inbound/outbound graph; planned support | Action / metadata treatment / acceptance |
|---|---|---|
| Lviv → Hannover | Lviv hub → Hannover; Hannover → Lviv hub and `/routes/lviv-celle/`; existing Celle-outbound → Hannover relation. No `/routes/hannover-lviv/`. For return, use existing selection/fallback through the Lviv hub without representing it as a published reverse route. | R. Keep `seo.title`/`seo.description`; rewrite `description` and propagate to JSON-LD/hub card. AC01/02/03/05/08/12. |
| Lviv hub | Keep cards for Hannover and both Celle directions; each route links back. Preserve existing related hubs `/cities/ivano-frankivsk/`, `/cities/celle/`, `/cities/stryi/` and bicycle guide. | H. Retain hub title/description/heading; keep CollectionPage/ItemList aligned with displayed route cards. AC01/02/03/05/07/08/12. |
| IF hub | Keep both Wolfsburg cards and backlinks. Preserve existing related hubs `/cities/lviv/`, `/cities/celle/`, `/cities/stryi/` and bicycle guide. IF↔Hannover remains inline inquiry only. | H. Retain title/description/heading and visible ItemList membership. AC01/02/03/05/07/08/12. |
| Lviv → Celle | Lviv hub → page; page → reverse, Hannover, Lviv hub and existing `/cities/celle/`. | R. Keep SEO title/description; rewrite `description` everywhere consumed. AC01/02/03/05/08/12. |
| Celle → Lviv | Lviv hub and existing Celle hub → page; page → outbound and both city hubs. | R. Keep SEO title/description; rewrite `description` consistently. AC01/02/03/05/08/12. |
| IF → Wolfsburg | IF hub → page; page → reverse and IF hub. Do not invent a Wolfsburg city hub. | R. Retain current metadata; preserve self-canonical; run the bounded discovery review below. AC01/02/03/05/06/08/12. |
| Wolfsburg → IF | IF hub → page; page → outbound and IF hub. | R. Retain current metadata; preserve self-canonical; investigate separately from outbound. AC01/02/03/05/06/08/12. |

S03 should retain the shared global `/routes/`, `/about/` and `/imprint/` navigation. The bicycle guide's existing hub links are sufficient as a baseline; add a contextual route-to-guide link only where final baggage copy benefits, as an explicit proposed link change to the existing `/guides/perevezennya-velosypeda/`. No new URLs or internal UTM tagging. Use descriptive Ukrainian anchors and trailing slashes. Record added/retained/moved links separately; this plan does not assert all proposed links are already live.

For each Wolfsburg direction, S03 first reconciles the dated inspection with the existing static link graph, sitemap inclusion and distinct content job. All three discovery mechanisms already have positive S01 evidence; a missing link is not established. If a later decision needs current indexing, request the smallest read-only URL-inspection/export readback: reason, last crawl, declared/selected canonical, sitemap/referrer. A new canonical/eligibility discrepancy gets a separate investigation; persistent discovered status alone does not authorize canonical changes, title churn or indexing requests. Keep the two pages and record the next observation condition.

## 3. Claim dispositions that control S03/S04

The corrected ledger is authoritative. `keep` retains the factual meaning and useful coverage; it does not require repeating text in several sections. A move must name its old/new section and preserve coverage. `await evidence` stays explicit in the research record; unsupported operational text is omitted from the included copy package unless suitable new evidence is reviewed. Never silently convert it into `keep`.

| Copy work unit | Exact claim IDs / required treatment |
|---|---|
| Hannover | Rewrite `R-lviv-hannover-description`, `R-lviv-hannover-practical1`, `R-lviv-hannover-faq3`. `R-lviv-hannover-faq2`: remove numeric precision; preserve the useful connection-planning question through a safe replacement. Keep title, both SEO fields, practical2, faq1/faq4 and confirm1–4. C01/C05 remain traceable aliases. |
| Lviv hub | Rewrite `N-lviv-zhovkva`, `N-lviv-yavoriv`, `N-lviv-zolochiv`, `N-lviv-sambir`; retain names without northern-exit/road/convenience/pickup implications. Keep `H-lviv-title`, `heading`, `description`, `intro`, `outbound`, `returning`, `nearbyIntro`, `faq1`–`faq5`, `resource1` (each suffix uses the `H-lviv-` prefix). `H-lviv-review` awaits genuine review evidence for any new date. |
| IF hub | Rewrite `N-if-kolomyia`, `N-if-tysmenytsia`, `N-if-rogatyn`, `N-if-bohorodchany`. Keep the equivalent `H-ivano-frankivsk-` fields listed for Lviv. `H-ivano-frankivsk-review` awaits evidence for a new date. Preserve locality names conditionally while inaccessible source details remain unknown. |
| Celle directions | For each prefix `R-lviv-celle-` and `R-celle-lviv-`: rewrite `description`, `practical1`, `faq1`, `faq3`; keep `title`, `seo.title`, `seo.description`, `practical2`, `faq2`, `faq4`, `confirm1`–`confirm4`. **Both practical1 rows are rewrite**, matching the corrected ledger. |
| Wolfsburg directions | Rewrite `R-ivano-frankivsk-wolfsburg-faq3`, `R-wolfsburg-ivano-frankivsk-faq1`, `R-wolfsburg-ivano-frankivsk-faq3`. Keep remaining exact-field rows for these two prefixes: title/description, both SEO fields, practical1/2, other FAQs and confirm1–4. Preserve S3's geographic usefulness. |
| Hannover shared carrier block | `OP-1`–`OP-4`, `OP-service`: await evidence; plan omission from included public copy pending current support. Do not assert two drivers, address delivery, no prepayment, Mercedes Sprinter or generic service scope from an old date. Preserve `OP-desk`, its technical identity/contact and existing referral URL. S07 chooses the bounded rendering mechanism and dependent-page review; S04 must not silently alter shared carrier data across the site. |
| Bicycle guide | Keep `G-title`, `G-description`, `G-faq1`–`G-faq3`, `G-customs`, `G-handoff`; edit only for clarity/coverage justified by the needs brief. `G-schema` awaits evidence for new dates/author claims. Customs is an official-resource link/general context, never proof of carrier acceptance or an individual clearance decision. |
| About/operator/shared | Keep `A-principle1`–`A-principle3`, `A-privacy`, `A-identity`; `I-role`, `I-reservation`, `I-legal`, `I-operatorName`, `I-legalForm`, `I-brand`, `I-website`, `I-contactAddress`; `SH-image`, `SH-candidate`; `M-about-title`, `M-about-description`, `M-imprint-title`, `M-imprint-description`. Preserve operator identity, illustrative captions and inquiry-only framing. No new legal/registry verification is claimed. |
| Schema and previews | Keep `SC-routes`, `SC-hubs`, `SC-shared`, `SC-meta` structures, while synchronizing any rewritten inputs. `route.description` feeds route JSON-LD and hub cards; `route.seo.description` feeds metadata/social previews. They are different fields and need separate retain/change entries. No BusTrip/Offer/rating, special AI schema or automatic FAQ-markup project. |
| Community drafts | Rewrite `P1-2`, `P2-2`, `P3-1`–`P3-4`. Keep `P1-1`, `P1-3`–`P1-5`, `P2-1`, `P2-3`–`P2-5` within their stated constraints. C14–C16 map to these rows; no claim that placement1 itself contains the direct/plural wording. |

S04 must expand the grouped notation into a reconciliation table with one row per ledger claim ID: original disposition, final action, destination copy key, source/limitation and reviewer decision. Original C01–C16 are aliases, not additional facts to count twice. A justified new change to a `keep` claim is logged with its rationale and source; an operational unknown cannot be “resolved” by smoother wording.


## All12 passenger needs


| Напрям | Питання пасажира | Клас | Наявне покриття | Прогалина для S04 | Джерело/ресурс | Межа твердження |
|---|---|---|---|---|---|---|
| Україна → Німеччина і назад | Яке місто вибрати, якщо фактичне місце — менший населений пункт? | Вимагає контракт | Хаби Львова й Івано-Франківська пояснюють вибір найближчого каталожного міста та приватне зазначення фактичного місця. Є окремі географічні приклади в `src/data/city-hubs.ts`. | Зробити однаково зрозумілими пошуковий вибір і реальне місце для обох напрямків. | [Контракт nearby-place](../../../Operations/Agentic/Operational/repository-contract.md); [міські хаби](../../../../src/data/city-hubs.ts). | Вибір міста не зобов’язує їхати до нього; назва не є alias, маршрутом чи покриттям. Перевізник підтверджує можливість і місце. |
| Україна → Німеччина | Що повідомити, якщо спершу треба доїхати до міста зустрічі? | Підтверджена наявним контентом | Вступи хабів радять назвати звідки й коли пасажир прибуває, погодити місце/час до купівлі попереднього квитка. | Виразно розділити запит перевізнику та незалежне планування першої ділянки. | [Львівський хаб](../../../../src/data/city-hubs.ts), `outbound`; [ІФ хаб](../../../../src/data/city-hubs.ts), `outbound`; [Lviv Travel](https://lviv.travel/ua/news/gaid-lvivskim-gromadskim-transportom); [Укрзалізниця](https://booking.uz.gov.ua/). | Не обіцяти очікування, стиковку чи посадку у конкретному місці. Міський/залізничний ресурс не визначає точку перевізника. |
| Німеччина → Україна | Де запропонувати зустріч у Целле або Вольфсбурзі? | Підтверджена наявним контентом | Львів↔Целле й ІФ↔Вольфсбург дають приклади району, вокзалу чи адреси для погодження. | Відділити орієнтир для опису побажання від підтвердженої зупинки. | [Celle Tourismus](https://www.celle-tourismus.de/info-besucherservice/tourist-information/anreise-parken); route objects `lviv-celle`/`celle-lviv` у [routes.ts](../../../../src/data/routes.ts). | Туристичні/міські джерела підтверджують лише міський контекст, не посадку чи висадку. |
| Україна → Німеччина | Чи можна прибути до Ганновера саме до ZOB, Hbf або адреси? | Підтверджена наявним контентом | Львів→Ганновер називає Hbf/ZOB як міські орієнтири й пропонує спитати про бажане місце. | Назвати міські орієнтири нейтрально; зберегти чітку умову підтвердження. | [Hannover.de — транспорт](https://www.hannover.de/Leben-in-der-Region-Hannover/Mobilit%C3%A4t/Bus-Bahn); `routes.ts`, `lviv-hannover`. | Наявність транспортних вузлів не підтверджує зупинку приватного перевізника або зручне пересадження. |
| Німеччина → Україна | Куди їхати далі після прибуття в Україну? | Гіпотеза потреби; тема присутня | Зворотні сторінки питають про місце/час прибуття й подальшу дорогу. | Порадити окремо перевірити наступний транспорт після погодження точки й орієнтовного прибуття. | `routes.ts`, `celle-lviv`, `wolfsburg-ivano-frankivsk`; офіційні ресурси перевізника пасажиром обираються за місцем. | Не вказувати час прибуття, гарантовану стиковку чи маршрут наступної ділянки. |
| Обидва | Які валізи/великі речі можна взяти і скільки це коштує? | Вимагає контракт | Route FAQ та `whatToConfirm` просять описати кількість/розміри і запитати умови. | Звести повтори до практичного запитання про габарити, кількість і можливу вартість. | [Дані маршрутів](../../../../src/data/routes.ts), `whatToConfirm`; [пасажирський контракт](../../../Product/passenger-discovery-conversion-spec-2026-10-22.md). | Норма, ціна, місткість і перевезення речі не підтверджені; відповідь дає перевізник для конкретної поїздки. |
| Обидва | Чи можна взяти велосипед і як його підготувати? | Підтверджена наявним контентом | Гайд просить повідомити тип, розміри/вагу, батарею для електровелосипеда, та погодити пакування й вартість. | Зберегти послідовність: спершу з’ясувати можливість, потім вимоги до пакування. Дати офіційне джерело митних правил. | [Гайд](../../../../src/app/guides/perevezennya-velosypeda/page.tsx); [Держмитслужба](https://customs.gov.ua/informatsiia-dlia-gromadian). | Митний статус велосипеда не підтверджує згоду перевізника, вільне місце чи пакування. Без індивідуальної митної поради. |
| Обидва | Чи буде пересадка і що буде з багажем? | Вимагає контракт | Хаби питають, чи передбачена пересадка у конкретній поїздці й як діяти з речами. | Залишити питання, не описувати практику як установлену. | `src/data/city-hubs.ts`, FAQ хабів; `routes.ts`, «Багаж і можливі пересадки». | Невідомо, чи є пересадка, чи змінюється транспорт, хто переносить речі або чи зберігається багаж. |
| Німеччина → Україна | Як знайти сторінку й підготувати окреме звернення на повернення? | Підтверджена наявним контентом | Хаби мають секцію повернення; Целле→Львів та Вольфсбург→ІФ окремо описують напрямок. | Community placement для повернення має вести на наявний зворотний напрямок або хаб, а не Львів→Ганновер. | [Пріоритетні сторінки](../../../../src/data/routes.ts), `celle-lviv`, `wolfsburg-ivano-frankivsk`; [хаб Целле](../../../../src/data/city-hubs.ts). | Не створювати Hannover→Lviv сторінку заради допису; ІФ↔Ганновер є лише inline inquiry. |
| Обидва | Що робити, коли дата чи місце змінилися після запиту? | Підтверджена наявним контентом | Львів→Ганновер радить повідомити про зміну й переглянути домовленість. | Залишити короткий крок повторного погодження без враження, що попередні умови зберігаються. | `routes.ts`, `lviv-hannover`, FAQ про зміну планів. | Нові дата/місце потребують повторного приватного погодження з перевізником; цей бриф не перевіряє реалізацію зберігання даних. |
| Обидва | Як звернутися, якщо дата ще невідома? | Вимагає контракт (приватність) | Сайт перевізника доступний без дати й телефону; WhatsApp-шлях готує повідомлення з полями. | Виразно показати можливість перейти на сайт без заповнення форми; не вимагати вигаданої дати. | [About](../../../../src/app/about/page.tsx); [контракт конверсії](../../../Product/passenger-discovery-conversion-spec-2026-10-22.md). | Не надсилати дату/телефон/текст у `track()`; не стверджувати, що запит резервує місце. |
| Обидва | Що робити, якщо не користуюся WhatsApp? | Вимагає контракт (поведінка продукту) | Помітний альтернативний перехід відкриває сайт перевізника без введення дати й телефону. | Зберегти цей шлях і зрозумілий label; це самостійний контакт, не підтверджений запит. | [About](../../../../src/app/about/page.tsx); `src/lib/whatsapp.ts`; partner-site link у сторінковому шаблоні. | Не змінювати allowlist/контакти; клік не доводить отримання звернення оператором. |


## Source scope


All sources below were reviewed/opened or their failed access recorded on 2026-10-27. An HTTP 200 alone is not support for a factual statement.

| Ref | Source and observation | Establishes | Does not establish |
|---|---|---|---|
| K1 | [Constitution](../../../00-project-constitution.md), §§3,37,40,42; [domain contract](../../../Operations/Agentic/Operational/repository-contract.md); current local source | Approved discovery/inquiry behavior, nearby-city selection, one carrier boundary and privacy constraints | Current operations, fulfilled journeys, or new demand; code review is not new end-to-end runtime QA |
| S1 | [Hannover municipal transit](https://www.hannover.de/Leben-in-der-Region-Hannover/Mobilit%C3%A4t/Bus-Bahn), opened text | Regional coordinated public transport and links to transport resources | Exact Hbf/ZOB connection assertion was not established from this page; no private-carrier stops/feasible margin |
| S2 | [Celle visitor arrival information](https://www.celle-tourismus.de/info-besucherservice/tourist-information/anreise-parken), opened text | City arrival orientation, rail and city-centre information | Carrier meeting points, promised walking/transfer time or address delivery |
| S3 | [Wolfsburg municipality](https://www.wolfsburg.de/en/bauenwohnen/wolfsburg-als-wohnort), opened text; Ortsteile list explicitly includes Fallersleben and Vorsfelde | Named districts belong to Wolfsburg | Carrier coverage, pickup or routing through them |
| S4 | [Lviv tourist information transport guide](https://lviv.travel/ua/news/gaid-lvivskim-gromadskim-transportom), opened text dated 15 May 2026 | Local transit planning resource | Intercity meeting point or guaranteed connection; this ledger republishes no fares |
| S5 | [Ukrzaliznytsia](https://booking.uz.gov.ua/), opened current search interface | Official independent train-search resource | A specific connection, seat or schedule; no search/booking submitted |
| S6 | [Zhovkva council](https://zhovkva-rada.gov.ua/) and [Yavoriv council](https://yavoriv-rada.gov.ua/) opened text. Other six cited locality sources were inaccessible in specialist direct checks | Municipal identity/context for the two opened sites; preserve other names as conditional actual-locality examples pending primary-source refresh | Northern exit, border-road pickup, convenience, coverage, or mandatory trip to a hub. Inaccessibility is unverified, not false |
| S7 | [Ukraine Customs travel information](https://customs.gov.ua/informatsiia-dlia-gromadian), official text opened; direct fetch had 403 | General personal-item rules mention a bicycle as sporting equipment, with legal context | Carrier acceptance, battery/packing rules, another country's rules, or individual customs clearance |
| S8 | [Carrier cited homepage](https://www.4k-koval.com/), public HTTP read and web open returned a client-rendered shell without substantive claim text; browser unavailable on resume | Source URL exists; local claims have historical `lastVerifiedAt: 2026-09-11` | Current support for four operational claims. Treat as unverified rather than false; no credentials or private messages inspected |
| S9 | `src/config/business.ts`, About/imprint live disclosures; constitution §40 | Existing owner-reported site operator identity/brand/contact disclosure, distinct from carrier | Fresh registry certification, professional expertise or carrier review |

The specialist also consulted a 2019 ODA transport PDF. It cannot establish current transport availability or pickup. It is not needed to retain Tysmenytsia as a conditional actual-locality example; no distance/timetable from it is recommended for publication.


## Scoped exact claim index
{"id":"R-lviv-hannover-title","location":"`src/data/routes.ts:10`; `/routes/lviv-hannover/`; `title`","support":"K1; local/live metadata comparison","disposition":"keep"}
{"id":"R-lviv-hannover-description","location":"`src/data/routes.ts:11`; `/routes/lviv-hannover/`; `description`","support":"K1; local/live metadata comparison","disposition":"rewrite"}
{"id":"R-lviv-hannover-seo.title","location":"`src/data/routes.ts:25`; `/routes/lviv-hannover/`; `seo.title`","support":"K1; local/live metadata comparison","disposition":"keep"}
{"id":"R-lviv-hannover-seo.description","location":"`src/data/routes.ts:26`; `/routes/lviv-hannover/`; `seo.description`","support":"K1; local/live metadata comparison","disposition":"keep"}
{"id":"R-lviv-hannover-practical1","location":"`src/data/routes.ts:31`; `/routes/lviv-hannover/`; `practicalContent.1`","support":"S1","disposition":"rewrite"}
{"id":"R-lviv-hannover-practical2","location":"`src/data/routes.ts:37`; `/routes/lviv-hannover/`; `practicalContent.2`","support":"K1","disposition":"keep"}
{"id":"R-lviv-hannover-faq1","location":"`src/data/routes.ts:43`; `/routes/lviv-hannover/`; `faq.1`","support":"K1; source field; operational confirmation absent","disposition":"keep"}
{"id":"R-lviv-hannover-faq2","location":"`src/data/routes.ts:47`; `/routes/lviv-hannover/`; `faq.2`","support":"K1; source field; operational confirmation absent","disposition":"remove"}
{"id":"R-lviv-hannover-faq3","location":"`src/data/routes.ts:51`; `/routes/lviv-hannover/`; `faq.3`","support":"K1; source field; operational confirmation absent","disposition":"rewrite"}
{"id":"R-lviv-hannover-faq4","location":"`src/data/routes.ts:55`; `/routes/lviv-hannover/`; `faq.4`","support":"K1; source field; operational confirmation absent","disposition":"keep"}
{"id":"R-lviv-hannover-confirm1","location":"`src/data/routes.ts:59`; `/routes/lviv-hannover/`; `whatToConfirm.1`","support":"K1","disposition":"keep"}
{"id":"R-lviv-hannover-confirm2","location":"`src/data/routes.ts:60`; `/routes/lviv-hannover/`; `whatToConfirm.2`","support":"K1","disposition":"keep"}
{"id":"R-lviv-hannover-confirm3","location":"`src/data/routes.ts:61`; `/routes/lviv-hannover/`; `whatToConfirm.3`","support":"K1","disposition":"keep"}
{"id":"R-lviv-hannover-confirm4","location":"`src/data/routes.ts:62`; `/routes/lviv-hannover/`; `whatToConfirm.4`","support":"K1","disposition":"keep"}
{"id":"R-lviv-celle-title","location":"`src/data/routes.ts:526`; `/routes/lviv-celle/`; `title`","support":"K1; local/live metadata comparison","disposition":"keep"}
{"id":"R-lviv-celle-description","location":"`src/data/routes.ts:527`; `/routes/lviv-celle/`; `description`","support":"K1; local/live metadata comparison","disposition":"rewrite"}
{"id":"R-lviv-celle-seo.title","location":"`src/data/routes.ts:541`; `/routes/lviv-celle/`; `seo.title`","support":"K1; local/live metadata comparison","disposition":"keep"}
{"id":"R-lviv-celle-seo.description","location":"`src/data/routes.ts:542`; `/routes/lviv-celle/`; `seo.description`","support":"K1; local/live metadata comparison","disposition":"keep"}
{"id":"R-lviv-celle-practical1","location":"`src/data/routes.ts:547`; `/routes/lviv-celle/`; `practicalContent.1`","support":"S2","disposition":"rewrite"}
{"id":"R-lviv-celle-practical2","location":"`src/data/routes.ts:553`; `/routes/lviv-celle/`; `practicalContent.2`","support":"K1","disposition":"keep"}
{"id":"R-lviv-celle-faq1","location":"`src/data/routes.ts:559`; `/routes/lviv-celle/`; `faq.1`","support":"K1; source field; operational confirmation absent","disposition":"rewrite"}
{"id":"R-lviv-celle-faq2","location":"`src/data/routes.ts:563`; `/routes/lviv-celle/`; `faq.2`","support":"K1; source field; operational confirmation absent","disposition":"keep"}
{"id":"R-lviv-celle-faq3","location":"`src/data/routes.ts:567`; `/routes/lviv-celle/`; `faq.3`","support":"K1; source field; operational confirmation absent","disposition":"rewrite"}
{"id":"R-lviv-celle-faq4","location":"`src/data/routes.ts:571`; `/routes/lviv-celle/`; `faq.4`","support":"K1; source field; operational confirmation absent","disposition":"keep"}
{"id":"R-lviv-celle-confirm1","location":"`src/data/routes.ts:575`; `/routes/lviv-celle/`; `whatToConfirm.1`","support":"K1","disposition":"keep"}
{"id":"R-lviv-celle-confirm2","location":"`src/data/routes.ts:576`; `/routes/lviv-celle/`; `whatToConfirm.2`","support":"K1","disposition":"keep"}
{"id":"R-lviv-celle-confirm3","location":"`src/data/routes.ts:577`; `/routes/lviv-celle/`; `whatToConfirm.3`","support":"K1","disposition":"keep"}
{"id":"R-lviv-celle-confirm4","location":"`src/data/routes.ts:578`; `/routes/lviv-celle/`; `whatToConfirm.4`","support":"K1","disposition":"keep"}
{"id":"R-celle-lviv-title","location":"`src/data/routes.ts:588`; `/routes/celle-lviv/`; `title`","support":"K1; local/live metadata comparison","disposition":"keep"}
{"id":"R-celle-lviv-description","location":"`src/data/routes.ts:589`; `/routes/celle-lviv/`; `description`","support":"K1; local/live metadata comparison","disposition":"rewrite"}
{"id":"R-celle-lviv-seo.title","location":"`src/data/routes.ts:602`; `/routes/celle-lviv/`; `seo.title`","support":"K1; local/live metadata comparison","disposition":"keep"}
{"id":"R-celle-lviv-seo.description","location":"`src/data/routes.ts:603`; `/routes/celle-lviv/`; `seo.description`","support":"K1; local/live metadata comparison","disposition":"keep"}
{"id":"R-celle-lviv-practical1","location":"`src/data/routes.ts:608`; `/routes/celle-lviv/`; `practicalContent.1`","support":"S2","disposition":"rewrite"}
{"id":"R-celle-lviv-practical2","location":"`src/data/routes.ts:614`; `/routes/celle-lviv/`; `practicalContent.2`","support":"K1","disposition":"keep"}
{"id":"R-celle-lviv-faq1","location":"`src/data/routes.ts:620`; `/routes/celle-lviv/`; `faq.1`","support":"K1; source field; operational confirmation absent","disposition":"rewrite"}
{"id":"R-celle-lviv-faq2","location":"`src/data/routes.ts:624`; `/routes/celle-lviv/`; `faq.2`","support":"K1; source field; operational confirmation absent","disposition":"keep"}
{"id":"R-celle-lviv-faq3","location":"`src/data/routes.ts:628`; `/routes/celle-lviv/`; `faq.3`","support":"K1; source field; operational confirmation absent","disposition":"rewrite"}
{"id":"R-celle-lviv-faq4","location":"`src/data/routes.ts:632`; `/routes/celle-lviv/`; `faq.4`","support":"K1; source field; operational confirmation absent","disposition":"keep"}
{"id":"R-celle-lviv-confirm1","location":"`src/data/routes.ts:636`; `/routes/celle-lviv/`; `whatToConfirm.1`","support":"K1","disposition":"keep"}
{"id":"R-celle-lviv-confirm2","location":"`src/data/routes.ts:637`; `/routes/celle-lviv/`; `whatToConfirm.2`","support":"K1","disposition":"keep"}
{"id":"R-celle-lviv-confirm3","location":"`src/data/routes.ts:638`; `/routes/celle-lviv/`; `whatToConfirm.3`","support":"K1","disposition":"keep"}
{"id":"R-celle-lviv-confirm4","location":"`src/data/routes.ts:639`; `/routes/celle-lviv/`; `whatToConfirm.4`","support":"K1","disposition":"keep"}
{"id":"R-ivano-frankivsk-wolfsburg-title","location":"`src/data/routes.ts:649`; `/routes/ivano-frankivsk-wolfsburg/`; `title`","support":"K1; local/live metadata comparison","disposition":"keep"}
{"id":"R-ivano-frankivsk-wolfsburg-description","location":"`src/data/routes.ts:650`; `/routes/ivano-frankivsk-wolfsburg/`; `description`","support":"K1; local/live metadata comparison","disposition":"keep"}
{"id":"R-ivano-frankivsk-wolfsburg-seo.title","location":"`src/data/routes.ts:663`; `/routes/ivano-frankivsk-wolfsburg/`; `seo.title`","support":"K1; local/live metadata comparison","disposition":"keep"}
{"id":"R-ivano-frankivsk-wolfsburg-seo.description","location":"`src/data/routes.ts:664`; `/routes/ivano-frankivsk-wolfsburg/`; `seo.description`","support":"K1; local/live metadata comparison","disposition":"keep"}
{"id":"R-ivano-frankivsk-wolfsburg-practical1","location":"`src/data/routes.ts:669`; `/routes/ivano-frankivsk-wolfsburg/`; `practicalContent.1`","support":"S3","disposition":"keep"}
{"id":"R-ivano-frankivsk-wolfsburg-practical2","location":"`src/data/routes.ts:675`; `/routes/ivano-frankivsk-wolfsburg/`; `practicalContent.2`","support":"K1","disposition":"keep"}
{"id":"R-ivano-frankivsk-wolfsburg-faq1","location":"`src/data/routes.ts:681`; `/routes/ivano-frankivsk-wolfsburg/`; `faq.1`","support":"K1; source field; operational confirmation absent","disposition":"keep"}
{"id":"R-ivano-frankivsk-wolfsburg-faq2","location":"`src/data/routes.ts:685`; `/routes/ivano-frankivsk-wolfsburg/`; `faq.2`","support":"K1; source field; operational confirmation absent","disposition":"keep"}
{"id":"R-ivano-frankivsk-wolfsburg-faq3","location":"`src/data/routes.ts:689`; `/routes/ivano-frankivsk-wolfsburg/`; `faq.3`","support":"K1; source field; operational confirmation absent","disposition":"rewrite"}
{"id":"R-ivano-frankivsk-wolfsburg-faq4","location":"`src/data/routes.ts:693`; `/routes/ivano-frankivsk-wolfsburg/`; `faq.4`","support":"K1; source field; operational confirmation absent","disposition":"keep"}
{"id":"R-ivano-frankivsk-wolfsburg-confirm1","location":"`src/data/routes.ts:697`; `/routes/ivano-frankivsk-wolfsburg/`; `whatToConfirm.1`","support":"K1","disposition":"keep"}
{"id":"R-ivano-frankivsk-wolfsburg-confirm2","location":"`src/data/routes.ts:698`; `/routes/ivano-frankivsk-wolfsburg/`; `whatToConfirm.2`","support":"K1","disposition":"keep"}
{"id":"R-ivano-frankivsk-wolfsburg-confirm3","location":"`src/data/routes.ts:699`; `/routes/ivano-frankivsk-wolfsburg/`; `whatToConfirm.3`","support":"K1","disposition":"keep"}
{"id":"R-ivano-frankivsk-wolfsburg-confirm4","location":"`src/data/routes.ts:700`; `/routes/ivano-frankivsk-wolfsburg/`; `whatToConfirm.4`","support":"K1","disposition":"keep"}
{"id":"R-wolfsburg-ivano-frankivsk-title","location":"`src/data/routes.ts:710`; `/routes/wolfsburg-ivano-frankivsk/`; `title`","support":"K1; local/live metadata comparison","disposition":"keep"}
{"id":"R-wolfsburg-ivano-frankivsk-description","location":"`src/data/routes.ts:711`; `/routes/wolfsburg-ivano-frankivsk/`; `description`","support":"K1; local/live metadata comparison","disposition":"keep"}
{"id":"R-wolfsburg-ivano-frankivsk-seo.title","location":"`src/data/routes.ts:724`; `/routes/wolfsburg-ivano-frankivsk/`; `seo.title`","support":"K1; local/live metadata comparison","disposition":"keep"}
{"id":"R-wolfsburg-ivano-frankivsk-seo.description","location":"`src/data/routes.ts:725`; `/routes/wolfsburg-ivano-frankivsk/`; `seo.description`","support":"K1; local/live metadata comparison","disposition":"keep"}
{"id":"R-wolfsburg-ivano-frankivsk-practical1","location":"`src/data/routes.ts:730`; `/routes/wolfsburg-ivano-frankivsk/`; `practicalContent.1`","support":"S3","disposition":"keep"}
{"id":"R-wolfsburg-ivano-frankivsk-practical2","location":"`src/data/routes.ts:736`; `/routes/wolfsburg-ivano-frankivsk/`; `practicalContent.2`","support":"K1","disposition":"keep"}
{"id":"R-wolfsburg-ivano-frankivsk-faq1","location":"`src/data/routes.ts:742`; `/routes/wolfsburg-ivano-frankivsk/`; `faq.1`","support":"K1; source field; operational confirmation absent","disposition":"rewrite"}
{"id":"R-wolfsburg-ivano-frankivsk-faq2","location":"`src/data/routes.ts:746`; `/routes/wolfsburg-ivano-frankivsk/`; `faq.2`","support":"K1; source field; operational confirmation absent","disposition":"keep"}
{"id":"R-wolfsburg-ivano-frankivsk-faq3","location":"`src/data/routes.ts:750`; `/routes/wolfsburg-ivano-frankivsk/`; `faq.3`","support":"K1; source field; operational confirmation absent","disposition":"rewrite"}
{"id":"R-wolfsburg-ivano-frankivsk-faq4","location":"`src/data/routes.ts:754`; `/routes/wolfsburg-ivano-frankivsk/`; `faq.4`","support":"K1; source field; operational confirmation absent","disposition":"keep"}
{"id":"R-wolfsburg-ivano-frankivsk-confirm1","location":"`src/data/routes.ts:758`; `/routes/wolfsburg-ivano-frankivsk/`; `whatToConfirm.1`","support":"K1","disposition":"keep"}
{"id":"R-wolfsburg-ivano-frankivsk-confirm2","location":"`src/data/routes.ts:759`; `/routes/wolfsburg-ivano-frankivsk/`; `whatToConfirm.2`","support":"K1","disposition":"keep"}
{"id":"R-wolfsburg-ivano-frankivsk-confirm3","location":"`src/data/routes.ts:760`; `/routes/wolfsburg-ivano-frankivsk/`; `whatToConfirm.3`","support":"K1","disposition":"keep"}
{"id":"R-wolfsburg-ivano-frankivsk-confirm4","location":"`src/data/routes.ts:761`; `/routes/wolfsburg-ivano-frankivsk/`; `whatToConfirm.4`","support":"K1","disposition":"keep"}
{"id":"H-lviv-title","location":"`src/data/city-hubs.ts:53`; `/cities/lviv/`; `title`","support":"K1; S4/S5 for separate transport resources","disposition":"keep"}
{"id":"H-lviv-heading","location":"`src/data/city-hubs.ts:54`; `/cities/lviv/`; `heading`","support":"K1; S4/S5 for separate transport resources","disposition":"keep"}
{"id":"H-lviv-description","location":"`src/data/city-hubs.ts:55`; `/cities/lviv/`; `description`","support":"K1; S4/S5 for separate transport resources","disposition":"keep"}
{"id":"H-lviv-intro","location":"`src/data/city-hubs.ts:56`; `/cities/lviv/`; `intro`","support":"K1; S4/S5 for separate transport resources","disposition":"keep"}
{"id":"H-lviv-outbound","location":"`src/data/city-hubs.ts:57`; `/cities/lviv/`; `outbound`","support":"K1; S4/S5 for separate transport resources","disposition":"keep"}
{"id":"H-lviv-returning","location":"`src/data/city-hubs.ts:58`; `/cities/lviv/`; `returning`","support":"K1; S4/S5 for separate transport resources","disposition":"keep"}
{"id":"H-lviv-nearbyIntro","location":"`src/data/city-hubs.ts:87`; `/cities/lviv/`; `nearbyIntro`","support":"K1; S4/S5 for separate transport resources","disposition":"keep"}
{"id":"H-lviv-faq1","location":"`src/data/city-hubs.ts:62`; `/cities/lviv/`; `faq.1`","support":"K1","disposition":"keep"}
{"id":"H-lviv-faq2","location":"`src/data/city-hubs.ts:66`; `/cities/lviv/`; `faq.2`","support":"K1","disposition":"keep"}
{"id":"H-lviv-faq3","location":"`src/data/city-hubs.ts:70`; `/cities/lviv/`; `faq.3`","support":"K1","disposition":"keep"}
{"id":"H-lviv-faq4","location":"`src/data/city-hubs.ts:74`; `/cities/lviv/`; `faq.4`","support":"K1","disposition":"keep"}
{"id":"H-lviv-faq5","location":"`src/data/city-hubs.ts:78`; `/cities/lviv/`; `faq.5`","support":"K1","disposition":"keep"}
{"id":"N-lviv-zhovkva","location":"`src/data/city-hubs.ts:94`; `/cities/lviv/`; `lviv-zhovkva`","support":"S6; https://zhovkva-rada.gov.ua/","disposition":"rewrite"}
{"id":"N-lviv-yavoriv","location":"`src/data/city-hubs.ts:104`; `/cities/lviv/`; `lviv-yavoriv`","support":"S6; https://yavoriv-rada.gov.ua/","disposition":"rewrite"}
{"id":"N-lviv-zolochiv","location":"`src/data/city-hubs.ts:114`; `/cities/lviv/`; `lviv-zolochiv`","support":"S6; https://zolochiv-rada.gov.ua/","disposition":"rewrite"}
{"id":"N-lviv-sambir","location":"`src/data/city-hubs.ts:124`; `/cities/lviv/`; `lviv-sambir`","support":"S6; https://sambir-rada.gov.ua/","disposition":"rewrite"}
{"id":"H-lviv-resource1","location":"`src/data/city-hubs.ts:133`; `/cities/lviv/`; `planningResources`","support":"S4","disposition":"keep"}
{"id":"H-lviv-review","location":"`src/data/city-hubs.ts`; `/cities/lviv/`; `contentReview`","support":"Existing source dates; this research does not prove prior review scope","disposition":"await evidence"}
{"id":"H-ivano-frankivsk-title","location":"`src/data/city-hubs.ts:150`; `/cities/ivano-frankivsk/`; `title`","support":"K1; S4/S5 for separate transport resources","disposition":"keep"}
{"id":"H-ivano-frankivsk-heading","location":"`src/data/city-hubs.ts:151`; `/cities/ivano-frankivsk/`; `heading`","support":"K1; S4/S5 for separate transport resources","disposition":"keep"}
{"id":"H-ivano-frankivsk-description","location":"`src/data/city-hubs.ts:152`; `/cities/ivano-frankivsk/`; `description`","support":"K1; S4/S5 for separate transport resources","disposition":"keep"}
{"id":"H-ivano-frankivsk-intro","location":"`src/data/city-hubs.ts:153`; `/cities/ivano-frankivsk/`; `intro`","support":"K1; S4/S5 for separate transport resources","disposition":"keep"}
{"id":"H-ivano-frankivsk-outbound","location":"`src/data/city-hubs.ts:154`; `/cities/ivano-frankivsk/`; `outbound`","support":"K1; S4/S5 for separate transport resources","disposition":"keep"}
{"id":"H-ivano-frankivsk-returning","location":"`src/data/city-hubs.ts:155`; `/cities/ivano-frankivsk/`; `returning`","support":"K1; S4/S5 for separate transport resources","disposition":"keep"}
{"id":"H-ivano-frankivsk-nearbyIntro","location":"`src/data/city-hubs.ts:183`; `/cities/ivano-frankivsk/`; `nearbyIntro`","support":"K1; S4/S5 for separate transport resources","disposition":"keep"}
{"id":"H-ivano-frankivsk-faq1","location":"`src/data/city-hubs.ts:159`; `/cities/ivano-frankivsk/`; `faq.1`","support":"K1","disposition":"keep"}
{"id":"H-ivano-frankivsk-faq2","location":"`src/data/city-hubs.ts:163`; `/cities/ivano-frankivsk/`; `faq.2`","support":"K1","disposition":"keep"}
{"id":"H-ivano-frankivsk-faq3","location":"`src/data/city-hubs.ts:167`; `/cities/ivano-frankivsk/`; `faq.3`","support":"K1","disposition":"keep"}
{"id":"H-ivano-frankivsk-faq4","location":"`src/data/city-hubs.ts:171`; `/cities/ivano-frankivsk/`; `faq.4`","support":"K1","disposition":"keep"}
{"id":"H-ivano-frankivsk-faq5","location":"`src/data/city-hubs.ts:175`; `/cities/ivano-frankivsk/`; `faq.5`","support":"K1","disposition":"keep"}
{"id":"N-if-kolomyia","location":"`src/data/city-hubs.ts:190`; `/cities/ivano-frankivsk/`; `if-kolomyia`","support":"S6; https://kolomyia.org.ua/","disposition":"rewrite"}
{"id":"N-if-tysmenytsia","location":"`src/data/city-hubs.ts:200`; `/cities/ivano-frankivsk/`; `if-tysmenytsia`","support":"S6; https://tysmenytsia-rada.gov.ua/","disposition":"rewrite"}
{"id":"N-if-rogatyn","location":"`src/data/city-hubs.ts:210`; `/cities/ivano-frankivsk/`; `if-rogatyn`","support":"S6; https://rogatyn-rada.gov.ua/","disposition":"rewrite"}
{"id":"N-if-bohorodchany","location":"`src/data/city-hubs.ts:220`; `/cities/ivano-frankivsk/`; `if-bohorodchany`","support":"S6; https://bohorodchany-rada.gov.ua/","disposition":"rewrite"}
{"id":"H-ivano-frankivsk-resource1","location":"`src/data/city-hubs.ts:229`; `/cities/ivano-frankivsk/`; `planningResources`","support":"S5","disposition":"keep"}
{"id":"H-ivano-frankivsk-review","location":"`src/data/city-hubs.ts`; `/cities/ivano-frankivsk/`; `contentReview`","support":"Existing source dates; this research does not prove prior review scope","disposition":"await evidence"}
{"id":"G-title","location":"`src/app/guides/perevezennya-velosypeda/page.tsx:11`","support":"K1","disposition":"keep"}
{"id":"G-description","location":"`src/app/guides/perevezennya-velosypeda/page.tsx:12`","support":"K1","disposition":"keep"}
{"id":"G-faq1","location":"`src/app/guides/perevezennya-velosypeda/page.tsx:16`","support":"K1; S7 only customs context","disposition":"keep"}
{"id":"G-faq2","location":"`src/app/guides/perevezennya-velosypeda/page.tsx:17`","support":"K1; S7 only customs context","disposition":"keep"}
{"id":"G-faq3","location":"`src/app/guides/perevezennya-velosypeda/page.tsx:18`","support":"K1; S7 only customs context","disposition":"keep"}
{"id":"G-customs","location":"`src/app/guides/perevezennya-velosypeda/page.tsx:29`","support":"S7","disposition":"keep"}
{"id":"G-handoff","location":"`src/app/guides/perevezennya-velosypeda/page.tsx:30`","support":"K1; BicycleInquiryCta/whatsapp source","disposition":"keep"}
{"id":"G-schema","location":"`src/app/guides/perevezennya-velosypeda/page.tsx:24`","support":"Parsed live JSON-LD + local source","disposition":"await evidence"}
{"id":"OP-1","location":"`src/data/carriers.ts:35`","support":"S8; historical source date 2026-09-11; live Hannover PartnerCard","disposition":"await evidence"}
{"id":"OP-2","location":"`src/data/carriers.ts:40`","support":"S8; historical source date 2026-09-11; live Hannover PartnerCard","disposition":"await evidence"}
{"id":"OP-3","location":"`src/data/carriers.ts:45`","support":"S8; historical source date 2026-09-11; live Hannover PartnerCard","disposition":"await evidence"}
{"id":"OP-4","location":"`src/data/carriers.ts:50`","support":"S8; historical source date 2026-09-11; live Hannover PartnerCard","disposition":"await evidence"}
{"id":"OP-service","location":"`src/data/carriers.ts:15`","support":"S8; live Hannover only in scoped pages","disposition":"await evidence"}
{"id":"OP-desk","location":"`src/data/carriers.ts:19`","support":"Local carrier desk + BookingWidget interpolation, matches live","disposition":"keep"}
{"id":"SH-image","location":"`src/app/routes/[slug]/page.tsx:128`","support":"Source + all5 route HTML","disposition":"keep"}
{"id":"SH-candidate","location":"`src/components/PartnerCard.tsx:38`","support":"K1; four candidate pages and About inquiryOnly","disposition":"keep"}
{"id":"SC-routes","location":"`src/lib/seo.ts:145`; all5 route pages","support":"K1/S9; live JSON-LD snapshot","disposition":"keep"}
{"id":"SC-hubs","location":"`src/lib/seo.ts:91`; /cities/lviv/ and /cities/ivano-frankivsk/","support":"K1; parsed live JSON-LD","disposition":"keep"}
{"id":"SC-shared","location":"`src/lib/seo.ts:64`; scoped pages","support":"K1/S9; parsed live JSON-LD","disposition":"keep"}
{"id":"SC-meta","location":"`src/lib/seo.ts:15`; all7 priority pages + guide/About/imprint","support":"Live metadata snapshots and local builder","disposition":"keep"}
## Current source field inventory
{"id":"lviv-hannover","slug":"lviv-hannover","title":"Львів → Ганновер","relatedRouteIds":["lviv-celle"],"originCityId":"lviv","destinationCityId":"hannover","deskId":"koval-de","carrierIds":["koval"],"practicalContent":[{"heading":"Оберіть орієнтир для прибуття у Ганновері","body":"Громадський транспорт Ганновера об'єднує центральний залізничний вокзал (Hannover Hbf) та автовокзал (ZOB). Для зустрічі чи висадки вкажіть конкретний орієнтир або район міста, щоб перевізник міг узгодити точну точку зупинки.","sourceUrl":"https://www.hannover.de/Leben-in-der-Region-Hannover/Mobilit%C3%A4t/Bus-Bahn","lastVerifiedAt":"2026-10-25"},{"heading":"Узгодьте доїзд до Львова з часом виїзду","body":"Якщо ви добираєтеся до Львова поїздом або автобусом з іншого населеного пункту, повідомте перевізнику орієнтовний час прибуття. Залиште достатній запас часу на випадок затримок та погодьте точне місце зустрічі у Львові."}]}
{"id":"lviv-celle","slug":"lviv-celle","title":"Львів → Целле","relatedRouteIds":["celle-lviv","lviv-hannover"],"originCityId":"lviv","destinationCityId":"celle","deskId":"koval-de","carrierIds":["koval"],"practicalContent":[{"heading":"Оберіть місце прибуття у Целле","body":"У туристичній інформації Целле вокзал і старе місто описані окремо. Для прибуття вкажіть потрібний район, адресу або один із цих орієнтирів. Так перевізнику буде легше узгодити з вами конкретне місце.","sourceUrl":"https://www.celle-tourismus.de/info-besucherservice/tourist-information/anreise-parken","lastVerifiedAt":"2026-10-06"},{"heading":"Узгодьте доїзд до Львова з посадкою","body":"Якщо спочатку приїжджаєте до Львова поїздом або автобусом, напишіть час і місце свого прибуття. Попросіть перевізника погодити точку посадки та обговоріть запас часу між двома поїздками. Коли місце зустрічі стане відоме, сплануйте, як дістатися до нього з багажем."}]}
{"id":"celle-lviv","slug":"celle-lviv","title":"Целле → Львів","relatedRouteIds":["lviv-celle"],"originCityId":"celle","destinationCityId":"lviv","deskId":"koval-de","carrierIds":["koval"],"practicalContent":[{"heading":"Оберіть орієнтир для зустрічі у Целле","body":"У туристичній інформації Целле вокзал і старе місто описані окремо. Для зустрічі вкажіть потрібний район, адресу або один із цих орієнтирів. Так перевізнику буде легше узгодити з вами конкретне місце.","sourceUrl":"https://www.celle-tourismus.de/info-besucherservice/tourist-information/anreise-parken","lastVerifiedAt":"2026-10-06"},{"heading":"Продумайте подальшу дорогу зі Львова","body":"Якщо зі Львова плануєте їхати далі, повідомте перевізнику кінцеве місто. Запитайте про місце висадки й орієнтовний час прибуття, а також про те, як дізнаватися про зміни в дорозі. Після цього обирайте наступний транспорт із запасом часу на пересадку."}]}
{"id":"ivano-frankivsk-wolfsburg","slug":"ivano-frankivsk-wolfsburg","title":"Івано-Франківськ → Вольфсбург","relatedRouteIds":["wolfsburg-ivano-frankivsk"],"originCityId":"ivano-frankivsk","destinationCityId":"wolfsburg","deskId":"koval-de","carrierIds":["koval"],"practicalContent":[{"heading":"Оберіть місце прибуття у Вольфсбурзі","body":"Вольфсбург має окремі райони, зокрема Фаллерслебен і Форсфельде. Назвіть район і, за можливості, адресу прибуття, а не лише місто. Точне місце висадки погодьте з перевізником.","sourceUrl":"https://www.wolfsburg.de/en/bauenwohnen/wolfsburg-als-wohnort","lastVerifiedAt":"2026-10-06"},{"heading":"Підготуйте спільний виїзд з Івано-Франківська","body":"Якщо їдете разом, домовтеся, де всім зручно зібратися, й запропонуйте цей орієнтир перевізнику. Зазначте кількість дорослих і дітей, вік дітей та загальну кількість валіз. Запитайте про потрібні умови для дітей і перевезення великого багажу до погодження поїздки."}]}
{"id":"wolfsburg-ivano-frankivsk","slug":"wolfsburg-ivano-frankivsk","title":"Вольфсбург → Івано-Франківськ","relatedRouteIds":["ivano-frankivsk-wolfsburg"],"originCityId":"wolfsburg","destinationCityId":"ivano-frankivsk","deskId":"koval-de","carrierIds":["koval"],"practicalContent":[{"heading":"Оберіть орієнтир для зустрічі у Вольфсбурзі","body":"Вольфсбург має окремі райони, зокрема Фаллерслебен і Форсфельде. Назвіть район і, за можливості, адресу зустрічі, а не лише місто. Точне місце посадки погодьте з перевізником.","sourceUrl":"https://www.wolfsburg.de/en/bauenwohnen/wolfsburg-als-wohnort","lastVerifiedAt":"2026-10-06"},{"heading":"Домовтеся про зустріч в Івано-Франківську","body":"Якщо після прибуття вас зустрічатимуть близькі, уточніть місце висадки та орієнтовний час. Запитайте, як підтримувати зв’язок і дізнаватися про зміни часу в дорозі. Передайте узгоджені відомості тим, хто приїде за вами. Якщо їдете далі, обговоріть запас часу для пересадки."}]}
{"cityId": "lviv", "heading": "Поїздки зі Львова до Німеччини та назад", "title": "Поїздки зі Львова до Німеччини та назад | UARoute", "routeSlugs": ["lviv-hannover", "lviv-celle", "celle-lviv"], "nearbyHeading": "Якщо ви живете неподалік"}
{"cityId": "ivano-frankivsk", "heading": "Поїздки з Івано-Франківська до Німеччини та назад", "title": "Поїздки з Івано-Франківська до Німеччини та назад | UARoute", "routeSlugs": ["ivano-frankivsk-wolfsburg", "wolfsburg-ivano-frankivsk"], "nearbyHeading": "Якщо ви живете неподалік"}

## Current template headings and dependencies
src/app/routes/[slug]/page.tsx
description: route.seo.description,
<h1 className="mt-2 max-w-4xl break-words type-h1">
<p className="mt-3 max-w-2xl type-body text-muted-foreground">{route.description}</p>
<h2 id="conditions-heading" className="text-sm font-semibold">Що погодити з перевізником</h2>
<h2 id="practical-heading" className="mt-2 type-h2">Сплануйте зустріч і прибуття</h2>
<h3 className="font-display text-2xl">{item.heading}</h3>
<h2 id="route-faq-heading" className="mt-2 type-h2">Часті питання</h2>
<h2 id="city-directions-heading" className="type-h2">Інші напрямки вашого міста</h2>
src/app/cities/[slug]/page.tsx
return buildMetadata({ title: details.title, description: details.description, path: `/cities/${slug}/`, socialImage: travelPreviewImage });
<h1 className="mt-3 max-w-4xl type-h1">{details.heading}</h1>
<h2 id="search-heading" tabIndex={-1} className="mt-3 scroll-mt-24 type-h2">Куди хочете їхати?</h2>
<h2 className="mt-3 type-h2">{presentation.departureHeading}</h2>
<h2 className="mt-3 type-h2">{presentation.arrivalHeading}</h2>
<h3 className="type-h3">Корисний довідник</h3>
<h2 className="mt-3 type-h2">Місце зустрічі, прибуття та підготовка</h2>
<h3 className="font-display text-xl">{route.title}</h3>
<p className="mt-2 type-body-small text-muted-foreground">{route.description}</p>
{presentation.relatedHubs.map(({ city: relatedCity, label }) => (
src/lib/seo.ts
description: string;
description: options.description,
description: options.description,
description: options.description,
description: siteConfig.description,
description: route.description,
description: content.description,
description: route.description,

## Controls and unknowns
Dated Oct27 S01: 5/7 indexed; both Wolfsburg discovered—not-indexed; seven HTTP200. Sitemap and links do not prove indexing. Oct26 requests remain historical. Page-performance unknown7/7, no measured demand. Later successful browser inspections supersede older connector-failure narrative; subsequent access interruption remains. Corrected ledger controls broader evidence summaries. Both Celle practical1 are rewrite. Existing dates are historical, not new review. Owner operational context not current public confirmation. No guaranteed connections, numeric buffer, stops, fares, direct service, carrier plurality. Geography never proves pickup/routing/coverage or requires travel to hub.

## Delivery references
Only stable docs may be linked: s03-s04-work-plan.md, search-baseline.md, claims-ledger.md, passenger-needs.md and governing contracts (already committed). This extract is context-only: do not link it.

## Source hashes and plan reconciliation
{
  "hashes": {
    "docs/00-project-constitution.md": "62f4f33efb3088ccbfdb7f2e55473083adab883238ced70d8f67f56a570f7cf7",
    "docs/Operations/Agentic/Operational/repository-contract.md": "f1e956e8a7512f830e0f0d24699c6ab19c5054ca1424b61a45f1bc74842e9d8f",
    "docs/Product/passenger-discovery-conversion-spec-2026-10-22.md": "4d08869ba493c37963dd823a9ae54a8c3063288a2121ac7a0c8f4b569cf30641",
    "docs/Marketing/SEO/mitigation-2026-10/s03-s04-work-plan.md": "e4507355c436a3e6c574b6d736f800f4a882f16819fa294af0fa59cda3d68419",
    "docs/Marketing/SEO/mitigation-2026-10/search-baseline.md": "666ee8e5a21baaa994e2bd79d8166435257bc0a4341978886e223f140f9df096",
    "docs/Marketing/SEO/mitigation-2026-10/claims-ledger.md": "9644a3ede2e4773063c63cb7966bcfb21b1ff1055dfbdccf201ff140977d063b",
    "docs/Marketing/SEO/mitigation-2026-10/passenger-needs.md": "60c763a9f43b7f0db06e5ab2279d582c1cf8a3f2e7decf11ac69e32d3828d3fd",
    "docs/Marketing/SEO/mitigation-2026-10/passenger-evidence.md": "3498b45393d3d7715a91a1069492a037bf6b54da18c38a0157b4d2e10dfdcf0a",
    "src/data/routes.ts": "dee967e008ef338cadccdb2343eb37ea7d4c41e5bf5c2a2c2c9d211a3635b772",
    "src/data/city-hubs.ts": "2c3699b360c38c4421380f1ee24f211173309c4510cffc45b6d86cea92777cfc",
    "src/app/routes/[slug]/page.tsx": "afc10b91c28e150ae8b9e3aa34d0dbf918f62c1f2df8528e7f9145a3b39d3c29",
    "src/app/cities/[slug]/page.tsx": "47efa6024b94f812195afaadbfef371cc93c7ca0045513b2d1dd89bb2db25a3c",
    "src/lib/seo.ts": "d43777c6b89066b5c1bd70522902a0ac03c11148985f3608fbd8d9ae6ed293bd",
    "src/components/PartnerCard.tsx": "f6ef4651756ecfc639ece2393d647ea4ff18e985bc5e9bf8853e000fed8541fa",
    "src/data/carriers.ts": "ee89b0a816c3f8b21d7a92fba3b7adef9cb03bc2067b67288f603ab308d2942a"
  },
  "plan_hash_recheck": {
    "search-baseline.md": {
      "planned": "666ee8e5a21baaa994e2bd79d8166435257bc0a4341978886e223f140f9df096",
      "current": "666ee8e5a21baaa994e2bd79d8166435257bc0a4341978886e223f140f9df096"
    },
    "claims-ledger.md": {
      "planned": "9644a3ede2e4773063c63cb7966bcfb21b1ff1055dfbdccf201ff140977d063b",
      "current": "9644a3ede2e4773063c63cb7966bcfb21b1ff1055dfbdccf201ff140977d063b"
    },
    "passenger-needs.md": {
      "planned": "60c763a9f43b7f0db06e5ab2279d582c1cf8a3f2e7decf11ac69e32d3828d3fd",
      "current": "60c763a9f43b7f0db06e5ab2279d582c1cf8a3f2e7decf11ac69e32d3828d3fd"
    },
    "passenger-evidence.md": {
      "planned": "3498b45393d3d7715a91a1069492a037bf6b54da18c38a0157b4d2e10dfdcf0a",
      "current": "3498b45393d3d7715a91a1069492a037bf6b54da18c38a0157b4d2e10dfdcf0a"
    }
  }
}
