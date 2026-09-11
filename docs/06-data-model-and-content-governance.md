# UARoute — Data Model & Content Governance

**Document status:** Living data and content-governance specification  
**Product:** UARoute  
**Domain:** https://uaroute.com/  
**Language:** Ukrainian in the current phase  
**Current milestone:** Milestone 1  
**Primary commercial partner:** Koval / 4K Koval  
**Implementation snapshot (2026-09-11):** Desks in code are `koval-de` and `koval-at`. Koval `claims[]` hold the matrix-approved statements sourced to `https://www.4k-koval.com/` on 2026-09-11. `validateCatalog()` runs at build via `src/app/sitemap.ts`.

---

## 1. Purpose

This document defines how UARoute represents places, routes, carriers, contact desks and sourced claims, and how content is validated before it is exposed to users or search engines.

The objectives are:

- keep route information structurally consistent,
- separate factual data from presentation,
- distinguish commercial routes from editorial destinations,
- preserve source provenance,
- prevent unsupported operational claims,
- support future content scaling,
- preserve future multi-carrier capability,
- reduce accidental misinformation by AI-assisted development.

This document is a **governance contract** as much as a data-model description.

---

# 2. Core Governance Principle

> **If UARoute does not have evidence for a fact, it must not present that fact as known.**

When operational information is unknown, UARoute should:

1. omit it,
2. identify it as something to confirm,
3. or obtain a source and record its provenance.

Do not fill missing fields with plausible values.

Do not derive operational claims merely because they "look reasonable."

---

# 3. Separation of Concerns

UARoute separates:

```text
Data
  ↓
Content governance
  ↓
Presentation
  ↓
User interaction
```

A component should not define route facts.

For example, a route component should receive route data rather than contain:

> "Львів → Ганновер"

as embedded business content.

This allows the same route entity to be:

- displayed on the homepage,
- displayed in `/routes`,
- rendered on its canonical route page,
- linked from future articles,
- used by analytics.

---

# 4. Core Entities

Milestone 1 uses five core concepts:

```text
City
Route
Carrier
Desk
Claim
```

Future content entities such as `Article` may be added later.

A `Lead` entity is deliberately **not** part of M1.

---

# 5. City

## Purpose

Represents a geographic place used for:

- route origin,
- route destination,
- search,
- aliases,
- future city content.

## Suggested model

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

### `id`

Stable internal identifier.

Must not be derived from display text in UI.

### `slug`

Canonical URL-safe identifier where a City eventually receives a public page.

City aliases must not generate separate SEO URLs.

### `name`

Canonical Ukrainian display name.

Example:

> Ганновер

### `country`

Display country.

Example:

> Німеччина

### `countryCode`

Stable country code.

Use a consistent convention throughout the application.

### `aliases[]`

Search-only variants.

Examples may include:

- Ukrainian transliteration variants,
- local-language names,
- English names,
- common user spellings.

Aliases resolve to one canonical City.

### `kind`

Allowed values:

```text
hub
satellite
destination
```

This distinction is important because a city or settlement mentioned by a carrier may represent:

- a pickup hub,
- a satellite pickup area,
- or a destination.

Do not automatically treat every name as an independent transport stop.

---

# 6. City Data Rules

A City may exist in the data layer without being:

- a commercial route,
- a public route page,
- a pickup location,
- a guaranteed stop.

The presence of a city record does not imply transport availability.

The UI must derive user-facing meaning from the appropriate relationship.

---

# 7. Route

## Purpose

Represents a specific origin → destination relationship.

The Route is the primary product/content entity of UARoute.

## Suggested model

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

---

# 8. Route Identity

A Route should have one stable identity.

Example:

```text
slug:
lviv-hannover
```

Canonical URL:

```text
https://uaroute.com/routes/lviv-hannover
```

Do not create multiple route entities for spelling variants.

Do not create:

```text
lviv-hannover
lviv-hanover
lvov-hannover
lviv-gannover
```

Aliases belong to City search, not to route duplication.

---

# 9. Route Status

Allowed values:

```text
commercial
editorial
```

## `commercial`

A route that UARoute is willing to expose as a transport-inquiry opportunity.

Commercial routes may appear in:

- route index,
- homepage route discovery,
- related routes,
- sitemap,
- commercial internal links.

## `editorial`

A relationship or destination that may be discussed as information but must not automatically be interpreted as a Koval transport product.

Editorial routes must not be presented with language that implies booking availability.

---

# 10. Commercial Route Requirements

A route should be `commercial` only when there is sufficient evidence to justify the relationship.

Evidence may come from:

- verified carrier information,
- confirmed operational relationship,
- approved project data.

Do not promote a route to `commercial` simply because:

- a city appears in a carrier datalist,
- a city appears in an image caption,
- a city is mentioned in general marketing copy,
- another website suggests the route,
- an AI model believes it is likely.

---

# 11. Route Corridor

The `corridor` represents broad geographic context.

Example:

```text
Україна → Польща → Німеччина
```

A corridor is not an operational itinerary.

Do not interpret a corridor as proof of:

- specific stops,
- border crossing,
- route timing,
- exact road,
- passenger boarding points.

The UI should visually communicate it as geographic context.

---

# 12. Forbidden Route Data in M1

Do not populate or render the following unless explicitly sourced and verified:

- trip duration,
- passenger timetable,
- departure times,
- arrival times,
- stop lists,
- ticket price,
- availability,
- booking status,
- operational distance,
- guaranteed departure frequency,
- ratings,
- reviews.

The absence of these fields is acceptable.

An empty field is better than a fabricated value.

---

# 13. Route Description

Each commercial route should have a unique description.

The description should explain:

- origin,
- destination,
- journey context,
- carrier relationship,
- what UARoute helps the traveller understand.

Do not copy the same paragraph and replace city names mechanically.

---

# 14. Route FAQ

`faq[]` should contain real, useful passenger questions.

Each FAQ item should be:

```text
FAQ
- question
- answer
```

Answers must be consistent with the route page and source data.

If a question cannot be answered reliably:

> Convert it into a "what to confirm" item instead of inventing an answer.

---

# 15. What-To-Confirm

`whatToConfirm[]` is intentionally different from FAQ.

It contains questions the traveller should ask Koval when the public information is not sufficient.

Examples:

```text
- точний час виїзду
- місце посадки
- вартість
- умови багажу
- можливість адресної подачі
```

These are not missing data fields that need to be guessed.

They are deliberately surfaced user guidance.

---

# 16. Carrier

## Purpose

Represents a transport provider.

Suggested model:

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

Milestone 1 displays Koval as the initial visible carrier.

The architecture remains carrier-agnostic.

Future:

```text
Route
 ├── Koval
 ├── Carrier B
 └── Carrier C
```

Do not introduce multi-carrier comparison UI in M1.

---

# 17. Carrier Naming

Use the canonical project-approved display name.

Current strategy:

> **Коваль / Koval**

Do not introduce additional variants such as:

- Koval Express,
- Koval Transport,
- Коваль Експресс,

unless the source and product requirements explicitly call for them.

Brand naming should be consistent across:

- partner section,
- CTA,
- WhatsApp message,
- SEO content,
- analytics labels.

---

# 18. Desk

## Purpose

Represents a contact/WhatsApp desk used to route an inquiry.

Suggested model:

```text
Desk
- id
- label
- phone
- whatsapp
- countries[]
```

Current known desks:

### Germany / default

```text
id: koval-de
label: Іван
phone: +38 050 978 63 30
whatsapp: https://wa.me/380509786330
countries:
  Germany
```

### Austria / Liechtenstein

```text
id: koval-at
label: Микола
phone: +380 63 079 2000
whatsapp: https://wa.me/380630792000
countries:
  Austria
  Liechtenstein
```

These numbers were identified from the Koval site review.

Because contact information can change, treat it as operational configuration and verify before production releases.

---

# 19. Desk Routing Rules

A Route references a `deskId`.

Do not infer the desk from:

- destination text,
- country labels,
- UI copy,
- arbitrary string matching.

Explicit relationship is safer.

If a route has no verified desk:

> fall back to the Koval website.

Never generate an invalid WhatsApp URL.

---

# 20. Claim

## Purpose

A Claim represents a factual statement about a carrier/service that UARoute is willing to display.

Suggested model:

```text
Claim
- text
- sourceUrl
- lastVerifiedAt
```

Optional future fields may be added only when needed for governance.

---

# 21. Claim Provenance

Every displayed Koval service claim should have a source.

Examples of possible claims, when verified:

- direct trips,
- two professional drivers,
- booking without prepayment,
- address delivery in Germany,
- passenger transport,
- parcel transport.

The source should be preserved even if it is not always displayed directly to the user.

---

# 22. Claim Freshness

`lastVerifiedAt` should represent the date on which the project last checked the underlying source.

Do not fabricate verification dates.

Do not mark a claim as verified merely because it existed previously.

Potentially changing operational information should be reviewed more frequently than stable geographic facts.

---

# 23. Claim Language

Do not strengthen a source claim during rewriting.

For example:

Source:

> "direct trips"

Do not transform it into:

> "guaranteed direct departures every week"

unless the source explicitly supports the stronger statement.

Preserve the meaning and scope of the original evidence.

---

# 24. Stable vs Operational Data

The governance model distinguishes:

## Relatively stable data

Examples:

- city name,
- country,
- city alias,
- route slug,
- carrier identity.

## Potentially changing data

Examples:

- contact phone,
- WhatsApp desk,
- carrier claims,
- schedules,
- prices,
- baggage rules,
- border information,
- availability.

The second group requires stronger provenance and/or verification.

---

# 25. Forbidden "Filler Data"

Never use placeholder values that look real.

Forbidden patterns include:

```text
від 100€
4.5 ★
~20 год
1,350 км
регулярно щотижня
вільні місця
гарантований виїзд
```

unless each specific value is sourced and approved.

Do not use:

- `0`,
- `N/A`,
- made-up estimates,
- generated defaults

to make the UI look populated.

If unknown:

> omit it or present a useful "what to confirm" question.

---

# 26. Legacy UARoute Data Governance

The existing UARoute application is a source of candidate data, not automatically authoritative production data.

Legacy objects should be classified:

```text
keep
transform
verify
redirect
delete
```

Before migration, review:

- carrier records,
- city records,
- aliases,
- routes,
- prices,
- ratings,
- metadata,
- URLs.

Known unsupported legacy values such as:

- `від 100€`,
- `4.5`

must not be migrated simply because they already exist.

---

# 27. Koval as Source of Carrier Facts

Koval's site is a primary source for:

- carrier identity,
- public service claims,
- public contact desks,
- public passenger/parcel information.

However:

> **Koval's public marketing copy is not automatically proof of a detailed operational product.**

For example, a city can appear in a destination list without establishing:

- a published timetable,
- a dedicated route,
- a guaranteed departure,
- an exact pickup arrangement.

UARoute should therefore maintain a stricter interpretation layer.

---

# 28. Editorial vs Commercial Evidence

Example:

A city appears in Koval marketing.

This may justify:

> City exists as a possible destination / editorial topic.

It does not automatically justify:

> Commercial UARoute route with bookable inquiry.

Promotion to commercial status requires sufficient evidence.

---

# 29. Content Publication Pipeline

Recommended workflow:

```text
Raw source
   ↓
Extract fact
   ↓
Verify relevance
   ↓
Classify
   ↓
Attach provenance
   ↓
Approve
   ↓
Publish
```

AI-generated content should never skip the source/verification layer for operational facts.

---

# 30. Content Classification

Every future content item should have a clear category.

Examples:

```text
commercial-route
destination
travel-guide
border-guide
document-guide
baggage-guide
parcel-guide
carrier-information
```

Do not combine unrelated intents on one page simply to increase content volume.

---

# 31. Page Eligibility for Indexing

A page should be indexable only when it has:

- a stable identity,
- meaningful unique content,
- a canonical URL,
- a clear user purpose,
- enough information to satisfy the intended search.

Do not create indexable pages just because the underlying database contains an entity.

---

# 32. Sitemap Eligibility

A route belongs in the sitemap only if:

1. it is a real published page,
2. it has meaningful content,
3. it is intended for search discovery,
4. its status is appropriate for indexing.

For M1:

> Commercial route pages only.

---

# 33. Internal Link Eligibility

A route can be used in:

- homepage route lists,
- route index,
- related routes,

only when its page actually exists.

Do not create references to future pages.

Do not generate dead links.

---

# 34. SEO Data Integrity

The same source data must drive:

- visible page,
- title,
- meta description,
- canonical,
- sitemap,
- structured data,
- internal route links.

Avoid separate manually-maintained values that can diverge.

Example:

If the canonical route slug is:

```text
lviv-hannover
```

the same route identity should drive:

```text
/routes/lviv-hannover
```

sitemap entry and canonical URL.

---

# 35. Data Validation Rules

At build time, validate at minimum:

### City

- unique ID,
- unique slug,
- valid country,
- aliases do not collide unexpectedly.

### Route

- unique ID,
- unique slug,
- valid origin city,
- valid destination city,
- at least one carrier for commercial routes,
- valid desk for inquiry-enabled routes,
- no self-route unless intentionally supported.

### Carrier

- unique ID,
- unique slug,
- valid website if present.

### Desk

- valid WhatsApp destination,
- valid phone representation,
- unique ID.

### Claim

- non-empty text,
- source URL,
- verification date.

If validation fails:

> fail the build rather than silently rendering questionable data.

---

# 36. Commercial Route Validation

A `commercial` Route should satisfy:

```text
origin exists
AND
destination exists
AND
carrier exists
AND
desk exists OR website fallback is configured
AND
unique slug
AND
unique useful content
```

A commercial route without a valid inquiry path should not be presented as fully bookable/inquiry-ready.

---

# 37. Editorial Route Validation

An `editorial` route may exist for content relationships without:

- active inquiry,
- Koval commercial claim,
- WhatsApp desk.

It must not be promoted as a commercial transport offering.

---

# 38. Data and UI Boundaries

Data should represent facts and relationships.

UI should decide:

- how information is arranged,
- how it is visually presented,
- how users interact with it.

Do not let UI components:

- invent claims,
- infer commercial status,
- decide carrier routing,
- construct unsupported operational data.

---

# 39. Data and Analytics Boundaries

Operational/user information required for a single inquiry may be temporarily assembled client-side.

Milestone 1 does not persist personal data in a UARoute database.

Do not add phone numbers or names to persistent route data.

Analytics receives non-sensitive operational context and an opaque lead ID, not the user's phone number.

---

# 40. No Lead Entity in M1

A `Lead` database entity is intentionally excluded.

The `UR-XXXX` lead code is:

- ephemeral,
- opaque,
- included in the WhatsApp message,
- included in analytics context.

It is a future reconciliation key, not a stored customer record.

---

# 41. Data Governance for Future Content

As UARoute expands, every new content type should answer:

1. What entity does this content describe?
2. Is it factual or editorial?
3. What is its source?
4. How often can it change?
5. Does it imply availability?
6. Is it commercially safe to publish?
7. Is there a unique user purpose?

If these questions cannot be answered, the content should not automatically be published.

---

# 42. AI-Assisted Content Rules

AI may assist with:

- summarization,
- formatting,
- translation,
- drafting,
- metadata suggestions,
- internal-link suggestions.

AI must not independently invent:

- prices,
- timetables,
- availability,
- route stops,
- contact details,
- reviews,
- ratings,
- guarantees,
- commercial status.

For operational claims:

> **Source first, generate second.**

---

# 43. Change Management

When a critical source changes:

1. identify affected Claims/Routes/Desks,
2. update the data,
3. update `lastVerifiedAt`,
4. review affected page copy,
5. rebuild,
6. verify SEO output,
7. record the change if strategically important.

A future automated content audit may be added, but M1 remains intentionally simple.

---

# 44. Recommended Source Hierarchy

For Koval-related information, prefer:

### Tier 1

Current Koval production website / confirmed Koval-provided information.

### Tier 2

Project-maintained verified data derived from Tier 1.

### Tier 3

Other reliable sources for general geographic/travel information.

### Tier 4

Unverified user-generated or model-inferred information.

Tier 4 must not be treated as evidence for operational UARoute claims.

When the required fact is not sufficiently supported:

> do not publish it as fact.

---

# 45. Data Lifecycle

A useful lifecycle is:

```text
Candidate
   ↓
Verified
   ↓
Published
   ↓
Re-verified
   ↓
Updated
   ↓
Deprecated
```

A deprecated route/data object should not remain silently active.

Future tooling can support explicit status transitions.

---

# 46. Content Review Checklist

Before publishing or updating a commercial route:

### Identity

- Is the route uniquely identified?

### Commercial status

- Is there sufficient evidence to treat it as commercial?

### Carrier

- Is the carrier correct?

### Desk

- Is the inquiry desk correct?

### Claims

- Are claims sourced?

### Operational data

- Is anything presented that looks like a schedule/price/availability?

### SEO

- Does the page have a unique purpose?

### UX

- Is the next action clear?

### Freshness

- Are time-sensitive claims verified?

---

# 47. Examples of Correct Governance

### Correct

> **Коли виїзд?**
>
> Уточніть точний час поїздки у Koval.

Reason:

The carrier does not publish a reliable passenger timetable.

### Correct

> **Перевезення виконує Koval.**

Reason:

Carrier relationship is known and source-backed.

### Correct

> **Україна → Польща → Німеччина**

Reason:

Broad route/corridor context can be presented when supported.

### Incorrect

> **Виїзд щочетверга о 18:30.**

unless a current verified source supports it.

### Incorrect

> **Поїздка коштує від 100€.**

unless current pricing is verified.

### Incorrect

> **4.5/5 ★**

without a trustworthy review source.

---

# 48. Future Extensions

The data model can later support:

### City pages

`City → Article / Routes`

### Articles

`Article → City / Route / Topic`

### Parcel

Separate parcel-specific data and contacts.

### Multiple carriers

`Route → Carrier[]`

### Availability

A future operational data layer.

### Booking confirmation

A future external booking/reconciliation layer.

These should be introduced only when actual requirements justify them.

---

# 49. Governance Principles for Agents

Any AI agent modifying UARoute data or content should:

1. read this document,
2. identify the source of the change,
3. distinguish fact from inference,
4. preserve provenance,
5. avoid inventing missing values,
6. run data validation before publishing,
7. avoid changing commercial status casually.

When uncertain:

> prefer omission over fabrication.

---

# 50. Definition of Data Governance Done

The data/content system is considered compliant when:

- entities have stable identifiers,
- commercial/editorial status is explicit,
- carrier relationships are data-driven,
- desk routing is explicit,
- Koval claims have provenance,
- operational values are not fabricated,
- aliases do not create duplicate URLs,
- sitemap reflects actual published pages,
- AI-generated content remains source-grounded,
- build validation catches invalid relationships.

---

# 51. Core Data Principle

> **A UARoute data record is not automatically a published fact.**

The existence of a value in:

- a legacy dataset,
- a carrier datalist,
- an image,
- an article,
- an AI suggestion,

does not by itself make that value safe to present as a commercial transport fact.

Publication requires appropriate evidence and classification.

---

# 52. Final Governance Principle

UARoute should favor:

> **verified, useful and limited data**

over:

> **complete-looking but uncertain data.**

The product's long-term value depends on users trusting that when UARoute states something as fact, it has a reason to believe it is true.
