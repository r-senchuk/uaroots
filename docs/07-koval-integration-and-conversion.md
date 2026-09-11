# UARoute — Koval Integration & Conversion

**Document status:** Living commercial integration and conversion specification  
**Product:** UARoute  
**Domain:** https://uaroute.com/  
**Language:** Ukrainian in the current phase  
**Current milestone:** Milestone 1  
**Primary commercial partner:** Koval / 4K Koval  
**Implementation snapshot (2026-09-11):** Inquiry WhatsApp is owned by the route widget (`BookingWidget` + `validateInquiry`). Homepage `PartnerCard` is website + sourced claims, not a second `wa.me` conversion path. Desks: `koval-de` (Іван), `koval-at` (Микола, unused on current commercial routes).

---

## 1. Purpose

This document defines how UARoute turns route intent into a measurable inquiry for Koval.

It covers:

- the UARoute → Koval relationship,
- partner positioning,
- route-to-carrier handoff,
- inquiry form,
- WhatsApp desk routing,
- WhatsApp message construction,
- lead-code attribution,
- Koval website referrals,
- CTA strategy,
- conversion measurement,
- privacy boundaries,
- future commercial models.

The objective is not to create a new Koval booking system.

The objective is:

> **Capture a useful transport inquiry in UARoute and hand it to the correct Koval contact with as little friction and ambiguity as possible.**

---

# 2. Strategic Integration Principle

The integration boundary is:

```text
UARoute
Discovery
Route information
Intent capture
Attribution
        ↓
Koval
Transport inquiry
Availability
Booking
Fulfilment
```

The governing principle is:

> **UARoute owns discovery and intent. Koval owns the transaction.**

UARoute must not imply that it confirms a seat, confirms a price, or completes a booking.

---

# 3. User Value at the Handoff

The user arrives at a route page because they want to understand a journey.

The handoff should answer:

> "I understand the route. I now want to ask the actual transport provider about travelling on my date."

UARoute should reduce friction by carrying forward:

- origin,
- destination,
- selected date,
- passenger count,
- user phone.

The user should not have to re-enter the route.

---

# 4. Koval Website

Primary carrier site:

https://www.4k-koval.com/

Current Koval public booking behavior uses a WhatsApp handoff.

The current Koval booking form was identified as requiring:

- travel date,
- contact phone,
- departure city,
- arrival city.

The current Koval form does not request:

- passenger count,
- name,
- return date,
- luggage details,
- pickup address.

UARoute adds passenger count because it improves inquiry quality while remaining a small additional field.

---

# 5. UARoute Inquiry vs Koval Booking

The terminology must remain precise.

## UARoute action

> **Inquiry**

Examples:

- `booking_intent`
- `whatsapp_inquiry`

## Koval action

> **Booking / transport confirmation**

A WhatsApp click does not confirm:

- a seat,
- a departure,
- a price,
- availability.

Therefore never use the following as the primary M1 CTA:

> **Забронювати**

Preferred:

> **Написати Koval у WhatsApp**

or:

> **Уточнити поїздку у WhatsApp**

---

# 6. Primary Conversion Flow

The complete flow is:

```text
Route page
     ↓
Select date
     ↓
Enter phone
     ↓
Select passengers
     ↓
Validate
     ↓
Resolve route desk
     ↓
Generate lead ID
     ↓
Generate WhatsApp message
     ↓
Track inquiry intent
     ↓
Track WhatsApp click
     ↓
Open correct Koval WhatsApp
     ↓
User presses Send
     ↓
Koval handles conversation
```

No UARoute backend is required for this flow.

---

# 7. Inquiry Widget

The widget should be compact and route-specific.

## Fields

### Date

Required.

Must not be in the past.

### Phone

Required.

Used to give Koval a callback/contact number.

Should not be persisted by UARoute.

### Passengers

Optional operational detail.

Default:

`1`

Range:

`1–8`

Origin and destination are inherited from the current route.

---

# 8. Form UX

Recommended structure:

```text
Дата
[ date ]

Телефон
[ +38 ... ]

Пасажири
[ 1 ]

[ Написати Koval у WhatsApp ]
```

Supporting copy:

> **Ви будете перенаправлені у WhatsApp до Koval для уточнення поїздки.**

The user should understand that:

- UARoute is preparing an inquiry,
- WhatsApp will open,
- the user still needs to press Send,
- Koval handles the response.

---

# 9. Validation

The CTA may open WhatsApp only after valid input.

## Date

Required.

Reject past dates.

## Phone

Required.

Validate in a way broadly consistent with the existing Koval behavior.

Allow:

- international `+`,
- reasonable digits/spaces/separators.

The system should normalize the phone for display/message purposes without storing it.

## Passenger count

Accept only integers 1–8.

## Route

Origin and destination must come from the canonical Route entity.

Do not allow the form to silently create arbitrary commercial routes.

---

# 10. Error Copy

Keep errors short and local.

### Missing date

> **Оберіть дату поїздки.**

### Missing phone

> **Вкажіть номер телефону.**

### Invalid phone

> **Перевірте номер телефону.**

### Invalid passengers

> **Вкажіть кількість пасажирів від 1 до 8.**

### Missing desk

Do not show a broken WhatsApp button.

Use:

> **Перейти на сайт Koval**

---

# 11. Koval Desk Model

The contact destination must be data-driven.

## Germany / default desk

**Іван**

Phone:

`+38 050 978 63 30`

WhatsApp:

`https://wa.me/380509786330`

## Austria / Liechtenstein

**Микола**

Phone:

`+380 63 079 2000`

WhatsApp:

`https://wa.me/380630792000`

These contacts come from the Koval site review and should be treated as operational configuration.

Before a production release, confirm that the contact data is still current.

---

# 12. Desk Routing

Every inquiry-enabled Route should reference a `deskId`.

Example:

```text
Route:
lviv-hannover
deskId:
koval-de
```

An Austrian route may reference:

```text
deskId:
koval-at
```

Do not infer a desk using arbitrary text rules.

Do not implement:

```text
if destination contains "Vienna"
  use Mykola
```

Instead:

> Route data explicitly selects the desk.

This keeps the integration deterministic.

---

# 13. WhatsApp Fallback

If the route has no verified desk:

1. do not construct a wa.me link,
2. do not guess the number,
3. do not silently use the Germany desk,
4. offer the Koval website.

This protects against routing users to the wrong operator.

---

# 14. WhatsApp Message

Recommended production template:

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

---

# 15. Message Rules

The WhatsApp message must:

- be generated programmatically,
- be URL-encoded,
- use the route's actual desk,
- include the route,
- include date,
- include passenger count,
- include phone,
- include UARoute source,
- include route URL,
- include lead ID.

Do not include:

- UTM parameters,
- raw analytics payload,
- JSON,
- internal database identifiers,
- undefined values,
- empty lines caused by missing optional values.

---

# 16. Why Include the Phone

Koval currently requires a contact phone in its own inquiry flow.

The phone is therefore justified in the UARoute inquiry.

However:

> **UARoute should not store the phone.**

The phone should only appear in the message the user voluntarily sends to Koval.

Phone numbers must not be sent to analytics.

Phone numbers must not appear in URLs.

Phone numbers must not become database records in M1.

---

# 17. Lead ID

Generate an opaque random lead code at inquiry time.

Example:

`UR-8F3K`

Properties:

- short,
- readable,
- not derived from personal data,
- unique enough for practical reconciliation,
- generated client-side,
- not persisted in a UARoute database.

The code appears in:

- WhatsApp message,
- analytics context.

It is intended to support future lead reconciliation with Koval.

It is not a booking ID.

---

# 18. Lead Lifecycle

M1 uses:

```text
Lead ID generated
      ↓
Inquiry intent
      ↓
WhatsApp click
      ↓
User manually sends message
      ↓
Koval receives inquiry
```

M1 does not have direct visibility into:

- message successfully sent,
- dispatcher response,
- qualified lead,
- booking,
- revenue.

Those require Koval-side cooperation.

---

# 19. Conversion Events

Core events:

```text
route_view
booking_intent
whatsapp_click
koval_site_click
```

Search-related event:

```text
route_search_completed
```

Optional contextual event:

```text
related_route_click
```

---

# 20. `booking_intent`

For analytics purposes:

> `booking_intent` means the user successfully submitted valid inquiry data on UARoute.

It does NOT mean:

- booking completed,
- seat confirmed,
- payment completed.

Suggested event context:

```text
conversionType:
whatsapp_inquiry
```

---

# 21. `whatsapp_click`

Fire when the correct WhatsApp URL is successfully constructed and the handoff is initiated.

Context should include:

```text
routeSlug
origin
destination
travelDate
passengerCount
ctaLocation
leadId
deskId
source
medium
campaign
landingPage
```

Do not include phone number.

---

# 22. CTA Locations

Track where the inquiry came from.

Possible values (M1 TypeScript union):

```text
hero
booking_widget
partner_card
related_route
sticky_mobile
footer
route_index
```

M1 primarily uses:

- booking_widget,
- partner_card,
- sticky_mobile.

`article` is not an M1 `ctaLocation`. Do not emit it.

This allows future conversion-rate optimization.

---

# 23. Koval Website CTA

Secondary action:

> **Сайт Koval**

This is useful for users who want to inspect the carrier first.

Use UTM parameters.

Example:

```text
https://www.4k-koval.com/
?utm_source=uaroute
&utm_medium=referral
&utm_campaign=m1
&utm_content=lviv-hannover_partner
```

The exact `<route>_<placement>` value should be generated programmatically.

---

# 24. UTM Rules

Use:

```text
utm_source=uaroute
utm_medium=referral
utm_campaign=m1
utm_content=<route>_<placement>
```

Do not put UTM parameters into WhatsApp messages.

Do not put UTM parameters into canonical URLs.

Do not use UTM parameters to create alternate route pages.

---

# 25. Koval Partner Card

The Koval partner module should explain the handoff.

Suggested content:

### Перевізник

**Коваль**

Passenger transport and parcel transport.

Then:

> **Перевезення виконує Koval; UARoute допомагає знайти маршрут та підготувати запит.**

Actions on the **route inquiry widget** (not a second homepage WhatsApp):

> **Написати Koval у WhatsApp**

On the homepage partner card:

> **Сайт Koval**

plus sourced claims. The homepage must not open a desk `wa.me` without date, phone, and lead code.

---

# 26. Partner Trust Rules

Do not use unsupported commercial language such as:

- best,
- cheapest,
- safest,
- No. 1,
- guaranteed,
- 100% reliable.

Do not display:

- fake ratings,
- fake review counts,
- unsupported price claims,
- invented booking guarantees.

The Koval partner section should communicate factual identity and service relationship.

---

# 27. Route-Specific Conversion

A route-specific inquiry is more valuable than a generic contact.

The system should preserve:

```text
Origin
Destination
Date
Passengers
Phone
Route URL
Lead ID
Desk
```

This allows the Koval dispatcher to receive a structured request instead of:

> "Hi, how much?"

This is a primary product advantage over sending users to a generic homepage.

---

# 28. Generic Koval Link vs Route Inquiry

The product should distinguish:

### User is ready to ask about the route

→ use route inquiry widget / WhatsApp.

### User wants to research the carrier

→ use Koval website.

Do not force all users into WhatsApp.

The partner website remains a valid secondary path.

---

# 29. Mobile Conversion

The mobile route page should provide a sticky action after the main inquiry widget has been scrolled past.

Label:

> **Написати Koval**

The sticky CTA must use the same:

- route,
- validation,
- desk,
- lead ID,
- message generation

as the primary widget.

It is not a different conversion system.

---

# 30. Conversion Psychology

The interaction should feel like:

> "I found the route; now I can ask the provider."

Not:

> "I am being forced to book."

Therefore:

- avoid artificial urgency,
- avoid fake availability,
- avoid countdowns,
- avoid "only 2 seats left",
- avoid aggressive popups,
- avoid repeated full-screen CTA interruptions.

---

# 31. Privacy Boundary

M1 must remain privacy-minimal.

UARoute does not create an account or booking database.

Do not persist:

- phone,
- name,
- email,
- travel date,
- passenger identity.

Temporary client-side values are allowed to complete the immediate WhatsApp handoff.

The user then voluntarily transmits the information to Koval through WhatsApp.

---

# 32. Analytics Boundary

UARoute tracks behavior and conversion events.

It should not become a shadow CRM for Koval.

M1 does not store:

- customer profiles,
- dispatcher conversations,
- booking history,
- revenue records.

Future commercial reporting should be based on a deliberately agreed data exchange with Koval.

---

# 33. Attribution Funnel

The commercial funnel is:

```text
Organic visitor
      ↓
Route view
      ↓
Inquiry intent
      ↓
WhatsApp click
      ↓
Koval receives inquiry
      ↓
Qualified lead
      ↓
Booking
      ↓
Revenue
```

UARoute controls:

- route discovery,
- route view,
- inquiry form,
- WhatsApp click,
- UTM referrals.

Koval controls:

- human response,
- qualification,
- booking,
- revenue.

---

# 34. What UARoute Can Prove in M1

M1 can prove:

- traffic volume,
- route demand,
- route engagement,
- inquiry volume,
- WhatsApp handoffs,
- Koval website referrals.

M1 cannot independently prove:

- successful WhatsApp delivery,
- qualified lead,
- confirmed booking,
- booking value,
- revenue.

Do not present M1 analytics as revenue attribution.

---

# 35. Future Lead Reconciliation

Potential future process:

```text
UARoute
UR-8F3K
     ↓
Koval dispatcher
     ↓
Booked? Yes / No
     ↓
Monthly report
```

Koval could eventually maintain a lightweight field:

> UARoute lead code

This could enable:

- qualified lead reporting,
- booking attribution,
- CPQL,
- cost-per-booking,
- revenue reporting.

Do not require this operational process for the M1 technical implementation.

---

# 36. Initial Commercial Models

Once inquiry volume is demonstrated, possible commercial models include:

### CPQL

Payment per qualified lead.

### CPB

Payment per confirmed booking.

### Fixed partnership

Monthly acquisition/placement fee.

### Hybrid

Fixed fee + performance.

### Sponsored route

Paid preferred route placement.

### Preferred corridor

Koval receives preferred placement for defined corridors.

These are commercial strategy options, not M1 implementation requirements.

---

# 37. Future Multi-Carrier Compatibility

The conversion architecture should support:

```text
Route
 ├── Koval
 ├── Carrier B
 └── Carrier C
```

without requiring a redesign of route data.

However:

> M1 shows only Koval.

Do not introduce:

- carrier comparison,
- rankings,
- bidding,
- marketplace checkout,
- pricing comparison

in M1.

---

# 38. Route Eligibility for Koval Conversion

A route may show Koval conversion only when:

- the carrier relationship is sufficiently verified,
- the route is classified `commercial`,
- a valid desk exists OR a Koval website fallback exists.

Editorial routes should not pretend to have an active Koval inquiry flow.

---

# 39. Passenger vs Parcel Conversion

Do not mix the two in one inquiry form.

### Passenger

Primary M1 conversion:

> WhatsApp transport inquiry.

### Parcel

Future / secondary flow:

> Koval parcel information.

Parcel routes may use different desks and operational rules.

A future parcel conversion model must be treated separately.

---

# 40. Conversion Copy Principles

Use:

- direct language,
- factual wording,
- human tone,
- Ukrainian,
- clear expectation setting.

Prefer:

> **Написати Koval у WhatsApp**

> **Уточнити поїздку**

Avoid:

> **Забронювати зараз!**

> **Гарантуйте місце!**

> **Останні місця!**

unless those claims are genuinely supported by a future live availability system.

---

# 41. Conversion Placement Strategy

### Homepage

Partner CTA after discovery content.

### Route page

Primary inquiry widget is the main conversion surface.

### Partner card

Secondary repeated access.

### Mobile

Sticky CTA after main widget.

### Future articles

Contextual route CTA after the article has answered the user's question.

Avoid showing the same large CTA repeatedly throughout a page.

---

# 42. Conversion Quality

A useful inquiry contains enough information for Koval to act.

Minimum:

- route,
- date,
- passenger count,
- phone.

Attribution:

- source,
- route URL,
- lead code.

This is superior to a generic:

> "Hi, I found your website."

---

# 43. Operational Safety

Never send an inquiry to an uncertain destination.

Before creating a WhatsApp URL:

1. load the Route,
2. load the `deskId`,
3. validate desk,
4. validate required fields,
5. build message,
6. generate URL,
7. track event,
8. open WhatsApp.

Any failure should fall back to the Koval website rather than guessing.

---

# 44. Integration Testing

Every release should test:

### Germany route

Correctly opens Ivan's desk.

### Austria route

Correctly opens Mykola's desk.

### Liechtenstein route

Correctly opens Mykola's desk.

### Missing desk

Falls back to Koval website.

### Missing date

Does not open WhatsApp.

### Missing phone

Does not open WhatsApp.

### Invalid phone

Does not open WhatsApp.

### Passengers

1–8 only.

### Message

Contains no `undefined` / empty fields.

### Lead code

Exists and is identical in analytics and generated message.

---

# 45. Conversion QA

Verify:

- correct route,
- correct date,
- correct passenger count,
- correct phone,
- correct desk,
- correct route URL,
- correct lead code,
- correct CTA location,
- correct UTM on Koval website link.

Do not manually assume that a click means the message was sent.

---

# 46. Future Conversion Extensions

Possible later features:

- Koval live availability,
- direct booking confirmation,
- route-specific schedule,
- price,
- parcel inquiry,
- return-trip selection,
- pickup/dropoff details,
- dispatcher dashboard,
- confirmed booking reconciliation.

Each requires new evidence/integration and must not be simulated in M1.

---

# 47. Conversion Optimization Roadmap

After traffic exists, optimize in this order:

### 1. Route-to-inquiry conversion

Does the route page create inquiry intent?

### 2. Form completion

Do users complete date/phone/passenger selection?

### 3. WhatsApp handoff

Do users click WhatsApp?

### 4. Koval quality

Does Koval consider the inquiries useful?

### 5. Booking conversion

Can Koval provide booking outcomes?

Avoid optimizing downstream metrics that cannot yet be measured.

---

# 48. Commercial Reporting

Eventually create a monthly partner report containing:

### Acquisition

- UARoute users,
- route searches,
- route views.

### Intent

- inquiry starts,
- WhatsApp clicks.

### Route demand

- top origins,
- top destinations,
- top routes.

### Commercial

- qualified leads,
- bookings,
- attributed revenue when Koval data is available.

The report should separate measured facts from estimates.

---

# 49. Integration Anti-Patterns

Avoid:

- one global WhatsApp number for every route,
- asking users to re-enter origin/destination,
- storing customer phone numbers in UARoute,
- claiming a WhatsApp click is a booking,
- using fake availability,
- putting UTM strings in WhatsApp text,
- creating a generic contact form instead of route inquiry,
- forcing users to Koval homepage when route context can be preserved,
- building a Koval-specific architecture that prevents future carriers.

---

# 50. Definition of Done

The Koval integration is complete for M1 when:

### Route

A commercial route has a valid carrier and inquiry desk.

### Form

The user can enter:

- date,
- phone,
- passengers.

### Handoff

The correct Koval WhatsApp desk opens.

### Message

The message contains:

- route,
- date,
- passengers,
- phone,
- UARoute,
- route URL,
- lead code.

### Attribution

Analytics captures:

- route,
- CTA location,
- desk,
- lead code,
- source/campaign context.

### Privacy

UARoute stores no personal customer record.

### Fallback

Routes without a verified WhatsApp desk use the Koval website.

### Semantics

The interface calls the action an inquiry/contact, not a confirmed booking.

---

# 51. Final Integration Principle

The integration should feel almost invisible to the user:

> **Find a route on UARoute → prepare a useful inquiry → contact the correct Koval desk.**

The technical complexity should remain behind the scenes.

The user should experience a simple, trustworthy handoff from:

> **route discovery**

to

> **real human transport conversation.**
