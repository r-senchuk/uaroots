---
type: "Report"
title: "S06 — Mobile lab performance baseline"
description: "Comparable local static-export measurements and reproduction recipe."
tags: ["seo", "performance", "measurement"]
---

# S06 — Mobile lab performance baseline

**Status:** ready with explicit unknowns, 2026-10-28. Scope is SG-08 and the performance part of S06; measurement/privacy decisions are recorded separately. These are local lab observations, not evidence of live deployment, field experience, CrUX or field INP. No application changes are proposed solely from these numbers.

## Candidate and conditions

The lock-matched baseline was copied from the original isolated baseline, itself copied from checkout HEAD `15725cba20f4f83475f0df8241e66f31836ce1d4`, including the eight existing dirty source/script files, before implementation. The ignored private copy is `output/seo-mitigation-execution-2026-10-28-private/performance/baseline-locked/`; it has its own `.next/` and `out/` and links to `output/seo-mitigation-execution-2026-10-28-private/locked-dependencies/node_modules` (prepared separately from the exact lockfile). It is a preserved reference, not proof of a matching live deployment. Source `src/` and `public/` hash-list SHA-256: `c682bfb1c9b84e077c1f08af9510dcaca5b5abc2b45b4d5f4137fd6686151286`; exported file hash-list SHA-256: `f71c67554058d258f06e6316e8f8f658d79e12c9908885fe33af98884c0d669b`. Both lists are alongside the private copy. Package lock SHA-256 `6e4c53cc064e1c6cea688a0b491eaac83a2a8e4576b01688b96d4cff329e64db`, Next config `f238ddad1b473c37d9779caeae433a9f2dd2f1d5a68d331f49d418998bc8fe4d`. The copied `.env` was loaded by the build; its contents are not published. The build succeeded with cached Node 22.23.3 and lock-matched Next 16.4.0 using `next build --webpack`; output tracing warned about multiple lockfiles. Build artifacts remained in the copy.

Google Chrome 156.0.8078.48, Playwright 1.61.1, headless on the same machine; 390 × 844 CSS pixels, device scale 1, mobile and touch emulation, CPU throttling 4×, CDP network latency 150 ms, download 1.6 Mbps, upload 0.75 Mbps. Python 3.15 local static server served the export without CDN compression. Each run used a fresh browser and context, no consent interaction, no service workers, navigation until `load` plus five seconds. Playwright intercepted requests and aborted every non-preview origin before network access. All twelve documents returned 200; no blocked external request was observed. This does not exercise consenting or handoff interactions.

## Results

LCP is the last observed browser largest-contentful-paint entry by the end of the observation; CLS is the maximum layout-shift session window observed in that period, excluding shifts after recent input. This is a bounded page-load sample, not full-lifecycle CLS. Three sequential runs per page, median shown; values are independently calculated per metric.

| Page | LCP runs (ms) | Median LCP (ms) | CLS runs | Median CLS |
| --- | --- | ---: | --- | ---: |
| `/` | 3288, 3268, 3268 | 3268 | 0.00724, 0.00724, 0.00724 | 0.00724 |
| `/cities/lviv/` | 3232, 3208, 3240 | 3232 | 0.000857, 0.000857, 0.000857 | 0.000857 |
| `/routes/lviv-hannover/` | 3196, 3168, 3152 | 3168 | 0.000294, 0.000294, 0.000294 | 0.000294 |
| `/guides/perevezennya-velosypeda/` | 2884, 2884, 2876 | 2884 | 0.16858, 0.16858, 0.16858 | 0.16858 |

The guide repeatedly registered a large shift of approximately 0.1542 around 4.5 seconds in the first run, with section, heading, paragraph and list elements among affected nodes. Its cause has not been established; shifted elements are not necessarily the cause. Investigate with a trace and controlled reproduction if relevant to the changed guide; do not claim a fix or attribute it to fonts or a component without evidence. First-run LCP elements were H1 for home and guide and P for Lviv and Hannover. The [sanitized observations](../../../../ops/evidence/seo-mitigation-execution-2026-10-28/performance/locked-baseline-results.json) include per-run shift timing and affected element tags, resource paths, transfer sizes and durations. Local server transfer sizes are diagnostic only and do not represent CDN delivery.

## Reproduction and comparison

Use the same machine and versions and preserve the baseline copy. Make a separate candidate copy containing the intended application changes and same lock-matched dependencies at the path above and the same configuration/environment, build it with the same Node 22 binary and `node_modules/next/dist/bin/next build --webpack`, and serve its `out/` with `python3 -m http.server 4177 --bind 127.0.0.1 --directory <candidate>/out`. Do not build into the checkout or reuse the baseline output directory. Stop any earlier server first. Then run the [measurement script](../../../../ops/evidence/seo-mitigation-execution-2026-10-28/performance/measure.mjs) with Node 22, arguments `http://127.0.0.1:4177` and a separate JSON output path. It uses the locally cached Playwright module and the exact Chrome path; confirm their versions and availability before rerunning. Its request allowlist is exactly the supplied local origin; do not change it to permit collectors or operator destinations. Repeat all three runs for every changed template, record candidate source/export identities, tool versions and environment, and inspect the per-run spread and resource/shift entries.

SG-08 calls for investigation of a repeated median LCP increase exceeding both 10% and 200 ms, or CLS increase exceeding 0.02; resolve cause or explain variance before acceptance. These are project investigation triggers, not universal field thresholds. A comparison cannot be claimed if the environment, consent state, build mode, or tooling changes. Field p75 LCP, INP and CLS remain unknown; no simulated interaction or lab metric is field INP. Device touch, native zoom and screen-reader acceptance require separate tests.

## Superseded installed-dependency run

The original isolated `baseline/` used installed Next 16.3.8, while the declared package and lock specify 16.4.0. Its [original results](../../../../ops/evidence/seo-mitigation-execution-2026-10-28/performance/baseline-results.json) and private export (hash-list SHA-256 `31c60b681578063ce9c97cfb8c497cb553695e17bb887e135948ca60231fa732`) are preserved for provenance, but are superseded for S08 comparison. Both snapshots have identical `src/` and `public/` manifest hashes. The guide shift appeared in both runs; the changed dependency and separate sample mean these runs do not establish its cause or a performance regression.
