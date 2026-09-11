# UARoute — Project Constitution

**Document:** `00-project-constitution.md`  
**Status:** Approved baseline  
**Product:** UARoute  
**Domain:** https://uaroute.com/  
**Primary language:** Ukrainian  
**Current commercial partner:** Koval / 4K Koval — https://www.4k-koval.com/

---

## 1. Purpose of this document

This document defines the non-negotiable principles for the UARoute product.

It is the highest-level product and design reference for AI agents, developers, designers, content authors, and future contributors.

Before changing product behavior, architecture, UX, visual design, content rules, SEO, analytics, or the Koval conversion flow, contributors must read this document and the relevant detailed document under `docs/`.

This document should remain relatively stable. Detailed implementation decisions belong in the other project documents and Architecture Decision Records.

**Implementation snapshot (2026-09-11):** the owned M1 app is Next.js 16 App Router with static export ([ADR 0001](decisions/0001-nextjs-static-export.md)). One commercial route (`lviv-hannover`); Hamburg and Berlin stay editorial. Production uaroute.com is still the legacy CRA catalog until cutover. Canonical maps: [README.md](../README.md) (humans), [AGENTS.md](../AGENTS.md) (coding agents).

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

UARoute does not confirm seats.

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

The UI should make the handoff explicit:

> **Перевезення виконує Koval; UARoute допомагає знайти маршрут та підготувати запит.**

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

UARoute should complement that flow, not replace it with a speculative booking engine.

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

> **Написати Koval у WhatsApp**

or, where context makes it clearer:

> **Уточнити поїздку в WhatsApp**

Avoid presenting the action as a guaranteed booking.

The interface may refer to the component as an inquiry or booking-intent widget, but the user-facing copy must not imply a confirmed seat.

Required transparency:

> **Ви будете перенаправлені у WhatsApp до Koval для уточнення поїздки.**

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
- travel dates tied to personal identity;
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

For the current architecture ([ADR 0001](decisions/0001-nextjs-static-export.md)):

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
- travelDate;
- passengerCount;
- ctaLocation;
- conversionType;
- leadId;
- deskId.

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

The current `uaroute.com` application is a live legacy product.

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

Research belongs under `docs/research/`.

Historical architectural decisions belong under `docs/decisions/`.

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

For the current phase:

> **UARoute generates intent. Koval converts and fulfils it.**

That relationship should remain clear in every important product decision.
