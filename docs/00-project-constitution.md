---
type: "Strategy"
title: "UARoute — Project Constitution"
description: "Product authority, truthful service boundaries, privacy and approved development gates."
tags: ["uaroute", "governance"]
---

# UARoute — Project Constitution

**Document:** `00-project-constitution.md`  
**Status:** Approved M1 baseline; gated M2 booking direction approved 2026-10-01; demand attribution and paid acquisition infrastructure actualized 2026-10-17
**Product:** UARoute  
**Domain:** https://uaroute.com/  
**Primary language:** Ukrainian  
**Current commercial partner:** Koval / 4K Koval — https://www.4k-koval.com/

**Scope decision (2026-10-01):** The owner approved UARoute itself evolving through a gated operator booking pilot. [ADR 0002](Decisions/0002-gated-operator-booking-pilot.md) and §39 explicitly extend the future product boundary. M1 discovery/inquiry remains the current implementation; booking APIs, enrolled inventory, and driver accounts are not released. M1-specific no-backend/no-storage rules do not prohibit the approved M2 pilot, and M2 approval does not permit fake availability or an unverified launch.

---

## 1. Purpose of this document

This document defines the non-negotiable principles for the UARoute product.

It is the highest-level product and design reference for AI agents, developers, designers, content authors, and future contributors.

Before changing product behavior, architecture, UX, visual design, content rules, SEO, analytics, or the Koval conversion flow, contributors must read this document and the relevant detailed document under `docs/`.

This document should remain relatively stable. Detailed implementation decisions belong in the other project documents and Architecture Decision Records.

**Implementation snapshot (2026-09-11):** the owned M1 app is Next.js 16 App Router with static export ([ADR 0001](Decisions/0001-nextjs-static-export.md)). One commercial route (`lviv-hannover`); Hamburg and Berlin stay editorial. At that date, production uaroute.com was documented as the legacy CRA catalog pending cutover. Current production status is unverified; see the [DEV-01 release-state check](knowledge-base.md#knowledge-base) (KB: `wiki/Marketing/12-first-income-development-backlog.md`) for the current evidence register. Canonical maps: [README.md](../README.md) (humans), [AGENTS.md](../AGENTS.md) (coding agents).

---

# 2. What UARoute is

UARoute is a **route-discovery and practical travel-information platform for journeys from Ukraine to Europe**.

Its primary purpose is to help a traveler:

1. discover a relevant route;
2. understand what is known and what should be confirmed;
3. decide what to do next;
4. start a qualified transport inquiry with the relevant carrier.

The first commercial partner is Koval.

The initial product is intentionally focused on **passenger route discovery and inquiry generation**. Parcel information is secondary in Milestone 1 and should not be mixed into the passenger booking flow.

---

# 3. Core product principle

> **UARoute owns discovery and travel intent. Koval owns the transport transaction.**

This distinction must remain visible in the architecture, UX, copy, analytics, and future business model.

UARoute is not the carrier.

In M1, UARoute does not confirm seats. In the gated M2 pilot (§39), it may confirm only a seat reservation committed against verified operator inventory; the operator remains responsible for service facts and transport fulfillment.

UARoute does not operate vehicles.

UARoute does not independently guarantee schedules, prices, availability, pickup locations, or other operational conditions unless verified and explicitly supported by source data.

Koval is responsible for confirming and fulfilling the actual transport inquiry.

---

# 4. The core business hypothesis

The central hypothesis is:

> **Can UARoute attract route-intent traffic from search and other channels, turn that traffic into useful route discovery, and convert part of the intent into measurable Koval WhatsApp inquiries?**

The intended funnel is:

```text
Search / Social / Direct
        ↓
      UARoute
        ↓
Route discovery
        ↓
Useful route information
        ↓
Travel intent
        ↓
Date + phone + passengers
        ↓
WhatsApp inquiry
        ↓
      Koval
        ↓
Human dispatcher / sales process
        ↓
Actual booking
```

The primary future business KPI is:

> **UARoute-generated Koval bookings per month**

However, UARoute cannot independently know confirmed bookings or revenue in Milestone 1. Those downstream metrics require cooperation from Koval.

---

# 5. Product positioning

UARoute should be perceived as:

- a modern route explorer;
- a practical travel guide;
- a digital European route atlas;
- a destination discovery product;
- eventually, potentially, a transport lead-generation / marketplace platform.

The intended product feeling is:

> **A digital atlas of journeys from Ukraine to Europe.**

UARoute should NOT be perceived as:

- a generic SEO blog;
- a traditional bus-company website;
- a Koval clone;
- a generic travel-agency landing page;
- a SaaS dashboard;
- an AI-generated transport directory;
- a fake timetable or booking engine.

---

# 6. Initial commercial relationship with Koval

Koval is the initial preferred transport partner for UARoute.

Reference site:

https://www.4k-koval.com/

UARoute should use Koval as the first commercial conversion destination while preserving an independent product identity and a carrier-agnostic architecture.

**Owner correction — 2026-10-20:** Public presentation is carrier-neutral. Use Ukrainian «перевізник», without the surname/brand «Коваль», in visible copy, metadata, structured data and inquiry messages. This supersedes older public naming examples; internal historical partner records may retain actual names. Preserve existing carrier/desk IDs, contact destinations, event names, source URLs and referral contracts. Neutral wording does not assert that additional carriers are connected or change who receives current inquiries.

The UI should make the handoff explicit:

> **Перевезення виконує перевізник; UARoute допомагає знайти маршрут та підготувати запит.**

Do not claim a formal endorsement or exclusive partnership unless that relationship has actually been established.

Avoid unsupported promotional claims such as:

- “best”;
- “safest”;
- “cheapest”;
- “No. 1”;
- “guaranteed”;
- “official”.

Use factual, attributable claims only.

---

# 7. Route-first product philosophy

The fundamental UARoute object is:

> **Origin → Destination**

The route is more important than the homepage.

The primary user journey should be:

> **Discover → choose route → understand route → decide to inquire → contact carrier**

The route page should answer:

- What is this route?
- Who operates it?
- What is actually known?
- What is not publicly confirmed?
- What should I ask the carrier?
- How do I contact the carrier?

The product should not force users through unnecessary pages before they can start a useful inquiry.

---

# 8. Truthfulness is a product requirement

UARoute must be **more conservative than unsupported transport marketing**.

Never invent transport information merely to make a page look complete.

Unless explicitly verified and sourced, do not present:

- passenger prices;
- trip duration;
- timetable;
- departure times;
- exact stop sequence;
- operational distance presented as trip distance;
- real-time availability;
- seat availability;
- ratings;
- reviews;
- guarantees;
- unsupported pickup/drop-off claims.

If information is unknown:

- omit it;
- state that it should be confirmed;
- or present the uncertainty honestly.

A page with less information is preferable to a page containing plausible but unverified information.

---

# 9. Data provenance

Important claims about a carrier should be traceable to their source.

Where a Koval claim is rendered in the UI, support it through a provenance structure such as:

```text
Claim
- text
- sourceUrl
- lastVerifiedAt
```

Claims can include factual service statements when supported by the Koval source, for example:

- direct transport;
- two professional drivers;
- booking without prepayment;
- passenger transport;
- address delivery in Germany.

Do not transform an operationally limited statement into a stronger commercial claim.

---

# 10. Commercial route vs editorial destination

These are different concepts.

### Commercial route

A route that UARoute is willing to present as a transport-inquiry path for the current carrier configuration.

### Editorial destination

A destination that UARoute may discuss or reference, but which is not necessarily confirmed as a currently bookable route.

Do not convert every city mentioned in a source, gallery, datalist, or article into a commercial route.

Only commercial routes belong in the primary route index and sitemap.

The owner-approved demand POC (§40) permits a bounded set of explicitly selected candidate inquiry pages within commercial discovery. Their `serviceMode: "candidate_inquiry"` is separate from operational service verification: Koval must first confirm whether the city pair and direction can be served. Editorial pages remain excluded. Neither classification provides live availability.

---

# 11. Carrier architecture

UARoute must remain carrier-agnostic at the data-model level even though Koval is the only visible carrier in Milestone 1.

Maintain a relationship such as:

```text
Route
 ├── Koval
 ├── Carrier B (future)
 └── Carrier C (future)
```

Keep `carrierIds[]` or an equivalent relationship in the route model.

Do not build multi-carrier comparison or marketplace UI in Milestone 1.

Do not hard-code Koval into generic route components.

---

# 12. Koval transaction principle

The current Koval customer flow uses WhatsApp as the practical transaction channel.

In M1, UARoute complements that flow. The approved M2 pilot adds a separate reservation path only for explicitly enrolled departures after the operator and technical release gates pass; non-enrolled routes retain inquiry mode.

The UARoute inquiry flow should collect the minimum useful information needed to improve the handoff:

### Required

- travel date;
- phone number.

### Additional

- passengers, default 1, range 1–8.

Origin and destination come from the route page and should not be unnecessarily re-entered.

The phone number is passed to Koval through the user-initiated WhatsApp message and is not stored by UARoute in Milestone 1.

---

# 13. Booking language

Opening WhatsApp is **not a confirmed booking**.

Preferred primary CTA:

> **Уточнити поїздку в WhatsApp**

or, where context makes it clearer:

> **Уточнити поїздку в WhatsApp**

Avoid presenting the action as a guaranteed booking.

The interface may refer to the component as an inquiry or booking-intent widget, but the user-facing copy must not imply a confirmed seat.

Required transparency:

> **Ви будете перенаправлені у WhatsApp до перевізника Коваль для уточнення поїздки.**

---

# 14. WhatsApp desk routing

Do not use one universal Koval WhatsApp number.

Current known desk configuration:

### Germany / default desk

Ivan  
`+38 050 978 63 30`  
`https://wa.me/380509786330`

### Austria / Liechtenstein

Mykola  
`+380 63 079 2000`  
`https://wa.me/380630792000`

Routes must reference a `deskId` or equivalent data relationship.

Do not infer the desk from UI text.

If a route has no verified desk, fall back to the Koval website rather than generating a broken WhatsApp URL.

---

# 15. WhatsApp attribution

The WhatsApp message should contain useful human-readable attribution.

A typical message structure is:

```text
Добрий день! Хочу уточнити поїздку (заявка, не підтверджене бронювання).

Маршрут: Львів → Ганновер
Дата: 18.09.2026
Пасажирів: 2
Телефон: +38 096 123 45 67

Джерело: UARoute
Сторінка: https://uaroute.com/routes/lviv-hannover
Код: UR-8F3K
```

Use an opaque lead code such as `UR-8F3K` for future reconciliation.

The code is ephemeral in Milestone 1. Do not create a Lead database.

Do not put UTM parameters in the WhatsApp message.

---

# 16. Privacy principle

Milestone 1 is privacy-minimal.

No database.

No backend storing personal leads.

Do not store:

- phone numbers;
- names;
- emails;
- travel dates;
- passenger identities;
- other unnecessary personal information.

Do not put phone numbers into URLs.

Do not create a lead database merely “for later”.

Future attribution should rely on opaque identifiers and cooperation from Koval, not unnecessary storage of personal information.

---

# 17. SEO principle

UARoute is intended to be an organic acquisition product.

SEO is therefore part of the product architecture, not a marketing afterthought.

Important route pages must be genuinely crawlable HTML pages.

For the current architecture ([ADR 0001](Decisions/0001-nextjs-static-export.md)):

- use Next.js App Router with static export;
- prerender pages at build time;
- deploy static output to S3/CloudFront;
- verify raw HTML;
- use absolute canonical URLs;
- generate the sitemap from actual routes/pages.

A route page must not depend on client-side JavaScript to expose its fundamental content to search engines.

---

# 18. SEO content quality rule

Do not create large volumes of thin programmatic pages.

A route page should exist only if it has enough unique information to be useful.

Aliases are for search/autocomplete UX, not separate SEO URLs.

Every indexed route page should have:

- unique title;
- unique description;
- one H1;
- useful route content;
- breadcrumbs;
- internal links;
- appropriate structured data only where supported by visible content.

Never invent `Offer`, `BusTrip`, price, schedule, or availability schema.

---

# 19. Visual identity

The approved creative direction is:

> **Editorial European Route Atlas**

UARoute should look like a sophisticated digital atlas/travel publication with a modern wayfinding system.

It should feel:

- editorial;
- geographic;
- premium;
- modern;
- human;
- Ukrainian;
- confident;
- practical.

The core visual metaphor is:

> **Every journey is a line connecting two places.**

The route line is therefore part of UARoute's brand language, not merely a decorative UI element.

---

# 20. Visual design rules

The visual system should use:

- strong Cyrillic typography;
- warm editorial backgrounds;
- deep ink/navy text;
- sophisticated blue accents;
- rare yellow signal accents;
- route lines;
- waypoints;
- geographic contours;
- editorial metadata;
- real travel/transport photography where available;
- restrained geographic patterns.

The design must NOT become:

- card-heavy SaaS;
- generic travel agency;
- bus-company visual identity;
- purple-gradient startup UI;
- glassmorphism;
- emoji-driven design;
- random illustration collection.

Use cards only where a card has a real functional reason to exist.

---

# 21. Typography principle

Typography is a primary brand component.

The current preferred direction is:

### Display / editorial
Instrument Serif or a comparable strong Cyrillic-capable editorial serif.

### UI / body
Work Sans or a comparable highly readable Cyrillic-capable sans-serif.

The exact final fonts are a design-system decision, but all typography must be tested using actual Ukrainian copy before approval.

Optional technical metadata may use a mono font sparingly.

---

# 22. Graphic language

The site should be visually enriched through a constrained graphic system.

Primary primitives:

- route lines;
- waypoints;
- route capsules;
- geographic contour forms;
- atlas patterns;
- editorial route dividers;
- coordinate/metadata treatments;
- simple monoline travel icons.

Graphics must communicate:

> route / movement / geography / wayfinding.

Do not add decoration simply to make a page look busy.

---

# 23. Photography principle

Prefer authentic photography over generic decorative imagery.

Useful sources include:

- real Koval vehicles;
- real Koval interiors;
- genuine destinations;
- European roads and arrival environments;
- recognizable city landmarks.

Do not create fake AI images to represent Koval's actual vehicles, operations, or service.

Photography should support UARoute's route-atlas identity rather than turn the site into a gallery.

---

# 24. Mobile-first principle

Mobile is a first-class experience.

The most important mobile priorities are:

1. route discovery;
2. useful answer;
3. inquiry action;
4. WhatsApp;
5. navigation.

A mobile sticky CTA may be used after the main inquiry widget is passed.

It must:

- respect safe areas;
- not obstruct focused fields;
- yield to the keyboard;
- trigger the same inquiry flow as the main CTA;
- not create a second conversion system.

---

# 25. Accessibility

Accessibility is part of product quality.

Use:

- semantic HTML;
- proper labels;
- keyboard-accessible search/autocomplete;
- visible focus states;
- sufficient contrast;
- accessible date input;
- accessible buttons;
- appropriate ARIA only where necessary.

Decorative graphics must not create accessibility noise.

Animations must respect `prefers-reduced-motion`.

---

# 26. Performance

UARoute should remain lightweight.

Prefer:

- prerendered HTML;
- optimized real images;
- SVG for simple graphics;
- minimal client JavaScript;
- no unnecessary map SDK;
- lazy loading for non-critical assets;
- reusable CSS/design tokens.

Do not introduce heavy dependencies merely for decorative effects.

---

# 27. Analytics principle

Analytics must measure the acquisition funnel rather than vanity metrics.

Core Milestone 1 events:

- `route_search_completed`
- `route_view`
- `booking_intent`
- `whatsapp_click`
- `koval_site_click`
- optionally `related_route_click`

Common context should include, where relevant:

- source;
- medium;
- campaign;
- landingPage;
- routeSlug;
- origin;
- destination;
- destinationCountry;
- passengerCount;
- ctaLocation;
- conversionType;
- leadId;
- deskId.

Do not include a travel date, phone number, name, or WhatsApp message in analytics. A travel date may be held transiently to validate the inquiry and prepare the user's immediate WhatsApp message; do not persist it in UARoute or browser storage.

`conversionType` values include:

- `whatsapp_inquiry`
- `koval_site`

Do not call an event “booking” unless an actual booking confirmation is received from Koval.

---

# 28. Attribution principle

Every important commercial interaction must be attributable to:

- route;
- page;
- CTA location;
- source/medium/campaign where available;
- Koval desk;
- opaque lead code where relevant.

Koval site links should carry UTM parameters.

WhatsApp attribution should use the human-readable page URL and lead code rather than inserting UTM parameters into the message.

---

# 29. Commercial evolution

The initial relationship is simple:

> UARoute generates inquiries for Koval.

Potential future monetization models include:

1. cost per qualified lead;
2. cost per completed booking;
3. fixed monthly partnership;
4. hybrid fixed + performance;
5. sponsored route placement;
6. preferred/exclusive corridor partnership;
7. eventual multi-carrier marketplace.

These are future options, not Milestone 1 requirements.

Do not sacrifice trust or independent product identity for short-term monetization.

---

# 30. Marketplace principle

Do not build a marketplace in Milestone 1.

However, do not architect UARoute as if Koval will permanently be the only carrier.

The future model may become:

```text
Route
 ├── Koval
 ├── Carrier B
 └── Carrier C
```

UARoute should own the discovery layer and potentially monetize access to demand.

The first partner is a validation mechanism, not the definition of the product.

---

# 31. Legacy UARoute migration principle

At the 2026-09-11 implementation snapshot, `uaroute.com` was documented as running the legacy application. Its current deployment status is unverified; use the legacy application as a historical source for migration review, not as evidence of what is presently live. See the [DEV-01 release-state check](knowledge-base.md#knowledge-base) (KB: `wiki/Marketing/12-first-income-development-backlog.md`) for current deployment evidence.

It may contain useful:

- domains and URLs;
- city data;
- carrier data;
- route candidates;
- aliases;
- assets.

It also contains data and UX that may no longer be trustworthy or aligned with the new strategy.

Legacy information must therefore be classified as:

- **Keep**
- **Transform**
- **Redirect**
- **Delete**

Never migrate legacy data blindly.

Legacy unsupported values such as ratings or prices must not survive merely because they already exist.

---

# 32. Existing-domain cutover principle

UARoute is an existing public domain, not a blank project.

Before production cutover:

1. inspect existing public/indexed URLs;
2. identify URLs worth preserving;
3. define redirects where needed;
4. remove obsolete pages intentionally;
5. update sitemap;
6. verify canonical URLs;
7. verify internal links;
8. verify that no high-value existing URL becomes an accidental 404.

Do not assume that replacing the frontend automatically handles SEO migration.

---

# 33. Scope discipline

For Milestone 1, do NOT build:

- payments;
- user accounts;
- login;
- real-time availability;
- full booking engine;
- database;
- CMS;
- admin dashboard;
- multi-carrier comparison UI;
- AI chatbot;
- map platform;
- full parcel workflow;
- large city-page system;
- large article CMS.

The MVP should prove the conversion hypothesis before the platform becomes more complex.

---

# 34. Quality bar

Every implementation decision should be evaluated against five questions:

### 1. Is it useful to the traveler?

### 2. Is it truthful and sourceable?

### 3. Does it improve discovery or conversion?

### 4. Is it measurable where commercially relevant?

### 5. Does it preserve UARoute's independent future value?

If a feature fails these tests, reconsider it before implementing.

---

# 35. Definition of success for Milestone 1

Milestone 1 is successful when:

- UARoute has a coherent route-discovery identity;
- the existing carrier catalog has been intentionally replaced;
- a user can search for a route;
- a real route page provides useful, truthful information;
- the user can enter date, phone, and passengers;
- the route automatically provides origin/destination;
- the correct Koval WhatsApp desk is selected;
- the generated inquiry is complete and clearly not a confirmed booking;
- an opaque lead code is generated;
- analytics captures the inquiry funnel;
- Koval website referrals are attributable;
- route pages are prerendered, crawlable HTML;
- unsupported operational data is absent;
- mobile and accessibility requirements are met.

The milestone does NOT need to prove confirmed bookings or revenue without Koval cooperation.

---

# 36. How project documents should be used

Use this document as the highest-level constitution.

Then consult the relevant detailed document:

```text
00-project-constitution.md
        ↓
01-product-strategy.md
02-prd-milestone-1.md
03-ux-and-information-architecture.md
04-visual-design-system.md
05-content-and-seo-strategy.md
06-data-model-and-content-governance.md
07-koval-integration-and-conversion.md
08-analytics-and-attribution.md
09-technical-architecture.md
10-cutover-and-seo-migration.md
```

The [knowledge map](README.md) is the navigation entry point. Booking execution contracts, experiments and release procedures belong under `docs/Product/Booking/`; they implement the approved M2 direction without certifying live capability.

Research belongs under `docs/Operations/Research/`.

Historical architectural decisions belong under `docs/Decisions/`.

Detailed documents may evolve more frequently than this constitution, but must not contradict it without an explicit Architecture Decision Record or product decision.

---

# 37. Rules for AI agents

AI agents working on UARoute must:

1. read this document before proposing material product changes;
2. read the relevant detailed document before changing that domain;
3. treat verified source data as more authoritative than assumptions;
4. never invent transport facts;
5. preserve the distinction between UARoute and Koval;
6. preserve privacy-minimal architecture in Milestone 1;
7. prefer reusable data-driven components;
8. avoid adding features outside the agreed milestone without approval;
9. surface uncertainty rather than filling gaps with plausible content;
10. explain material conflicts with existing decisions before changing them.

When a source does not support a proposed claim, the default action is:

> **do not claim it**

When requirements conflict, prioritize:

1. factual integrity;
2. user trust;
3. core conversion flow;
4. SEO integrity;
5. maintainability;
6. visual polish;
7. optional functionality.

---

# 38. North-star statement

> **UARoute is a digital atlas of journeys from Ukraine to Europe: it helps people find the right route, understand what is known, know what to ask, and connect with the right transport provider.**

For the current M1 inquiry phase:

> **UARoute generates intent. Koval converts and fulfils it.**

That relationship should remain clear in every important product decision.


# 39. Approved gated operator booking pilot (M2)

Decision date: **2026-10-01**, authorized by the product owner. UARoute remains the discovery product and may become the reservation interface for one verified operator/corridor with 2–3 drivers. Koval participation is unverified. This changes the future discovery-only boundary explicitly, not the meaning of existing WhatsApp inquiries.

- Frontend: Next.js static export on S3 + CloudFront. Live operations: API Gateway + Lambda. Introduce DynamoDB before real reservations for shared atomic inventory; Cognito for provisioned driver/operator identities. No interim Express/SQLite hosting or planned Postgres/SSR migration.
- Pilot: eight verified passenger seats/trip; guests reserve 1–3, drivers enter 1–8 subject to capacity. No payments, cargo, dynamic routing, or broad marketplace. This is not a claim about Koval's current vehicles or schedules.
- Operator enrollment, commercial catalog eligibility, and live trip eligibility are distinct. Booking is disabled until verified trip facts, operator agreement, authoritative phone/online inventory, privacy terms, retention/deletion, authorization, idempotency, cancellation, cutoff/DST, recovery, and support gates pass.
- M1 form data stays transient. M2 may privately store passenger name/phone and necessary booking metadata for an enrolled reservation under a defined deletion policy. No personal data, selected dates, receipt credentials, or messages in analytics, public URLs, logs, static output, or the repository.
- UARoute confirms only a successful committed reservation; an inquiry, link click, unavailable API, or ambiguous timeout cannot confirm a seat. The operator owns transport execution, operational facts, and customer support.
- Preserve Ukrainian UI, atlas identity, source-grounded content, commercial-only discovery, editorial noindex, and the current inquiry fallback for non-enrolled routes.
- Baseline and pilot evidence must distinguish realized occupancy, total administration/support time, self-booking, and cash collected. Continue only with measurable economic improvement and willingness to pay; no automatic feature expansion.

[ADR 0002](Decisions/0002-gated-operator-booking-pilot.md) controls architecture; [development strategy](knowledge-base.md#knowledge-base) (KB: `wiki/Product/13-booking-pilot-development-strategy.md`) controls roadmap and stop/pivot rules; [site details](knowledge-base.md#knowledge-base) (KB: `wiki/Product/14-booking-pilot-site-details.md`) controls future pages and states. These documents certify direction only.

# 40. Owner-approved demand POC (2026-10-06)

The product owner's autonomous POC instruction makes completed passenger journeys attributable to UARoute the immediate outcome. The test covers travel to and from Schwerin, Lüneburg, Lübeck, Celle, Wolfsburg, and Braunschweig, with fourteen candidate Ukrainian pickup cities recorded in the [operator conversation note](knowledge-base.md#knowledge-base) (KB: `wiki/Marketing/Research/koval-demand-pilot-2026-10-06.md`). UARoute operates within the owner's Polish JDG; Crew Bravo is its business brand/site, not a separate legal person. Publish only sourced business identity facts.

- The initial published implementation is a bounded six-page candidate inquiry slice: Dolyna ↔ Celle, Wolfsburg, and Braunschweig. This agent-selected slice used the reported carrier base/corridor context; it is not evidence of higher demand or verification that Koval operates each direction. Record inquiry eligibility separately from operational verification in the route matrix and runtime data with `serviceMode: "candidate_inquiry"`. Keep `commercial` as published inquiry eligibility and preserve commercial-only search, index, and sitemap.
- Owner correction later on 2026-10-06: prioritize **Lviv and Ivano-Frankivsk** for acquisition across the six German pilot cities; Dolyna remains secondary. Make all six destinations discoverable in both directions, without automatically publishing every city pair. Useful origin/destination overview pages and deliberately selected pair pages may extend the initial slice under the same content and honesty gates. The [routes SEO/marketing review](knowledge-base.md#knowledge-base) (KB: `wiki/Marketing/Research/routes-seo-marketing-review-2026-10-06.md`) records the architectural proposal and acceptance checks; the owner approved execution with “GO!”. The bounded next selection is two Ukrainian city hubs and Lviv ↔ Celle / Ivano-Frankivsk ↔ Wolfsburg candidate pages, with selection rationale in the matrix and implementation/publication evidence in [POC status](knowledge-base.md#knowledge-base) (KB: `wiki/Operations/POC/poc-status.md`). Improve discovery while gathering operator outcomes; missing outcome data does not require preserving a known acquisition mismatch.
- Candidate copy must state that the operator first confirms feasibility, pickup/drop-off, date, price, and seats by direct contact. Do not assert an operating route, confirmed service, scheduled stop, direct transport, address delivery, timetable, fare, or available capacity. Suppress generic operational carrier claims on these pages. Each page needs useful city-specific and direction-specific content before indexing; city-name substitution alone is insufficient.
- Other candidate combinations may offer a labelled possibility inquiry without pretending a route exists or generating extra SEO URLs. Search aliases cover Ukrainian, Russian, German, Polish, and English spellings; UI and page content remain Ukrainian.
- Keep the transient user-initiated WhatsApp flow. An inquiry code links operator-reported outcomes where possible; no lead database, roster, payment, commission, or automated reservation is required. Preserve UARoute source through tagged Koval referrals without relabelling Koval's own traffic. Never put passenger contact details or selected dates into referral URLs or analytics.
- Measure received inquiries, confirmed passengers, and completed passenger journeys separately. Production deployment, message delivery, indexing, and travelled passengers need their own observed evidence. Attribution alone does not prove an increase over existing demand.
- Commercial pricing is deliberately deferred until demand value is demonstrated. This POC takes priority over the earlier first-income plan; M2 reservation work remains gated under ADR 0002 and is not a prerequisite.
 
# 41. Demand validation, paid acquisition infrastructure and attribution (2026-10-17)

Following the production deployment of Google Ads auto-tagging attribution (PR #17, commit `0b00148`), the project's development strategy is actualized around controlled demand validation, attribution integrity, and gated scaling:

1. **Production Advertiser & MCC Infrastructure**:
   - Production account **UARoute (`525-602-4115`)** is activated and linked under MCC **Crew Bravo (`127-345-5194`)** (`manager_link_id: 6682389034`, status: `ACTIVE`). Currency is PLN, timezone Europe/Warsaw, billing setup approved.
   - Tagging destination is consolidated into the live production GA4 tag `G-PMXHF9YT7V` without code changes. Enhanced Conversions remain strictly disabled to uphold M1 zero-PII non-negotiables.
   - Live spend is currently observed at **0.00 PLN** with 0 active campaigns; any future activation requires explicit owner launch authorization and campaigns default to `PAUSED`.

2. **Gated Micro-Budget Experiment**:
   - Authorized pilot: **5 PLN/day for three days** (with an approximate ~15 PLN total planning estimate subject to standard Google daily delivery rules; the daily limit is strictly 5 PLN/day and cannot be increased without authorization) on priority corridors (Lviv ➔ Celle `/routes/lviv-celle/`, Ivano-Frankivsk ➔ Wolfsburg `/routes/ivano-frankivsk-wolfsburg/`).
   - Strategy: Manual CPC (1.50 PLN). Client-side telemetry isolates `gclid` to initial consented landing view; outbound WhatsApp and partner referral links strictly strip click IDs. Intercepted browser tests confirmed outgoing client payloads only; they did **not** confirm server-side receipt, ingestion, or conversion attribution by Google.
   - Conversion/link configuration is mutable operational state. Use the [checked state register](Operations/Agentic/Operational/state-register.md) for dated resource-specific observations and evidence limits; re-read before a dependent action. The October 18 snapshot is historical: its MANY_PER_CLICK/no-fixed-value state was changed and independently read back on October 22. Do not treat imported GA4 counting as immutable merely because one API path cannot edit it. Configured conversions do not prove real Google ingestion or operator receipt.

3. **Strategic Development Roadmap (M1 ➔ M2)**:
   - **Phase 1 — Acquisition & Intent Validation (Active)**: Improve existing discovery/contact journeys and organic acquisition under §42; test permission-based distribution and, separately, the gated micro-paid experiment. Quantify travel intent through the existing carrier handoff; technical desk IDs (`koval-de`, `koval-at`) remain unchanged.
   - **Phase 2 — Partner Economics & Qualification Loop (Near-term)**: Formalize operator feedback loop with carrier «Коваль» regarding trip feasibility confirmation rates and passenger volume.
   - **Phase 3 — Gated Operator Booking Pilot (M2 Horizon — [ADR 0002](Decisions/0002-gated-operator-booking-pilot.md))**: Reservation APIs and driver management remain gated until real-world demand and operator-model stability (flexible corridor vehicle redistribution vs seat reservation) are proven.

# 42. Existing-page acquisition and conversion priority (2026-10-24)

Owner instruction: actualize development sequencing from the SEO/marketing learnings. This section sets the next M1 development priority; it does not authorize a release, outreach, account changes or advertising activation.

- **First development package:** complete the already reviewed passenger discovery/contact remediation, preserving current work and its acceptance criteria. In parallel, finish a bounded seven-URL indexing register before choosing per-page SEO changes. Do not build a second conversion redesign or hold useful organic work behind the Ads setup blocker.
- **Next content package:** improve the existing Lviv–Hannover page as the observed-search lane, and strengthen the Lviv/Ivano-Frankivsk hubs plus the four approved Lviv ↔ Celle / Ivano-Frankivsk ↔ Wolfsburg inquiry pages. Preserve URLs, eligibility and source-backed useful content. Better relevance, indexing and external visits take priority over producing more pages. Hannover visibility does not authorize a reverse page or expansion of the candidate matrix.
- **Distribution:** prepare a small experiment of three relevant, permission-based community placements. Publishing and contacting third parties require their own authorized scope. Use existing acquisition enums; preserve the separate carrier referral touch. No purchased links, bulk outreach, passenger database or new tracking system is required.
- **Public presentation:** Ukrainian copy uses neutral «перевізник», without carrier surnames or branding, following the owner's 2026-10-20 decision. Existing technical IDs, contacts and referral URLs remain. Do not imply multiple connected carriers. This wording supersedes older named-carrier public-copy examples; it does not alter historical provenance.
- **Learning and gates:** distinguish indexed eligibility, search appearances/clicks, consented visits, attempted handoffs, received carrier inquiries and completed journeys. Review weekly; use a four-week initial experiment window after an approved release, allowing longer organic observation when crawling/exposure is insufficient. Do not interpret the tiny baseline or QA-contaminated events as a proven acquisition channel, ROI or a guaranteed uplift.
- **Paid and M2:** paid launch remains separate, with exactly 5 PLN/day for three days and Manual CPC 1.50 PLN. Do not launch an unfinished draft with substitute bidding. M2 remains gated under ADR 0002; more pages, paid spend or booking infrastructure are not prerequisites for improving the current discovery product.

The [next acquisition increment](Marketing/SEO/priority-acquisition-increment-2026-10-24.md) defines the bounded work order and acceptance criteria, alongside the [existing passenger remediation plan](Product/passenger-review-remediation-plan-2026-10-24.md). Detailed dated research/evidence remains separate from these canonical requirements.

# 43. Agent continuity and verification development (2026-10-24)

Maintain a lightweight, resource-scoped agent setup that preserves verified results across sessions. The [checked state register](Operations/Agentic/Operational/state-register.md) is the entry point for dated operational observations, evidence provenance, blockers and next-task scope. It does not replace fresh provider reads, owner authorization or deployment evidence. Requirements belong in canonical contracts; mutable settings belong in the register; dated research/history belongs in the configured Project KB.

The initial local increment is implemented: portable register, structural checker, negative tests, documentation-check integration and working-agreement guidance. This establishes a validated record format, not automatic live verification. The [continuation backlog](Operations/Agentic/Operational/setup-continuation.md) distinguishes what remains: sanitized evidence capture at observation time, narrow capability preflight, saved-state browser recovery, producer/receiver compatibility checking, durable historical filing and measured evaluation on subsequent tasks.

Keep this supporting work proportional. Complete the passenger remediation and acquisition sequence in §42 first; adopt the evidence/checkpoint practices during that work. Add automation only for repeated, observed failure modes. Do not introduce a new agent framework, expand credentials, buy connectors, publish another repository or activate advertising as an incidental setup repair. Each future implementation retains its own resource scope, acceptance checks and existing authorization boundaries.
