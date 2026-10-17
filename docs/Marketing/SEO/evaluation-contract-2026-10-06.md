---
type: "Evaluation"
title: "EDD: критерії оцінювання SEO-оновлення"
description: "Evaluation criteria or dated evidence; local results do not establish deployment or commercial outcomes."
tags: ["uaroute", "marketing"]
---

# EDD: критерії оцінювання SEO-оновлення

**Дата baseline/специфікації:** 2026-10-06. **Критерії зафіксовано:** 2026-10-07 до code implementation. **Підхід:** evaluation-driven development — критерії та очікувані результати зафіксовані до реалізації, зміна проходить незалежну перевірку за ними. Це проєктний контракт оцінювання SEO-оновлення. [Специфікація](../../knowledge-base.md#knowledge-base) (KB: `wiki/Marketing/SEO/upgrade-spec-2026-10-06.md`), [план](../../knowledge-base.md#knowledge-base) (KB: `wiki/Marketing/SEO/upgrade-plan-2026-10-06.md`), [аудит](../../knowledge-base.md#knowledge-base) (KB: `wiki/Marketing/SEO/audit-2026-10-06.md`).

## 1. Цикл і статуси

Для кожного критерію: baseline → очікуваний результат/fixtures → реалізація → оцінювання → виправлення → повторна оцінка лише зміненого або пов’язаного контракту. Не послаблювати критерій для проходження власної реалізації. Зміну критерію обґрунтовувати окремим рішенням та evidence.

Статуси: `fail` (спостережена невідповідність), `pass-local` (fixtures/export/browser), `pass-live` (датована production перевірка), `unknown` (даних/доступу немає), `not-applicable` (пояснена відсутність вимоги). Unknown не зараховується як pass. Local pass не закриває live-вимогу. Код і документація можуть бути готовими до релізу без твердження, що production дефект усунуто.

## 2. Критерії, визначені до реалізації

| ID / SEO | Baseline | Oracle / критерій | Evidence та gate |
| --- | --- | --- | --- |
| E01 / SEO-01 | Live missing path → homepage 200: fail | Unknown document, nested path і provider → 404; no homepage body/canonical; missing asset не 200 | Edge fixtures + HTTP matrix; локальний і live статуси окремо. Blocking release |
| E02 / SEO-02 | П’ять HTML redirects 200: fail | Exact legacy map → 301/308, точний destination, no loops; unknown не blanket redirect | GET/HEAD + raw Location/chain; всі mapped slash/slashless cases. Blocking release |
| E03 / SEO-03 | www/http/index.html 200, routes slashless 302: fail | Canonical host/protocol/known aliases; query multivalue/encoding збережено; assets/RSC не normalised як документи | Fixture matrix та live checks; максимум два обґрунтовані protocol/path hops. Blocking release |
| E04 / integrity | Local export pass; future edge unknown | 18 sitemap URLs; commercial/editorial split; one H1/canonical; 404 no homepage canonical; HTML, RSC, fonts/images readable | `npm run check` + HTTP + browser navigation. Blocking release |
| E05 / inquiry | Попередній discovery QA pass | 168 cross-country choices, same-country guard, reversal preserves pair, expected-country aliases; first-touch ≠ targetPath; no actual external messages | Existing browser suites з blocked handoffs; жодних personal analytics/storage. Blocking release |
| E06 / SEO-06 | Wrong-entity risk; не доведена нерелевантна GSC acquisition | Six priority pages origin/destination correct; Celle/Wolfsburg country/Latin context; useful direction copy, Коваль naming, trip-confirmation boundary | Export/content inspection + catalog validation + human Ukrainian review. False facts block release |
| E07 / SEO-09 | У 20 pages немає og:image | Доречний representative image там, де обраний; absolute URL, dimensions, alt, no false documentary claim | Metadata tests + image file/type/dimensions + rendered preview. Nonblocking enhancement |
| E08 / SEO-10/11 | Sitemap has ignored hints; FAQ schema legacy | Немає fake lastmod; sitemap set stable; visible FAQ retained if schema removed; no invented Offer/rating/service | Export schema/sitemap tests. New false schema blocks release |
| E09 / release | Local/live titles differ; recovery partly recorded | Exact scope/build fingerprints; old chunks retained; rollback restores matching HTML/RSC/assets+config | Dry-run deletion/retention tests, retrieval evidence, release record. Blocking deployment gate |
| E10 / SEO-04 | GSC unknown | Dated six-URL indexed/live/canonical baseline or explicit unknown; owner access action logged | No fake indexing pass; independent from code completion |
| E11 / SEO-08 | Field/lab performance unknown | Three templates, mobile comparable runs; field p75 LCP≤2.5s, INP≤200ms, CLS≤0.1 when data exists | Tool/settings/date/median recorded; missing CrUX unknown; lab ≠ field. Specific regression blocks affected optimisation |
| E12 / SEO-07 | Organic outcome segmentation unavailable | Search aggregates separate from operator journeys; no organic ROI without attribution contract; no vendor activation | Privacy/config tests + report review. Blocking if privacy boundary changes |

Priority URL set: `/cities/lviv/`, `/cities/ivano-frankivsk/`, `/routes/lviv-celle/`, `/routes/celle-lviv/`, `/routes/ivano-frankivsk-wolfsburg/`, `/routes/wolfsburg-ivano-frankivsk/`.

## 3. Сценарії, які оцінюють поведінку

- Правильні: canonical home/hub/candidate, backward direction, legacy redirect з повторним `tag`, percent-encoded query, static resources, RSC navigation.
- Негативні: random unknown/nested/provider, missing image/JS/Flight, untrusted Host, near-match legacy path, `Celje`/`Würzburg` aliases, same-country pair, passenger data in telemetry.
- Після релізу: новий HTML зі старою вкладкою/chunks; actual 404 не кешована як homepage; відкат попереднього комплекту та function/config.

Fixtures мають бути незалежними очікуваними відповідями, а не копією output реалізації. Redirect-map testing охоплює всі п’ять адрес; live evaluator read-only, bounded і без cookies/credentials або реальних contact sends. Помилка tool/network записується як unknown/error, не як правильний HTTP status.

## 4. Підсумковий звіт

Зберегти один dated evaluation report з ID, pass/fail/unknown, command/tool, artifact version, evidence path та залишковою дією/власником. Повний `npm run check` — local gate. Browser/export/function checks не є production proof. Усі blocking criteria для конкретного release scope мають бути pass на відповідному рівні; GSC та зрілі journeys можуть лишатися unknown без вигаданого успіху кампанії.
