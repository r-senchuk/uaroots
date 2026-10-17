---
type: "Specification"
title: "M2 booking domain and API contract"
description: "Requirements, boundaries and implementation context for M2 booking domain and API contract."
tags: ["uaroute", "product"]
---

# M2 booking domain and API contract

**Updated:** 2026-10-08. **Status:** planned implementation contract. **Owner:** developer.

Authority: [constitution §39](../../00-project-constitution.md#39-approved-gated-operator-booking-pilot-m2) → [ADR 0002](../../Decisions/0002-gated-operator-booking-pilot.md). Companion: [site details](../../knowledge-base.md#knowledge-base) (KB: `wiki/Product/14-booking-pilot-site-details.md`), [backlog](../../knowledge-base.md#knowledge-base) (KB: `wiki/Product/Booking/implementation-backlog.md`). Source facts and design inferences: [research](../../knowledge-base.md#knowledge-base) (KB: `wiki/Product/Research/booking-pilot-strategy-review.md`).

## Fit boundary clarified — 2026-10-08

The [flexible-corridor strategy](../../knowledge-base.md#knowledge-base) (KB: `wiki/Product/18-flexible-corridor-development-strategy.md`) does not expand this API contract. Here, `Trip` remains one verified whole-trip physical allocation. A catalog passenger pair is a discovery intent; it is not an independent inventory pool. Regular vehicle transfers/pooling reported for Koval remain outside this pilot until BK-01 selects a genuinely stable eligible departure or a separate scope/ADR revision is accepted. Do not sum vehicles, create independent capacity copies for every SEO pair, or resolve multi-leg commitments with this single-trip counter. Uniform fare does not establish allocation fit.

## 1. Domain boundary

| Concept | Meaning | Explicit limit |
| --- | --- | --- |
| Corridor | Sourced origin/destination in the existing catalog. | Commercial status permits inquiry discovery, not booking; candidate pages require independent operational verification before enrollment. |
| Operator enrollment | One accountable provider agrees to inventory, support, and data responsibilities. | Provisioned privately; no public registration or marketplace onboarding. |
| Trip | A specific verified departure and its physical eight-passenger-seat allocation. | One whole journey; passengers do not release seats at intermediate stops. |
| Booking | One party reserves 1–3 guest seats or 1–8 driver-entered seats. | Name/phone identify the contact for the party; no named seat map, payment or ticket issuance. |
| Driver | Provisioned identity assigned to particular trips. | Cannot manage a different operator or unassigned trip. |
| Booking reference | Opaque server-issued support reference. | Does not authorize public roster/history lookup. |

Pilot fit requires a real eight-passenger-seat vehicle, a single ledger for all selling channels, and no overlapping departures using the same seats. If the operator requires intermediate-leg capacity reuse, pooled vehicles, variable pickup pricing, border documents, or externally allocated seats, select a simpler departure/segment or pivot before build. Do not silently apply an eight-seat model to every provider vehicle. Pickup and support facts must be verified; do not add free-text passenger notes or document uploads.

## 2. Records and access patterns

Two DynamoDB tables; names below are logical, not provisioned resources. UTC timestamps are ISO 8601. `revision` is an increasing integer, not a timestamp.

| Record | Key / minimum fields | Access / privacy |
| --- | --- | --- |
| Trip in `Trips` | `tripId` primary key; `operatorId`, catalog `routeId`, private `vehicleRef`, assigned identity subjects, `departsAtUtc`, `guestClosesAtUtc`, `capacity=8`, `remainingSeats`, `status`, `bookingEnabled`, `revision`, creation/cancellation metadata. | Strong lookup by ID. Public projection excludes assignments, vehicle reference, actors and passenger data. |
| Operator control in `Trips` | Reserved key `CONTROL#operatorId`; enrollment enabled, booking writes enabled, approved commercial route IDs/catalog revision, approved admin/driver subjects, policy version. | Same table, distinct record type; never public. Lets the transaction enforce an operator-wide pause. |
| Booking in `Bookings` | Partition `tripId`, sort `bookingId`; `operatorId`, seats, source, state, created/cancelled metadata, nullable boarded count, private name/phone, submission identity/fingerprint, PII deadline. | Strong per-trip queries and exact-key lookup; no public booking listing. |

Maintain the approved-route allowlist from the sourced commercial catalog; route eligibility changes require updating or disabling backend enrollment too, without relying on a cached frontend. Public operator/pickup/support facts come from the verified enrollment record, not client payloads.

Default search index: verified route + Warsaw departure date → departure time/ID, on Trip records only. A bounded pilot driver list can query the same date/corridor and filter assignments on the server; every exact-trip endpoint rechecks authorization. No vehicle/route/package table, general audit table, or universal repository abstraction yet.

Search/index results identify candidates, then strong base-table reads filter current trip state and produce current availability. A newly created trip may take time to appear in search; its direct link works through `GET /trips/{tripId}`. Never use an index count to allocate seats. Paginate per-trip booking reads, including cancelled records; eight active seats do not bound historical record count.

Every roster-affecting write increments trip `revision` in the same transaction. Read a strong trip revision, query all booking pages strongly, then re-read revision; retry a changed revision a bounded number of times. If still changing, report `ROSTER_REFRESH_REQUIRED`, not an apparently consistent counter/roster. This is our snapshot design, not a claim that a DynamoDB Query and separate Get are one transaction. Reconciliation runs with writes paused.

## 3. Capacity and transitions

Invariant: `remainingSeats + sum(seats where booking.state = reserved) = 8`; remaining is an integer in 0…8. Trip cancellation does not erase its roster. Departure metrics use the booking timeline, not today's remaining counter.

| Action | Conditions | Atomic effects |
| --- | --- | --- |
| Create trip | Enrolled operator/admin; sourced commercial corridor; verified vehicle allocation and time. | Create scheduled, initially disabled trip with eight remaining seats. Operator enables only after checks. |
| Enable/pause trip | Authorized admin, expected revision. | Set booking switch and increment revision. Pausing affects new writes; it does not undo earlier commits. |
| Reserve guest/phone | Operator control allows writes; scheduled/enabled trip; action deadline; sufficient seats; new submission identity. | Check operator control, conditionally update trip counter/revision, put reserved booking. |
| Cancel booking | Authorized assigned driver/admin; reserved booking; before departure. | Set cancelled/actor/time and return seats once, updating revision. Repeat returns cancelled state without adding seats. |
| Cancel trip | Operator admin; expected revision. | Mark cancelled, disable booking, increment revision. Keep references/roster for contacting affected passengers. |
| Complete trip | Operator admin; departure has passed. | Mark completed/disabled; freeze departure outcome basis. Boarding entry may be completed afterwards. |
| Record boarding | Assigned driver/admin; after departure, count 0…reserved seats or unknown. | Conditional booking update and trip revision increment; actor/time recorded. No inventory allocation. |

Do not edit booked departure, cutoff, corridor, vehicle allocation, or capacity. The initial interface uses cancel/recreate with operator support. An unused trip may be cancelled and recreated as well; general edit CRUD adds no essential pilot value. Reject post-departure booking cancellation; later support corrections use boarding outcomes and an operator-reviewed aggregate correction, rather than rewriting occupancy history.

Use the condition on the Trip `Update` itself; a separate condition check and update of the same item is invalid in one DynamoDB transaction. Read current trusted control/assignment data and pin its version in the transaction where permissions affect a write. Concurrent enrollment/assignment changes must not leave a stale authorization path.

## 4. Time and durable retries

Accept a verified UTC instant when creating a trip; if UI takes Warsaw local date/time, resolve it explicitly before sending. A nonexistent local time is invalid; an ambiguous one requires choosing the offset. Guest cutoff is a stored immutable UTC instant, configured and agreed in P0; no guessed default is published.

Server time immediately before each new transaction attempt decides cutoff eligibility: guest `now < guestClosesAtUtc`, driver `now < departsAtUtc`. Recheck after retries; do not retain an earlier deadline check across backoff. The rule governs the accepted attempt, not browser click time; it does not promise millisecond-exact commit timing or a midnight scheduled close.

Client generates at least 128 bits of random submission identity and sends it in `Idempotency-Key`. Derive a stable opaque booking ID from trip + random submission identity using SHA-256; do not make that ID depend on a rotating secret. Store a versioned keyed fingerprint of normalized payload, action/source and actor scope with the booking; retain the necessary key version for its permitted retry lifetime. This uses the booking record as the durable retry record; no third table. Treat hashes/keys as private pseudonymous data, never analytics.

- Look up the existing record strongly before new-write eligibility. Identical retry returns its current state/reference even if cutoff has passed; it never consumes seats again.
- Same key, changed normalized payload/action/identity returns `IDEMPOTENCY_CONFLICT`. Driver retries require current authorization. Guest retry response contains no passenger name/phone.
- If concurrent retries race, only one conditional booking insert can succeed; resolve the loser by strong read. Do not classify an existing cancelled reservation as newly successful.
- Keep the key in current browser memory through timeout/retry. Do not persist passenger fields or credentials to browser storage. Reload/lost flow uses operator support; there is no guest history endpoint.
- At PII expiry remove contact and fingerprint material. A minimal expired marker may prevent recreation; expired retries return `RECEIPT_EXPIRED`, never a fresh booking. Retention/deletion requirements control any marker kept.

Redact contact fields without deleting inventory/timeline records while the trip ledger is retained. Never apply TTL to an active reservation record to free or forget seats. Whole-ledger deletion happens only for a finalized trip after commitments and permitted reporting are resolved; trip IDs are never reused. The capacity invariant applies to retained operational ledgers, not an aggregate archive.

The transaction's returned success or a matching persisted record is commit evidence. A local success flag, HTTP submission initiation, or ambiguous timeout is not.

## 5. HTTP surface

All routes are in API Gateway/Lambda, not Next.js request-time handlers. Use JSON, bounded body sizes, `Cache-Control: no-store`, and explicit origin allowlists. Browser CORS is not authentication. Operational API date queries are allowed for search but their query strings are excluded from access logs; public share URLs never carry a passenger's selected date.

| Method / path | Identity | Request / result |
| --- | --- | --- |
| `GET /trips?routeId=…&date=YYYY-MM-DD` | Guest | Validated commercial corridor and Warsaw date; public trip list, freshness timestamp, no roster. |
| `GET /trips/{tripId}` | Guest | Strong public projection, including disabled/cancelled/departed state for old links. No private trip metadata. |
| `POST /trips/{tripId}/book` | Guest | `{name, phone, seats}` + submission header; 201 commit, 200 identical replay with current state. |
| `GET /driver/trips?date=YYYY-MM-DD` | Driver/admin | Only own authorized trip summaries. |
| `GET /trips/{tripId}/passengers` | Assigned driver/admin | Private consistent roster with state/source/counts; no analytics. |
| `POST /trips/{tripId}/add-client` | Assigned driver/admin | Same booking service and key behavior; seats 1–8. |
| `POST /trips/{tripId}/bookings/{bookingId}/cancel` | Assigned driver/admin | Conditional cancel; state result, no double release. |
| `PUT /trips/{tripId}/bookings/{bookingId}/boarding` | Assigned driver/admin | `{boardedSeats: integer or null, expectedRevision}`; conflict requires refresh. |
| `POST /operator/trips` | Admin | Verified trip configuration; rejects invented/unsupported corridor and incompatible allocation. |
| `POST /operator/trips/{tripId}/enable`, `/pause`, `/cancel`, `/complete` | Admin | Expected revision plus explicit action; current state returned. |
| `GET /trips/{tripId}/export` | Assigned driver/admin, conditional feature | CSV streamed privately; escaping and spreadsheet-formula neutralization. No stored export link. |

Before coding each slice, translate its rows into a minimal OpenAPI document alongside the API implementation. This Markdown is the current canonical design; no callable API or generated schema is certified here.

Success projection: booking reference/ID, state, trip public facts, seats, committed timestamp, replay indicator, and verified support details; no guest name/phone echo. Private roster may return contact fields only before the access deadline. Validation: trimmed name 2–100 characters without restricting to Latin letters; phone normalized with explicit country code, international parsing, and bounded length; seats integer with action-specific limit. Do not claim phone ownership is verified. Server derives source/operator/actor; reject unknown writable properties.

Error shape: `{code, message, requestId, retryable}`; capacity errors may include freshly read `remainingSeats`. UI maps codes to [Ukrainian states](../../knowledge-base.md#knowledge-base) (KB: `wiki/Product/14-booking-pilot-site-details.md`), rather than exposing developer messages.

| HTTP / code | Meaning / action |
| --- | --- |
| 400 `INVALID_INPUT` | Show field validation; no booking. |
| 401 / 403 | Sign in again / forbidden. Never return another operator's data. |
| 404 `TRIP_NOT_FOUND` | Unknown or undiscoverable trip; no operational facts invented. |
| 409 `CAPACITY_CHANGED`, `IDEMPOTENCY_CONFLICT`, `REVISION_CONFLICT` | Refresh stock; preserve original submission; or refresh stale administration state. |
| 410 `BOOKING_CLOSED`, `TRIP_CANCELLED`, `TRIP_DEPARTED`, `RECEIPT_EXPIRED` | Explicit closed state; current inquiry/support path carries no seat promise. |
| 429 `RATE_LIMITED` | Bounded retry guidance; do not create a new submission key. |
| 503 `BOOKING_PAUSED`, `RETRY_SAME_SUBMISSION`, `ROSTER_REFRESH_REQUIRED` | No confirmation. Retry same booking key when appropriate; use the runbook. |

Use Cognito managed login, public app client without secret, authorization code + PKCE, access-token scopes, and Lambda's current operator/assignment checks. Initial booking/driver shells disable browser analytics entirely. Remove callback code/state from the visible URL before any later optional application analytics can initialize; account for scripts inherited from the root layout. Keep tokens out of URL queries, logs, static files and long-lived browser storage. Session restart can require sign-in again. Provision accounts privately and support revocation through current server-side permission checks.
