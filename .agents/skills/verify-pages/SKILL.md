---
name: verify-pages
description: >-
  Verifies UARoute UI after layout, routing, copy, or inquiry changes. Use after
  editing src/app, src/components, search, BookingWidget, PartnerCard, or
  Ukrainian user-facing strings.
---

# Verify pages

Click through the changed flow. A screenshot is not verification.

- `/` — Ukrainian H1, commercial list, search
- Search miss (Львів → Гамбург) — «Ми поки не маємо інформації про цей маршрут.»
- `/routes/lviv-hannover/` — H1 in view-source; date `min` / past date invalid; fill date+phone; do not click WhatsApp
- `/about/`, `/contact/` → `/about/`, `/routes/` commercial-only

No browser? Curl HTML or `./out` after `npm run build`, and say what you could not click.
