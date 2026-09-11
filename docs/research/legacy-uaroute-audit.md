# Legacy UARoute Audit

## 1. Executive Summary

The legacy UARoute application should be treated as a **live legacy acquisition/catalog product and migration source**, not as the source of truth for current transport operations. The 11 September 2026 HTTP crawl (live-verification appendix) found a JavaScript-only carrier catalog on S3/CloudFront. Repository JSON has **three** carriers (4k-koval, vektor24, Vobus), including unsafe Koval fields `від 100€`, `4.5`, and `щотижня` that must be **DELETE**d. A fourth carrier from earlier memory is **Unknown** without executing the live bundle.

The current Koval site confirms the core operational model needed for the migration: the carrier publishes origins/hub clusters, destination regions/cities, service claims, and a booking form that collects **travel date, contact phone, origin, and destination**, then opens WhatsApp with a prepared message. It does **not** publish a passenger timetable, public trip duration, passenger fare table, stop sequence, or seat inventory.

Therefore the correct migration is not a field-for-field copy. The legacy system contains five kinds of value:

| Value class | Treatment |
|---|---|
| URL/SEO history | **KEEP / REDIRECT** after exact URL verification |
| City, country, alias, corridor candidates | **KEEP / VERIFY** |
| Carrier abstraction and multi-carrier seam | **KEEP internally; hide unverified carriers in M1 UI** |
| Koval claims, photos, contact data | **VERIFY / TRANSFORM** against current Koval evidence |
| Legacy prices, ratings, fabricated operational fields | **DELETE** |

The highest migration risks are: losing the existing domain's indexed URLs; retaining client-only route content; migrating unsupported price/rating/schedule values; routing Austrian/Liechtenstein inquiries to the wrong Koval desk; and accidentally preserving carrier-first information architecture when M1 is intended to become route-first.

The recommended M1 seed should therefore be deliberately small: `City`, `Route`, `Carrier`, `Desk`, `Claim`, `sourceRef`, `lastVerifiedAt`, and related-route references. Operational numbers remain optional and **must not render when absent**.

A critical evidence limitation in the original draft was that `uaroute.com` could not be fetched. That limitation is **removed** as of the 11 September 2026 HTTP crawl documented in the live-verification appendix below. Carrier counts and unsafe fields are taken from `legacy/src/json/transporters.json` in this repository (three carriers), not from the unreachable four-carrier production memory.

## 2. Audit Scope and Methodology

This audit follows the requested migration-oriented scope: production behavior, repository architecture, routes, data, Koval representation, search, conversion, analytics, SEO, content, assets, dependencies/infrastructure, performance/accessibility/mobile risks, and migration mapping.

Evidence is classified as:

- **Verified current production** — directly observable in the current public source used for the audit.
- **Production/source evidence from prior forensic inspection** — reported from direct inspection of UARoute production/repository in the prior research artifact.
- **Source-only / historical** — present in source/data or previously observed but not independently revalidated on the current date.
- **Inference** — analytical conclusion from evidence.
- **Unknown** — cannot be established reliably from available evidence.

The current Koval website was re-checked by HTTP fetch on 11 September 2026 (see Koval audit Appendix C). The live UARoute hostname was fetched the same day (appendix below).

The prior forensic UARoute evidence is superseded by the live-verification appendix in this file (11 September 2026 HTTP crawl) plus `legacy/src/` in this repository.

## 3. Production Overview

### Legacy production identity

The prior forensic audit reports the following production characteristics:

- `https://uaroute.com/` was live.
- Hosting was identified as S3 + CloudFront.
- The production application was a JavaScript-only carrier catalog.
- Four carrier records were exposed, with Koval among them.
- The homepage interaction was carrier-oriented, including **«Пошук перевізника»**, rather than a route-first origin/destination search.
- The legacy page title was reported as **«UARoutes - пасажирські перевезення в Європу»**.
- The source/manifest contained inconsistent brand forms including UARoute/UARoutes/UARoots/uaroots.
- The production experience exposed commercial-looking fields that were not supported by current operational evidence, including `від 100€` and `4.5` for Koval. [Internal evidence E1]

### Production-state confidence

| Finding | Evidence state | Confidence |
|---|---|---|
| Existing public `uaroute.com` domain | Prior production inspection | High |
| S3/CloudFront hosting | Prior production inspection | High |
| JS-only carrier catalog | Prior production inspection | High |
| Four carrier records | Prior production/source inspection | High |
| Koval represented as carrier | Prior production/source inspection | High |
| Legacy `від 100€` / `4.5` | Prior JS-bundle/source inspection | High |
| Current live UARoute status on 2026-09-11 | Direct HTTP fetch of HTML shell | High |

The current Koval website remains useful as an operational comparison source, not as proof of every legacy UARoute claim. Current Koval publicly presents route/corridor information and a WhatsApp booking flow, but deliberately leaves the exact passenger schedule and fare to inquiry.

## 4. Public URL Inventory

The previous forensic audit established an important distinction between the **legacy source route surface** and the **new M1 target surface**. The exact 2026 production URL set still requires a fresh crawl before cutover.

### Live HTTP inventory (11 September 2026)

All of the following returned **HTTP 200** and the **same 845-byte Create React App shell** (`<div id="root">`, `/static/js/main.2ee62985.js`):

| URL | Notes |
| --- | --- |
| `https://uaroute.com/` | `lang="en"`; title `UARoutes - пасажирські перевезення в Європу`; meta description `UARoutes. Пасажирські перевезення мікроавтобусами` |
| `/about` | same shell |
| `/contact` | same shell (this is the CRA route; `/contacts` is not in `legacy/src/App.js`) |
| `/packages` | same shell — **no packages page in CRA source** |
| `/gallery` | same shell — **no gallery page in CRA source** |
| `/sitemap.xml` | same JS shell, **not an XML sitemap** |

`https://uaroute.com/robots.txt` is a real text file: `User-agent: *` / `Disallow:` (empty). It does **not** advertise a sitemap.

Router in `legacy/src/App.js`: `/`, `/about`, `/contact`, `/provider/:name`. Catalog rows link to external carrier URLs, not `/provider/:name`.

`legacy/src/json/transporters.json` contains **three** carriers (4k-koval, vektor24, Vobus), including unsafe Koval fields `від 100€`, `4.5`, `щотижня`. A fourth carrier (MyBus) is **not** in this repository snapshot. Whether production JS still lists four names is **Unknown** without executing the live bundle.

### Known legacy/static URL classes

| URL | Page type | Production/source evidence | Migration action | New target |
|---|---|---|---|---|
| `/` | home | Legacy public page | **TRANSFORM / KEEP URL** | `/` |
| `/about` | static/company | Legacy source/public surface | **TRANSFORM** | `/about` |
| `/contact` | contact/lead | Legacy source, includes a PII-capturing contact path in prior audit | **REMOVE** unless independently justified | none in M1 |
| Carrier-specific paths | carrier | Legacy carrier catalog | **REDIRECT / REMOVE** per indexed URL evidence | relevant route or `/routes` |
| Route-like paths | generated/route | Legacy/source evidence must be enumerated | **REDIRECT** only where a real M1 equivalent exists | `/routes/<origin>-<destination>` |
| Sitemap | utility | Legacy SEO artifact | **REBUILD** | `/sitemap.xml` |
| `robots.txt` | utility | Legacy SEO artifact | **REBUILD** | `/robots.txt` |

### Required pre-cutover inventory

A final migration must enumerate all URLs from sitemap, application routes, navigation, internal links, deployed HTML, and known search-visible paths. The prior M1 review explicitly warns that the existing domain is **not** a blank slate and that old indexed URLs cannot be discarded merely by replacing the frontend. [Internal evidence E1]

## 5. Technical Architecture

### Legacy architecture

The prior forensic inspection supports the following architecture-level picture:

```text
Public domain
    ↓
CloudFront
    ↓
S3 static hosting
    ↓
Client-rendered React / CRA-style shell
    ↓
Carrier / route-like data
    ↓
Client-side catalog/search/navigation
```

The key SEO property is the client-rendered shell. The prior audit found that route/article-level content was dependent on JavaScript rather than being fully present as crawlable HTML. [Internal evidence E1]

### Strategic implication

The new architecture should move to:

```text
Typed static dataset
    ↓
Route-first pages
    ↓
Prerendered HTML
    ↓
S3 / CloudFront
    ↓
Search engine + user
```

The existing hosting pattern is therefore potentially reusable. The rendering architecture is not.

### Rendering

| Concern | Legacy | M1 action |
|---|---|---|
| HTML content | CSR / JS-dependent | **REPLACE with prerendered HTML** |
| URL routing | Legacy client routes | **REBUILD around route slugs** |
| Dynamic data | Client-side catalog | **STATIC typed data** |
| Backend DB | None indicated for M1 | **KEEP none** |
| Maps | Not essential | **DELETE/DEFER** |
| Runtime APIs | Contact/legacy integrations exist | **AUDIT and remove unnecessary PII path** |

## 6. Repository Architecture

The precise repository tree was not re-mounted in this research turn, but the prior forensic inspection provides enough architecture-level evidence to reconstruct its migration-relevant organization.

### Observed conceptual structure

```text
src/
  application/page/router code
  components/
  hooks/
  data/domain records
  assets/
  analytics/integration helpers
public/
  static assets / SEO support files
configuration/
  build / deployment / metadata
```

The legacy repository should be treated as containing three distinct classes of material:

1. **Domain data** — carrier, route-like, city and commercial attributes.
2. **UI implementation** — carrier cards, search, page chrome, conversion links.
3. **Deployment/SEO support** — static hosting configuration, metadata, sitemap/robots, analytics.

### Migration significance

The most reusable technical concepts are the data abstractions, asset references, and hosting/deployment knowledge. The carrier-first UI and unsupported commercial field presentation should not be ported wholesale.

## 7. Legacy Domain Model

The legacy model is best reconstructed as a directory/catalog model rather than a clean transport product model.

### Core entities

| Entity | Legacy role | Migration relevance |
|---|---|---|
| Carrier | Operator/company record | **KEEP abstraction** |
| Route | Route-like relationship / candidate | **TRANSFORM into route-first unit** |
| City | Origin/destination label | **KEEP + VERIFY** |
| Country | Geography grouping | **KEEP** |
| Contact | Phone/link/CTA | **VERIFY / desk-map** |
| Price | Commercial card field | **DELETE unless verified** |
| Rating | Commercial card field | **DELETE** |
| Schedule | Potential field/claim | **DELETE unless verified** |
| Availability | Potential field/claim | **DELETE unless verified** |
| Gallery | Marketing assets | **REVIEW for reuse** |

### Required M1 conceptual model

```text
City
  ├── aliases[]
  ├── country
  └── kind: hub | satellite | destination

Carrier
  ├── id
  ├── displayName
  ├── website
  └── desks[]

Route
  ├── id / slug
  ├── origin
  ├── destination
  ├── carrierIds[]
  ├── status: commercial | editorial
  ├── serviceKind: passenger
  ├── claims[]
  ├── deskId
  ├── seo
  ├── faq
  └── relatedRouteIds[]

Claim
  ├── text
  ├── sourceUrl
  └── lastVerifiedAt
```

The prior audit explicitly recommended this shape and advised against a persistent Lead entity. [Internal evidence E1]

## 8. Carrier Inventory

The legacy application was identified as multi-carrier rather than inherently single-carrier. Repository JSON names **4k-koval, vektor24 and Vobus**. A fourth name (MyBus) is not in this snapshot.

| Carrier | Legacy presence | M1 UI | Migration action |
|---|---:|---:|---|
| Koval | Yes | Yes, preferred partner | **TRANSFORM / VERIFY** |
| MyBus | Yes | No | **KEEP internally; VERIFY later** |
| vektor24 | Yes | No | **KEEP internally; VERIFY later** |
| Vobus | Yes | No | **KEEP internally; VERIFY later** |

### Architectural conclusion

The multi-carrier abstraction is valuable because it separates UARoute's discovery layer from a single commercial partner. The correct M1 behavior is to **hide unverified carriers from UI**, not to erase the carrier abstraction from the codebase. This preserves future expansion without importing marketplace complexity. [Internal evidence E1]

## 9. Koval Legacy Representation

The legacy site represented Koval in a way that mixed identity, marketing, and unsupported commercial metadata.

### Known legacy Koval fields

| Field | Legacy state | Current verification | Action |
|---|---|---|---|
| Display name | Present | Current site uses Коваль / KOVAL branding | **TRANSFORM** |
| Website | Present | `https://www.4k-koval.com/` | **KEEP + verify** |
| Phone | Present | Multiple current desks | **VERIFY / desk-map** |
| WhatsApp | Present | Current Koval booking flow exists | **TRANSFORM** |
| Route/city data | Present | Broadly corroborated by current site | **VERIFY** |
| `від 100€` | Present for Koval | Not supported as passenger fare | **DELETE** |
| `4.5` rating | Present | No public Koval evidence found | **DELETE** |
| `щотижня` | Present/echoed | Current site states service claims but not a route timetable | **VERIFY** |
| Photos | Present | Current Koval publishes vehicle/salon imagery | **REVIEW licensing/reuse** |
| Legacy carrier ID | Present | Internal abstraction only | **KEEP** |

### Current Koval evidence

Koval's current site identifies passenger transport between Ukraine and Germany as its primary offering, lists Ukraine origin hubs in Chernivtsi, Ivano-Frankivsk and Lviv clusters, lists destination regions in Germany plus Austria/Liechtenstein, and provides a booking form with date, phone, origin and destination followed by WhatsApp.

The current site also publishes operational contacts split by geography. Germany/Poland/Czechia includes an Ivan booking WhatsApp number, while Austria/Czechia/Liechtenstein uses Mykola.

This is materially different from a single global WhatsApp number.

## 10. Route Inventory

The legacy route inventory should be understood as a **candidate graph**, not a verified schedule/product table.

### High-value candidate routes

The prior research supports these strongest initial route candidates:

| Origin | Destination | Evidence status | M1 action |
|---|---|---|---|
| Lviv | Hannover | Strong route/city evidence; gallery reference | **KEEP / TRANSFORM** |
| Lviv | Berlin | Strong regional/city evidence; gallery reference | **KEEP / TRANSFORM** |
| Lviv | Hamburg | Strong regional/city evidence; gallery reference | **KEEP / TRANSFORM** |
| Ivano-Frankivsk cluster | Hannover | Strong origin-hub + destination evidence | **VERIFY then seed** |
| Chernivtsi cluster | Germany | Origin evidence but route specificity weaker | **VERIFY** |
| Lviv | Vienna | Current Koval corridor evidence | **VERIFY desk mapping** |

### Do not migrate these as operational fields

- price
- passenger fare
- trip duration
- distance presented as trip distance
- exact departure/arrival time
- number of stops
- seat count
- live availability
- guaranteed frequency

Current Koval evidence supports regional/city service claims and direct/address-delivery claims, but the public site does not publish a passenger timetable or fare table.

## 11. City / Geography Inventory

### Current Koval origin structure

The strongest current evidence is a hub-and-satellite model:

- **Chernivtsi**: Zablotiv, Sniatyn.
- **Ivano-Frankivsk**: Kolomyia, Otyniia, Burshtyn, Rohatyn, Kalush, Rozhniativ, Broshniv, Dolyna, Bolekhiv.
- **Lviv**: Stryi, Drohobych, Boryslav, Sambir, Truskavets, Horodok.

These should be modelled as pickup clusters, not as a published stop-by-stop route timeline.

### Destination taxonomy

| Geography | Classification |
|---|---|
| Germany | Primary commercial destination family |
| Austria | Commercial corridor; separate desk logic |
| Liechtenstein | Commercial corridor; operational detail requires verification |
| Poland | Corridor / transit / service relationship; do not invent city-level route products |
| Czechia | Corridor with multiple contact grouping; verify exact commercial route logic |
| Belgium | Marketing claim weaker than city-level service evidence |
| Netherlands | Marketing claim weaker than city-level service evidence |

Koval's current site lists Germany, Poland, Czechia, Austria and Liechtenstein in its main travel corridor and gives extensive Germany/Austria/Liechtenstein city lists; Belgium and Netherlands are not part of the current search result's main corridor list.

### Geography rule

A city appearing in a gallery, SEO list, datalist, or broad corridor statement must not automatically become an indexable M1 route page.

## 12. Search and Discovery

### Legacy implementation

The legacy product's primary discovery model was **carrier search**. Prior production evidence identified the homepage interaction as «Пошук перевізника», meaning the user first selected/inspected an operator rather than expressing the actual transport intent as origin → destination. [Internal evidence E1]

### Legacy assets worth preserving

- city names
- alternate spellings
- transliteration/alias data
- country groupings
- route-like associations

### What must change

The new search model should be:

```text
Origin city
      +
Destination city
      ↓
Route candidate
      ↓
Existing commercial route page OR truthful no-page state
```

Search aliases are UX data, not separate SEO URLs. This prevents `/lviv`, `/lvov`, `/hannover`, `/hanover`, etc. from becoming duplicated page systems.

### Fallback behavior

Known cities without a verified commercial route should not be presented as bookable. The safest M1 response is a clear “no dedicated route page yet” state and, only where evidence supports it, a generic contact path that does not make an operational claim.

## 13. UX and Conversion Flow

### Legacy flow

The prior audit reconstructs the legacy user journey as approximately:

```text
Homepage
  ↓
Carrier search
  ↓
Carrier/card context
  ↓
External carrier site / contact
```

The key weakness is that the route context is not preserved into the commercial handoff.

### M1 target flow

```text
Search / organic landing
        ↓
Route page
        ↓
Useful route information
        ↓
Date + phone + passengers
        ↓
WhatsApp handoff
        ↓
Koval dispatcher
```

### Why this is the correct transformation

Koval's own production form collects date, phone, origin and destination and opens WhatsApp with a prepared message; it does not itself expose a public schedule or online booking engine.

The UARoute route page should therefore **reduce uncertainty before handoff**, not imitate a booking engine.

### CTA language

Preferred:

> **Написати Koval у WhatsApp**

or

> **Уточнити поїздку в WhatsApp**

Avoid “book now” wording unless Koval confirms that the click can actually complete a booking. The user still must send the WhatsApp message and receive human confirmation.

## 14. Analytics

The prior audit identified an oversized legacy/implementation-plan event surface and recommends a much smaller M1 measurement model.

### Recommended M1 events

| Event | Purpose |
|---|---|
| `route_search_completed` | route intent signal |
| `route_view` | route content engagement |
| `booking_intent` | valid inquiry-form submission |
| `whatsapp_click` | handoff initiated |
| `koval_site_click` | secondary carrier-site intent |

### Common event context

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

Do not call the WhatsApp click `booking`. The prior audit correctly defines it as an inquiry proxy; a click cannot establish that the user sent the message or received a response. [Internal evidence E1]

### Legacy → M1 event treatment

| Legacy pattern | M1 action |
|---|---|
| Carrier click | **RETIRE / transform** unless needed for future internal-only analytics |
| Route/card click | **TRANSFORM → `route_view` / navigation** |
| WhatsApp | **TRANSFORM → `whatsapp_click`** |
| Generic contact submit | **REMOVE** |
| Fine-grained widget micro-events | **DEFER** |

## 15. SEO and Indexability

### Legacy SEO condition

Prior production/source evidence indicates the legacy UARoute application was heavily JS-dependent and had generic carrier positioning. The previous review specifically found a generic title, `lang="en"`, and insufficiently differentiated route-level HTML. [Internal evidence E1]

### Migration requirements

1. **Prerender every indexable page.**
2. Include unique route content in raw HTML.
3. Use absolute canonicals under `https://uaroute.com/`.
4. Generate sitemap from the same dataset that generates pages.
5. Keep robots and sitemap consistent.
6. Create only meaningful route pages.
7. Preserve useful old URLs with 301s when an exact semantic replacement exists.
8. Do not create `Offer`, `BusTrip`, fare, schedule or availability structured data unless the values are real and visible.

### Metadata

M1 should move from carrier-like branding to route intent. Example direction:

```text
Title: Львів — Ганновер: маршрут і як уточнити поїздку | UARoute
H1: Львів → Ганновер
```

### Internal linking

Minimum graph:

```text
Home
  ↕
Routes
  ↕
Route page
  ↔ related route pages
  ↘
Koval partner site
```

### Existing-domain SEO risk

The old domain must be treated as an existing SEO asset. The migration is therefore a **cutover**, not a greenfield launch.

## 16. Content Inventory

### Meaningful content classes in legacy

- homepage positioning
- carrier descriptions
- route-like copy
- destination/city labels
- contact information
- packages/parcel-related material
- gallery captions
- SEO-oriented route claims
- disclaimers / CTA copy

### Content treatment

| Content class | Migration action |
|---|---|
| Route/city taxonomy | **KEEP / VERIFY** |
| Koval factual service claims | **TRANSFORM + source + lastVerifiedAt** |
| Generic carrier directory copy | **DELETE / REWRITE** |
| Historical commercial copy | **DELETE unless verified** |
| Gallery captions | **REVIEW for provenance** |
| Parcel content | **KEEP as external/secondary path; separate passenger intent** |
| About page | **REWRITE** |

### Current Koval content useful to UARoute

Koval currently publishes passenger transport positioning, two-driver minibuses, address delivery in Germany, direct trips without transfers, and a broad destination list. These can seed factual claims provided they are clearly attributed to Koval and date-stamped in the new content model.

## 17. Unsupported / High-Risk Legacy Claims

This is the most important deletion list.

| Claim/field | Evidence problem | Action |
|---|---|---|
| `від 100€` | Not supported as a public Koval passenger fare; current Koval public site provides 0.8 €/km only for an individual/private transfer service | **DELETE** |
| `4.5` rating | No current public rating evidence found | **DELETE** |
| `щотижня` as a route timetable | Historical/SEO claim, not a published timetable | **VERIFY before use** |
| exact duration | Not published by Koval | **DELETE** |
| distance shown as trip distance | Not published | **DELETE or label as external estimate** |
| exact stops | Not published | **DELETE** |
| seat count | Not published | **DELETE** |
| availability | No live inventory | **DELETE** |
| “booking completed” from WhatsApp click | Click is only handoff intent | **DELETE / rename** |
| broad city list as bookable SKU | Datalist/marketing list is not a product catalogue | **VERIFY** |
| parcel intake time as passenger departure | Different service | **DELETE as passenger field** |

Current Koval explicitly separates its passenger booking form from parcel collection times, which reinforces the need not to transform parcel hours into passenger timetables.

## 18. Asset Inventory

The prior audit identified reusable legacy visual material including Koval vehicle and interior imagery and route-related gallery captions. [Internal evidence E1]

### Reuse framework

| Asset type | Action |
|---|---|
| Authentic Koval vehicle photos | **REVIEW / KEEP** if rights are confirmed |
| Interior/salon photos | **REVIEW / KEEP** |
| Route graphics | **REVIEW / TRANSFORM** |
| Carrier logos | **VERIFY rights and current branding** |
| Old rating/star graphics | **DELETE** |
| Screenshots of legacy UI | **DELETE** unless historical documentation only |
| Duplicate/oversized files | **DELETE / OPTIMIZE** |
| Generic stock/generated transport imagery | **DELETE** unless provenance is clear |

### Rights

No licensing ownership was independently verified. Every reusable asset must be marked `rightsStatus = unknown` until provenance is confirmed.

### Migration recommendation

Prefer fewer authentic assets over a large imported media directory. Current Koval itself publishes vehicle and interior imagery, so there is a plausible source of authentic material, but reuse permission remains a separate question.

## 19. Component Inventory

The prior forensic design review indicates a componentized React application with reusable cards, route/carrier presentation, search and contact UI. [Internal evidence E1]

### Migration classification

| Component family | M1 action |
|---|---|
| Header/navigation | **REFACTOR** |
| Footer | **REFACTOR** |
| Carrier card | **REPLACE with partner card** |
| Route card | **REUSE concept / REFACTOR** |
| Search | **REPLACE with route search** |
| Contact form | **DELETE** |
| WhatsApp CTA | **REFACTOR / KEEP concept** |
| Gallery | **REVIEW / reuse only where useful** |
| Rating component | **DELETE** |
| Price component | **DELETE** |
| Timeline | **DELETE unless real stop data exists** |
| Generic modal | **REVIEW** |
| Article/destination cards | **DEFER** until content exists |

The strongest reusable technical seam is a data-driven `RoutePage`; the strongest non-reusable semantic seam is the legacy carrier-first catalogue.

## 20. Dependencies and Infrastructure

### Known migration-relevant infrastructure

- S3 static hosting
- CloudFront distribution
- React/client-rendered application
- analytics integration
- legacy contact/API integration
- static assets and build artifacts

### Recommendation

Keep the hosting model where it reduces cutover risk. Do not add a database, runtime server, CMS or availability backend merely to reproduce legacy behavior.

### Legacy contact endpoint

Prior research identified a live contact path using an AWS API Gateway endpoint that collected name, phone, email and free text. This is not appropriate for M1, which explicitly avoids persistent lead storage. [Internal evidence E1]

This endpoint should be treated as **legacy PII infrastructure** and removed from the new conversion path.

### Dependencies

Review `package.json` / lockfiles before migration for:

- router
- analytics
- form handling
- UI libraries
- icon/animation libraries
- obsolete build tooling

Do not perform broad dependency upgrades solely as cleanup; only upgrade where required for the new architecture or security.

## 21. Performance / Accessibility / Mobile Findings

### Performance

The main legacy architectural risk is client-side rendering: route content is delivered through JavaScript, which adds SEO and first-render dependency. The migration to prerendered HTML should remove that dependency while also reducing runtime work.

Secondary risk areas:

- oversized legacy image catalog
- third-party scripts
- unnecessary component/UI dependencies
- duplicate assets
- legacy analytics overhead

### Accessibility

M1 should treat the following as acceptance criteria:

- native semantic buttons/links
- keyboard-accessible city search
- explicit form labels
- native date input where acceptable
- focus states
- sufficient contrast
- sticky CTA that does not obscure focused controls

### Mobile

The conversion path is inherently mobile-heavy because WhatsApp is the destination. Therefore mobile behavior is not a polish concern: the route page, date/phone form, CTA and keyboard interaction are core conversion surfaces.

A sticky mobile CTA is useful only after the main form is out of view and must yield to keyboard/focus behavior.

## 22. Production vs Repository Discrepancies

The audit cannot complete a new production-vs-repository diff because the legacy repository was not re-mounted in this turn and direct live UARoute resolution was unavailable.

However, the prior forensic work already identified the following discrepancy class:

| Discrepancy | Evidence | Risk |
|---|---|---|
| Source candidate vs production usage | Prior source inspection | High |
| Data in JS bundle vs current Koval support | `від 100€`, `4.5`, `щотижня` | High |
| Intended route semantics vs carrier-first UI | Source/product comparison | High |
| Legacy contact API vs M1 no-DB policy | Source inspection | High |
| Old brand tokens vs approved UARoute identity | manifest/source | Medium |

### Required final verification

Before cutover, produce an automated diff:

```text
repository routes
      vs
production discovered URLs
      vs
sitemap URLs
      vs
indexed URLs
```

and a second diff:

```text
legacy commercial fields
      vs
current verified Koval fields
```

No migration should proceed from an unresolved high-severity discrepancy.

## 23. Technical Debt

### P0

- client-only SEO/content rendering
- unsupported commercial fields in production data
- hard-coded or insufficiently abstracted contact/WhatsApp routing
- existing-domain cutover not yet fully mapped
- legacy contact/PII API path

### P1

- carrier-first IA
- inconsistent brand naming
- duplicate/legacy assets
- analytics events with unclear semantics
- route/city data without provenance metadata

### P2

- component consolidation
- package cleanup
- naming consistency
- design-token consolidation

Technical debt should be addressed only where it affects truthful migration, SEO, conversion, or operational routing.

## 24. Migration Risk Matrix

| Risk | Severity | Evidence | Impact | Mitigation |
|---|---|---|---|---|
| Existing URLs disappear | P0 | Existing public domain + prior indexed/catalog behavior | Organic loss | Full URL inventory + 301 map |
| Unsupported price migrates | P0 | `від 100€` in legacy | User deception | Delete field; no fare UI |
| Unsupported rating migrates | P0 | `4.5` in legacy | Trust/legal risk | Delete |
| Wrong Koval WhatsApp desk | P0 | DE vs AT/LI desk split | Misrouted leads | Route-level `deskId` |
| Client-only route pages | P0 | Legacy JS-only behavior | SEO/indexability | Prerender |
| Germany-wide pseudo-route | P1 | Broad destination blob | Thin/incorrect SEO | Route/city-specific content only |
| Munich or weak cities over-promoted | P1 | Weak current evidence | Thin/incorrect pages | Evidence thresholds |
| Parcel hours become passenger schedule | P1 | Mixed Koval content | False operational claim | Separate service types |
| Generic contact PII endpoint retained | P1 | Prior source inspection | Privacy/security | Remove |
| Multi-carrier records deleted | P1 | Legacy has 4 carriers | Future flexibility lost | Keep internal abstraction |
| Koval microsite outcome | P1 | Preferred-partner focus | Strategic lock-in | Independent route content |
| Analytics called booking | P1 | Click ≠ completed inquiry | False KPI | Honest event taxonomy |
| Asset rights unknown | P1 | No rights evidence | Legal/brand risk | Rights review |
| Thin programmatic page scale | P2 | City lists are broad | SEO quality | Manual/page-worthiness threshold |

## 25. Legacy → M1 Mapping

| Legacy concept | Legacy implementation | M1 replacement | Action |
|---|---|---|---|
| Carrier catalog | Four-operator cards/catalog | Preferred Koval partner + hidden carrier abstraction | **TRANSFORM** |
| Carrier search | «Пошук перевізника» | Origin/destination route search | **REPLACE** |
| Carrier card price | `від 100€` | No fare until verified | **DELETE** |
| Rating | `4.5` | None | **DELETE** |
| Route-like records | Catalog associations | Typed `Route` records | **TRANSFORM** |
| City lists | Legacy city datasets | `City` + aliases + hub kind | **TRANSFORM** |
| Koval page | Carrier-centric | Route-context partner block | **TRANSFORM** |
| WhatsApp | Generic/external handoff | Route-aware, desk-aware WhatsApp | **TRANSFORM** |
| Contact form | PII/API endpoint | No persistent lead DB | **DELETE** |
| Gallery | Legacy visual assets | Curated authentic travel assets | **REVIEW** |
| Sitemap | Legacy route/static URLs | Dataset-driven sitemap | **REBUILD** |
| Robots | Legacy crawl directives | M1 allow + sitemap | **REBUILD** |
| Canonical | Legacy/source implementation | Absolute `https://uaroute.com/...` | **REBUILD** |
| Analytics | Legacy/carrier events | 5 M1 intent events | **TRANSFORM** |
| Generic About | Carrier-style copy | Discovery/product explanation | **REWRITE** |
| Other carriers | Legacy visible records | Internal candidates only | **KEEP internally / hide UI** |

## 26. URL Migration Matrix

Because the legacy repository and current live URL set were not directly re-crawled in this turn, this is the **migration decision matrix**, not the final exhaustive redirect table.

| Legacy URL pattern | Type | Production status | New URL | Action | SEO rationale |
|---|---|---|---|---|---|
| `/` | home | historical production | `/` | **KEEP** | Preserve root authority |
| `/about` | static | historical production | `/about` | **KEEP / TRANSFORM** | Preserve useful URL if indexed |
| `/contact` | contact | historical/source | none | **REMOVE** | No M1 PII lead DB |
| `/carrier/<id>` | carrier | legacy catalog | route or `/routes` | **REDIRECT selectively** | Preserve only where semantic equivalent exists |
| `/route/<id>` or equivalent | route-like | legacy/source | `/routes/<slug>` | **REDIRECT after mapping** | Route intent preserved only for verified equivalence |
| old package/gallery URLs | static | verify | relevant M1 page or external Koval | **REDIRECT selectively** | Avoid orphaning useful indexed assets/content |
| obsolete generated URLs | utility/generated | verify | none | **REMOVE / 410 only after SEO review** | No misleading replacement |
| `/sitemap.xml` | utility | legacy | `/sitemap.xml` | **REBUILD** | Exact current sitemap needed |
| `/robots.txt` | utility | legacy | `/robots.txt` | **REBUILD** | Exact crawl policy needed |

### Final redirect rule

Never redirect a legacy URL to the homepage simply to avoid a 404. Redirect only where the new page serves substantially the same user intent; otherwise remove intentionally and monitor Search Console.

## 27. Data Migration Matrix

| Legacy field | New field | Migration rule |
|---|---|---|
| `carrier.id` | `carrier.id` | Preserve internal identity where useful |
| `carrier.name` | `carrier.displayName` | Verify current branding |
| `carrier.website` | `carrier.website` | Verify current URL |
| `city.name` | `city.name` | Verify spelling/current usage |
| city aliases | `city.aliases[]` | Preserve useful search aliases |
| `country` | `city.country` | Preserve |
| route origin | `route.origin` | Verify against current carrier evidence |
| route destination | `route.destination` | Verify |
| route carrier | `route.carrierIds[]` | Preserve candidate relationship |
| route price | — | Delete unless independently verified |
| route rating | — | Delete |
| duration | — | Delete unless sourced |
| distance | optional estimate field | Do not display as trip duration; external source only |
| schedule | — | Delete unless current evidence exists |
| availability | — | Delete |
| phone | `carrier.desk.phone` | Re-verify by geography |
| WhatsApp number | `carrier.desk.whatsapp` | Route/desk mapping required |
| description | `route.claims[]` | Rewrite + source + verification date |
| gallery image | asset ref | Rights/quality review |
| analytics event | M1 event | Semantic mapping, not 1:1 copy |

## 28. Recommended M1 Seed Dataset

### Seed entities

```text
cities.json
routes.json
carriers.json
desks.json
claims.json
```

### Initial carriers

```text
koval
```

Additional legacy carrier records remain outside the M1 UI until independently verified.

### Initial commercial route seed

```text
routes/lviv-hannover
routes/lviv-berlin
routes/lviv-hamburg
```

These are the strongest initial candidates from the prior forensic review, subject to one final current-operations confirmation with Koval before publishing. [Internal evidence E1]

### Seed-data policy

Every record should carry:

```text
legacySource
currentVerificationStatus
sourceRefs[]
lastVerifiedAt
migrationAction
```

Example:

```json
{
  "slug": "lviv-hannover",
  "origin": "lviv",
  "destination": "hannover",
  "carrierIds": ["koval"],
  "status": "commercial",
  "serviceKind": "passenger",
  "deskId": "koval-de-booking",
  "claims": [
    {
      "text": "Direct passenger transport without transfers",
      "sourceUrl": "https://www.4k-koval.com/",
      "lastVerifiedAt": "2026-09-11"
    }
  ]
}
```

The exact claim wording should be generated from current Koval source, not copied from the legacy UARoute text. Current Koval explicitly advertises direct trips without transfers and address delivery in Germany.

## 29. Reusable Legacy Value

### Technical reuse

- S3/CloudFront hosting knowledge
- existing deployment/domain knowledge
- carrier abstraction
- route/city data structures
- static asset pipeline where technically useful

### Content reuse

- verified city naming
- route candidate taxonomy
- genuinely useful route context
- historical understanding of user intent

### Data reuse

- carrier IDs
- city aliases
- origin/destination candidates
- Koval identity/asset references after verification

### SEO reuse

- existing domain
- historical URL inventory
- sitemap/crawl history
- indexed pages, once independently measured

### Visual reuse

- authentic Koval transport imagery, subject to rights
- useful route/wayfinding metaphors

The most valuable legacy asset is therefore **structured knowledge about what UARoute previously exposed**, not the legacy UI itself.

## 30. Legacy Material to Delete

The following should not survive the migration merely because it exists:

- `від 100€` Koval passenger price claim
- `4.5` Koval rating
- unsupported schedule/frequency fields
- unsupported trip durations
- unsupported stop timelines
- unsupported seat/availability data
- carrier-first homepage semantics
- generic lead/contact API storing PII
- empty “coming soon” content modules
- broad Germany blob pages
- thin pages derived solely from datalists
- duplicated/obsolete brand tokens such as UARoutes/UARoots where they survive production
- legacy UI components whose only purpose is presenting deleted commercial claims

The current Koval site does not publish a public passenger price table or timetable, so adding those fields in UARoute would make the discovery layer less trustworthy than the carrier source.

## 31. Open Questions

1. What is the **complete current URL inventory** of live `uaroute.com` on the cutover date?
2. What exact URLs are indexed in Google/Bing/Search Console today?
3. Is `uaroute.com` still the production hostname, and which CloudFront distribution currently serves it?
4. What exact legacy repository commit corresponds to the currently deployed site?
5. What are the exact carrier records and all carrier-specific public URLs in the current deployment? (This repo has three; live bundle count is Unknown without executing production JS.)
6. Which legacy routes have measurable organic traffic or backlinks and therefore deserve dedicated redirect targets?
7. Which Koval origin cluster should be the canonical model for the Lviv/Hannover flagship?
8. Which Germany cities are confirmed as passenger-service destinations rather than broad regional marketing lists?
9. Which Austria/Liechtenstein routes must resolve to Mykola instead of Ivan?
10. Is the `UR-xxxx` code accepted by Koval dispatchers for reconciliation?
11. Who legally controls the UARoute domain, CloudFront distribution, and image/content licenses?
12. Is a privacy notice required for the new WhatsApp handoff and analytics implementation under the intended deployment/consent model?
13. Which legacy Koval assets are licensed or owned and therefore safe to reuse?
14. Which current analytics property, GTM container and consent behavior belong to legacy UARoute?
15. Has the current legacy deployment changed after the prior forensic audit?

## 32. Final Migration Recommendations

### 1. Treat legacy UARoute as a dataset and SEO-history source, not a product specification.

The old system tells the new system what once existed; it does not establish what is currently true operationally.

### 2. Replace the carrier-first IA with a route-first IA.

The primary object is `Origin → Destination`. Carrier identity becomes supporting context, with Koval as the first preferred transport partner.

### 3. Preserve the multi-carrier abstraction internally.

Do not render MyBus, vektor24 or Vobus in M1 until their current offerings are independently verified. The architectural seam is valuable even while the UI remains single-partner.

### 4. Delete unsupported legacy commercial values.

In particular, do not migrate `від 100€`, `4.5`, fabricated schedules, duration, stops, seat counts or availability. Current Koval evidence does not support such a public passenger product table.

### 5. Make Koval desk routing explicit in the data model.

At minimum, M1 needs a Germany/PL/CZ desk mapping and a separate Austria/LI mapping. Current Koval publicly exposes different booking contacts for those territories.

### 6. Make WhatsApp an inquiry handoff, not a fake booking engine.

Collect date and phone; preserve origin and destination from the route; default passenger count to one; create an opaque lead code; and clearly state that the user still needs to send the WhatsApp message and receive confirmation.

### 7. Keep the existing S3/CloudFront operational model if it remains valid, but change rendering.

The new route pages should be prerendered, contain substantive content in raw HTML, use absolute canonicals, and derive the sitemap from the page dataset.

### 8. Execute URL migration as a formal SEO project.

Before replacing production, build the exact inventory of legacy URLs, classify every URL as KEEP / REDIRECT / REMOVE, deploy redirects, regenerate the sitemap, verify canonicals, and crawl the production release.

### 9. Separate passenger and parcel semantics.

Current Koval content contains substantial parcel operations and parcel pickup times. Those times are not passenger schedules and must not be rendered as transport itinerary data.

### 10. Use claims with provenance.

Every Koval-derived statement in M1 should be represented as a structured `Claim` with source URL and `lastVerifiedAt`. This is the cleanest defense against the historical failure mode of migrating “plausible-looking” but unsupported values.

### 11. Start with three route pages, not a giant programme.

Use the strongest route candidates — Lviv → Hannover, Lviv → Berlin, Lviv → Hamburg — and verify them against Koval before publication. Expand only where there is meaningful unique content and evidence.

### 12. Measure inquiry intent honestly.

The first trustworthy UARoute KPI is not bookings; it is **qualified route-intent traffic and inquiry handoff volume**. Confirmed bookings and revenue require downstream Koval cooperation.

### 13. Remove the legacy PII contact path from M1.

Do not re-create a database merely because the old site had a contact endpoint. The new product can remain static and privacy-minimal while passing the necessary inquiry payload directly to WhatsApp.

### 14. Perform one final forensic cutover verification immediately before launch.

The current research confirms the migration direction, but the exact 2026 UARoute URL set, deployed commit and production/source diff still need direct verification because the current research environment could not resolve `uaroute.com` or mount the legacy repository itself.

### Bottom-line migration rule

> **Take the legacy domain, route/city knowledge, useful aliases, validated carrier abstractions, authentic assets and SEO history. Do not take unsupported prices, ratings, schedules, availability, or carrier-first product semantics.**

The new UARoute should emerge from the old system as a **truthful route-discovery layer**: discover the corridor, explain what is known, make uncertainty explicit, prepare a structured inquiry, then hand the transaction to the verified carrier.

---

# Evidence Appendix

## Evidence E1 — Prior forensic UARoute/Koval research artifact

Internal source: superseded by the live-verification appendix in this file and `legacy/` in the repository. Historical notes (not current carrier count):

- UARoute domain live on S3 + CloudFront and legacy carrier catalog behavior.
- Three carrier records in `legacy/src/json/transporters.json` (4k-koval, vektor24, Vobus); MyBus not in this snapshot.
- Legacy Koval `від 100€`, `4.5`, `щотижня` values identified as unsafe/unsupported.
- Legacy carrier-first search and client-rendered architecture.
- Koval booking field mismatch and geography-specific WhatsApp desks.
- M1 route/data/analytics migration recommendations.

File evidence:

## Evidence E2 — Current Koval public website

`https://www.4k-koval.com/`

Current public evidence includes:

- H1: passenger transport Ukraine → Germany.
- Ukraine origin hubs / satellite clusters.
- Germany, Austria and Liechtenstein destination lists.
- Passenger booking form requiring date, contact phone, origin and destination.
- WhatsApp CTA with prepared message.
- Direct passenger trips, two drivers, address delivery in Germany.
- Parcel-specific intake hours and separate parcel contacts.

Source: current Koval public site.

## Confidence Framework

### High

Directly observable in current Koval public evidence or strongly documented by the prior forensic production/source inspection.

### Medium

Strongly supported by source/data evidence but current deployment usage is not independently revalidated today.

### Low

Historical, inferred, or indirectly supported.

### Unknown

Cannot be established without direct access to the current deployment/repository.

## Audit Limitation

The 11 September 2026 crawl verified the **HTML shell**, robots.txt, and repository snapshot. It did not execute the production JavaScript, so in-app copy such as «Пошук перевізника» and the rendered carrier row count remain **Unknown** at the live DOM layer. Do not invent a fourth live carrier. Repeat a browser pass immediately before CloudFront cutover.

## Sources

1. Koval. “Коваль Експресс — перевезення Україна — Німеччина.” Current public website. https://www.4k-koval.com/
2. Koval. `/index.html` (same SPA shell as `/` on 2026-09-11). https://www.4k-koval.com/index.html
3. Live `https://uaroute.com/` HTML shell, `robots.txt`, and this repository’s `legacy/` tree (11 September 2026).
4. Internal project documents: `docs/00-project-constitution.md`, `docs/01-product-strategy.md`, `docs/07-koval-integration-and-conversion.md`.
