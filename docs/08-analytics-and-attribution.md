# 08 — Analytics and Attribution

**Status:** Approved working specification  
**Scope:** UARoute Milestone 1 and the measurement foundation for later conversion attribution  
**Audience:** Product, engineering, analytics, SEO/content, growth, and coding agents  
**Primary relationship:** UARoute generates route discovery and travel intent; Koval owns the transaction and booking process.

---

## 1. Purpose

This document defines how UARoute measures user behavior, route-level demand, conversion intent, and the handoff from UARoute to Koval.

The analytics system must answer five practical questions:

1. Which acquisition sources bring people to UARoute?
2. Which routes and origins/destinations generate real travel intent?
3. Where in the UARoute funnel do users stop?
4. Which users explicitly hand off to Koval through WhatsApp or the Koval website?
5. Which route/source combinations should be prioritized commercially and editorially?

The system is deliberately designed for the current UARoute architecture:

- static/prerendered site;
- no application database;
- no stored personal lead records;
- Koval remains the booking owner;
- WhatsApp is the primary conversion handoff;
- route and intent data are more important than generic pageview volume.

Analytics is therefore not a generic traffic dashboard. It is a **route-demand measurement system**.

---

## 2. Measurement principles

### 2.1 Measure intent, not vanity

Pageviews and sessions are useful diagnostic metrics, but they are not the primary business outcome.

The hierarchy is:

**Traffic → route discovery → route interest → booking intent → Koval handoff → qualified lead → booking**

UARoute can directly measure the first five stages. Qualified lead and booking outcomes require future cooperation or attribution feedback from Koval.

### 2.2 Never require personal data for analytics

UARoute must not send a user's phone number, name, WhatsApp text, or other directly identifying information to the analytics platform.

The phone number is collected only because Koval's current inquiry flow requires it. It is used locally to construct the WhatsApp handoff and is not stored as a UARoute record.

Do not put personal data into:

- URLs;
- query parameters;
- analytics event properties;
- `dataLayer`;
- local storage;
- cookies unless a separately approved analytics/consent implementation requires them.

### 2.3 Route is the primary analytical object

Every important event should be attributable to a route whenever a route is known.

A useful analytical key is therefore:

`routeId + origin + destination + source + landingPage`

Examples:

- `lviv-hannover`
- `lviv-hamburg`
- `lviv-berlin`

The route identifier must be stable even if the route's editorial wording changes.

### 2.4 Separate discovery from commercial conversion

A user may:

- search for a route;
- read several route pages;
- click a related route;
- open the inquiry widget;
- submit the widget;
- click WhatsApp;
- visit Koval's site;

without actually booking.

Analytics must preserve these distinctions.

Do not label a WhatsApp click as a booking.

### 2.5 Do not infer unavailable business outcomes

UARoute cannot know from its own analytics whether Koval:

- replied;
- accepted the inquiry;
- confirmed availability;
- confirmed the price;
- completed a booking;
- completed the trip.

Those are downstream business outcomes.

Unless a future integration provides confirmed data, UARoute must report them as **unknown**, not inferred.

---

## 3. Measurement architecture

### 3.1 Current M1 architecture

```text
User
  │
  ├── Search / social / direct / referral
  │
  ▼
UARoute
  │
  ├── route_search_completed
  ├── route_view
  ├── booking_intent
  ├── whatsapp_click
  ├── koval_site_click
  └── related_route_click
  │
  ▼
Koval
  │
  ├── WhatsApp conversation
  └── Koval website
```

Analytics is client-side because the M1 site is primarily static.

The implementation may use the existing analytics stack available to the site, but the event contract in this document is the source of truth.

### 3.2 Required implementation characteristics

The analytics implementation must:

- load without blocking primary content;
- avoid making the route page dependent on analytics availability;
- fail silently if analytics is unavailable;
- avoid exposing personal data;
- work on mobile and desktop;
- preserve SPA/prerender navigation correctness;
- emit events only once per intended user action;
- distinguish route context from page context.

---

## 4. Measurement taxonomy

The core taxonomy is:

### Acquisition

How the user arrived.

Examples:

- organic search;
- direct;
- social;
- referral;
- UTM campaign.

### Discovery

How the user found a route.

Examples:

- homepage route search;
- direct route page;
- internal related-route click;
- organic landing page.

### Intent

Whether the user signals genuine travel interest.

Examples:

- opening/using booking inquiry;
- entering date;
- entering phone;
- selecting passenger count;
- submitting inquiry.

### Handoff

Whether UARoute successfully transfers the user toward Koval.

Examples:

- WhatsApp click;
- Koval site click.

### Downstream outcome

Whether Koval actually produces a business result.

Examples:

- qualified lead;
- confirmed booking;
- revenue.

These downstream outcomes are not directly observable in M1.

---

## 5. Event contract

The M1 event set is intentionally small.

### 5.1 `route_search_completed`

**Purpose:** Measure route discovery demand from the search interface.

Emit when a user completes a route search and UARoute produces a meaningful result.

Do not emit for:

- every keystroke;
- opening the search interface;
- selecting a city before completing the search.

Recommended properties:

```text
event: route_search_completed
searchOrigin
searchDestination
resultCount
matchedRouteId
source
medium
campaign
landingPage
```

Notes:

- `searchOrigin` and `searchDestination` are normalized UARoute city IDs where possible.
- If no route is matched, `matchedRouteId` should be null or omitted.
- `resultCount` is useful for diagnosing search quality.
- Search queries must not contain phone numbers or other personal information.

---

### 5.2 `route_view`

**Purpose:** Measure actual route-page interest.

Emit when a route page becomes meaningfully visible to the user.

Recommended properties:

```text
event: route_view
routeId
origin
destination
routeStatus
source
medium
campaign
landingPage
```

`route_view` is one of the most important analytical events because route-page demand is the primary product signal.

Do not fire duplicate route-view events merely because the framework re-rendered the component.

---

### 5.3 `booking_intent`

**Purpose:** Measure a user progressing from passive route research toward a Koval inquiry.

This is a deliberately broader intent signal than the final WhatsApp click.

Recommended trigger:

- inquiry widget is submitted successfully; or
- equivalent final-intent action occurs immediately before the WhatsApp handoff.

Recommended properties:

```text
event: booking_intent
routeId
origin
destination
date
passengerCount
deskId
ctaLocation
conversionType: whatsapp_inquiry
leadId
source
medium
campaign
landingPage
```

Important:

- `date` is a travel date, not a timestamp;
- `passengerCount` is not personal data;
- `leadId` is a random ephemeral identifier such as `UR-8F3K`;
- no phone number is sent;
- do not call this event `booking_confirmed`.

---

### 5.4 `whatsapp_click`

**Purpose:** Measure the actual outbound handoff to Koval WhatsApp.

Recommended properties:

```text
event: whatsapp_click
routeId
origin
destination
date
passengerCount
deskId
ctaLocation
conversionType: whatsapp_inquiry
leadId
source
medium
campaign
landingPage
```

This event should fire immediately before or at the point the WhatsApp link is activated.

It is a **handoff event**, not a booking event.

If the user blocks popups, leaves the page before the navigation completes, or the browser behaves unexpectedly, the event represents the click/action initiated by UARoute, not proof that a WhatsApp conversation was actually completed.

---

### 5.5 `koval_site_click`

**Purpose:** Measure referral traffic from UARoute to Koval's website.

Recommended properties:

```text
event: koval_site_click
routeId
ctaLocation
targetPath
source
medium
campaign
landingPage
```

The outbound URL should use UTM parameters.

Example:

```text
utm_source=uaroute
utm_medium=referral
utm_campaign=m1
utm_content=lviv_hannover_partner_card
```

The `utm_content` value should be deterministic and placement-specific.

---

### 5.6 `related_route_click`

**Purpose:** Measure cross-route discovery and identify route clusters users naturally explore.

Recommended properties:

```text
event: related_route_click
sourceRouteId
targetRouteId
placement
source
medium
campaign
landingPage
```

This event is optional for the first implementation but strongly recommended if the related-route component is present.

---

## 6. Common event context

Where applicable, events should carry a consistent context object.

```ts
type AnalyticsContext = {
  source?: string
  medium?: string
  campaign?: string
  landingPage?: string

  routeId?: string
  origin?: string
  destination?: string

  deskId?: string
  ctaLocation?: string
  conversionType?: string

  leadId?: string
}
```

Do not duplicate fields with conflicting names across events.

For example, use `routeId` consistently rather than:

- `route`
- `routeSlug`
- `routeName`
- `routeKey`

unless there is a specific technical reason and the distinction is documented.

---

## 7. Acquisition attribution

### 7.1 UTM model

UARoute should accept conventional UTM parameters:

```text
utm_source
utm_medium
utm_campaign
utm_content
utm_term
```

Examples:

```text
utm_source=google
utm_medium=organic
```

or:

```text
utm_source=facebook
utm_medium=social
utm_campaign=route_launch
utm_content=lviv_hannover
```

or for Koval referral:

```text
utm_source=koval
utm_medium=referral
utm_campaign=m1
utm_content=route_page
```

### 7.2 Preserve acquisition context

Because UARoute is primarily a static route-discovery site, the first useful acquisition context should be preserved through the current browsing session.

The implementation should support:

- initial landing source;
- current page source;
- campaign data;
- landing-page URL.

Avoid building a complex identity-resolution system in M1.

### 7.3 Attribution model

M1 should expose at least two attribution views:

**First-touch attribution**

The source that initially brought the user to UARoute.

Useful for:

- SEO;
- social;
- partnerships;
- campaign evaluation.

**Conversion-touch attribution**

The source/campaign context associated with the route conversion event.

Useful for:

- CTA experiments;
- route-specific campaigns;
- conversion optimization.

Do not claim that either model equals the user's complete marketing journey.

Future analytics can add assisted-conversion and multi-touch models once enough data exists.

---

## 8. Landing-page attribution

`landingPage` should represent the first UARoute page observed in the session or the page used as the attribution landing point, depending on implementation.

At minimum, record:

```text
/routes/lviv-hannover
```

rather than storing the entire URL when unnecessary.

The canonical route page should remain deterministic and clean:

```text
https://uaroute.com/routes/lviv-hannover
```

UTM parameters may exist on acquisition URLs, but canonical URLs must remain parameter-free.

---

## 9. Lead ID

### 9.1 Purpose

The lead ID creates a lightweight bridge between the UARoute analytics event and the WhatsApp message.

Example:

```text
UR-8F3K
```

### 9.2 Requirements

The identifier must:

- be generated client-side;
- be random/unpredictable enough for collision avoidance;
- contain no personal information;
- not encode the phone number, date of birth, or other user attribute;
- be short enough to read in WhatsApp.

### 9.3 Lifecycle

Generate the lead ID when the user submits the inquiry.

Reuse the same ID for:

```text
booking_intent
whatsapp_click
```

and in the WhatsApp message.

No database record is created in M1.

### 9.4 Future use

If Koval later agrees to provide confirmed lead/booking outcomes, the lead ID can become the reconciliation key.

Possible future flow:

```text
UARoute inquiry
    ↓
UR-8F3K
    ↓
Koval WhatsApp
    ↓
Koval CRM/manual record
    ↓
qualified lead / booking
    ↓
UARoute conversion reconciliation
```

This should be treated as a future capability, not an M1 dependency.

---

## 10. Conversion funnel

The canonical UARoute funnel is:

```text
Session
  ↓
Route discovery
  ↓
Route page view
  ↓
Inquiry intent
  ↓
WhatsApp handoff
  ↓
Koval conversation
  ↓
Qualified lead
  ↓
Booking
  ↓
Revenue
```

M1 directly measures:

- session/page acquisition;
- route search;
- route views;
- booking intent;
- WhatsApp click;
- Koval site click.

M1 does **not** directly measure:

- Koval reply;
- Koval acceptance;
- confirmed booking;
- trip completion;
- revenue.

---

## 11. KPI definitions

### 11.1 Traffic KPIs

**Sessions**

Number of analytics sessions attributable to UARoute.

**Organic sessions**

Sessions attributed to organic search according to the analytics platform.

**Landing-page sessions**

Sessions grouped by first UARoute landing page.

Traffic volume is diagnostic, not the ultimate north star.

### 11.2 Discovery KPIs

**Route view count**

Number of `route_view` events.

**Unique route-view sessions**

Distinct sessions that viewed a route.

**Route demand distribution**

Share of route views by route.

Example:

```text
Lviv → Hannover    31%
Lviv → Hamburg     24%
Lviv → Berlin      19%
...
```

### 11.3 Intent KPIs

**Booking-intent rate**

```text
booking_intent sessions
/
route-view sessions
```

Use sessions rather than raw event count when evaluating user-level conversion.

**WhatsApp handoff rate**

```text
whatsapp_click sessions
/
route-view sessions
```

**Intent-to-WhatsApp rate**

```text
whatsapp_click sessions
/
booking_intent sessions
```

This reveals friction between inquiry completion and the actual handoff.

### 11.4 Referral KPIs

**Koval referral rate**

```text
koval_site_click sessions
/
route-view sessions
```

Track this separately from WhatsApp conversion.

### 11.5 Route quality KPIs

For each route:

- sessions;
- route views;
- search demand;
- booking intents;
- WhatsApp clicks;
- Koval clicks;
- intent rate;
- WhatsApp handoff rate;
- source mix;
- landing-page mix.

This creates a route-level demand matrix.

---

## 12. North-star measurement

The long-term business north star is:

> **UARoute-generated Koval bookings per month.**

M1 cannot reliably measure this without Koval-side reconciliation.

Therefore M1 uses a hierarchy of leading indicators:

### Primary M1 indicator

**WhatsApp handoffs to Koval from route pages**

This is the clearest observable commercial action under UARoute's direct control.

### Secondary indicators

- booking-intent sessions;
- route-view sessions;
- route-search completion;
- Koval website referrals;
- route-level conversion rate.

### Supporting indicators

- organic traffic;
- landing-page sessions;
- related-route exploration;
- source/medium performance.

Do not optimize UARoute for pageviews at the expense of route intent.

---

## 13. Route-level demand intelligence

UARoute's analytics should eventually answer:

> “Which route demand is appearing in the market, from which origins, through which acquisition channels, and with what conversion intent?”

A route score can later be derived from normalized metrics such as:

```text
Route Demand Score =
  weighted traffic
+ weighted route views
+ weighted booking intent
+ weighted WhatsApp handoffs
+ weighted Koval referrals
```

However, M1 should not introduce a complex opaque score into the product.

The raw metrics must remain available.

Future growth dashboards can rank:

- high traffic / low conversion routes;
- low traffic / high conversion routes;
- high search / low content coverage routes;
- high intent / low operational confirmation routes;
- strong route clusters.

These categories can guide content, SEO, paid acquisition, and Koval partnership discussions.

---

## 14. Search analytics

Search behavior has strategic value because it reveals demand before a conversion.

Track:

- origin;
- destination;
- matched route;
- zero-result searches;
- result count.

### 14.1 Zero-result searches

Zero-result searches should not be silently discarded.

They can identify:

- missing routes;
- missing city aliases;
- demand that belongs to a future corridor;
- user terminology not yet represented in the route taxonomy.

A future dashboard should expose:

```text
Top zero-result searches
```

Examples:

```text
Wrocław → Ivano-Frankivsk
Bremen → Lviv
Nuremberg → Lviv
```

These are research signals, not evidence that Koval currently operates the route.

### 14.2 Search quality

A high number of searches with no matched route can indicate:

- incomplete route data;
- poor aliasing;
- unsupported corridors;
- UX friction.

Do not automatically create new pages from zero-result searches.

They must pass the content/data governance rules in `06-data-model-and-content-governance.md`.

---

## 15. Route conversion analysis

The minimum route-level report should look like:

| Route | Sessions | Views | Intent | WhatsApp | Koval clicks | Intent rate |
|---|---:|---:|---:|---:|---:|---:|
| Lviv → Hannover | … | … | … | … | … | … |
| Lviv → Hamburg | … | … | … | … | … | … |
| Lviv → Berlin | … | … | … | … | … | … |

Do not fill unavailable values.

The report should eventually support slicing by:

- date;
- origin;
- destination;
- acquisition source;
- landing page;
- device;
- CTA placement;
- route status;
- Koval desk.

---

## 16. CTA attribution

Every meaningful commercial CTA should have a recognizable `ctaLocation`.

Recommended values:

```text
inquiry_widget
mobile_sticky
partner_card
route_header
route_footer
```

The exact vocabulary should remain small and controlled.

Do not allow arbitrary free-text CTA names.

This makes it possible to answer:

> Which placement actually drives handoffs?

Example:

```text
mobile_sticky       42%
inquiry_widget      38%
partner_card        15%
route_header         5%
```

These numbers are illustrative only.

---

## 17. Desk attribution

Koval has route/operator-specific WhatsApp desks.

Analytics must carry `deskId` when a conversion event is associated with a desk.

Example:

```text
deskId = koval-de
deskId = koval-at-li
```

The analytics system must never infer the desk from a hard-coded phone number.

The route's structured data is the source of truth.

This is important because the same UARoute interface can support multiple Koval operational desks and, later, multiple carriers.

---

## 18. Cross-domain boundary

M1 should treat UARoute and Koval as separate properties.

Do not attempt to create an artificial cross-domain session identity unless a future implementation proves it necessary and privacy-compliant.

At minimum:

- UARoute records `whatsapp_click`;
- UARoute records `koval_site_click`;
- Koval receives UTM parameters on website referrals;
- future Koval-side analytics can independently record visits and booking activity.

This keeps the first implementation robust and simple.

---

## 19. Koval outbound attribution

All Koval website links from UARoute should include UTM parameters.

Recommended structure:

```text
https://www.4k-koval.com/<path>
  ?utm_source=uaroute
  &utm_medium=referral
  &utm_campaign=m1
  &utm_content=<route>_<placement>
```

Examples:

```text
lviv_hannover_partner_card
lviv_hannover_footer_cta
packages_partner_card
```

Keep these values lowercase and deterministic.

Do not append user phone numbers or lead IDs to Koval URLs.

---

## 20. WhatsApp attribution

The WhatsApp message itself should contain:

- route;
- date;
- passenger count;
- user's phone;
- UARoute source;
- route page;
- ephemeral lead code.

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

The analytics event must not copy the phone number.

---

## 21. Privacy and consent boundary

M1 analytics must follow the site's approved privacy/consent approach.

Regardless of the specific analytics provider:

- do not transmit phone numbers;
- do not transmit names;
- do not transmit WhatsApp message contents;
- do not use analytics as a CRM;
- do not retain a database of inquiries;
- do not create behavioral profiles beyond the approved measurement need;
- do not use sensitive attributes;
- do not put personal data in URLs.

If consent is required by the selected analytics technology or implementation context, analytics must respect it.

The product must remain usable if analytics is unavailable or disabled.

---

## 22. Analytics failure behavior

Analytics must never block:

- route search;
- route-page rendering;
- inquiry form validation;
- WhatsApp handoff;
- Koval website referral.

Failure scenarios include:

- analytics library blocked by browser;
- consent not granted;
- network failure;
- third-party analytics outage;
- JavaScript error in the analytics layer.

The expected product behavior is:

```text
Analytics unavailable
        ↓
Product continues to function normally
```

---

## 23. Event deduplication

Common duplication sources include:

- React re-renders;
- hydration;
- browser back/forward navigation;
- SPA route transitions;
- repeated component mounts.

Rules:

- `route_view` fires once per actual route-page view in a session/context;
- `booking_intent` fires once per successful inquiry submission;
- `whatsapp_click` fires once per user click;
- `koval_site_click` fires once per user click;
- repeated clicks may legitimately produce repeated click events if the user actually clicks repeatedly.

Do not implement broad client-side suppression that hides real user actions.

---

## 24. Analytics naming rules

Event names:

- lowercase;
- snake_case;
- stable;
- semantic;
- action-oriented.

Good:

```text
route_view
booking_intent
whatsapp_click
koval_site_click
```

Avoid:

```text
clickButton
button_clicked_1
track
conversion
event2
```

Properties should use camelCase consistently if that is the project's TypeScript convention.

Example:

```ts
{
  routeId: "lviv-hannover",
  passengerCount: 2,
  ctaLocation: "inquiry_widget"
}
```

---

## 25. Type-safe analytics contract

Engineering should define a typed event union rather than allowing arbitrary event payloads.

Conceptually:

```ts
type AnalyticsEvent =
  | {
      name: "route_search_completed"
      props: {
        searchOrigin: string
        searchDestination: string
        resultCount: number
        matchedRouteId?: string
      }
    }
  | {
      name: "route_view"
      props: {
        routeId: string
        origin: string
        destination: string
        routeStatus: "commercial" | "editorial"
      }
    }
  | {
      name: "booking_intent"
      props: {
        routeId: string
        origin: string
        destination: string
        date: string
        passengerCount: number
        deskId: string
        ctaLocation: string
        conversionType: "whatsapp_inquiry"
        leadId: string
      }
    }
```

The actual implementation may extend this with the remaining M1 events.

The important rule is that analytics is part of the typed product contract.

---

## 26. Analytics implementation boundary

The UI should not contain provider-specific analytics logic everywhere.

Prefer an abstraction such as:

```ts
trackEvent("route_view", {
  routeId,
  origin,
  destination,
  routeStatus,
})
```

rather than:

```ts
gtag(...)
```

inside every React component.

This provides:

- provider independence;
- easier testing;
- easier migration;
- centralized privacy handling;
- centralized event normalization.

---

## 27. Debugging and QA

Every event must be testable in a staging/development environment.

### Required QA checks

#### Route search

- search completion emits exactly one `route_search_completed`;
- aliases normalize correctly;
- zero-result searches are captured;
- no personal data is emitted.

#### Route view

- direct page load emits `route_view`;
- internal navigation emits it correctly;
- re-render does not duplicate it.

#### Inquiry

- missing date blocks submission;
- missing phone blocks submission;
- passenger count remains within accepted range;
- successful submission emits `booking_intent`;
- lead ID is generated;
- phone does not enter analytics payload.

#### WhatsApp

- correct desk receives the message;
- `whatsapp_click` emits once;
- message contains expected fields;
- source page is included;
- lead ID matches analytics event.

#### Koval site

- correct UTM parameters exist;
- `koval_site_click` emits;
- destination is correct;
- no personal data enters the URL.

---

## 28. Analytics acceptance criteria

M1 analytics is complete when:

### Event coverage

- [ ] `route_search_completed` implemented
- [ ] `route_view` implemented
- [ ] `booking_intent` implemented
- [ ] `whatsapp_click` implemented
- [ ] `koval_site_click` implemented
- [ ] `related_route_click` implemented if related-route UI exists

### Attribution

- [ ] source/medium/campaign are consistently available
- [ ] landing-page context is available
- [ ] route ID is available on route-context events
- [ ] CTA location is available on conversion events
- [ ] desk ID is available on WhatsApp conversion events
- [ ] Koval outbound links have UTM parameters

### Privacy

- [ ] phone numbers are not sent to analytics
- [ ] names are not sent to analytics
- [ ] WhatsApp message contents are not sent to analytics
- [ ] personal data is not placed into URLs
- [ ] analytics failure does not break the product

### Conversion integrity

- [ ] WhatsApp is represented as inquiry/handoff, not booking confirmation
- [ ] lead IDs are ephemeral and non-personal
- [ ] route-specific desk configuration drives the destination
- [ ] duplicate event firing has been tested

### Reporting

- [ ] route-level demand can be measured
- [ ] source-level performance can be measured
- [ ] intent rate can be calculated
- [ ] WhatsApp handoff rate can be calculated
- [ ] Koval referral rate can be calculated
- [ ] zero-result search demand can be inspected

---

## 29. M1 dashboard specification

The first useful dashboard should be simple.

### Overview

Show:

```text
Sessions
Route views
Booking intents
WhatsApp clicks
Koval site clicks
```

with period-over-period comparison where the analytics platform supports it.

### Top routes

Show:

```text
Route
Views
Intent
WhatsApp
Intent rate
```

### Acquisition

Show:

```text
Source
Sessions
Route views
Intent
WhatsApp
```

### Search demand

Show:

```text
Origin → Destination
Searches
Matched
No result
```

### Conversion placement

Show:

```text
CTA placement
Booking intent
WhatsApp clicks
Handoff rate
```

Do not build a complex BI application in M1.

---

## 30. Decision framework for analytics

Analytics should change product decisions.

Examples:

### High traffic, low intent

Possible actions:

- improve route relevance;
- improve route content;
- clarify what the user can confirm with Koval;
- improve CTA positioning;
- inspect whether the page is attracting informational rather than travel intent.

### Low traffic, high intent

Possible actions:

- increase SEO coverage;
- strengthen internal linking;
- create supporting content;
- test acquisition campaigns;
- discuss route prioritization with Koval.

### High search, zero result

Possible actions:

- inspect alias coverage;
- verify whether Koval operates the requested corridor;
- consider an editorial route page only if supported by evidence;
- log as product demand intelligence.

### High WhatsApp clicks, weak downstream results

This requires Koval-side evidence.

Do not conclude that the UARoute page is failing without knowing:

- whether Koval responds;
- whether availability exists;
- whether users are qualified;
- whether booking completion occurs.

---

## 31. Attribution roadmap

### M1

Implement:

- event taxonomy;
- route attribution;
- source/medium/campaign;
- landing-page attribution;
- CTA placement;
- desk attribution;
- ephemeral lead ID;
- Koval UTMs;
- basic route-level reporting.

### M2

Potential additions:

- richer zero-result analysis;
- content-to-route attribution;
- first-touch vs conversion-touch reporting;
- funnel cohorts;
- route opportunity scoring;
- experiment metadata.

### M3+

Potential additions:

- Koval lead-status reconciliation;
- confirmed booking imports;
- booking value/revenue;
- CPQL/CPS/CPA reporting;
- route profitability;
- partner/carrier comparison;
- demand forecasting;
- route expansion recommendations.

---

## 32. What not to build

Do not introduce the following into M1:

- a CRM;
- a lead database;
- user accounts;
- persistent personal profiles;
- cross-device identity resolution;
- a complex CDP;
- opaque attribution scoring;
- probabilistic user identification;
- fabricated booking metrics;
- a UARoute booking confirmation state;
- a second transaction system competing with Koval.

The analytical system should remain proportionate to the current product.

---

## 33. Relationship to the source-of-truth documents

Analytics decisions must remain consistent with:

- `00-project-constitution.md` — business model, truthfulness, privacy, Koval boundary;
- `01-product-strategy.md` — North Star and strategic data advantage;
- `02-prd-milestone-1.md` — event scope and implementation requirements;
- `03-ux-and-information-architecture.md` — CTA placement and conversion UX;
- `05-content-and-seo-strategy.md` — route-level search strategy;
- `06-data-model-and-content-governance.md` — route IDs, desk IDs, provenance and data discipline;
- `07-koval-integration-and-conversion.md` — inquiry flow, WhatsApp handoff, lead ID and UTM rules.

If a later implementation decision conflicts with this document, update the relevant decision record rather than silently changing analytics semantics.

---

## 34. Final measurement principle

UARoute should be able to say:

> **“We know which routes people are looking for, which routes generate real travel intent, which acquisition sources create that intent, and how often UARoute hands that intent to Koval.”**

It should not claim:

> **“We generated bookings”**

until Koval-side evidence exists.

That distinction is fundamental to credible measurement.

**M1 analytics success = trustworthy route-demand and conversion-intent data, not a large event catalogue.**
