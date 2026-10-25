---
type: Specification
title: "Community placements and GSC re-indexing package"
description: "Targeted Ukrainian/Lower Saxony distribution briefs, compliant UTM links, and GSC URL inspection sequence for Step 4."
tags: [uaroute, marketing, seo, distribution, utm, gsc]
---

# Community placements and GSC re-indexing package

Parent: [Marketing/SEO](index.md).
Contract: [Next acquisition increment — existing pages and passenger journey](priority-acquisition-increment-2026-10-24.md).

## 1. Overview and Operational Governance

This document records the Step 4 distribution package prepared according to Section 4 of [`priority-acquisition-increment-2026-10-24.md`](priority-acquisition-increment-2026-10-24.md). It defines three targeted community placement briefs, compliant UTM links from [`src/config/utm.ts`](../../../src/config/utm.ts), and the Google Search Console (GSC) re-indexing verification checklist following the Step 2 on-page deployment.

### Non-Negotiable Distribution Rules
1. **Manual Placement**: No automated posting, mass scraping, or bulk messaging. Placements are manually published by an authorized team member after verifying group audience rules.
2. **Mandatory Affiliation Disclosure**: Placements must clearly disclose UARoute affiliation as an independent passenger discovery atlas.
3. **Approved UTM Attribution**: Only approved `utm_source`, `utm_medium=social`, and `utm_campaign=route_launch` parameters from `src/config/utm.ts` may be used. No personal identifiers or group IDs may be appended.
4. **No Operational Guarantees**: Copy must preserve the M1 boundary: UARoute owns discovery; the carrier confirms feasibility, exact address pickup, schedule, and pricing upon private inquiry.

---

## 2. Community Placement Briefs

### Placement 1: Lviv Regional Catchment (Lviv & Surrounding Hromadas)
- **Target Audience**: Passengers traveling from Lviv Oblast (Zhovkva, Yavoriv, Zolochiv, Sambir) toward Lower Saxony / Hannover.
- **Approved Channels**: Verified Western Ukraine travel & expat Telegram/Facebook community groups.
- **Approved Canonical Link**:
  `https://uaroute.com/cities/lviv/?utm_source=telegram&utm_medium=social&utm_campaign=route_launch`
- **Reviewed Copy (Ukrainian)**:
  > **Плануєте поїздку зі Львова чи сусідніх містечок до Німеччини?**
  >
  > Якщо ви живете не в самому Львові, а поруч (Жовква, Яворів, Золочів, Самбір тощо), найзручніше орієнтуватися на львівський напрямок, а в приватному зверненні до перевізника назвати точний населений пункт і адресу виїзду.
  >
  > На UARoute (ми розвиваємо цей довідник пасажирських напрямків) зібрали практичні поради щодо доїзду, стиковки з потягами та орієнтирів прибуття в Ганновері й Целле:
  > 👉 https://uaroute.com/cities/lviv/?utm_source=telegram&utm_medium=social&utm_campaign=route_launch
  >
  > *Можливість посадки за адресою, ціну та наявність місць підтверджує перевізник безпосередньо у відповідь на запит.*

---

### Placement 2: Ivano-Frankivsk & Prikarpattya Regional Catchment
- **Target Audience**: Passengers from Ivano-Frankivsk and regional districts (Kolomyia, Tysmenytsia, Rohatyn, Bohorodchany) traveling to Wolfsburg / Lower Saxony.
- **Approved Channels**: Prikarpattya regional community and travel groups.
- **Approved Canonical Link**:
  `https://uaroute.com/cities/ivano-frankivsk/?utm_source=telegram&utm_medium=social&utm_campaign=route_launch`
- **Reviewed Copy (Ukrainian)**:
  > **До уваги тих, хто планує дорогу з Прикарпаття до Німеччини (Вольфсбург, Нижня Саксонія):**
  >
  > Якщо добираєтеся з Коломиї, Тисмениці, Рогатина чи Богородчан, не обов'язково одразу купувати квитки до самого Івано-Франківська — спершу узгодьте з перевізником фактичну адресу та можливість посадки по дорозі.
  >
  > Підготували корисний чеклист для виїзду, розрахунку багажу та зустрічі після повернення на UARoute:
  > 👉 https://uaroute.com/cities/ivano-frankivsk/?utm_source=telegram&utm_medium=social&utm_campaign=route_launch
  >
  > *(Матеріал підготовлено командою UARoute; поїздка та точні зупинки узгоджуються з перевізником напряму).*

---

### Placement 3: Lower Saxony Diaspora Return (Hannover, Celle, Wolfsburg)
- **Target Audience**: Ukrainians living in Lower Saxony returning or visiting Western Ukraine.
- **Approved Channels**: Ukrainian diaspora communities in Hannover, Celle, Wolfsburg, Braunschweig.
- **Approved Canonical Link**:
  `https://uaroute.com/routes/lviv-hannover/?utm_source=facebook&utm_medium=social&utm_campaign=route_launch`
- **Reviewed Copy (Ukrainian)**:
  > **Поїздки між Ганновером та Львовом: що варто узгодити заздалегідь**
  >
  > Якщо плануєте дорогу в Україну чи зустрічаєте рідних у Ганновері, врахуйте зручні орієнтири: автовокзал (ZOB), головний вокзал (Hbf) або точну адресу району.
  >
  > На UARoute (довіднику прямих рейсів і запитів до перевізників) оновили практичну інформацію про маршрут Львів — Ганновер, орієнтацію на місці та поради щодо багажу:
  > 👉 https://uaroute.com/routes/lviv-hannover/?utm_source=facebook&utm_medium=social&utm_campaign=route_launch

---

## 3. Google Search Console Re-Indexing Submission Sequence

Following production deployment to CloudFront/S3, submit the following priority pages via **GSC → URL Inspection → Request Indexing**:

| URL | Priority | Primary Diagnostic Goal |
|---|---|---|
| `https://uaroute.com/routes/lviv-celle/` | High | Clear *"Discovered – currently not indexed"* state with differentiated copy and Hannover cross-links. |
| `https://uaroute.com/routes/lviv-hannover/` | High | Re-crawl newly added verified Hannover ZOB/Hbf mobility guidance for AI Overview snippet extraction. |
| `https://uaroute.com/cities/lviv/` | Medium | Ingest the 4 source-backed regional catchment entries (Жовква, Яворів, Золочів, Самбір). |
| `https://uaroute.com/cities/ivano-frankivsk/` | Medium | Ingest the 4 source-backed regional catchment entries (Коломия, Тисмениця, Рогатин, Богородчани). |
| `https://uaroute.com/guides/perevezennya-velosypeda/` | Medium | Index newly de-orphaned guide now linked bidirectionally across all 4 city hubs. |

---

## 4. Placement & Acquisition Log (Template)

| Date | Destination URL | Channel / Group | Exposure / Views | Consented Visits | Handoff Clicks | Operator Inquiries |
|---|---|---|---|---|---|---|
| *YYYY-MM-DD* | `/cities/lviv/?...` | Telegram: *group_name* | *TBD* | *GA4 sessions* | *Inquiry clicks* | *Privately verified* |
| *YYYY-MM-DD* | `/cities/ivano-frankivsk/?...` | Telegram: *group_name* | *TBD* | *GA4 sessions* | *Inquiry clicks* | *Privately verified* |
| *YYYY-MM-DD* | `/routes/lviv-hannover/?...` | Facebook: *group_name* | *TBD* | *GA4 sessions* | *Inquiry clicks* | *Privately verified* |
