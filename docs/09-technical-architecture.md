# 09 — Technical Architecture

**Status:** Approved working specification  
**Scope:** UARoute Milestone 1 and the technical foundation for subsequent route/content growth  
**Primary deployment target:** Static/prerendered application delivered through S3 + CloudFront  
**Application model:** Route-discovery website with Koval as the downstream transaction owner  
**Implementation snapshot (2026-09-11):** Next.js 16 App Router, `output: "export"`, `trailingSlash: true`, artifact `./out` ([ADR 0001](decisions/0001-nextjs-static-export.md)). Lint is `eslint .` (the Next CLI no longer has `next lint`). Catalog validation: `src/lib/validate-catalog.ts`. Production uaroute.com is still CRA until cutover.

---

## 1. Purpose

This document defines the technical architecture for UARoute.

The architecture is intentionally optimized for the current business model:

- UARoute owns route discovery, SEO landing pages, travel intent, and demand generation.
- Koval owns the actual passenger transaction and booking.
- M1 does not require a backend database.
- M1 does not require user accounts.
- M1 does not store personal lead records.
- The site must be fast, crawlable, resilient, inexpensive to operate, and easy for coding agents to maintain.
- The technical design must support later expansion without forcing a premature marketplace architecture.

The central architectural principle is:

> **Static content and route intelligence should be generated at build time; user interaction should remain client-side and lightweight; the transaction boundary remains an external Koval handoff.**

---

## 2. Architecture goals

### Primary goals

The M1 architecture must provide:

- excellent SEO;
- prerendered route pages;
- fast first load;
- reliable operation from a CDN;
- typed route/content data;
- deterministic route URLs;
- safe WhatsApp handoff;
- route-specific Koval desks;
- analytics instrumentation;
- clean separation between content, domain data, UI, and integrations;
- simple local development;
- straightforward deployment;
- compatibility with AI/coding-agent workflows.

### Secondary goals

The architecture should also make it easy to add:

- more routes;
- more cities;
- editorial route pages;
- route articles/guides;
- additional Koval desks;
- future carriers;
- richer analytics;
- future lead reconciliation;
- eventually, a marketplace layer.

### Explicit non-goals

M1 does not build:

- a booking engine;
- payment processing;
- user accounts;
- a CRM;
- an internal lead database;
- a marketplace;
- live seat inventory;
- real-time timetable synchronization;
- route operational scheduling;
- a server-side booking API.

---

## 3. High-level architecture

The target system is:

```text
                         ┌──────────────────────┐
                         │   Search / Social    │
                         │  Direct / Referral   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      CloudFront      │
                         │         CDN          │
                         └──────────┬───────────┘
                                    │
                      ┌─────────────▼─────────────┐
                      │       UARoute App         │
                      │  Next.js App Router       │
                      │  static export HTML       │
                      └─────────────┬─────────────┘
                                    │
               ┌────────────────────┼─────────────────────┐
               │                    │                     │
               ▼                    ▼                     ▼
        route/content data      analytics            external CTAs
          at build time        provider              ┌─────────────┐
               │                                      │  WhatsApp   │
               │                                      │    Koval    │
               │                                      └──────┬──────┘
               │                                             │
               │                                      ┌──────▼──────┐
               │                                      │ Koval site  │
               │                                      └─────────────┘
               │
               ▼
        ┌────────────────┐
        │ S3 origin      │
        │ static assets  │
        └────────────────┘
```

The application has three broad layers:

1. **Build-time domain/content layer**
2. **Rendered application/UI layer**
3. **Client-side integration layer**

There is deliberately no application database in this architecture.

---

## 4. Technology baseline

### 4.1 Application framework

**Next.js 16 App Router + React + TypeScript** is the baseline framework ([ADR 0001](decisions/0001-nextjs-static-export.md)).

Reasons:

- good fit for route-centric applications;
- strong TypeScript support;
- React Server Components at build time with `output: "export"`;
- works with static deployment to S3/CloudFront;
- suitable for SEO-oriented sites;
- provides an extensible foundation without requiring a database.

There is no Node SSR host in M1. Pin production dependency versions in the repository.

Do not depend on “latest” package resolution during production builds.

---

## 5. Rendering strategy

### 5.1 Primary rendering mode

UARoute M1 should use **prerendered static HTML** for all public content pages.

Core public pages include:

```text
/
/routes
/routes/<route-slug>
/about
```

and any additional explicitly approved static/editorial pages.

### 5.2 Why prerendering

Prerendering provides:

- crawlable HTML;
- stable metadata;
- predictable page source;
- low latency from CDN delivery;
- resilience to backend failure;
- no runtime server dependency for normal page viewing;
- inexpensive hosting.

### 5.3 Runtime JavaScript

Client-side JavaScript is still used for:

- route search;
- inquiry widget;
- form validation;
- analytics;
- WhatsApp handoff;
- small interactive elements.

The core route content must remain available in the prerendered HTML.

### 5.4 Progressive enhancement principle

A user should be able to:

- load a route page;
- understand the route;
- understand who operates it;
- understand what must be confirmed;
- discover the Koval contact path;

without requiring a complex JavaScript application state.

Interactive behavior improves the experience but should not replace the underlying content.

---

## 6. Hosting architecture

### 6.1 Target

```text
S3
  ↓
CloudFront
  ↓
https://uaroute.com
```

The application build generates the deployment artifact.

The artifact is uploaded to S3.

CloudFront serves the public site.

### 6.2 Requirements

CloudFront should provide:

- HTTPS;
- caching of static assets;
- edge delivery;
- compression where appropriate;
- appropriate cache-control headers;
- SPA/static route fallback behavior where required by the framework;
- clean custom-domain routing.

### 6.3 Origin security

Where practical:

- keep the S3 origin private behind CloudFront;
- use the appropriate CloudFront origin-access mechanism;
- do not expose a public write-capable S3 bucket.

The exact AWS configuration is an infrastructure concern and should be documented separately if infrastructure-as-code is introduced.

---

## 7. Domain and URL architecture

### Canonical domain

The canonical public domain is:

```text
https://uaroute.com/
```

All canonical URLs must use the absolute HTTPS domain.

Never generate:

```text
/ routes/lviv-hannover
```

as canonical metadata.

Use:

```text
https://uaroute.com/routes/lviv-hannover
```

### Route URL model

Recommended:

```text
/routes/<origin>-<destination>
```

Examples:

```text
/routes/lviv-hannover
/routes/lviv-hamburg
/routes/lviv-berlin
```

Route slugs must be:

- lowercase;
- ASCII-safe;
- deterministic;
- stable;
- unique.

Do not change route slugs merely because editorial copy changes.

---

## 8. Route data architecture

Route data is the most important domain layer in M1.

The application should use typed structured data rather than scattered constants inside UI components.

Conceptually:

```ts
type Route = {
  id: string
  slug: string

  originCityId: string
  destinationCityId: string

  status: "commercial" | "editorial"

  carrierIds: string[]
  deskId: string

  corridor?: string

  intro: string

  claims: string[]

  faq: FAQItem[]

  relatedRouteIds: string[]

  sourceRefs: string[]

  updatedAt: string
}
```

The implementation may use more precise types, but the architectural rule is:

> Route information belongs in domain data, not in presentation components.

---

## 9. Core domain entities

M1 should maintain explicit typed entities for:

### City

```ts
type City = {
  id: string
  name: string
  countryCode: string
  kind: "hub" | "satellite" | "destination"
  aliases: string[]
  sourceRefs: string[]
}
```

### Carrier

```ts
type Carrier = {
  id: string
  name: string
  websiteUrl: string
  sourceRefs: string[]
}
```

### Desk

```ts
type Desk = {
  id: string
  carrierId: string
  region: string
  whatsappPhone: string
  label: string
}
```

The phone number is operational configuration and must never be duplicated throughout the application.

### Claim

Claims allow the product to distinguish between:

- verified operational statements;
- editorial statements;
- derived descriptions.

Conceptually:

```ts
type Claim = {
  id: string
  text: string
  sourceRefs: string[]
  type: "commercial" | "editorial"
}
```

The exact implementation may attach claims differently, but provenance must remain available.

---

## 10. Single source of truth

The same domain object should drive:

- route-page content;
- breadcrumbs;
- metadata;
- structured data;
- inquiry widget defaults;
- WhatsApp desk selection;
- analytics context;
- related-route links;
- sitemap inclusion.

Avoid duplicate hard-coded route definitions.

For example, do not have:

```text
routes.ts
```

say one desk while:

```text
WhatsAppButton.tsx
```

contains another number.

The route/domain model must determine the operational desk.

---

## 11. Desk routing

This is a critical technical boundary.

A route should reference:

```text
route.deskId
```

The inquiry/WhatsApp component resolves that desk through the carrier/desk data layer.

Example:

```ts
const desk = getDesk(route.deskId)
const whatsappPhone = desk.whatsappPhone
```

Never use:

```ts
const whatsappPhone = "+380509786330"
```

inside a generic route component.

This prevents the Germany/default desk from accidentally receiving an Austria/Liechtenstein inquiry.

---

## 12. Inquiry architecture

The inquiry widget is a client-side component.

### Required inputs

```text
date
phone
passengerCount
```

Origin and destination come from the route.

Passenger count defaults to:

```text
1
```

and remains within the approved M1 range.

### Validation

Validation occurs before handoff.

At minimum:

- date is required;
- phone is required;
- passenger count is valid.

The system should not pretend that the inquiry has been booked.

---

## 13. WhatsApp handoff implementation

The component constructs a prefilled WhatsApp message using route data and user inputs.

Conceptual flow:

```text
submit inquiry
    ↓
validate
    ↓
generate leadId
    ↓
track booking_intent
    ↓
construct message
    ↓
track whatsapp_click
    ↓
open wa.me/<desk phone>?text=<encoded message>
```

The implementation must use URL encoding correctly.

Do not concatenate raw user input into an unencoded URL.

### Message contents

The message contains:

- inquiry disclaimer;
- route;
- date;
- passenger count;
- phone;
- source;
- route page;
- lead code.

The phone is present in the WhatsApp message because Koval's current passenger form requires it.

---

## 14. No server-side lead storage in M1

The inquiry flow must not write the phone number to a UARoute database.

No:

```text
POST /api/leads
```

is required for M1.

No:

```text
Lead
```

database table is required.

This is a deliberate architectural constraint.

It reduces:

- infrastructure;
- privacy exposure;
- security responsibility;
- operational complexity;
- unnecessary duplication of Koval's transaction process.

The temporary lead ID exists only as an attribution bridge.

---

## 15. Lead ID generation

Lead IDs are client-generated.

Requirements:

- short;
- non-personal;
- collision-resistant enough for expected traffic;
- reusable across `booking_intent` and `whatsapp_click`.

Example:

```text
UR-8F3K
```

Do not derive it from:

- phone number;
- email;
- timestamp alone;
- route plus date in a predictable encoding.

---

## 16. Analytics boundary

Analytics should be abstracted behind a project-level function.

Example:

```ts
trackEvent("route_view", {
  routeId: route.id,
  origin: origin.name,
  destination: destination.name,
  routeStatus: route.status,
})
```

Components should not know provider-specific details.

Prefer:

```text
application
    ↓
analytics adapter
    ↓
provider
```

rather than:

```text
every component
    ↓
provider SDK
```

The analytics contract is defined in:

```text
08-analytics-and-attribution.md
```

---

## 17. Analytics and build architecture

Analytics must not prevent static generation.

The public route page should remain renderable if:

- analytics script fails;
- analytics provider is unavailable;
- consent prevents analytics;
- network access to analytics is blocked.

This means analytics is an optional runtime dependency, never a page-rendering dependency.

---

## 18. Content architecture

Content should be structured separately from React components.

Recommended repository organization:

```text
src/
  content/
    cities/
    routes/
    carriers/
    desks/
    claims/
    faqs/
```

or an equivalent typed data structure.

The exact directory arrangement can differ, but the separation must remain.

UI components should consume validated domain objects.

---

## 19. Source and provenance metadata

Every meaningful operational claim should have source references.

Conceptually:

```ts
sourceRefs: [
  "koval-homepage",
  "koval-contacts",
  "koval-booking-form"
]
```

This enables content review without embedding citations visibly into every UI block.

Operational data and editorial data must remain distinguishable.

---

## 20. Content validation

A build-time validation layer should catch:

- duplicate city IDs;
- duplicate route IDs;
- duplicate route slugs;
- missing route origins;
- missing destinations;
- missing carrier;
- missing desk;
- invalid desk/carrier relationship;
- missing required route copy;
- broken related-route IDs;
- route included in sitemap without publishable status;
- invalid source references.

Example:

```text
Route → Desk → Carrier
```

must resolve completely at build time.

The build should fail rather than silently produce broken route pages.

---

## 21. Route status and publication

M1 supports:

```text
commercial
editorial
```

### Commercial

A route that UARoute can legitimately connect to a current Koval commercial inquiry path.

Commercial routes may have:

- inquiry widget;
- WhatsApp CTA;
- Koval partner card;
- route-level conversion tracking.

### Editorial

A route/content page that is informative but does not imply Koval currently operates the route.

Editorial routes should not automatically receive a commercial WhatsApp CTA.

This distinction should be encoded in the route model.

---

## 22. Search architecture

Route search is client-side in M1.

The search index should be generated from the same city/route domain data used elsewhere.

Conceptually:

```ts
type SearchIndexEntry = {
  cityId: string
  label: string
  aliases: string[]
  routeIds: string[]
}
```

The search system should normalize:

- case;
- common spelling variants;
- approved aliases.

It should not use a separate manually maintained list.

---

## 23. Search behavior

The search flow is:

```text
origin input
destination input
       ↓
normalize
       ↓
resolve city IDs
       ↓
find compatible route
       ↓
navigate to route page
```

The search layer must not invent a route when no supported route exists.

Zero-result searches are analytics signals.

---

## 24. Static generation

At build time, the framework should generate:

```text
/
 /routes
 /routes/lviv-hannover
 /routes/lviv-hamburg
 /routes/lviv-berlin
 /about
```

and all other approved pages.

The route list should be derived from published route data.

Do not manually maintain a second list solely for static generation.

---

## 25. Sitemap generation

The sitemap must be generated from the same publication-aware route/page model.

Include:

- home;
- published route pages;
- approved static/editorial pages.

Do not include:

- draft pages;
- unsupported routes;
- arbitrary search URLs;
- UTM variants;
- internal state URLs.

A route should never exist in sitemap output unless it has a valid canonical URL.

---

## 26. Robots

`robots.txt` must:

- allow normal public crawling;
- expose the sitemap;
- avoid accidental blocking of public route pages.

Do not use robots rules as a substitute for route publication governance.

---

## 27. Metadata architecture

Every public page should have deterministic metadata.

For route pages:

```text
title
description
canonical
Open Graph title
Open Graph description
Open Graph image
```

The metadata generator should consume the route model.

Do not hard-code SEO metadata independently from route data.

Canonical URLs must be absolute.

---

## 28. Structured data

The application should generate structured data from the same page/domain model.

Approved M1 structures include:

### Home

- WebSite
- Organization

### Route

- BreadcrumbList
- FAQPage only when the FAQ content is actually visible on the page and qualifies for the markup.

Do not generate structured data that claims:

- a confirmed timetable;
- fake ratings;
- unsupported prices;
- unsupported availability;
- fictional reviews.

---

## 29. Related routes

Related routes should be explicitly configured.

Do not infer related routes merely because two cities are geographically close.

The model should provide:

```ts
relatedRouteIds: string[]
```

The UI resolves those IDs.

If a related route is unavailable or unpublished, the build should fail or omit it according to a deterministic validation rule.

---

## 30. Images and assets

Images should be treated as content assets, not random component resources.

Recommended model:

```text
public/
  images/
    routes/
    koval/
    editorial/
```

Asset requirements:

- meaningful file names;
- optimized dimensions;
- appropriate modern formats where supported;
- explicit width/height to reduce layout shift;
- meaningful alt text.

Do not add generic AI-generated vehicle photography merely to fill a card.

Real Koval photography should be preferred when it is available and approved for reuse.

---

## 31. CSS and design architecture

The design system is specified in:

```text
04-visual-design-system.md
```

The implementation should preserve the editorial route-atlas concept.

The technical architecture must not push the UI back toward generic SaaS patterns.

Avoid building the component library around:

- excessive card wrappers;
- glassmorphism;
- decorative gradient blobs;
- arbitrary pill controls;
- excessive border-radius;
- dashboard-style density.

The design system should be expressed through reusable primitives without forcing every section into the same card component.

---

## 32. Component architecture

A practical component hierarchy is:

```text
App Shell
├── Header
├── Page
│   ├── Breadcrumbs
│   ├── Route Hero
│   ├── Route Content
│   ├── What To Confirm
│   ├── FAQ
│   ├── Inquiry Widget
│   ├── Partner Card
│   └── Related Routes
└── Footer
```

Domain-level components should receive typed data.

Example:

```tsx
<RouteHero route={route} />
```

rather than:

```tsx
<RouteHero
  title="Львів — Ганновер"
  city1="Львів"
  city2="Ганновер"
  phone="+380..."
/>
```

This avoids fragmented business logic.

---

## 33. Routing architecture

Routes should be defined declaratively through the framework.

Required public route patterns:

```text
/
/routes
/routes/$routeSlug
/about
```

The route slug is resolved against the route data model.

Unknown route slugs should produce a real 404 response/page behavior.

Do not silently render a generic route page with missing data.

---

## 34. Error handling

### Build-time errors

Build should fail on domain-data integrity issues.

Examples:

```text
Unknown deskId
Duplicate route slug
Broken relatedRouteId
Missing origin city
Missing carrier
```

### Runtime errors

The application should provide graceful error handling for:

- route not found;
- failed client-side interaction;
- analytics unavailable;
- WhatsApp handoff failure.

A runtime integration failure must not destroy the route page.

---

## 35. 404 behavior

The 404 page should:

- clearly identify the missing page;
- provide route-search access;
- provide a route list or useful navigation;
- avoid pretending a route exists.

It should be indexable only according to standard HTTP/status handling, not as a fake route page.

---

## 36. Dependency management

Use a small dependency footprint.

Every dependency should have a clear purpose.

Avoid adding libraries solely because an AI-generated template includes them.

Review before adding:

- UI frameworks;
- analytics SDKs;
- animation libraries;
- map libraries;
- form libraries;
- search libraries;
- icon packs.

The application should remain understandable to a human engineer reviewing the repository.

---

## 37. Maps

M1 should not depend on an operational route map.

A future map can be added for:

- geographic orientation;
- route visualization;
- city relationships;
- destination discovery.

It must not fabricate:

- exact pickup points;
- exact travel trajectory;
- live route position;
- stop-by-stop itinerary.

The architectural placeholder may exist without making a mapping provider a required M1 runtime dependency.

---

## 38. External integration boundaries

UARoute has only a few external integrations in M1:

### Koval WhatsApp

Purpose:

- passenger inquiry handoff.

Protocol:

```text
https://wa.me/<phone>?text=<encoded-message>
```

### Koval website

Purpose:

- referral.

Requirements:

- correct outbound target;
- UTM parameters.

### Analytics

Purpose:

- measurement.

Requirements:

- provider abstraction;
- no personal data;
- no hard dependency for page rendering.

These boundaries should remain explicit.

---

## 39. Security model

M1 has a small attack surface because there is no server-side application backend.

Nevertheless:

- never trust raw query parameters as domain data;
- encode WhatsApp message values;
- sanitize or safely render editorial content;
- avoid dangerously setting arbitrary HTML;
- avoid embedding secrets in client code;
- do not expose private AWS credentials;
- do not place analytics secrets in source code unless the provider specifically defines them as public configuration;
- keep package dependencies patched.

No secret API keys are required for the core M1 functionality.

---

## 40. Environment configuration

Use environment variables only for values that genuinely vary by environment or provider.

Examples might include:

```text
PUBLIC_ANALYTICS_ID
PUBLIC_SITE_URL
```

Do not put route operational data behind environment variables.

Route definitions belong in the typed data layer.

Do not store WhatsApp desk phone numbers in `.env` merely to hide them. They are intentionally public contact information and should be modeled as domain data.

---

## 41. Build pipeline

A recommended pipeline is:

```text
install
  ↓
typecheck
  ↓
lint
  ↓
domain validation
  ↓
test
  ↓
build
  ↓
prerender
  ↓
SEO validation
  ↓
artifact inspection
  ↓
deploy
```

The build must fail if critical content/domain integrity checks fail.

---

## 42. CI quality gates

Minimum CI gates:

- TypeScript passes;
- lint passes;
- tests pass;
- domain validation passes;
- production build passes;
- prerendered route pages exist;
- sitemap exists;
- robots exists;
- required canonical URLs are absolute;
- no known placeholder content remains.

Optional later gates:

- Lighthouse;
- accessibility testing;
- broken-link checking;
- structured-data validation;
- screenshot regression testing.

---

## 43. Deployment model

Deployment should be immutable.

A deployment produces a specific build artifact.

Recommended flow:

```text
Git commit
   ↓
CI build
   ↓
static artifact
   ↓
S3 upload
   ↓
CloudFront cache invalidation where needed
   ↓
production
```

Avoid manually editing production files.

The repository should remain the source of truth.

---

## 44. Cache strategy

Static assets should be long-lived and content-hashed where the build system supports it.

Example:

```text
/assets/app.3f29c1.js
```

can receive a long cache lifetime.

HTML should have a shorter cache strategy or controlled invalidation because route/content changes need to propagate predictably.

Do not use one blanket cache policy for all file types.

---

## 45. Deployment rollback

Because the site is static, rollback should be straightforward.

A rollback should restore:

- a known-good build artifact;
- corresponding route/content data;
- compatible asset references.

Do not attempt to “fix” a production build by manually changing individual HTML files.

---

## 46. Repository structure

A practical target structure:

```text
/
├── src/
│   ├── app/
│   ├── components/
│   ├── config/
│   ├── data/
│   │   ├── cities.ts
│   │   ├── routes.ts
│   │   ├── carriers.ts
│   │   ├── queries.ts
│   │   └── types.ts
│   └── lib/
│       ├── analytics.ts
│       ├── validate-catalog.ts
│       ├── whatsapp.ts
│       └── seo.ts
├── public/
├── docs/
├── package.json
├── next.config.ts
├── tsconfig.json
└── ...
```

The exact file names may vary. The architectural separation (typed domain data, UI, integrations) should not.

---

## 47. AI/coding-agent development rules

Because the project is expected to be modified by coding agents, the architecture must actively constrain agent behavior.

Agents must:

- read `00-project-constitution.md` before making product-level changes;
- read the relevant source-of-truth document for the task;
- inspect existing code before rewriting components;
- preserve route/domain types;
- avoid creating duplicate sources of truth;
- avoid inventing operational data;
- avoid changing WhatsApp routing without updating the desk model;
- preserve absolute canonical URLs;
- preserve analytics event semantics;
- preserve the editorial visual direction;
- run validation/build before declaring completion.

Agents must not:

- introduce a new backend merely to solve a frontend problem;
- hard-code phone numbers into UI components;
- fabricate schedule, duration, distance, price, availability, or reviews;
- add a fake booking-confirmed state;
- migrate unsupported legacy values into the new design;
- replace the route data model with component-local constants;
- add a generic SaaS UI kit that conflicts with the visual system;
- create a marketplace abstraction prematurely.

---

## 48. Testing strategy

### Unit tests

Focus on:

- city alias normalization;
- route matching;
- route lookup;
- desk resolution;
- lead ID generation;
- WhatsApp message generation;
- analytics event construction;
- UTM generation.

### Integration tests

Focus on:

- route search → route page;
- route page → inquiry submission;
- inquiry → correct desk;
- inquiry → WhatsApp URL;
- Koval outbound link → correct UTM.

### End-to-end tests

Critical journeys:

```text
Homepage
  → Search
  → Lviv → Hannover
  → Route page
  → Inquiry
  → WhatsApp
```

and:

```text
Homepage
  → Route list
  → Route page
  → Koval website
```

### SEO tests

Check:

- title;
- description;
- canonical;
- H1;
- robots;
- sitemap;
- structured data;
- route 200/404 behavior.

---

## 49. Performance architecture

Primary performance goals:

- fast HTML delivery from CloudFront;
- minimal blocking JavaScript;
- optimized images;
- no unnecessary client-side data fetching for route content;
- route content available immediately in HTML.

Prefer:

```text
HTML first
JS enhancement second
```

rather than:

```text
JavaScript loads
    ↓
API request
    ↓
route content appears
```

For M1, route content should not require an API request.

---

## 50. Accessibility architecture

Accessibility is a product requirement, not a later polish layer.

The architecture should support:

- semantic HTML;
- keyboard navigation;
- visible focus;
- properly associated form labels;
- accessible error messages;
- sufficient contrast;
- reduced-motion behavior;
- screen-reader-compatible navigation;
- meaningful alt text.

The inquiry widget must remain usable without pointer-only interactions.

---

## 51. Internationalization boundary

M1 can remain Ukrainian-first.

Do not build a full translation framework merely for hypothetical future support.

However, the content/domain layer should avoid hard-coding language-dependent values into core identifiers.

For example:

```text
route.id = lviv-hannover
```

is stable.

The displayed:

```text
Львів → Ганновер
```

is presentation content.

This leaves room for future multilingual content without changing route identity.

---

## 52. Observability

M1 does not require a complex observability stack.

At minimum, engineering should have:

- deployment status;
- build failure visibility;
- CloudFront/S3 operational visibility;
- analytics validation;
- browser error visibility if already available through the chosen platform.

Application errors should not be hidden merely because the site is static.

---

## 53. Data lifecycle

### Source data

Maintained in repository/data layer.

### Build artifacts

Generated from source.

### CDN artifacts

Served from CloudFront/S3.

### Analytics data

Held by the analytics provider according to the approved analytics configuration.

### Personal inquiry information

Passed directly into the Koval WhatsApp message and not stored as UARoute application data.

This separation is intentional.

---

## 54. Future architecture evolution

The architecture is designed to evolve in stages.

### Stage 1 — Static route intelligence

```text
typed data
+ prerendering
+ CDN
+ client-side interaction
```

### Stage 2 — Rich editorial/content layer

```text
typed data / CMS-like source
+ more route pages
+ destination guides
+ search-demand tooling
```

### Stage 3 — Conversion reconciliation

```text
UARoute
   ↓
lead ID
   ↓
Koval outcome data
   ↓
booking attribution
```

### Stage 4 — Multi-carrier marketplace

Only after route demand and commercial relationships justify it:

```text
route
  ↓
multiple carriers
  ↓
operational availability
  ↓
commercial comparison
  ↓
transaction layer
```

This should be introduced only when the business model actually requires it.

---

## 55. Architectural decision rules

When choosing between two implementations, prefer the option that:

1. preserves static crawlable route content;
2. keeps the transaction boundary at Koval;
3. minimizes personal-data storage;
4. keeps domain data centralized;
5. makes operational claims traceable;
6. reduces infrastructure complexity;
7. remains easy for a future engineer or coding agent to understand;
8. preserves the editorial route-atlas experience.

---

## 56. Definition of Done

The M1 technical architecture is implemented in the **repository** when the items below are true. Checkboxes reflect 2026-09-11. Production cutover of `./out` to uaroute.com is still outstanding.

### Application

- [x] Next.js App Router + React + TypeScript is used consistently (static export; ADR 0001)
- [x] public route pages are prerendered
- [x] route content is available in HTML
- [x] route URLs are deterministic
- [x] 404 handling works

### Domain data

- [x] cities are typed
- [x] routes are typed
- [x] carriers are typed
- [x] desks are typed
- [x] route → desk resolution is centralized
- [x] provenance is represented
- [x] build validation catches broken relationships

### Conversion

- [x] inquiry widget is client-side
- [x] date/phone/passenger count validation works
- [x] lead ID is generated
- [x] correct Koval desk is selected
- [x] WhatsApp message is encoded safely
- [x] no lead database exists

### Analytics

- [x] analytics adapter is centralized
- [x] M1 event contract is implemented
- [x] no phone/name/message content is transmitted
- [x] UTM attribution works
- [x] Koval outbound links include UTM parameters

### SEO

- [x] absolute canonicals
- [x] deterministic metadata
- [x] sitemap generation
- [x] robots.txt
- [x] structured data
- [x] route pages are crawlable without client-side API fetching

### Infrastructure

- [x] production build produces deployable static artifacts
- [ ] S3/CloudFront deployment of this Next export (live site is still CRA)
- [x] HTTPS works (existing CloudFront)
- [x] cache strategy is defined
- [x] rollback is possible (`legacy/` + previous `./out`)

### Quality

- [x] typecheck passes
- [x] lint passes (`eslint .`)
- [x] domain validation passes
- [x] test suite passes
- [x] critical end-to-end journeys pass (local 2026-09-11)
- [x] mobile layout works
- [ ] accessibility checks pass at the agreed M1 level (ongoing)

---

## 57. Final architectural principle

UARoute should remain technically boring where infrastructure is concerned and ambitious where route discovery, content quality, SEO, visual design, and demand intelligence are concerned.

The ideal M1 architecture is therefore:

```text
Typed route intelligence
        +
Prerendered editorial pages
        +
CDN delivery
        +
Lightweight client interaction
        +
Analytics
        +
Koval handoff
```

rather than:

```text
Database
+ API
+ accounts
+ booking engine
+ marketplace
+ inventory
+ payments
```

The architecture should enable UARoute to become a powerful route-demand platform without forcing the product to become a marketplace before the business has earned that complexity.

**M1 technical success = fast, crawlable, truthful, maintainable route discovery with a reliable Koval conversion handoff.**
