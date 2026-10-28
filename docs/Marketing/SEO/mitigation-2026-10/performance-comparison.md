---
type: "Report"
title: "S08 — Mobile lab performance comparison"
description: "Matched baseline and frozen candidate static-export measurements."
tags: ["seo", "performance", "measurement"]
---

# S08 — Mobile lab performance comparison

**Result: no SG-08 lab regression trigger observed** in this three-run comparison, 2026-10-28. This is a bounded local page-load experiment; it does not establish field Core Web Vitals, INP, user experience, or deployed performance. The existing guide layout shift remains present and is not a new regression.

## Candidate and method

The frozen S08 candidate was served from `output/seo-mitigation-execution-2026-10-28-private/implementation/candidate/out`. Its source manifest SHA-256 was `61df2660ff0eb485eee2f77adbc9130807b47f46498ad7631f1b2d32afb25bc8` (167 entries), and export manifest SHA-256 was `40a5db56e1a7ae1aa8b6d06ebabf05f3d1adde1229dc2c25517adfaa89636572` (258 files). Before and after measurement, every listed file matched its manifest, no extra source/public or export files were found, and the manifest hashes remained unchanged.

The [lock-matched baseline](performance-baseline.md) and candidate used the same cached Node 22.23.3, Next 16.4.0 static webpack export, Chrome 156.0.8078.48, Playwright 1.61.1, Python 3.15 loopback server, mobile viewport 390 × 844 at DPR 1, 4× CPU, 150 ms latency, 1.6 Mbps download and 0.75 Mbps upload. Each run used a fresh context and browser, untouched consent, no service worker, and observation through load plus five seconds. Requests to any non-preview origin were aborted. All 12 document responses were 200 and no attempted external request was observed. Browser and server were stopped after measurement. The [candidate observations](../../../../ops/evidence/seo-mitigation-execution-2026-10-28/performance/candidate-results.json) retain resource and shift entries; baseline observations and detailed limitations are linked from the baseline record.

## Three-run comparison

LCP is the last observed browser entry within the window; CLS is the maximum observed layout-shift session window, excluding recent-input shifts. Each median is calculated independently. Deltas are candidate minus baseline; the percentage is relative to baseline LCP. Ranges reflect only three runs and should not be treated as confidence intervals.

| Page | Baseline LCP runs (ms) | Candidate LCP runs (ms) | Median LCP change | Baseline → candidate median CLS | CLS change |
| --- | --- | --- | --- | --- | ---: |
| `/` | 3288, 3268, 3268 | 3336, 3344, 3400 | +76 ms (+2.33%) | 0.007237 → 0.007179 | -0.000057 |
| `/cities/lviv/` | 3232, 3208, 3240 | 3272, 3300, 3324 | +68 ms (+2.10%) | 0.000857 → 0.000404 | -0.000453 |
| `/routes/lviv-hannover/` | 3196, 3168, 3152 | 3220, 3212, 3216 | +48 ms (+1.52%) | 0.000294 → 0.000294 | 0 |
| `/guides/perevezennya-velosypeda/` | 2884, 2884, 2876 | 2916, 2872, 2900 | +16 ms (+0.55%) | 0.168581 → 0.168581 | 0 |

No median increase exceeds both 10% and 200 ms for LCP, and no median CLS increase exceeds 0.02. Those SG-08 values are project investigation triggers, not field thresholds. Small differences in this sample do not establish a meaningful improvement or regression, and no repeat was triggered.

The guide retains the existing 0.168581 lab CLS in all three candidate runs, matching the baseline. A separate [bounded diagnosis](../../../../ops/evidence/seo-mitigation-execution-2026-10-28/performance/guide-diagnostic.md) found strong evidence of web-font loading involvement without isolating a specific face or proving a remedy. This comparison does not certify a fix, field CLS, accessibility, native zoom, screen-reader behavior, or real-device touch interaction.
