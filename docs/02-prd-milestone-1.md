# UARoute — Product Requirements Document
## Milestone 1 — Route Discovery & Koval Inquiry MVP

**Status:** Approved / M1 implemented in the repo (2026-09-11)  
**Product:** UARoute  
**Domain:** https://uaroute.com/  
**Language:** Ukrainian  
**Current partner:** Koval / 4K Koval  
**Milestone objective:** Turn route-intent traffic into a truthful, measurable Koval WhatsApp inquiry.

Production uaroute.com is still the legacy CRA catalog until cutover. Tracker: [M1 implementation checklist](m1-implementation-checklist.md). Route publication: [verification matrix](research/m1-route-verification-matrix.md).

---

## 1. Purpose

Milestone 1 establishes the first complete UARoute product funnel.

The user should be able to:

```text
Discover UARoute
      ↓
Search for a route
      ↓
Open a specific route
      ↓
Understand the route
      ↓
Enter travel intent
      ↓
Start a pre-filled WhatsApp inquiry
      ↓
Continue with Koval
```

The milestone is intentionally narrow.

It does **not** attempt to build:

- a full booking engine,
- real-time availability,
- payments,
- accounts,
- a CMS,
- a multi-carrier marketplace,
- a map platform,
- a parcel management system,
- a lead database.

The milestone tests one business hypothesis:

> **Can UARoute create truthful, measurable Koval transport inquiries from route-intent traffic without becoming a fake timetable or a Koval microsite?**

---

# 2. Product boundary

## UARoute owns

- route discovery,
- route-specific information,
- route navigation,
- travel-intent capture,
- inquiry initiation,
- UARoute-side attribution.

## Koval owns

- transport operation,
- availability confirmation,
- final trip conditions,
- booking confirmation,
- customer conversation after handoff,
- fulfilment.

The UI must communicate this boundary clearly.

UARoute must never imply that a WhatsApp click equals a confirmed booking.

---

# 3. Current implementation context

The existing `uaroute.com` application has been replaced visually with the approved design direction:

- warm paper background,
- large serif Cyrillic typography,
- schematic atlas graphics instead of card-heavy layouts,
- numbered typographic route lists,
- restrained photography,
- editorial composition.

The current product logic remains unchanged:

- route search,
- route pages,
- WhatsApp inquiry,
- analytics,
- SEO,
- mobile behavior.

The current design direction must remain consistent with `docs/04-visual-design-system.md`.

This PRD specifies **product behavior and requirements**, not visual tokens.

---

# 4. Milestone 1 scope

## Included

### Pages

- `/`
- `/routes`
- `/routes/lviv-hannover`
- related commercial route pages only when verified
- `/about`
- `/404`
- `/robots.txt`
- `/sitemap.xml`

### Core product features

- route search,
- city aliases/transliterations,
- route discovery,
- route page,
- inquiry widget,
- Koval partner handoff,
- WhatsApp message generation,
- route/desk attribution,
- lead code,
- analytics events,
- SEO metadata,
- prerendered HTML,
- sitemap/robots,
- responsive/mobile interaction,
- accessibility.

## Excluded

- city-page engine,
- article/CMS engine,
- parcel workflow,
- real-time availability,
- payment,
- authentication,
- user accounts,
- database,
- backend,
- map SDK,
- AI assistant,
- marketplace comparison,
- carrier ranking,
- booking inventory.

---

# 5. Information architecture

Milestone 1 information architecture:

```text
/
├── routes
│   ├── lviv-hannover
│   ├── lviv-hamburg
│   └── lviv-berlin
│
├── about
├── 404
├── robots.txt
└── sitemap.xml
```

Only verified commercial routes may appear in:

- the main route index,
- homepage route recommendations,
- sitemap,
- commercial internal links.

Editorial/non-commercial destinations may exist in data later but must not be presented as bookable Koval products.

---

# 6. Route entity requirements

Each commercial route must have:

- stable ID,
- stable slug,
- origin city,
- destination city,
- route title,
- short unique description,
- corridor,
- carrier relation,
- desk relation,
- related routes,
- SEO metadata,
- FAQ,
- "what to confirm" questions.

Suggested structure:

```text
Route
- id
- slug
- status
- originCityId
- destinationCityId
- title
- description
- corridor
- carrierIds[]
- deskId
- relatedRouteIds[]
- seo
- faq[]
- whatToConfirm[]
```

`status`:

- `commercial`
- `editorial`

Only `commercial` routes are included in the M1 commercial navigation and sitemap.

---

# 7. City entity requirements

City data should support search and route relationships.

Suggested structure:

```text
City
- id
- slug
- name
- country
- countryCode
- aliases[]
- kind
```

`kind`:

- `hub`
- `satellite`
- `destination`

Aliases are for search UX only.

Aliases must never create duplicate SEO URLs.

---

# 8. Carrier and desk model

Koval is the initial visible carrier.

Keep carrier abstraction for future expansion.

```text
Carrier
- id
- slug
- name
- website
- serviceDescription
- desks[]
- claims[]
```

Desk routing is explicit.

### Germany / default desk

Ivan  
+38 050 978 63 30  
`https://wa.me/380509786330`

### Austria / Liechtenstein

Mykola  
+380 63 079 2000  
`https://wa.me/380630792000`

A route must reference `deskId`.

Do not infer a desk from:

- UI labels,
- country text,
- destination name,
- arbitrary component logic.

If a route has no verified desk:

> fall back to the Koval website.

Never generate a broken WhatsApp URL.

---

# 9. Route search requirements

The primary homepage interaction is route search.

The user selects:

### From

Departure city.

### To

Destination city.

Search must support:

- Ukrainian names,
- aliases,
- common transliterations.

Example:

> `Ган`

suggests:

> `Ганновер, Німеччина`

Search must be:

- keyboard accessible,
- clearly labelled,
- mobile friendly,
- deterministic,
- based on structured local data.

Do not introduce AI search in M1.

---

# 10. Search behavior

### Valid search

If both cities are selected and a commercial route exists:

→ navigate to the canonical route page.

### Known cities, no commercial route

Show:

> **Ми поки не маємо інформації про цей маршрут.**

Do not imply that Koval provides the route.

Where strategically appropriate, offer valid commercial alternatives.

### Unknown city

Show a useful validation state.

Do not silently accept arbitrary free text as a commercial route.

### Alias

An alias resolves to the canonical City entity.

Do not create separate URLs for aliases.

---

# 11. Homepage requirements

The homepage is a route-discovery interface.

It should contain:

## Hero

Primary message:

> **Маршрути з України до Європи**

Supporting message should explain that UARoute helps users find routes and prepare a transport inquiry.

Primary interaction:

> **Звідки → Куди → Знайти маршрут**

The approved visual design uses:

- editorial composition,
- atlas graphics,
- large serif typography,
- asymmetric layout,
- warm paper background.

Do not revert to a centered SaaS hero or large generic search card.

## Commercial routes

Show only a small number of verified commercial routes.

The route presentation should use the approved typographic/atlas treatment rather than a grid of generic rounded cards.

## How it works

Three steps:

1. **Знайдіть маршрут**
2. **Дізнайтеся важливе**
3. **Уточніть поїздку у Koval**

## Koval partner section

Position below the useful discovery content.

Communicate:

> **Перевезення виконує Koval; UARoute допомагає знайти маршрут та підготувати запит.**

Primary action:

> **Написати Koval у WhatsApp**

Secondary:

> **Сайт Koval**

---

# 12. Route index requirements

`/routes` should list only commercial routes.

The preferred visual treatment is a typographic route list, for example:

```text
01  ЛЬВІВ ───────────── ГАННОВЕР
    UA · PL · DE

02  ЛЬВІВ ───────────── ГАМБУРГ
    UA · PL · DE

03  ЛЬВІВ ───────────── БЕРЛІН
    UA · PL · DE
```

The exact graphic treatment follows the visual design system.

Do not fill the page with placeholder cards or uncertain destinations.

---

# 13. Flagship route page

Primary M1 route:

`/routes/lviv-hannover`

The route page must contain enough meaningful information to answer:

> What is this route?

> Who provides the transport?

> What does Koval state publicly?

> What is still unknown?

> What should I ask Koval?

> How do I contact Koval?

## Required structure

1. Breadcrumb
2. H1
3. unique route introduction
4. corridor
5. operator/carrier information
6. verified Koval claims
7. "Перед поїздкою уточніть у Koval"
8. passenger FAQ
9. inquiry widget
10. partner card
11. related verified routes

---

# 14. Route information integrity

The following must NOT be shown unless explicitly sourced and verified:

- exact travel duration,
- passenger timetable,
- exact departure times,
- stop lists,
- ticket price,
- booking availability,
- ratings,
- reviews,
- guaranteed departures,
- operational distance presented as actual trip distance.

Do not generate a RouteTimeline that implies an operational schedule.

A route corridor such as:

> **Україна → Польща → Німеччина**

is acceptable when supported.

A detailed stop-by-stop itinerary is not.

---

# 15. "What to confirm" content

A route page should help the traveller distinguish facts from unanswered operational questions.

Section:

## Перед поїздкою уточніть у Koval

Potential questions include:

- точний час виїзду,
- місце посадки,
- вартість,
- умови багажу,
- можливість адресної подачі,
- інші деталі поїздки.

These are questions, not claims.

Do not turn unknown operational information into fabricated values.

---

# 16. Koval claims

Claims about Koval should be represented as sourced claims.

Suggested model:

```text
Claim
- text
- sourceUrl
- lastVerifiedAt
```

Only render claims supported by the source.

Possible examples where verified:

- direct trips,
- two professional drivers,
- booking without prepayment,
- address delivery in Germany,
- passenger transport,
- parcel transport.

Never manufacture:

- price,
- ratings,
- number of customers,
- timetable,
- duration,
- availability.

---

# 17. Inquiry widget

The route itself defines origin and destination.

The widget collects:

### Required

- date,
- phone.

### Additional

- passengers.

Passengers:

- default: `1`
- minimum: `1`
- maximum: `8`

The user must not re-enter:

- origin,
- destination.

## CTA

Primary:

> **Написати Koval у WhatsApp**

Secondary:

> **Сайт Koval**

Do not label the primary action as confirmed booking.

---

# 18. Inquiry validation

Required validation:

### Date

- required,
- cannot be in the past.

### Phone

- required,
- accepts `+`,
- follows the same general spirit as Koval's current phone validation,
- must be validated before WhatsApp opens.

### Passengers

- integer,
- 1–8.

If required data is missing:

- show inline error,
- do not open WhatsApp.

---

# 19. WhatsApp message generation

The message is generated programmatically.

Template:

```text
Добрий день! Хочу уточнити поїздку (заявка, не підтверджене бронювання).

Маршрут: {origin} → {destination}
Дата: {date}
Пасажирів: {passengers}
Телефон: {phone}

Джерело: UARoute
Сторінка: {routeUrl}
Код: {leadId}
```

Rules:

- properly URL-encode the message,
- use the route's desk,
- do not include UTM parameters,
- do not include empty/undefined values,
- do not open WhatsApp if required data is missing.

The user must still manually press Send in WhatsApp.

Transparency copy:

> **Ви будете перенаправлені у WhatsApp до Koval для уточнення поїздки.**

---

# 20. Lead code

Generate an opaque ephemeral code at inquiry time.

Format example:

`UR-8F3K`

Requirements:

- random enough to avoid accidental duplication,
- not derived from phone number,
- not a personal identifier,
- no database storage,
- included in the WhatsApp message,
- included in analytics context.

The lead code is a future reconciliation key, not a proof of booking.

---

# 21. Analytics requirements

Use one vendor-neutral helper:

```text
track(event, context)
```

Core M1 events:

- `route_search_completed`
- `route_view`
- `booking_intent`
- `whatsapp_click`
- `koval_site_click`
- `related_route_click`

`booking_intent` means:

> a valid UARoute inquiry form submission before the external WhatsApp handoff.

It does not mean booking confirmed.

---

# 22. Analytics context

Common context:

```text
source
medium
campaign
landingPage
routeSlug
origin
destination
destinationCountry
travelDate
passengerCount
ctaLocation
conversionType
leadId
deskId
```

`conversionType`:

- `whatsapp_inquiry`
- `koval_site`

Never use:

- `booking`
- `booking_completed`

unless real booking confirmation is later integrated.

Do not send phone numbers to analytics.

---

# 23. Koval website attribution

Koval website links should use UTM parameters:

```text
utm_source=uaroute
utm_medium=referral
utm_campaign=m1
utm_content=<route>_<placement>
```

Example:

```text
https://www.4k-koval.com/?utm_source=uaroute&utm_medium=referral&utm_campaign=m1&utm_content=lviv-hannover_partner
```

Generate these programmatically.

---

# 24. Privacy requirements

Milestone 1 has no database and no backend.

Do not store:

- name,
- phone,
- email,
- travel date,
- passenger identity.

Do not put phone numbers into:

- URLs,
- route slugs,
- analytics context,
- persistent client storage.

The user voluntarily sends the inquiry to Koval through WhatsApp.

The lead code is opaque and non-personal.

---

# 25. Mobile requirements

The complete discovery → inquiry flow must work on mobile.

After the user scrolls beyond the main inquiry widget, use a sticky mobile CTA:

> **Написати Koval**

The sticky action must invoke the exact same inquiry flow as the main widget.

Requirements:

- safe-area aware,
- keyboard aware,
- hidden while an input is focused / keyboard is open where practical,
- never cover focused controls,
- no duplicate second workflow.

---

# 26. Accessibility

Required:

- semantic HTML,
- visible labels,
- correct input labels,
- keyboard navigation,
- accessible autocomplete/combobox,
- visible focus,
- sufficient contrast,
- accessible date input,
- meaningful button labels,
- decorative SVGs marked appropriately.

The route-search suggestions must work without a mouse.

---

# 27. SEO requirements

Every important route page must be a real crawlable page.

Use prerendered static HTML.

Raw HTML must contain:

- Ukrainian H1,
- unique route copy,
- metadata,
- canonical.

Required metadata:

- unique title,
- unique meta description,
- `og:title`,
- `og:description`,
- `og:type`,
- `og:url`.

Use absolute canonicals:

```text
https://uaroute.com/routes/lviv-hannover
```

Do not use relative canonicals.

---

# 28. Structured data

Homepage:

- WebSite
- Organization

Route pages:

- BreadcrumbList
- FAQPage only when the FAQ is actually visible on the page and matches the structured data.

Do not create structured data for:

- invented prices,
- schedules,
- availability,
- ratings,
- fake offers.

Do not emit unsupported transport-offer schema merely to improve SEO.

---

# 29. Sitemap and robots

Generate sitemap during the static build.

Sitemap contains only real production pages:

- `/`
- `/routes`
- commercial route pages
- `/about`

Do not include:

- aliases,
- editorial-only destinations,
- future pages,
- design-system pages,
- nonexistent routes.

`robots.txt` must point to:

`https://uaroute.com/sitemap.xml`

---

# 30. Existing-site cutover

UARoute is already live.

Before replacing the current application:

1. inspect existing public/indexable URLs,
2. identify URLs with potential value,
3. define redirect/preservation rules,
4. ensure no valuable URL is silently discarded,
5. update sitemap,
6. verify canonical targets,
7. verify internal links.

Particular attention should be paid to existing routes such as:

- `/about`
- `/packages`
- `/gallery`
- `/contacts`

Keep, rewrite, redirect, archive or remove them intentionally.

Do not perform a blind replacement.

---

# 31. Design integration

The visual implementation has already moved to the approved direction:

> **Editorial European Route Atlas**

Current visual principles:

- warm paper background,
- large serif Cyrillic typography,
- clean functional sans-serif UI,
- schematic atlas graphics,
- typographic route lists,
- restrained photography,
- route/waypoint visual language,
- asymmetric editorial composition.

The product requirements in this document must not cause the UI to revert to:

- generic SaaS cards,
- dashboard layouts,
- excessive rounded containers,
- purple gradients,
- glassmorphism.

Product structure and visual styling are separate concerns.

---

# 32. Koval partner component

Use one clear partner section.

Suggested messaging:

> **Перевізник**

> **Коваль**

> Пасажирські перевезення та посилки

Then:

> **Перевезення виконує Koval; UARoute допомагає знайти маршрут та підготувати запит.**

Actions:

- **Написати Koval у WhatsApp**
- **Сайт Koval**

Keep the partner section useful but subordinate to UARoute discovery.

---

# 33. Related routes

Related routes must be:

- real,
- verified commercial routes,
- actually available as pages.

Do not populate related routes merely to fill the interface.

The related-route mechanism exists to help users discover alternatives and create an internal SEO graph.

---

# 34. Error states

## Incomplete search

> **Оберіть місто відправлення та місто призначення.**

## Known cities without a commercial route

> **Ми поки не маємо інформації про цей маршрут.**

## Unknown route

Use 404 with valid commercial alternatives.

## Missing desk

Show:

> **Сайт Koval**

instead of a broken WhatsApp link.

## Invalid inquiry

Keep the user on the page and display inline validation.

---

# 35. Content rules

Every M1 route page must contain genuinely useful unique content.

Do not create thin programmatic pages.

A route page should answer:

- what the route is,
- who operates it,
- what is known,
- what is unknown,
- what should be confirmed,
- how to contact the operator.

Avoid filling sections simply because the template contains them.

---

# 36. Route scope for M1

Primary:

- Львів → Ганновер

Potential related routes (remain **editorial** until the matrix has stronger evidence than a destination list):

- Львів → Гамбург
- Львів → Берлін

Only publish as commercial when sufficiently supported. The 2026-09-11 matrix keeps Hamburg and Berlin editorial.

Do not publish as commercial M1 routes:

- generic Germany,
- Munich,
- Vienna before Austrian desk confirmation,
- Poland city routes without evidence,
- Czechia city routes without evidence,
- Belgium/Netherlands city routes without evidence.

---

# 37. Parcels

Parcel information is relevant to Koval but remains secondary in M1.

Do not create a parcel booking widget.

A small outbound link to Koval parcel information is allowed.

Passenger route pages should remain passenger-first.

---

# 38. Implementation sequence

### Step 1 — Foundation

- config
- typed data
- carrier/desks/claims
- cities
- routes
- queries
- analytics helper
- WhatsApp helper
- SEO helper

### Step 2 — Design primitives

Use existing approved design system and visual direction.

### Step 3 — Homepage

Implement:

- hero
- route search
- commercial routes
- how it works
- Koval partner

### Step 4 — Search

Implement:

- aliases
- suggestions
- keyboard navigation
- routing.

### Step 5 — Flagship route

Implement:

- route introduction,
- corridor,
- claims,
- what-to-confirm,
- FAQ,
- inquiry,
- partner,
- related routes.

### Step 6 — Conversion

Implement:

- date,
- phone,
- passengers,
- validation,
- desk resolution,
- WhatsApp message,
- lead code,
- analytics.

### Step 7 — Mobile/accessibility

### Step 8 — SEO/cutover

- `/about`
- `/routes`
- sitemap
- robots
- structured data
- prerender verification
- redirect/preservation rules.

### Step 9 — QA

Test all requirements in this document.

---

# 39. Acceptance criteria

Milestone 1 is complete only when all of the following are true.

## Product

- homepage explains UARoute immediately,
- route search works,
- route aliases work,
- commercial route navigation works,
- route page provides meaningful content,
- user can start an inquiry.

## Inquiry

- date required,
- phone required,
- passengers default to 1,
- origin/destination come from route,
- correct desk is selected,
- WhatsApp message is generated correctly,
- lead code is included,
- missing required fields block handoff.

## Integrity

The M1 UI contains no unsupported:

- price,
- rating,
- timetable,
- duration,
- stop sequence,
- availability,
- review.

## Analytics

Core events fire with context.

## SEO

- prerendered HTML,
- H1,
- metadata,
- canonical,
- breadcrumbs,
- structured data,
- sitemap,
- robots.

## Mobile/accessibility

- usable on mobile,
- no layout overflow,
- keyboard-friendly search,
- accessible inputs,
- sticky CTA does not obstruct interaction.

## Cutover

- current site replacement is deliberate,
- valuable existing URLs are preserved or redirected,
- no important legacy route silently disappears,
- sitemap matches actual pages.

---

# 40. Definition of Done

Milestone 1 is done when a real user can arrive from search, select a route, understand what UARoute knows and does not know, enter the minimal required inquiry information, and open the correct Koval WhatsApp desk with a complete, attributable message.

The resulting product must feel like:

> **a useful route atlas that helps a traveller take the next real step**

not:

> **a transport-company brochure or a fake booking engine.**
