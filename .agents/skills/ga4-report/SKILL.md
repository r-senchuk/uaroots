---
name: ga4-report
description: "Use when querying GA4 reports, acquisition, engagement, or inquiry telemetry for uaroute (property 557859031). Do not use for account changes, authentication, tracking deployment, or confirmed booking/lead qualification."
---

# GA4 Analytical Playbook & Query Recipes (UARoute)

Operational guidance and query templates for inspecting Google Analytics 4 telemetry on UARoute using the `google-analytics` MCP tools.

## When To Use

Use for read-only GA4 analysis in this project's workspace. Do NOT use for Google configuration changes, tag deployment, credential recovery, or treating clicks as fulfilled business outcomes.

## Inputs To Collect First

- Requested question, completed date window, comparison period, analytical unit, and output destination.
- Project profile: property `557859031`; use an explicit `property_id` in every call.
- Current tool catalog and the property's custom-definition metadata when custom fields are needed.

## Procedure

### Step 1 — Confirm scope and select the smallest useful query

Read the workspace `.codex/config.toml`: `GA4_ENFORCE_ISOLATION=true`, with both allowed and default property set to `557859031`. The shared launcher alone does not select the project. Stop on a mismatch; do not broaden the allowlist. A newly connected client must load this workspace profile.

Use tool discovery before unfamiliar endpoints. Fetch `get_property_details` or `list_web_data_streams` only when identity needs confirmation. Reuse current identity evidence and schema metadata instead of repeatedly listing accounts. For custom fields, inspect `get_custom_dimensions_and_metrics` for this exact property. A static shared schema or another property's cache does not prove registration. `describe` skips the report request but may fetch metadata.

Use completed days by default: `7daysAgo` through `yesterday` is seven inclusive dates in the property's timezone. Label a partial `today` window explicitly. Start with one bounded report; paginate only when the question needs all rows. A core report does not establish ordered funnel progression; use the funnel endpoint for that question and inspect its result structure.

### Step 2 — Fixed Identifiers & Non-Negotiable Boundaries

- **Property ID**: `557859031` (Default and allowed property)
- **Web Data Stream**: `16060537484`
- **Measurement ID**: `G-PMXHF9YT7V`
- **Canonical Host**: `https://uaroute.com`
- **Time Zone / Currency**: `Europe/Warsaw` / `PLN`
- **Identity evidence**: Property and stream metadata confirmed through the scoped MCP on 14 October 2026; this does not prove event collection.

#### Product & Privacy Boundaries (M1 Model)
- **Discovery vs Booking Ownership**: UARoute owns passenger discovery and route intent. Carrier «Коваль» owns reservation and booking fulfillment.
- **Outbound Handoffs, Not Confirmed Bookings**: `whatsapp_click` and `koval_site_click` record outbound user actions from UARoute into carrier communication channels. They do **not** confirm operator message receipt, ticket purchase, payment, seat reservation, or completed travel.
- **Intent vs Handoff**: `booking_intent` measures validated form interaction before dispatch. Always report `booking_intent` separately from handoff event counts.
- **Zero Passenger PII**: No passenger names, phone numbers, or travel dates are ever tracked or sent to GA4.

---

### Step 3 — API Endpoint Discipline & Query Parameter Rules

GA4 Data APIs require distinct query parameters across endpoints:

| Endpoint | Tool | Time Parameter | Pagination | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Core Reports** | `run_report` | `date_ranges` (`YYYY-MM-DD` or relative `today`, `yesterday`, `7daysAgo`) | `limit` (default 50, max 1000), `offset` | 24–48h processing latency; returns property quota telemetry. |
| **Realtime Reports** | `run_realtime_report` | `minute_ranges` (e.g. `[{"start_minutes_ago": 29, "end_minutes_ago": 0}]`) | `limit` only; **NO offset** | Live window (up to 29m Standard); completeness metadata is unavailable; no date ranges. |
| **Conversion Reports** | `run_conversions_report` | `date_ranges` | `limit`, `offset` | Requires `conversion_spec`; inspect its discovered schema before use. |
| **Funnel Reports** | `run_funnel_report` | `date_ranges` | Inspect discovered schema | Multi-step user journey analysis; returns `funnel_table` & `funnel_visualization`. |

> [!WARNING]
> Never pass `date_ranges` or `offset` to `run_realtime_report`. Use `minute_ranges` exclusively. Passing `offset` to Realtime will result in `INVALID_ARGUMENT`.

---

### Step 4 — Decoupled Funnel Recipes (ADR-15)

#### Recipe 1: Inquiry Form Funnel
Measures observed passenger progression through the validated route inquiry form into an outbound handoff:
1. `route_view` (Passenger views a specific route page)
2. `booking_intent` (Passenger validates form context and initiates handoff)
3. `(whatsapp_click | koval_site_click)` (Outbound dispatch via WhatsApp or Коваль website modal)

*Interpretation*: Measures form completion efficiency. Report `booking_intent` volume alongside handoff volume.

#### Recipe 2: Carrier Website Handoff Funnel
Measures carrier website referral handoffs originating from route discovery:
1. `route_view`
2. `koval_site_click` (All placements: `booking_widget`, `route_index`, `partner_card`, `footer`, and form fallback)

*Interpretation*: Captures total carrier website traffic referred from UARoute. Existing `ctaLocation` dimensions do not cleanly isolate direct links from form modal fallbacks across historical data; report this as all carrier website handoffs.

#### Recipe 3: Total Коваль Website Handoffs
Measures aggregate outbound referral volume to `4k-koval.com`:
- Filter: `eventName == "koval_site_click"`
- Dimensions: `pagePath`, `customEvent:ctaLocation`, `customEvent:conversionType`

#### Recipe 4: Unified Discovery Handoffs (Deduplicated Union)
Measures the deduplicated count of discovery sessions or users that produced **at least one** outbound carrier handoff:
- Condition: Session contains `whatsapp_click` OR `koval_site_click` (including direct WhatsApp clicks without prior `booking_intent`).
- Count: Deduplicated once per selected unit (session or user).
- Separate Intent: Report total `booking_intent` events in parallel as an inquiry engagement indicator.

---

### Step 5 — Matched Denominators & Metric Hygiene

To avoid distorted conversion metrics, always match numerators and denominators to the same analytical unit:

- **Session-Level Discovery Conversion Rate**:
  $$\text{Session Conversion Rate} = \frac{\text{Deduplicated Sessions with Handoff}}{\text{Total Discovery Sessions}}$$
- **User-Level Discovery Conversion Rate**:
  $$\text{User Conversion Rate} = \frac{\text{Deduplicated Users with Handoff}}{\text{Total Discovery Users}}$$

> [!CAUTION]
> Never divide event totals (e.g. total `whatsapp_click` events) by session totals to compute conversion rates. Multiple clicks by a single user will generate rates $>100\%$ and corrupt acquisition reporting.

---

### Step 6 — Standard MCP Tool Query Templates

#### Template A: Realtime Activity (Last 30 Minutes)
```json
{
  "property_id": "557859031",
  "minute_ranges": [
    {
      "start_minutes_ago": 29,
      "end_minutes_ago": 0
    }
  ],
  "dimensions": [
    "eventName",
    "unifiedScreenName"
  ],
  "metrics": [
    "activeUsers",
    "eventCount"
  ],
  "limit": 50
}
```

#### Template B: Route Views & Discovery Handoffs (Last 7 Days)
```json
{
  "property_id": "557859031",
  "date_ranges": [
    {
      "start_date": "7daysAgo",
      "end_date": "yesterday"
    }
  ],
  "dimensions": [
    "pagePath",
    "eventName"
  ],
  "metrics": [
    "sessions",
    "totalUsers",
    "eventCount"
  ],
  "dimension_filter": {
    "filter": {
      "field_name": "eventName",
      "in_list_filter": {
        "values": [
          "route_view",
          "booking_intent",
          "whatsapp_click",
          "koval_site_click"
        ]
      }
    }
  },
  "limit": 100
}
```

#### Template C: Acquisition Channels for Discovery Handoffs (Deduplicated Union)

Measures sessions and users driving outbound discovery handoffs (`whatsapp_click` OR `koval_site_click`) across acquisition channels.

> [!NOTE]
> **Deduplication Hygiene (ADR-15)**: To report the deduplicated union of handoff sessions without double-counting sessions that triggered both WhatsApp and website links, query with channel dimensions only (omitting `eventName` from `dimensions`) while applying the `dimension_filter` for `eventName in ["whatsapp_click", "koval_site_click"]`. Validate field compatibility and the resulting aggregation before labeling a result deduplicated. Do not sum rows to create a unique-user total, and do not infer ordered progression from this report. Never rely on generic `conversions` without this explicit filter.

```json
{
  "property_id": "557859031",
  "date_ranges": [
    {
      "start_date": "30daysAgo",
      "end_date": "yesterday"
    }
  ],
  "dimensions": [
    "sessionDefaultChannelGroup",
    "sessionSourceMedium"
  ],
  "metrics": [
    "sessions",
    "totalUsers",
    "eventCount"
  ],
  "dimension_filter": {
    "filter": {
      "field_name": "eventName",
      "in_list_filter": {
        "values": [
          "whatsapp_click",
          "koval_site_click"
        ]
      }
    }
  },
  "order_bys": [
    {
      "metric": {
        "metric_name": "sessions"
      },
      "desc": true
    }
  ],
  "limit": 25
}
```

---

### Step 7 — Verification & Telemetry Inspection

- **Quota:** Inspect `quota.advisory` and consumed/remaining counters. The low-quota threshold is configurable (default 20%); missing telemetry is not evidence of spare quota. Do not repeatedly retry quota or permission failures.
- **Completeness:** Inspect `completeness.sampled`, `completeness.other_row_data_loss`, thresholding/restriction fields when available. Missing or null means unavailable, not false. Realtime and funnel responses have different metadata; inspect each endpoint's envelope.
- **Result status:** Distinguish `CONFIRMED`, `NO_DATA`, zero values and errors. Empty results do not prove absent collection or business inactivity. In particular, inspect actual funnel tables rather than inferring an empty funnel from a wrapper status alone.
- **Totals:** Compare returned rows with `row_count` where supplied; a limit is not a complete export. Never sum user/session counts across overlapping event, channel or page rows. Keep event volume separate from deduplicated users/sessions and ordered funnel counts.
- **Failures:** On `FORBIDDEN`, confirm the workspace profile; on invalid fields, inspect this property's definitions and endpoint schema. On an uncertain timeout, inspect the outcome before retrying. Never edit credentials or enable tracking as an analytical repair.

## Completion Checks

- Report identifies property, date window, timezone, unit, filters and whether rows were truncated.
- Distinguish observed events from leads, handoffs and confirmed bookings; retain endpoint caveats and missing telemetry.
- State the response status and limitations; do not manufacture zeroes for unavailable data.
- No credentials, passenger/client personal information, Google resource edits, or site changes were introduced.

## References

- [GA4 inclusive date ranges](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1alpha/DateRange)
- [GA4 reporting data expectations](https://developers.google.com/analytics/devguides/reporting/data/v1/reporting-data-expectations)
- The live MCP `tools/list` input schemas and this property's `get_custom_dimensions_and_metrics` output.
