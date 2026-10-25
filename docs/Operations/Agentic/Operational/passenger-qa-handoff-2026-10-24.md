---
type: Operational
title: "UARoute — передача в Manual QA та новий потік"
description: "Збережений QA-пакет, журнал результатів, безпечні режими й наступні дії після архівування координаційного чату."
tags: [uaroute, qa, handoff, continuity]
---

# Новий потік: Manual QA та виправлення за результатами

Власник попросив зберегти результат, очистити локальні PDF/тимчасові матеріали й архівувати попередній чат. Власник сам ініціює наступний потік і планує поширити завантажений PDF серед QA. Нового чату, повідомлень QA або запрошень не створювалося.

## Прочитати на старті

1. Застосовні AGENTS.md і [робочу угоду](working-agreement.md); перевірити актуальні HEAD/branch/dirty scope, не відкидати сторонню роботу.
2. [Manual QA:40кейсів](../../../Product/manual-qa-passenger-2026-10-24.md) — канонічні steps/expected, A/B/F, usability, bug template, AC coverage.
3. [Актуальну стратегію](../../../Product/development-strategy-2026-10-24.md) — завершене й наступне; [реєстр](../../../../ops/agent-state.json) — датовані факти/межі.
4. [Підтвердження QA-пакета](../../../../ops/evidence/manual-qa-package-2026-10-24.json) та [production receipt](../../../../ops/evidence/production-release-2026-10-24.json). Не вимагати ignored output/KB для розуміння стану.

## Готове й опубліковане

- Application production: `dac7e98735eabfdda8abb7df37fb6e59428b22be`, CI40124363351/deploy40124595922 success.258об’єктів,373HTTP checks,24live HTML hash matches; recovery446objects retrieved/verified. Не вважати HEAD документації новим deployed application SHA.
- На початку передачі repository HEAD `0588ef40ce762e5f36623d56e4b3477565545a5f` (strategy docs); нові QA/handoff файли слід звірити з фактичним status при resume. Ця дата/версія не замінює повторної перевірки.
- Discovery/contact/content/referral remediation реалізовано й перевірено. WhatsApp головний із перевіреним desk; сайт незалежний від полів; без desk головний сайт. Пари/desks/allowlists/privacy незмінні.
- Український PDF54сторінки/40кейсів підготовлено й перевірено; local copy видалена за вказівкою власника. Повний текст для відтворення інструкцій збережено у canonical Markdown; hash/підсумок PDF — у receipt. Точну remote PDF URL власник ще не надав; не вигадувати її.
- [execution-uaroute](https://docs.google.com/spreadsheets/d/1nxW52uq2Jzh9AdClGrwkieLkwlksXr2EBQLJlBhtmEE/edit?usp=drivesdk) у [папці testing](https://drive.google.com/drive/folders/1qzNFQ4NiYXTNIXbTBWa8MPxho2PzBOwl). Metadata перевірено, рядки/права доступу для кожного QA не перевірялися. Нічого в таблиці не змінено. Початкові інструкції мають NOT RUN; фактичних результатів немає.

## Наступна робота

- Якщо є нові QA reports: прочитати саме їх і потрібні рядки таблиці, відтворити на названому build/device/consent, оформити impact/priority; не робити загальний redesign із поодинокого враження.
- Якщо результатів ще немає: допомогти підготувати інтерактивний B/F-контекст із перевіреним перехопленням collectors/handoffs до synthetic input. Headless harness сам собою не означає готового manual workspace. A-огляд можливий без цього, але без тестових полів/submit/external contact clicks.
- Розділяти bugs, UX findings, BLOCKED середовища й downstream unknowns. Для fix — вузькі edits, relevant negative tests, stable check за application scope та retest конкретного нового export. Не позначати старий FAIL заднім числом PASS.
-5–8new-user tasks, real phones/native zoom/screen readers не виконані; не підміняти ними automated PASS. Паралельний acquisition/indexing register залишається за стратегією.

## Межі й збережені ресурси

Немає дозволу на нову рекламну активацію, збільшення витрат, повідомлення QA/перевізнику, акаунтні зміни, receiver-repository writes або наступну публікацію з цього handoff. За належно авторизованою задачею діяти автономно, не питати повторно про кожну підготовчу дію. Попередня публікація не є універсальним дозволом на майбутні релізи.

Vibe не запускати/не відновлювати:6нових starts вичерпано, закриті artifacts rejected, власник обрав direct implementation. Старі dirty supervisor worktrees збережені після відмови безпечного cleanup; не force-delete і не застосовувати їхні patches. Managed worktrees цього чату не прикріплені. Не торкатися `.codex/`, приватної `.agents/skills/ga4-report/` та чужих змін.

Локальні PDF та згенеровані previews/тимчасові копії можна вважати відсутніми після cleanup; Markdown, CSV template, sanitized validation/release receipts, run ledger і attributable patch evidence збережені. Повні recovery bytes залишаються у приватному recovery storage, не в Git. Потрібен PDF повторно — відтворити з canonical plan або отримати від власника вже завантажений, а не шукати секрети/сирі сесії.
