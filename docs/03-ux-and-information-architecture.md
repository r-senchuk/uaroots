# UARoute — UX & Information Architecture

**Document status:** Living product specification  
**Product:** UARoute  
**Domain:** https://uaroute.com/  
**Language:** Ukrainian  
**Current milestone:** Milestone 1 — Route Discovery & Koval Inquiry MVP  
**Implementation snapshot (2026-09-11):** Search, commercial index, flagship inquiry widget, PRD empty-state copy, and legacy HTML redirects are in the Next.js tree. Search does not treat editorial corridors as bookable.

---

## 1. Purpose

This document defines how users navigate, understand and interact with UARoute.

It specifies:

- information architecture,
- page hierarchy,
- navigation,
- core user journeys,
- route discovery,
- route-page structure,
- inquiry flow,
- Koval handoff,
- mobile behavior,
- states and error handling,
- accessibility principles.

It does not define:

- visual tokens,
- typography,
- colors,
- detailed illustration style,
- code architecture.

Those belong primarily to `04-visual-design-system.md` and `09-technical-architecture.md`.

The UX principle is:

> **Help the traveller understand a specific journey and take the next real step toward a carrier with minimum friction.**

---

# 2. UX North Star

The primary user journey is:

```text
Discover
   ↓
Search
   ↓
Choose route
   ↓
Understand
   ↓
Decide
   ↓
Inquire
   ↓
Contact Koval
```

The ideal user experience should make this flow feel natural rather than like a sales funnel.

UARoute should answer:

> **Where can I go?**

> **What do I need to know?**

> **What should I clarify?**

> **Who can help me?**

> **What do I do next?**

---

# 3. Core UX Principles

## 3.1 Route-first

The route is the primary product object.

Prefer:

> Львів → Ганновер

over generic categories such as:

> Німеччина

The product should organize itself around origin → destination relationships.

---

## 3.2 Intent-first

Every major page should help move the user toward a meaningful decision.

For a route page:

> Understand route → decide whether to inquire → start inquiry.

Avoid interactions that create activity without user value.

---

## 3.3 Useful before commercial

The user should receive useful route information before the Koval commercial handoff becomes dominant.

The preferred hierarchy is:

```text
User question
    ↓
Useful answer
    ↓
Relevant route
    ↓
Transport provider
    ↓
Inquiry
```

Not:

```text
Advertisement
    ↓
Advertisement
    ↓
Book now
```

---

## 3.4 Transparent handoff

The user must understand:

### UARoute

Provides route discovery and information.

### Koval

Handles the actual transport inquiry and booking.

Use explicit language:

> **Перевезення виконує Koval; UARoute допомагає знайти маршрут та підготувати запит.**

The interface must never imply that UARoute itself operates the vehicle or confirms the seat.

---

## 3.5 Truthful uncertainty

When operational information is unavailable:

> Say that it needs confirmation.

Do not fill UX gaps with fabricated facts.

For example:

> **Перед поїздкою уточніть у Koval: час виїзду, місце посадки, вартість та умови багажу.**

This is better than showing invented timetable/price information.

---

## 3.6 Minimal friction

Do not make users re-enter information already established.

Once the user is on:

> Львів → Ганновер

the inquiry flow should automatically know:

- origin,
- destination,
- route.

Only ask for information needed to continue the inquiry.

---

## 3.7 Mobile-first

The core product must work on a phone without requiring:

- horizontal scrolling,
- complex navigation,
- multiple form screens,
- desktop-only controls.

Mobile is a primary experience, not a reduced desktop version.

---

# 4. User Personas / Intent Groups

Personas should remain behavior-oriented rather than demographic.

## 4.1 Specific route seeker

Knows:

- origin,
- destination,
- approximate travel intent.

Example:

> Львів → Ганновер

This is the primary M1 persona.

## 4.2 Destination explorer

Knows the destination but is still deciding the exact starting city or travel method.

Example:

> Як доїхати до Ганновера з України?

## 4.3 Route planner

Has a route but is not ready to inquire yet.

Wants to understand:

- documents,
- baggage,
- pickup,
- practical preparation.

## 4.4 Returning traveller

Needs Europe → Ukraine travel.

This is strategically important but not a distinct M1 UX flow unless supported by the route dataset.

## 4.5 Parcel user

Needs parcel transport.

This remains a secondary, separate intent in M1.

---

# 5. Information Architecture

M1 navigation:

```text
UARoute
│
├── Home
│   └── /
│
├── Routes
│   ├── /routes
│   ├── /routes/lviv-hannover
│   ├── /routes/lviv-hamburg
│   └── /routes/lviv-berlin
│
├── About
│   └── /about
│
├── System
│   ├── /404
│   ├── /robots.txt
│   └── /sitemap.xml
│
└── Future
    ├── cities
    ├── articles
    ├── border
    ├── documents
    ├── baggage
    └── parcels
```

Future sections should not be exposed in navigation until useful content actually exists.

Do not create empty navigation categories simply to communicate future plans.

---

# 6. Primary Navigation

The header should remain intentionally simple.

Recommended conceptual navigation:

- **Маршрути**
- optionally **Про UARoute**

The route search is the primary discovery mechanism and should always remain easy to access.

Avoid a large multi-level menu in M1.

Avoid navigation items for sections that do not yet have content.

---

# 7. Homepage Information Architecture

The homepage has five conceptual layers:

```text
1. Discover
2. Explore
3. Understand
4. Trust
5. Act
```

## 7.1 Discover

Hero:

> Маршрути з України до Європи

Route search:

> Звідки → Куди

Primary CTA:

> Знайти маршрут

The visual treatment follows the Editorial European Route Atlas design system.

---

## 7.2 Explore

Show a small set of verified commercial routes.

The purpose is:

- provide examples,
- shortcut users who already recognize a route,
- expose the route network.

Do not show uncertain or generic destinations.

Use route-list / atlas treatment rather than generic card grids.

---

## 7.3 Understand

The homepage should explain the product in three steps:

### 1. Знайдіть маршрут

### 2. Дізнайтеся важливе

### 3. Уточніть поїздку у Koval

This explains the value proposition without lengthy marketing copy.

---

## 7.4 Trust

The Koval partner area explains:

- who provides transport,
- what UARoute does,
- where the user will be sent.

Use factual claims only.

---

## 7.5 Act

Primary action:

> **Написати Koval у WhatsApp**

Secondary:

> **Сайт Koval**

The commercial action should follow the useful experience rather than dominate the entire homepage.

---

# 8. Route Search UX

Route search is the main navigation mechanism.

The basic interaction:

```text
[ Звідки ]
     ↓
[ Куди ]
     ↓
[ Знайти маршрут ]
```

---

## 8.1 Autocomplete

As the user types:

> Ган...

suggest:

> **Ганновер, Німеччина**

Suggestions should show:

- city,
- country.

Aliases resolve to one canonical City.

---

## 8.2 Keyboard behavior

Autocomplete must support:

- arrow up/down,
- Enter to select,
- Escape to close,
- Tab behavior consistent with forms.

The active suggestion must be visually clear.

---

## 8.3 Search validation

If either field is missing:

> **Оберіть місто відправлення та місто призначення.**

Do not submit incomplete route searches.

---

## 8.4 Search result routing

If a commercial route exists:

> navigate to canonical route page.

If the route is not available:

> show a clear state explaining that UARoute does not currently have a commercial route page.

Do not automatically imply Koval availability.

---

# 9. Route Page Information Architecture

The route page is the core product surface.

Recommended order:

```text
Breadcrumb
 ↓
Route title
 ↓
Route introduction
 ↓
Corridor / geographic context
 ↓
Who operates the route
 ↓
Verified information
 ↓
What to confirm
 ↓
FAQ
 ↓
Inquiry widget
 ↓
Koval partner
 ↓
Related routes
```

The exact visual composition follows the design system.

The information hierarchy should remain stable.

---

# 10. Route Header

Example:

> **Львів → Ганновер**

Secondary information:

> **Україна → Польща → Німеччина**

Potential route metadata:

- carrier,
- verification date, only when actually present,
- route status where useful.

Do not place unsupported operational numbers in the header.

Avoid:

> 18 год 30 хв

> 1,345 км

> від €100

unless explicitly sourced and verified.

---

# 11. Route Introduction

Every commercial route should have a unique short introduction.

The introduction should answer:

- what the route represents,
- where it starts,
- where it ends,
- who provides the transport.

Keep it editorial and concise.

Do not duplicate generic text across all route pages.

---

# 12. Corridor Presentation

Use a simple geographic concept:

> **Україна → Польща → Німеччина**

This is contextual information, not a stop-by-stop itinerary.

Do not represent:

- specific stops,
- border timing,
- exact route geometry,
- departure schedule

unless verified.

The corridor graphic should be visualized through the design system rather than a fake navigation map.

---

# 13. "Who operates the route"

The route should make the carrier identity explicit.

Example:

> **Перевізник**

> **Коваль**

> Пасажирські перевезення та посилки

Then:

> Перевезення виконує Koval; UARoute допомагає знайти маршрут та підготувати запит.

This section establishes trust before the inquiry.

---

# 14. Verified Service Information

Display only claims supported by the Koval source model.

Examples may include:

- direct trips,
- two drivers,
- booking without prepayment,
- address delivery in Germany.

Claims should be visually distinct from ordinary editorial copy.

Where appropriate, provide a source or verification marker.

Do not expose internal data structures such as `sourceUrl` directly unless designed as a useful source link.

---

# 15. "Before the trip, confirm with Koval"

This section is important because it turns uncertainty into useful UX.

Recommended structure:

> **Перед поїздкою уточніть у Koval**

Possible questions:

- Коли точний виїзд?
- Де буде посадка?
- Яка вартість поїздки?
- Які умови багажу?
- Чи доступна адресна подача?

These are explicit questions to the carrier.

They should not look like missing functionality or errors.

The tone should be:

> "Here is what you should clarify before travelling."

---

# 16. FAQ

FAQ should answer genuine passenger questions.

M1 FAQ should remain small and useful.

Examples:

- Як уточнити дату поїздки?
- Де дізнатися точний час виїзду?
- Як уточнити місце посадки?
- Як зв'язатися з Koval?
- Що уточнити щодо багажу?

Do not create FAQs merely to increase keyword density.

The visible FAQ must exactly match any FAQ structured data.

---

# 17. Inquiry Widget UX

The inquiry widget is not a payment or booking form.

Its meaning is:

> **Prepare and send a transport inquiry to Koval.**

Fields:

### Date

Required.

### Phone

Required.

### Passengers

Default 1.

Allowed range:

1–8.

Origin/destination are inherited from the current route.

---

# 18. Inquiry Form Behavior

The form should be compact.

Avoid multi-step flows in M1.

Preferred:

```text
Дата
[ date ]

Телефон
[ +38 ... ]

Пасажири
[ 1 ]

[ Написати Koval у WhatsApp ]
```

The user should understand immediately that this opens WhatsApp.

---

# 19. Inquiry Validation

### Missing date

Show an inline error.

### Missing phone

Show an inline error.

### Invalid phone

Show an inline error near the field.

### Invalid passenger count

Prevent submission.

The page should remain stable when validation occurs.

Do not replace the complete page with a modal error.

---

# 20. WhatsApp Handoff UX

Before handoff, tell the user what will happen:

> **Ви будете перенаправлені у WhatsApp до Koval для уточнення поїздки.**

When the user activates the CTA:

1. validate form,
2. resolve route desk,
3. generate lead ID,
4. generate message,
5. encode the URL,
6. open the correct WhatsApp destination.

The user must still press **Send** in WhatsApp.

Do not display language suggesting that a seat is reserved.

---

# 21. WhatsApp Message

The message should communicate:

- route,
- date,
- passenger count,
- phone,
- source,
- route URL,
- lead code.

Example:

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

This is an inquiry, not a booking confirmation.

---

# 22. CTA Language

Use:

> **Написати Koval у WhatsApp**

or:

> **Уточнити поїздку у WhatsApp**

Avoid:

> **Забронювати**

unless the product later gains a true booking-confirmation capability.

This keeps UARoute's claims aligned with the actual process.

---

# 23. Secondary Koval Action

The secondary action is:

> **Сайт Koval**

This should open the carrier website and include UTM attribution.

The user should not need to choose between two different inquiry workflows.

The hierarchy should be:

```text
Primary: WhatsApp inquiry
Secondary: Koval website
```

---

# 24. Partner Section UX

The Koval section should answer:

> Who am I being sent to?

It should communicate:

- carrier name,
- relevant service description,
- transparency about the relationship,
- WhatsApp action,
- Koval website.

Do not make this section visually dominate the route content.

---

# 25. Related Routes

Related routes help users explore the route network.

Only show:

- real pages,
- commercially verified routes,
- relevant alternatives.

Good:

> Львів → Берлін

> Львів → Гамбург

Bad:

> Мюнхен

when there is no corresponding useful route page.

Related routes should reinforce the network concept.

---

# 26. Mobile UX

The mobile experience should preserve the same conceptual hierarchy.

Recommended vertical order:

```text
Route
 ↓
Useful information
 ↓
What to confirm
 ↓
Inquiry
 ↓
Koval
 ↓
Related routes
```

Do not force users to scroll past a large visual hero before seeing useful information.

---

# 27. Sticky Mobile CTA

Once the main inquiry widget has been passed, a sticky bottom action may appear:

> **Написати Koval**

The sticky CTA should:

- use the same inquiry logic,
- inherit the current route,
- not start a different process,
- hide or reposition when the keyboard is active,
- respect safe-area insets,
- never cover focused controls.

The sticky CTA is a convenience layer, not a second booking system.

---

# 28. Mobile Search

On mobile:

- From field should be easy to activate,
- suggestions should not be hidden behind the keyboard,
- selected values should remain obvious,
- To field should follow naturally,
- search CTA should be reachable without excessive scrolling.

The search interaction should be usable with one hand.

---

# 29. Desktop UX

Desktop can use more spatial editorial composition.

The product can use:

- asymmetric hero layouts,
- route graphics,
- larger typography,
- wider content areas,
- side-by-side content in selected contexts.

However:

> Desktop should not turn the product into a dashboard.

---

# 30. Information Density

Use the principle:

> **Dense where decisions require information; spacious where hierarchy requires attention.**

Route pages can contain substantial information, but should remain scannable.

Use:

- headings,
- short paragraphs,
- lists,
- metadata,
- FAQ,
- graphic dividers,
- route visuals.

Avoid large blocks of uninterrupted text.

---

# 31. Content Hierarchy

A typical route page should visually distinguish:

### Primary

- route,
- practical answer,
- inquiry.

### Secondary

- carrier details,
- FAQ,
- related routes.

### Tertiary

- metadata,
- source/verification information.

Do not make secondary information compete with the user's main task.

---

# 32. Navigation Back to Discovery

Users should always be able to return to route discovery.

Provide clear paths:

- Home,
- Routes,
- breadcrumb.

Example:

> Головна → Маршрути → Львів → Ганновер

Do not make route pages dead ends.

---

# 33. Cross-linking Model

M1 internal linking:

```text
Home
 ↓
Routes
 ↓
Specific route
 ↓
Related routes
```

Route pages should link to other relevant commercial route pages.

Future model:

```text
City
 ↕
Route
 ↕
Article
```

Do not introduce future content types into navigation before they exist.

---

# 34. Search vs Navigation

Search should be treated as the main discovery mechanism.

Navigation should remain lightweight.

Use navigation for:

- Routes,
- About.

Use search for:

- finding a specific route.

Do not build a large filter system in M1.

---

# 35. Trust UX

Trust should come from:

- factual wording,
- clear carrier identity,
- source/verification treatment,
- real imagery where appropriate,
- transparent handoff,
- absence of fake ratings,
- absence of fake guarantees.

Do not use:

- "best",
- "safest",
- "No. 1",
- fake stars,
- fabricated customer counts.

---

# 36. UX treatment of uncertainty

Uncertainty should be expressed as practical guidance.

Bad:

> Даних немає.

Better:

> **Перед поїздкою уточніть у Koval точний час виїзду та місце посадки.**

This keeps the product useful even when operational data is unavailable.

---

# 37. Editorial/Commercial balance

UARoute pages should maintain:

> **Editorial value → commercial action**

not:

> commercial action → minimal editorial justification.

The user should feel that UARoute helped first.

The Koval handoff should feel like a natural next step.

---

# 38. Error and Empty States

## Unknown route

> **Цей маршрут поки не представлений на UARoute.**

Then show useful commercial alternatives where available.

## No search result

> **Ми поки не маємо інформації про цей маршрут.**

## Invalid form

Inline field-specific error.

## Missing desk

Show:

> **Перейти на сайт Koval**

instead of opening an invalid WhatsApp link.

## 404

A branded route-atlas 404 should provide:

- explanation,
- search,
- popular commercial routes.

---

# 39. Accessibility

Accessibility should be part of the UX system, not a late QA layer.

Required:

- semantic landmarks,
- logical heading order,
- clear form labels,
- keyboard-accessible autocomplete,
- visible focus,
- clear error association,
- useful button labels,
- adequate contrast,
- screen-reader-friendly route information,
- reduced-motion support.

Decorative route graphics should not add noise to screen readers.

---

# 40. Analytics-aware UX

Important user interactions should map naturally to analytics.

Examples:

### Search completed

User successfully selects origin + destination.

### Route viewed

User enters a valid route page.

### Booking/inquiry intent

User submits valid inquiry data.

### WhatsApp click

Correct WhatsApp handoff generated.

### Koval site click

User chooses the secondary carrier-site path.

Analytics should never change what the user experiences.

---

# 41. Conversion Funnel UX

The UX funnel is:

```text
Discovery
   ↓
Route selection
   ↓
Route comprehension
   ↓
Inquiry preparation
   ↓
WhatsApp handoff
```

Optimization should focus on reducing friction between these states.

Do not optimize a single CTA independently from the route experience.

---

# 42. Future UX Extensions

M1 deliberately leaves room for:

## City pages

City → routes → guides.

## Articles

Article → route.

## Practical sections

Documents / border / baggage.

## Parcel journey

Separate intent and contact path.

## Additional carriers

Route → multiple carrier options.

## Availability

Potential future live availability.

These should be added without changing the fundamental route-first UX model.

---

# 43. Anti-patterns

Avoid:

- large generic card grids,
- every section in a bordered container,
- excessive modals,
- multi-step forms,
- duplicate CTAs with identical actions,
- fake operational information,
- dead navigation items,
- empty "coming soon" sections,
- generic stock travel imagery,
- giant maps with no functional purpose,
- excessive popups,
- autoplay video,
- intrusive sticky UI.

---

# 44. Definition of UX Done

M1 UX is complete when:

### Discovery

A first-time visitor understands what UARoute does quickly.

### Search

A user can find a route using normal Ukrainian names and aliases.

### Route

A valid route page clearly communicates:

- route,
- corridor,
- carrier,
- verified information,
- unknown information,
- next step.

### Inquiry

A user can enter:

- date,
- phone,
- passengers

and submit an inquiry.

### Handoff

The correct Koval WhatsApp desk receives a complete pre-filled message.

### Trust

The user understands that:

- UARoute provides discovery/information,
- Koval handles the transport inquiry.

### Mobile

The full journey is usable with one hand and no horizontal overflow.

### Accessibility

Core discovery and inquiry interactions work with keyboard and assistive technologies.

### No dark patterns

There is no pressure, fake urgency, misleading booking language or hidden commercial relationship.

---

# 45. UX North-Star Statement

The final UX goal is:

> **A traveller should be able to arrive with a question about a journey, understand the route quickly, know what still needs confirmation, and contact the appropriate carrier without unnecessary friction.**

UARoute succeeds when the experience feels less like filling out a transport form and more like:

> **finding the right line on a well-designed route atlas and taking the next step.**
