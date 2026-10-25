---
type: Strategy
title: "UARoute — актуалізована стратегія після пасажирського релізу"
description: "Підтверджений production baseline, пріоритети залучення й перевірки реального попиту, окремі ворота реклами та M2."
tags: [uaroute, strategy, acquisition, conversion, measurement]
---

# Стратегія UARoute після релізу 24 жовтня 2026

Мета — перетворити релевантне відкриття маршруту на зрозуміле звернення до перевізника та перевірити, чи приводить UARoute нових пасажирів. Реалізація discovery/contact вже опублікована. Наступний крок — навчитися на реальних відвідуваннях і підтверджених результатах, а не починати ще один redesign або масово створювати сторінки.

Вища рамка: [конституція](../00-project-constitution.md), [M1 та M2](../Decisions/0002-gated-operator-booking-pilot.md), [контентний контракт](06-data-model-and-content-governance.md), [аналітика](../Marketing/08-analytics-and-attribution.md). Чинний execution contract — [пріоритетний acquisition increment](../Marketing/SEO/priority-acquisition-increment-2026-10-24.md); датований стан і межі доказів — [реєстр](../../ops/agent-state.json). Цей документ визначає черговість, а не надає нову авторизацію на рекламу, повідомлення третім сторонам, акаунтні зміни чи публікацію наступних змін.

## 1. Що вже зроблено

| Напрям | Результат | Що саме доведено |
|---|---|---|
| Пасажирський discovery | Ганновер видимий у виборі; комерційна сторінка має пріоритет над inline, далі чесний unknown fallback | Вибір не розширив eligibility й не створив нових сторінок або зворотної Hannover-пари |
| Вибір міста/напрямку | Міські картки заповнюють правильне поле, зберігають контекст і фокус; зміна пари/маршруту скидає старі поля та помилки | Query/negative/state/browser регресії |
| Контактний шлях | Ранні JourneyActions; WhatsApp головний за перевіреного desk; сайт — незалежна помітна альтернатива без дати/телефону; без desk сайт головний | Одна inquiry-форма/anchor; рання дія лише фокусує дату; валідний submit має один шлях подій/handoff |
| Форми й доступність | Семантичний Enter, hydration guard, custom validation, count1–8, readable reflow/sticky reserve, reduced motion | Перевірені Chromium360/375/1440 і CSS zoom200%; це не повний native zoom/screen-reader/real-device audit |
| Контент і довіра | Нейтральне «перевізник»; коротші вступи/інструкції; прибрані або обмежені непідтверджені обіцянки; claims register; корисні FAQ без штучного minimum | Джерела/ролі/негативні gates збережені; немає вигаданих цін, рейсів, місць чи нових перевізників |
| Referral і приватність | Правильна поточна повна пара; generic href без вигаданих міст; placement mapping виправлено; first touch окремо від targetPath | Парсери/allowlists/consent/PII negatives; не доказ отримання звернення оператором |
| Carrier receiver | Source commit `c30fd37` додає celle-stryi до122-label контракту; live stamp і точний sender/fixture hash збігаються | Деплой18 жовтня підтверджено;24 жовтня повторно перевірено source policy: 122 labels / 252 pairs / 277 rejects. Це не новий receiver deployment і не реальний receipt |
| Реліз UARoute | ae2e65f — контракти/tooling; dac7e98 — passenger implementation; push і production 24 жовтня | CI40124363351 та deploy40124595922 success;258 опублікованих об’єктів;373 HTTP checks;24 live HTML hash matches; recovery: 446 objects retrieved/verified |
| Вимірювання | Direct labels нормалізуються на Google boundary; Basic consent; Ads destination відокремлено за ранішою авторизацією; два contact actions |24 жовтня Ads readback: ENABLED/CONTACT/Secondary/ONE_PER_CLICK/default 0/always_use_default_value=true. Конфігурація не дорівнює ingestion чи attribution |
| Наступність агентів | Portable register/checker, negative tests, docs integration і робоча угода | Структура та provenance перевіряються локально; checker не підтверджує live-стан автоматично |

[Портативний release receipt](../../ops/evidence/production-release-2026-10-24.json) містить SHA, authenticated Actions URLs, recovery hash і межі. Повні локальні звіти/скриншоти залишаються в ignored output; CI не залежить від них. Попередні звіти з146/149tests та старими Ads flags — історія. Поточний production candidate пройшов168 application tests,32 local acceptance checks,22 regression flows; analytics-enabled CI candidate окремо пройшов22 mocked regression flows. Live smoke виконано з блокуванням collectors/handoffs, без пасажирських даних.

## 2. Чого результат ще не означає

Пошукові появи, consented sessions, кліки WhatsApp/сайту, отримані inquiries, погоджені поїздки та виконані journeys — різні величини. Тестові кліки7–10 жовтня та мізерна кількість органічних візитів не встановлюють незалежного нового пасажира. У цій актуалізації нових performance reports не запитували; нової кількісної оцінки попиту немає.

Підтверджено технічну придатність конкретних артефактів і їх публікацію. Не підтверджено стабільного потоку пасажирів, uplift, Google ingestion/processed attribution, операторського receipt, бронювань або доходу. Статус «всі операційні задачі завершено» не застосовується. Успішний receiver workflow не замінює actual handoff verification.

## 3. Пріоритети наступного етапу

| Порядок | Робота | Готовий результат / критерій рішення |
|---|---|---|
| P1 | 5–8 нових людей проходять discovery/contact завдання без підказок | Зафіксовані успіх, перше хибне натискання, розуміння ролей/каналів/статусу місця; усунуто блокувальні проблеми. Технічний PASS не замінює цього тесту |
| P1 | Завершити семи-URL indexing register | Для всіх 7 сторінок є дати, status/reason/canonical/crawl/sitemap та конкретне потрібне втручання або «не потрібне». Уже відомі 4 результати не видаються за перевірку всіх 7 |
| P1 | Перевірити реальний receiver шлях контрольовано | Окремий authorized sender→поточний receiver→contact browser check з перехопленням усіх collectors/handoffs. Без QA-повідомлення перевізнику; code/pair не губляться. Це лишається технічним доказом |
| P2 | Вибрати мінімальні зміни існуючих SEO входів за register/попитом | Львів–Ганновер як observed-search lane; Львів/ІФ hubs і4 пріоритетні напрямки. Не переписувати хороші тексти й metadata без проблеми/доказу |
| P2 | Підготувати3 доречні community placements | По одному Львів/ІФ/німецький destination-return контекст; правила каналу й disclosure перевірені; matching page та allowlisted UTM. Публікація/повідомлення лише за окремим дозволом |
| P2 | Домовитись про aggregate operator feedback | За окремою авторизацією контакту погодити мінімальну звірку received inquiries/confirmed passengers/completed journeys; не будувати CRM і не переносити телефон/дату/коди в analytics |
| P3 | Контрольований paid pilot лише після gates | Завершений reviewed setup, перевірені targeting/consent/conversion settings, зрозумілий budget cap, explicit launch. Organic/distribution робота не чекає на Ads |

P1 — близькі паралельні перевірки, не вимога нової багатотижневої інфраструктури. Агенти автономно обирають пропорційний спосіб виконання в дозволеному обсязі; не потрібне погодження кожного локального кроку. Реальний external write/launch потребує відповідного scope, а не висновку іншого агента «ready».

### Семи-URL register: відома частина на 24 жовтня

Це збережені датовані URL Inspection спостереження, не повторний live GSC-запит цієї актуалізації. Додаткові crawl/canonical поля ще належить доповнити за execution contract.

| URL | Збережений результат | Залишкова дія |
|---|---|---|
| `/cities/lviv/` | Indexed | Додати/звірити детальні поля перед SEO edit |
| `/cities/ivano-frankivsk/` | Indexed | Додати/звірити детальні поля перед SEO edit |
| `/routes/lviv-celle/` | Discovered, not indexed | З’ясувати reason/crawl/canonical/context; не називати technical failure без діагнозу |
| `/routes/ivano-frankivsk-wolfsburg/` | Unknown to Google | Перевірити discovery/crawl evidence, не вигадувати дату indexing |
| `/routes/lviv-hannover/` | Individual inspection pending | Попередня пошукова видимість не замінює цей inspection |
| `/routes/celle-lviv/` | Individual inspection pending | Завершити register |
| `/routes/wolfsburg-ivano-frankivsk/` | Individual inspection pending | Завершити register |

Sitemap read 23 жовтня, Success / 22 discovered спостерігали 24 жовтня; це не 22 indexed pages. Уточнення цих рядків не вимагає повторного читання вже перевірених незалежних акаунтних налаштувань.

## 4. Discovery та контент: розвивати корисні входи

Пріоритет Львова й Івано-Франківська збережено. Львів–Ганновер має початкову пошукову видимість, але це не підстава автоматично множити Hannover-сторінки. Наступні edits визначаються конкретним індексаційним/пошуковим/UX бар’єром.

Зберегти чинні URLs, city IDs, pair eligibility, desk routing, approved attribution tuples, editorial noindex і commercial-only navigation. Список міст не є доказом виконуваного перевезення. Для малого населеного пункту — nearest selectable city і приватне уточнення фактичного місця; не обіцянка заїзду й не вимога їхати до хабу.

FAQ має відповідати окремим питанням пасажира, а не SEO-квоті. Спільні корисні відповіді між URL допустимі. PracticalContent, provenance й короткі чесні підтвердження важливіші за довжину тексту. Нові operational facts — лише за джерелом з реальною датою перевірки. Customs матеріали залишаються пояснювальними офіційними посиланнями, якщо немає достатнього доказу для конкретного висновку.

## 5. Вимірювання й цикл рішень

Перший огляд стабільності — через 7 днів після production 24 жовтня, тобто 31 жовтня. Початковий чотиритижневий organic observation window — до 21 листопада. Це календар планування, не автоматизація чи обіцянка достатнього трафіку. Для майбутніх community placements/paid start записати окрему дату: до фактичного старту їм не приписується чотиритижневий результат.

Щотижня збирати узгоджені агрегати:

- GSC: settled impressions/clicks за URL/query, indexing/canonical/crawl семи пріоритетних сторінок. Sitemap Success не означає індексації кожного URL.
- GA4: production-host consented sessions за page/channel, matched-unit sessions з contact handoff; внутрішні/QA/невідомі джерела позначати. Не вважати всі Direct незалежними пасажирами.
- Receiver/operator: технічне збереження source/pair/code окремо від агрегованих отриманих inquiries, confirmed passengers та completed journeys. Без operator evidence downstream outcomes залишаються unknown.
- Контент/реліз: дата й причина зміни, артефакт/URL, consent/build mode; distribution exposure — тільки якщо відомий. Не обіцяти повну видимість через consented GA4.

Кліки подій не ділити на сесії як готову conversion rate. Для відсотка потрібні однакові unit/period/population numerator і denominator. Відсутність кліків при майже нульовій exposure не доводить поганого CTA.

| Спостереження | Наступне рішення |
|---|---|
| Немає indexing/crawl eligibility | Усунути конкретну technical/canonical/internal-link проблему; не генерувати нові pages |
| Indexed, але слабкі релевантні impressions | Перевірити intent/usefulness/distribution; довший період, якщо вибірка мала |
| Є достатня порівнювана exposure, низький CTR | Перевірити snippet/title/query match; одна обґрунтована зміна |
| Є незалежні visits, мало handoffs | Повторити user tasks/контактну friction; не починати redesign без відтворення |
| Є handoffs, немає confirmed receipt | Перевірити receiver/contact і operator feedback; не називати click booking |
| Є підтверджені нові inquiries/journeys | Обережно тестувати наступний acquisition scope/економіку за окремим рішенням |

Не встановлювати довільний «успішний uplift%» без бази. Масштабувати канал після релевантного попиту, зрозумілої економіки й виконання privacy/operational gates, а не після зеленого deployment.

## 6. Paid track і фінансові межі

Чинна авторизація — configured average daily budget 5 PLN на 3 дні, Manual CPC 1.50 PLN, дві approved pair groups. Це не дозвіл збільшити budget, змінити bidding чи почати рекламу. Стан setup у реєстрі датований22 жовтня: campaign query0rows, recoverable draft з порожніми полями, Manual CPC не знайдено в inspected dropdown; це не свіжа перевірка24 жовтня й не активна кампанія.

**Budget setting не дорівнює billed hard cap.** За [офіційними Google spending limits](https://support.google.com/google-ads/answer/10486637/about-spending-limits), для більшості кампаній daily billing limit може становити 2× average daily budget. Отже5 PLN average/day може означати до 10 PLN за конкретний день;~15 PLN за 3 дні не гарантований lifetime maximum. Якщо вимога власника — фактичний максимум5 PLN/day або15 PLN total, launch заблокований до узгодженого підтримуваного механізму обмеження/нового рішення. Не підміняти бюджетне рішення автоматично іншим налаштуванням або правилом паузи з недоведеною точністю.

Перед launch: повторно read-only перевірити intended customer/property/link/campaign/bidding/targeting; чинні contact actions мають Secondary/default0/ONE_PER_CLICK; personalization/advertising isolation і consent залишаються за контрактом. Поточний direct link не створювати повторно через старий звіт; недоступний метод API не доводить immutable setting. Для paid setup/тесту вимірювання потрібна окрема авторизація; зелена конфігурація не є Google ingestion.

## 7. M2 та інженерна дисципліна

M1 залишається discovery/intent: UARoute не підтверджує місця й не зберігає пасажирські дані; перевізник погоджує і виконує поїздку. M2 reservation APIs, inventory, driver accounts та економіка партнера залишаються gated під ADR 0002 і доказами стабільної operator allocation. Flexible corridor/vehicle redistribution не можна оголосити придатним seat inventory без рішення BK-01. Нові carrier/pages/CRM не є наступним кроком цього релізу.

Технічна наступність: Node22/npm/TS6/static export; Server Components за замовчуванням; no dependency upgrades. Під час edits — focused checks, один stable full check за потребою application change; docs-only — docs:index/docs:check/tooling checks. Browser QA перехоплює всі collectors/handoffs до synthetic input. У релізі зберігати source/run/artifact hashes, exact export acceptance і recovery receipt. Реліз24 жовтня має verified backup; повний isolated rollback rehearsal усе ще окрема незакрита робота.

Немає нових Vibe calls або відновлення закритих runs; попередній бюджет вичерпано й власник обрав direct coordinator implementation. Це provenance, а не причина будувати нову agent platform. Підтримувальні tooling задачі виконувати лише для повторюваних реальних проблем. Сирі reasoning/credentials/пасажирські дані не зберігати в історії чи звітах.

## 8. Межа цієї актуалізації

Стратегія та portable register оновлені локально після перевіреного production release. Цей документ не був частиною artifact `dac7e98` і його редагування не є новим deployment. Старі source/deployment/test dates не переписуються заднім числом. Публічний сайт, бюджети, кампанії, акаунти й receiver repository у межах цього завдання не змінюються. Повні sanitized локальні докази: `output/production-release-2026-10-24/` та `output/agy-review-2026-10-24/`; shared decisions і мінімальні receipts доступні без цих директорій або KB.


## 9. Передача в Manual QA —24 жовтня2026

[Пакет ручного тестування](manual-qa-passenger-2026-10-24.md) готовий:40 детальних кейсів, перевірка12 маршрутів на двох розмірах, задачіU1-U6 для5–8 нових людей, UX-оцінювання, шаблон баг-репорту та AC01-AC16/18-finding coverage. Український PDF-посібник має54сторінки, клікабельний зміст і посилання на журнал; верстку перевірено. Це готовність інструкцій, не PASS ручного тестування.

Власник планує поширити завантажений PDF серед QA та продовжити в новому потоці. [Таблиця execution-uaroute](https://docs.google.com/spreadsheets/d/1nxW52uq2Jzh9AdClGrwkieLkwlksXr2EBQLJlBhtmEE/edit?usp=drivesdk) знайдена в [папці testing](https://drive.google.com/drive/folders/1qzNFQ4NiYXTNIXbTBWa8MPxho2PzBOwl); її результати не читалися й не заповнювалися. Відомість PDF з hash/джерелом та межами збережена у [portable receipt](../../ops/evidence/manual-qa-package-2026-10-24.json). Локальні PDF/прев’ю видалено за окремою вказівкою власника; завантажені матеріали Drive не змінено.

Найближча робота: підготувати безпечний інтерактивний B/F-контекст для повного contact/privacy QA; дати QA пройти A-сценарії без реальних звернень; отримати результати за build/device; відокремити функціональні дефекти від UX findings; пріоритизувати й відтворити проблеми, виправляти вузько й робити retest на новій версії. Немає результатів — NOT RUN/BLOCKED, не «пройдено автоматичними тестами».5–8-person testing і native zoom/реальні пристрої залишаються pending до фактичного виконання.

Вхід у новий потік: [QA handoff](../Operations/Agentic/Operational/passenger-qa-handoff-2026-10-24.md). Спочатку прийняти результати/контекст або підготувати потрібне середовище, а не знову переглядати весь завершений implementation чи запускати Vibe. Індексаційний реєстр, evidence-based acquisition та окремі paid/M2 gates зберігаються. Архівування чату не є втратою канонічного плану, дозволом на рекламу чи доказом виконаного QA.
