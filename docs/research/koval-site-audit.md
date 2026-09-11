# Koval Site Audit

## Executive conclusion

This audit captures the public Koval website as observed on **11 September 2026** and is intended as a frozen evidence base for the UARoute integration.

The currently indexed Koval web presence is centered on **`https://www.4k-koval.com/`**, with **`https://www.4k-koval.com/index.html`** also publicly indexed and exposing a materially different, older information set. The root page appears to be the newer public presentation: it identifies Koval as an international passenger/parcel carrier, presents Ukraine departure hubs, names five destination countries, provides a WhatsApp-oriented booking form, and lists a large German/Austrian/Liechtenstein destination geography. The `/index.html` version contains additional, more detailed route/parcel information and a larger contact roster, but it is internally inconsistent with the newer root page in several respects.

For UARoute, the most important operational conclusion is:

> **Koval’s website provides broad service-area and proposition evidence, but it does not provide a dependable public passenger timetable or live availability dataset. UARoute may use the site to establish that a corridor/city is within Koval’s published geography, but should not turn that into a date-specific bookable trip without confirmation from Koval.**

The safest integration pattern is therefore **discovery → qualified inquiry → Koval WhatsApp/booking desk → Koval confirms operational availability**. UARoute should not invent schedules, prices, stop sequences, pickup points, seat availability, or booking status.

---

## 1. Evidence basis and confidence model

### Evidence classes used

| Class | Meaning | UARoute treatment |
|---|---|---|
| **Verified from Koval** | Directly stated or visibly implemented on the Koval site | Safe to repeat with source preservation, subject to freshness |
| **Derived / inferred** | Logical interpretation of verified evidence that Koval does not state verbatim | Use internally; do not present as a Koval fact without qualification |
| **Unknown** | Not established by the public site | Ask Koval / treat as unavailable |
| **Not verified** | Mentioned externally or suggested by conflicting/old material but not sufficiently established on the current public site | Do not use commercially until confirmed |

### Primary source

- **Koval live root:** https://www.4k-koval.com/ — the current indexed root page, crawled by search infrastructure within the last week at the time of research.[1]
- **Koval `/index.html`:** https://www.4k-koval.com/index.html — an alternate indexed page containing an older/different content set.[2]

### Secondary corroboration used sparingly

External sources were used only to identify historical/independent corroboration or technical context, not to override Koval’s own public statements. Work.ua currently associates `4k-koval.com` with a transport/logistics company and describes passenger and parcel transport, while an older company listing states activity since 2017 and names Poland, Czechia, Austria and Germany.[3][4]

---

## 2. Domain and public web footprint

### 2.1 Canonical domain verification

**Verified:** `https://www.4k-koval.com/` is a live indexed Koval domain and is the strongest current primary source.[1]

The root page currently brands the service as **KOVAL / International Transport • Parcels & Passengers** and uses the title/presentation “Пасажирські перевезення Україна — Німеччина”.[1]

**Important:** `/index.html` is also publicly accessible/indexed and materially differs from `/`. This should be treated as an information-governance issue for UARoute because different crawl surfaces can expose different operational data.[2]

### 2.2 Public pages discovered

The current root page presents the following navigational sections in its footer:

- Головна / Home
- Посилки / Parcels
- Про нас / About
- Наші фото / Photos
- Контакти / Contacts
- Напрямки / Directions

However, the public search footprint reviewed for this audit did not establish a stable, independently indexable URL for each section. Much of the current information appears to be rendered/served from the main page.[1]

**Unknown:** exact current URL paths for each linked section, whether these are separate HTML documents, anchors, or client-side routes.

**Integration recommendation:** do not hard-code inferred sub-URLs such as `/contacts` or `/parcels` until they are directly verified in the live site or source.

### 2.3 Other technical surface checks

The web environment used for this research did not provide a reliable direct-fetch path for `robots.txt`, `sitemap.xml`, or raw page source/network traces. Search discovery did not establish a usable public sitemap URL. Therefore:

- **robots.txt:** Unknown / not verified.
- **sitemap.xml:** Unknown / not verified.
- **raw HTML / source-level structured data:** Not verified.
- **public JSON/API endpoint for routes or availability:** Not verified.
- **booking backend API:** Not verified.

Do not infer absence from inability to observe these artifacts through the research environment. Record them as **not verified** rather than “does not exist”.

### 2.4 Indexed-version inconsistency

The current root page has a **© 2026** footer, while `/index.html` contains **© 2024** text and substantially more legacy detail.[1][2]

This is a material data-quality issue. The `/index.html` version includes:

- longer German/Austrian destination lists;
- parcel pickup addresses and schedules;
- a larger contact list;
- additional German/Polish/Czech contact assignments;
- a different booking UI description.

The presence of these details in an accessible/indexed Koval page does not prove they remain operationally current in September 2026.

**UARoute policy:** the current root page is the primary truth surface; any legacy `/index.html` fact should be tagged **legacy / needs confirmation** until reconciled with Koval.

---

## 3. Business proposition

### 3.1 Primary proposition

**Verified:** Koval presents international passenger transport as its principal business direction. The root page describes passenger transport across borders and explicitly labels the business as “International Transport • Parcels & Passengers”.[1]

Koval states that its team has worked in international transport for “about 10 years”; this is a self-description, not an independently audited corporate-history fact.[1]

**Safe UARoute wording:**

> “Koval publicly offers international passenger and parcel transport.”

**Avoid:** “Koval has operated for exactly 10 years” unless the date basis is confirmed.

### 3.2 Passenger proposition

The current root page states or displays:

- passenger transport abroad;
- comfort-oriented minibuses;
- adjustable individual seats;
- autonomous heating and air conditioning;
- luggage shelves inside the passenger cabin;
- two professional drivers;
- Mercedes Sprinter minibuses;
- direct journeys without transfers;
- address delivery for passengers in Germany;
- booking without prepayment.[1]

These are all Koval’s published claims. They are not independent service-quality guarantees.

### 3.3 Parcel/cargo proposition

The site also presents parcel and small-cargo transport. The current root page states a **cargo limit of up to 2 tonnes** and lists personal belongings, furniture, permitted food products and online-store orders among accepted categories.[1]

The site separately describes parcel collection points/times in Germany and Austria and says that other German cities can be handled by address arrangement.[1]

Because these details are operationally sensitive and can change, UARoute should treat them as **Koval-published parcel-service data**, not permanent infrastructure.

### 3.4 Private / individual transfer proposition

The legacy `/index.html` and the newer root page both contain a claim for an individual transfer / vehicle order priced at **€0.8 per kilometre**.[1][2]

The current site wording is not sufficient to establish:

- whether €0.8/km is still current for every vehicle type;
- whether tolls, waiting time, border costs or other fees are included;
- whether the price applies to passengers, vehicle hire, or a particular transfer product.

**UARoute status:** **Verified that the site publishes €0.8/km; commercial pricing semantics remain unknown.** Do not turn this into an all-in fare promise.

### 3.5 B2B / employment-agency proposition

**Verified:** Koval states that it works with employment agencies to transport their passengers. It also states that a vehicle can be ordered under a contract with cashless payment.[1]

**Derived:** this supports a plausible B2B referral/inquiry path for recruitment or workforce mobility, but does not establish formal corporate account processes, SLAs, invoicing terms or contract templates.

**Unknown:** exact B2B contact routing, quotation process, volume thresholds, payment terms and service-level commitments.

### 3.6 Differentiators published by Koval

| Published claim | Classification | UARoute use |
|---|---|---|
| Mercedes Sprinter minibuses | Verified | Safe as a Koval-published fleet description |
| Two professional drivers | Verified | Safe as a Koval-published operational claim |
| Direct rides without transfers | Verified | Safe with destination/date qualification; do not generalize to every conceivable itinerary |
| Address passenger delivery in Germany | Verified | Safe for Germany, not automatically other countries |
| Booking without prepayment | Verified | Safe as current site wording, but final booking terms remain Koval-controlled |
| Adjustable individual seats | Verified | Safe as product description |
| Heating + air conditioning | Verified | Safe as equipment description |
| Punctuality / departures and arrivals on schedule | Verified claim | Do not present as a guaranteed performance metric |
| Flexible discounts for repeat customers | Verified legacy/current-site claim | Do not encode as a UARoute discount unless Koval confirms current commercial terms |

---

## 4. Passenger route inventory

### 4.1 Current Ukrainian departure evidence

The current root page explicitly lists **three Ukrainian departure areas**, each with satellite locations:[1]

| Primary origin hub | Satellite pickup locations explicitly listed by Koval | Evidence level |
|---|---|---|
| **Chernivtsi** | Zabolotiv, Sniatyn | Verified |
| **Ivano-Frankivsk** | Kolomyia, Otyniia, Burshtyn, Rohatyn, Kalush, Rozhniativ, Broshniv, Dolyna, Bolekhiv | Verified |
| **Lviv** | Stryi, Drohobych, Boryslav, Sambir, Truskavets, Horodok | Verified |

**Interpretation:** the page structure strongly suggests that the three named cities are the primary origin hubs while the parenthesized places are satellite/feeder pickup locations. This is a reasonable structural inference, but Koval does not formally define “hub” versus “satellite” terminology. Therefore UARoute should model these as `primary_origin` and `published_pickup_locality`, not as separate independent routes.

### 4.2 Destination countries

The current page explicitly names these destination countries:

- Germany
- Poland
- Czech Republic
- Austria
- Liechtenstein

The site also repeats a corridor string covering:

> Ukraine → Poland → Czech Republic → Austria → Liechtenstein → Germany.[1]

This establishes a published international corridor concept, but **does not establish that every possible city-to-city combination across that chain is a currently operated passenger service**.

### 4.3 Germany: current destination geography

The current root page lists the following passenger/parcel destination geography in Germany.[1]

| Region | Explicitly named cities/places |
|---|---|
| Lower Saxony / Bremen | Bremen, Hannover, Braunschweig, Wolfsburg, Hildesheim, Peine, Gifhorn, Celle, Uelzen, Lüneburg |
| Saxony-Anhalt | Magdeburg, Halle, Bismark |
| Saxony / Thuringia grouping | Dresden, Chemnitz, Leipzig, Jena, Erfurt, Meiningen |
| Brandenburg / Berlin | Berlin, Potsdam, Cottbus, Neuruppin |
| Mecklenburg-Western Pomerania | Rostock, Malchow/“Maklenburg” as rendered, Schwerin |
| Schleswig-Holstein / Hamburg | Hamburg, Lübeck, Itzehoe, Neumünster |
| North Rhine-Westphalia | Paderborn, Münster, Dortmund, Düsseldorf, Essen, Duisburg, Cologne, Bonn |
| Hesse | Kassel, Fulda, Frankfurt, Darmstadt, Wiesbaden, Mannheim |
| Rhineland-Palatinate | Koblenz, Mainz |
| Baden-Württemberg | Stuttgart, Karlsruhe, Heilbronn, Ulm, Wertheim am Main |
| Saarland | Saarbrücken, Homburg |
| Bavaria | Munich, Augsburg, Nuremberg, Würzburg, Bayreuth, Passau |

**Important classification:** Koval describes these as places “where we transport passengers and parcels” on the current root page.[1] This is stronger than a generic SEO keyword occurrence, so UARoute may use them as **published destination coverage**. It is still not equivalent to date-specific availability.

### 4.4 Austria: current destination geography

The current site publishes:[1]

| Region | Explicit destinations | Evidence level |
|---|---|---|
| Lower Austria | Vienna, Baden bei Wien, St. Pölten | Verified |
| Upper Austria | Linz, Wels | Verified |
| Salzburg | Salzburg | Verified |
| Tyrol | Innsbruck and all cities in Tyrol | Verified at regional level; city-complete list not specified for passengers |
| Vorarlberg | Bludenz, Nenzing, Feldkirch, Sulz, Hohenems, Dornbirn, Bregenz | Verified |

The phrase **“Innsbruck and all cities in Tyrol”** is broad. It should not be expanded by UARoute into a fully enumerated city list unless Koval supplies one or the site explicitly lists it.

### 4.5 Liechtenstein

The site lists **Vaduz** as the passenger destination.[1]

The current root also says Liechtenstein service is delivered via **Feldkirch railway station** in Austria.[1]

**Important:** do not interpret this as “door-to-door Vaduz” for passengers. The website evidence specifically references a railway-station transfer point for Liechtenstein.

### 4.6 Poland and Czech Republic

The current site clearly names **Poland** and **Czech Republic** as destination countries and includes them in its international corridor string.[1]

However, the current root page does **not** provide a comparable city-by-city passenger destination inventory for Poland or Czech Republic.

**UARoute classification:**

- Poland: **country-level passenger coverage verified; city-level destination list unknown.**
- Czech Republic: **country-level passenger coverage verified; city-level destination list unknown.**

Do not manufacture a list of Polish or Czech cities from generic geographic assumptions.

### 4.7 Corridor-only statements

Koval repeatedly publishes the multi-country sequence:

**Ukraine → Poland → Czech Republic → Austria → Liechtenstein → Germany.**[1]

This should be stored as a **corridor statement**, not as a guaranteed stop sequence. The site does not expose an authoritative city-by-city itinerary, border crossing order, or stop timetable.

### 4.8 What counts as a route in UARoute

Recommended internal data semantics:

```text
published_country_coverage
published_destination_city
published_origin_city
published_satellite_pickup
corridor_mention
schedule_verified
availability_verified
pickup_point_verified
fare_verified
```

Do **not** collapse all of these into a single `route=true` flag.

---

## 5. Booking and inquiry flow

### 5.1 Current passenger booking mechanism

The current root page includes a booking form requesting:[1]

- date of trip;
- contact phone;
- departure city;
- arrival city.

The current interface then provides **“Написати в WhatsApp”** and states that the site will open WhatsApp with a prepared message which the customer only needs to send.[1]

The page explicitly states **booking without prepayment**.[1]

### 5.2 What the public flow proves

**Verified:** the web form is an inquiry/WhatsApp handoff, not a visible instant-booking engine.[1]

**Not verified:**

- server-side reservation creation;
- inventory lock;
- automatic seat assignment;
- online payment;
- booking confirmation email/SMS;
- passenger identity verification;
- cancellation flow;
- refund flow;
- automated price calculation;
- real-time availability API.

Therefore UARoute should treat “booking” as a **lead/inquiry handoff** until Koval confirms the actual reservation process.

### 5.3 WhatsApp handoff design implication

The current site’s form is highly compatible with UARoute’s proposed model. UARoute can capture the same minimum inquiry fields:

```text
travel_date
origin_city
origin_country
destination_city
destination_country
passenger_count
passenger_contact
additional_pickup_or_dropoff_need
```

But UARoute should clearly disclose that the request is forwarded to Koval for confirmation and does not itself constitute a confirmed reservation.

### 5.4 Contact-desk routing

The current root page groups contacts as follows:[1]

**Germany / Poland / Czech Republic**

- Ivan — +38 (097) 777-17-87 — WhatsApp
- Ivan — +38 (050) 978-63-30 — booking trips / Viber / WhatsApp / Telegram
- Andrii — +38 (095) 609-43-57 — Viber / WhatsApp / Telegram
- Yurii — +38 (099) 754-91-10 — Viber / WhatsApp / Telegram

**Austria / Czech Republic / Liechtenstein**

- Mykola — +38 (063) 079-20-00 — Viber / WhatsApp / Telegram

The page title/header also presents +38 (095) 609-43-57 as a prominent main number.[1]

**Routing implication:** the site supports a sensible default mapping for UARoute:

| UARoute inquiry destination | Preferred public Koval desk according to site |
|---|---|
| Germany | Germany / Poland / Czech Republic desk |
| Poland | Germany / Poland / Czech Republic desk |
| Czech Republic | Either group; current site places Czech Republic in both group labels, so human confirmation is safest |
| Austria | Austria / Czech Republic / Liechtenstein desk |
| Liechtenstein | Austria / Czech Republic / Liechtenstein desk |

**Important:** because Czech Republic appears in both contact groups, do not auto-route Czech inquiries to a single individual unless Koval explicitly confirms the preferred desk.

### 5.5 Legacy contact differences

The `/index.html` version contains additional German contact numbers, Austrian numbers and a “Dovidka”/information number.[2]

Because these are absent from the current root’s contact presentation, UARoute should mark them **legacy / not verified for 2026** and should not publish or hard-code them without confirmation.

---

## 6. Parcel service evidence

Parcel information is extensive and more operationally specific than passenger information.

### 6.1 Weight and categories

The current root page states:

- cargo up to **2 tonnes**;
- personal items;
- furniture;
- permitted food;
- online-shop orders.[1]

It also lists pets and vehicle-import services in the FAQ/service content.[1]

### 6.2 Germany parcel reception points

The current page lists:[1]

- **Hannover:** Monday, Thursday, Friday, Sunday, 10:00–18:00
- **Bremen:** Sunday, 10:00–10:30
- **Porta Westfalica:** Monday, Tuesday, Thursday, Friday, Saturday, 10:00–18:00
- **Hamburg:** Sunday, 12:00–13:00

The legacy `/index.html` additionally lists **Pinneberg** and gives street addresses for the German points.[2]

Because the root page omits those addresses while the older page contains them, the address-level parcel data should be treated as **legacy operational detail pending confirmation**.

### 6.3 Austria parcel evidence

The current page states:[1]

- Vienna: collection any day by arrangement; Vienna courier collection up to 25 kg by prior arrangement.
- Tyrol/Vorarlberg corridor: Thursday service.
- Innsbruck → Kufstein / Zell am See corridor: Friday service.
- Salzburg: Sunday collection/delivery at 14:00.
- Vorarlberg: Saturday by prior arrangement.
- Liechtenstein: Saturday by prior arrangement, with handover via Feldkirch railway station.

These are **parcel service schedules**, not passenger schedules. UARoute must keep the two service domains separate.

### 6.4 Ukraine parcel intake

The current site names **Nova Poshta branch No. 1 in Dolyna, Ivano-Frankivsk region** as the Ukrainian intake point for parcels heading toward Germany, and gives Ivan Koval as recipient/contact.[1]

For Austria, the site similarly names Dolyna Nova Poshta branch No. 1 and a Koval contact.[2]

Do not substitute this parcel address for a passenger pickup location.

### 6.5 Prohibited parcel categories

The current page lists prohibited items including:

- meat/meat products and dairy products;
- alcohol;
- potatoes;
- tobacco/tobacco products;
- e-cigarettes and refills;
- new high-value equipment;
- valuables;
- narcotics and precursors;
- tree seedlings.[1][2]

The site directs customers to border-service rules for more detail. UARoute should avoid presenting Koval’s list as complete legal advice or as a substitute for current customs/border rules.

---

## 7. Exact operational claims that UARoute must constrain

### 7.1 Safe to repeat, with attribution to Koval

The following are strong candidates for UARoute content because they are directly published by Koval:

- Koval offers international passenger transport and parcel transport.[1]
- Koval publishes passenger departures from Chernivtsi, Ivano-Frankivsk and Lviv areas with named satellite locations.[1]
- Koval names Germany, Poland, Czech Republic, Austria and Liechtenstein as destination countries.[1]
- Koval publishes extensive German destination coverage.[1]
- Koval publishes Austrian regional/city coverage.[1]
- Koval lists Vaduz for Liechtenstein and references Feldkirch for handover.[1]
- Koval advertises direct trips without transfers.[1]
- Koval advertises passenger address delivery in Germany.[1]
- Koval says booking is without prepayment.[1]
- Koval provides WhatsApp/Viber/Telegram contact channels.[1]
- Koval publishes a WhatsApp-based inquiry form requesting date, phone, origin and destination.[1]

### 7.2 Must be qualified or confirmed

These should not be transformed into hard promises:

- “on schedule” / punctuality;
- exact frequency of passenger departures;
- any specific travel date availability;
- the exact trip time;
- the exact journey distance;
- exact pickup/drop-off address for a passenger;
- exact route sequence through countries;
- fare for ordinary passenger journeys;
- exact baggage allowance;
- seat availability or passenger capacity;
- confirmation that a specific city will be served on a specific date;
- exact meaning/inclusiveness of the €0.8/km transfer rate.

### 7.3 Do not invent

UARoute must never invent or infer as current facts:

```text
departure_time
arrival_time
frequency_per_week
fare
seat_count
seat_map
baggage_kg
pickup_address
dropoff_address
route_stops
live_availability
booking_confirmation
response_time
cancellation_terms
refund_terms
payment_method_other_than_published_claim
rating/review_score
```

---

## 8. SEO/content observations relevant to UARoute

This is a content and integration audit, not a redesign proposal.

### 8.1 Searchable content strengths

The site contains unusually rich destination text for Germany, Austria and Liechtenstein. The current root page exposes many city names in crawlable text, which is likely useful for organic discovery of long-tail queries such as Ukrainian-origin → German-city transport.[1]

The page also combines passenger and parcel content. This broadens keyword coverage but makes semantic separation important for UARoute: a city appearing in a parcel context should not automatically be interpreted as a passenger route.

### 8.2 SEO/content risks

The main risks for downstream UARoute data extraction are:

1. **Large geography lists without timetable context.** A destination appearing in “where we go” does not carry a date, departure day, frequency or fare.[1]
2. **Multiple indexed versions.** `/` and `/index.html` contain conflicting freshness markers and different data.[1][2]
3. **Mixed service types.** Passenger destinations, parcel points and parcel-only schedules appear on the same page.[1]
4. **Legacy contact data.** Older contact entries can survive in `/index.html` even when omitted from the newer root page.[2]
5. **Broad regional wording.** “all cities in Tyrol” is not equivalent to an exhaustive city inventory.[1]

### 8.3 Data-extraction guidance

UARoute should preferentially consume a structured, manually validated content layer derived from Koval—not directly parse every city string from the site and publish it as a route.

Recommended internal data record:

```yaml
operator: KOVAL
source_url: https://www.4k-koval.com/
service_type: passenger
origin:
  country: Ukraine
  locality: Lviv
  evidence: published_origin
 destination:
  country: Germany
  locality: Hannover
  evidence: published_destination
availability: unknown
fare: unknown
schedule: unknown
pickup: unknown
notes: "Published geography; date-specific service requires Koval confirmation."
last_verified: 2026-09-11
```

---

## 9. Technical/product integration implications

### 9.1 Appropriate UARoute system boundary

The public evidence supports the following architecture:

```text
UARoute
  ├─ route discovery
  ├─ city/corridor content
  ├─ passenger intent capture
  ├─ qualification
  └─ referral / WhatsApp handoff
           ↓
      Koval inquiry desk
           ↓
     Koval availability check
           ↓
       Koval confirms
           ↓
        transaction
```

UARoute should **not** become the system of record for Koval’s inventory unless Koval later provides an authenticated availability/booking feed.

### 9.2 Recommended inquiry payload

Minimum payload to preserve useful intent while avoiding unsupported promises:

```json
{
  "operator": "KOVAL",
  "service": "passenger",
  "travel_date": "YYYY-MM-DD",
  "origin": {
    "city": "",
    "country": "Ukraine"
  },
  "destination": {
    "city": "",
    "country": ""
  },
  "passengers": 1,
  "contact": "",
  "pickup_address_request": false,
  "dropoff_address_request": false,
  "notes": ""
}
```

The UI should display **“request availability” / “send inquiry”**, not “book now”, unless Koval confirms a true reservation handoff.

### 9.3 Contact routing matrix

| Destination | Site evidence | Default UARoute routing | Confidence |
|---|---|---|---|
| Germany | Current root groups Germany with Poland/Czech | Germany/Poland/Czech desk | High |
| Poland | Current root groups Poland with Germany/Czech | Germany/Poland/Czech desk | High |
| Czech Republic | Appears in both desk labels | Human or Koval-defined routing | Medium |
| Austria | Current root explicitly groups Austria with Czech/Liechtenstein | Austria/Czech/Liechtenstein desk | High |
| Liechtenstein | Same group | Austria/Czech/Liechtenstein desk | High |

Use the **current root page’s numbers** as primary. Do not adopt legacy `/index.html` numbers automatically.[1][2]

---

## 10. Missing information that UARoute needs from Koval

The following are the highest-priority confirmation fields before UARoute presents Koval as a commercially selectable transport option.

### Passenger operations

- authoritative list of current passenger corridors;
- exact passenger origin cities vs feeder/pickup localities;
- exact passenger destination cities by country;
- operating days by corridor;
- departure windows / exact departure times;
- typical journey duration ranges;
- pickup/drop-off rules by country;
- whether address pickup/delivery applies outside Germany;
- passenger fare rules and price-update process;
- child pricing/seat requirements;
- baggage allowance and excess-baggage rules;
- pets policy for passengers;
- cancellation/rescheduling rules;
- no-show rules;
- payment options;
- what constitutes a confirmed booking;
- availability confirmation SLA, if any.

### Integration

- one canonical WhatsApp booking endpoint;
- preferred contact per destination country;
- whether UARoute should route to one central desk or country-specific operators;
- a stable booking/inquiry message template;
- whether a referral/attribution ID can be included;
- whether Koval can report confirmed bookings/leads for attribution;
- whether an API, webhook, CRM export, or shared intake sheet can be provided.

### Content governance

- which root/index information is authoritative;
- whether `/index.html` is legacy and should be removed/redirected;
- current official passenger city inventory;
- current parcel pickup schedule and addresses;
- current contact roster;
- current pricing language for private transfers.

---

## 11. Claims inventory for UARoute

| Claim / data point | Source | Status | UARoute action |
|---|---|---|---|
| Koval is an international passenger + parcel carrier | `/` | Verified | May repeat |
| Ukraine → Germany passenger proposition | `/` | Verified | May repeat |
| Poland, Czechia, Austria, Liechtenstein destination countries | `/` | Verified | May repeat at country level |
| Chernivtsi / Ivano-Frankivsk / Lviv origin areas | `/` | Verified | May repeat |
| Parenthesized Ukrainian localities are feeder/satellite pickup areas | `/` structure | Derived | Model as pickup localities, not independent route hubs |
| Germany city list | `/` | Verified | May use as published destination coverage |
| Austria city/region list | `/` | Verified | May use with regional wording preserved |
| Vaduz destination | `/` | Verified | May repeat |
| Feldkirch railway-station handover for Liechtenstein | `/` | Verified | Repeat with service-specific wording |
| Direct/no-transfer claim | `/` | Verified | May repeat with date/service qualification |
| Address passenger delivery in Germany | `/` | Verified | May repeat only for Germany |
| Booking without prepayment | `/` | Verified | May repeat as Koval’s published booking term |
| WhatsApp inquiry with date/phone/origin/destination | `/` | Verified | Use as integration model |
| €0.8/km private transfer | `/` + `/index.html` | Verified but semantics incomplete | Confirm before monetizing/publishing as fare |
| Passenger schedule | None | Unknown | Do not fabricate |
| Passenger fare by route | None | Unknown | Do not fabricate |
| Live seat inventory | None | Unknown | Do not expose as live |
| Baggage allowance | None | Unknown | Ask Koval |
| Passenger pickup addresses | Mostly absent | Unknown | Ask Koval |
| Current legacy contacts from `/index.html` | `/index.html` | Not verified for 2026 | Do not hard-code |

---

## 12. Material inconsistencies and risks

### Risk 1 — `/` vs `/index.html`

**Severity: High.** Two public Koval pages expose materially different information and freshness markers.[1][2]

**Why it matters:** automated extraction or human research can collect outdated contact numbers, addresses or schedules.

**UARoute action:** establish a canonical Koval source URL and maintain a validation date on every imported operator fact.

### Risk 2 — Geographic coverage could be mistaken for availability

**Severity: High.** The site has a large city inventory but no authoritative date-specific passenger timetable.[1]

**UARoute action:** separate `published_destination` from `available_on_date`.

### Risk 3 — Passenger and parcel geography is mixed

**Severity: High.** The same destination blocks contain both passenger and parcel claims.[1]

**UARoute action:** separate service types in the UARoute data model.

### Risk 4 — Country-only claims for Poland/Czechia

**Severity: Medium.** Country coverage is explicit, but city-level passenger coverage is not.[1]

**UARoute action:** do not generate Polish/Czech city routes from assumption.

### Risk 5 — Contact ambiguity for Czech Republic

**Severity: Medium.** Czechia appears in both current contact group labels.[1]

**UARoute action:** use Koval-confirmed desk routing or a general booking contact until clarified.

### Risk 6 — Legacy contact/parcel data

**Severity: Medium/High.** `/index.html` includes more detailed addresses and contacts than the newer root.[2]

**UARoute action:** do not ingest legacy details automatically.

---

## 13. Recommended UARoute source-of-truth policy

Until Koval provides a structured operator feed, UARoute should maintain a small **operator evidence registry** rather than scraping the site at runtime.

Each fact should retain:

```text
operator
service_type
country
city/locality
fact_type
source_url
source_version
verification_date
status
notes
```

Use the following status lifecycle:

```text
published
  ↓
validated
  ↓
commercially-approved
  ↓
retired
```

A destination should be allowed into UARoute’s broad discovery layer at `published` status, but it should not appear as **available for a specific date** until Koval confirms it.

---

## 14. Suggested frozen baseline for UARoute

As of **11 September 2026**, the safest frozen interpretation is:

1. **Canonical public domain:** `https://www.4k-koval.com/`.
2. **Primary service:** international passenger transport, with parcel/cargo services also offered.
3. **Published passenger departure geography in Ukraine:** Chernivtsi area, Ivano-Frankivsk area, Lviv area, with listed satellite localities.
4. **Published destination countries:** Germany, Poland, Czech Republic, Austria, Liechtenstein.
5. **Published detailed city coverage:** extensive Germany list; several Austrian regions/cities; Vaduz in Liechtenstein.
6. **Poland/Czechia:** country-level evidence only on the current root; city-level passenger coverage remains unknown.
7. **Booking:** public form collecting trip date, phone, origin and destination, then handing off to WhatsApp; booking is advertised as without prepayment.
8. **Passenger scheduling:** no dependable public timetable discovered.
9. **Passenger pricing:** no ordinary fare table discovered; a €0.8/km individual-transfer claim exists, but its commercial scope is not fully specified.
10. **Live availability:** not publicly verified.
11. **Operational contact:** current root provides country-grouped WhatsApp/Viber/Telegram contacts; Czech routing is ambiguous.
12. **Legacy page:** `/index.html` contains older/different operational information and must not be treated as automatically current.

This baseline is sufficient for UARoute to build **route-discovery and lead-generation content**, but not sufficient to claim **live bookability** without a Koval confirmation layer.

---

## 15. Sources

1. Koval, **“Коваль Експресс — перевезення Україна — Німеччина”**, current root page, accessed/crawled September 2026. https://www.4k-koval.com/
2. Koval, **“Комфортні пасажирські перевезення та перевезення посилок до Німеччини | KOVAL”**, indexed `/index.html` page, accessed/crawled 2026. https://www.4k-koval.com/index.html
3. Work.ua, **“4k-Koval — Available jobs”**, company profile referring to `4k-koval.com`; historical business description. https://www.work.ua/jobs/by-company/2659633/
4. Work.ua, **“Коваль, ФОП (транспортна компанія) — Available jobs”**, company profile referring to `4k-koval.com`; passenger/parcel transport description. https://www.work.ua/jobs/by-company/3149641/

---

## Appendix A — Current passenger geography, normalized

### Ukraine — origin evidence

```text
Chernivtsi
├── Zabolotiv
└── Sniatyn

Ivano-Frankivsk
├── Kolomyia
├── Otyniia
├── Burshtyn
├── Rohatyn
├── Kalush
├── Rozhniativ
├── Broshniv
├── Dolyna
└── Bolekhiv

Lviv
├── Stryi
├── Drohobych
├── Boryslav
├── Sambir
├── Truskavets
└── Horodok
```

### Germany — published destination evidence

```text
Lower Saxony / Bremen
  Bremen, Hannover, Braunschweig, Wolfsburg, Hildesheim,
  Peine, Gifhorn, Celle, Uelzen, Lüneburg

Saxony-Anhalt
  Magdeburg, Halle, Bismark

Saxony / Thuringia
  Dresden, Chemnitz, Leipzig, Jena, Erfurt, Meiningen

Brandenburg / Berlin
  Berlin, Potsdam, Cottbus, Neuruppin

Mecklenburg-Western Pomerania
  Rostock, ["Maklenburg" as rendered], Schwerin

Schleswig-Holstein / Hamburg
  Hamburg, Lübeck, Itzehoe, Neumünster

North Rhine-Westphalia
  Paderborn, Münster, Dortmund, Düsseldorf, Essen,
  Duisburg, Cologne, Bonn

Hesse
  Kassel, Fulda, Frankfurt, Darmstadt, Wiesbaden, Mannheim

Rhineland-Palatinate
  Koblenz, Mainz

Baden-Württemberg
  Stuttgart, Karlsruhe, Heilbronn, Ulm, Wertheim am Main

Saarland
  Saarbrücken, Homburg

Bavaria
  Munich, Augsburg, Nuremberg, Würzburg, Bayreuth, Passau
```

### Austria — published destination evidence

```text
Lower Austria: Vienna, Baden bei Wien, St. Pölten
Upper Austria: Linz, Wels
Salzburg: Salzburg
Tyrol: Innsbruck + all cities in Tyrol (not individually enumerated on root)
Vorarlberg: Bludenz, Nenzing, Feldkirch, Sulz, Hohenems, Dornbirn, Bregenz
```

### Liechtenstein

```text
Vaduz
  Published destination

Feldkirch railway station, Austria
  Published handover reference for Liechtenstein service
```

---

## Appendix B — Data fields that should remain null until Koval confirms them

```text
passenger_fare
passenger_departure_time
passenger_arrival_time
passenger_frequency
journey_duration
journey_distance
passenger_pickup_address
passenger_dropoff_address
route_stop_sequence
baggage_allowance
passenger_capacity
seat_availability
booking_confirmation_status
cancellation_policy
refund_policy
response_time
```

