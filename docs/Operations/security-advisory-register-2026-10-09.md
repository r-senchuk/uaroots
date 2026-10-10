---
type: Report
title: "Security advisory and disposition register"
description: "Verified advisory ranges, installed paths, exposure and compatible fixes."
tags: [uaroute, operations, security]
---

# Security advisory and disposition register

Date: October 9, 2026. Owner: Roman. Scope: local M1 security maintenance; no deployment or permission changes.

Baseline source `af305326ba7911c79e95cfdb72e5b5bbdbc1bd9b`; full audit 12 package entries (11 high, one critical), production audit three entries. After: five high package entries, **one unique unresolved advisory**; production audit zero. 22 unique baseline advisory records, 21 cleared. Package aggregates are not vulnerability counts. Registry and maintainer readback on October 9. [Before](../knowledge-base.md#knowledge-base) (KB: `wiki/Operations/security-evidence-2026-10-09/before-audit.json`), [after](../knowledge-base.md#knowledge-base) (KB: `wiki/Operations/security-evidence-2026-10-09/after-audit.json`), [production after](../knowledge-base.md#knowledge-base) (KB: `wiki/Operations/security-evidence-2026-10-09/after-prod-audit.json`).

| Advisory / source | Vendor severity | Installed-line affected range → first fixed | Before → after | Disposition / feature reachability |
| --- | --- | --- | --- | --- |
| [GHSA-q2hr-2g5m-vwhr](https://github.com/juliangruber/brace-expansion/security/advisories/GHSA-q2hr-2g5m-vwhr) | medium | `< 1.1.21` → `1.1.21` | 1.1.18 → 1.1.21 | cleared by update; Lint/build glob input; no exported runtime module. Untrusted repository/CLI patterns are the relevant precondition. |
| [GHSA-qhr7-859c-m2p7](https://github.com/juliangruber/brace-expansion/security/advisories/GHSA-qhr7-859c-m2p7) | high | `< 1.1.20` → `1.1.20` | 1.1.18 → 1.1.21 | cleared by update; Lint/build glob input; no exported runtime module. Untrusted repository/CLI patterns are the relevant precondition. |
| [GHSA-6j4f-fj2g-mc7p](https://github.com/juliangruber/brace-expansion/security/advisories/GHSA-6j4f-fj2g-mc7p) | high | `< 1.1.19` → `1.1.19` | 1.1.18 → 1.1.21 | cleared by update; Lint/build glob input; no exported runtime module. Untrusted repository/CLI patterns are the relevant precondition. |
| [GHSA-vfj7-8cjw-p6xm](https://github.com/micromatch/braces/issues/70) | high | `<= 3.0.3` → `none` | 3.0.3 → 3.0.3 | open; no supported compatible patch; Development/CI glob parsing; project supplies fixed patterns, not visitor strings. Contributor-controlled repository content remains a trust boundary. No supported patch; maintainers dispute treating untrusted patterns as safe. |
| [GHSA-vc2v-76pw-4v95](https://github.com/expressjs/compression/security/advisories/GHSA-vc2v-76pw-4v95) | high | `< 1.8.2` → `1.8.2` | 1.8.1 → 1.8.2 | cleared by update; Local preview HTTP response abort; not S3 runtime. Patched abort-to-stream-destruction fixture passes. |
| [GHSA-v2hh-gcrm-f6hx](https://github.com/fastify/fast-uri/security/advisories/GHSA-v2hh-gcrm-f6hx) | high | `>= 2.3.1, <= 2.4.2` → `2.4.3` | 3.1.2 → 3.1.8 | cleared by update; Local preview/schema URI parsing. No M1 API validating visitor schemas; hostile URI/schema input is the relevant precondition. |
| [GHSA-7p8r-x3mc-p8w7](https://github.com/fastify/fast-uri/security/advisories/GHSA-7p8r-x3mc-p8w7) | high | `>= 3.0.0, < 3.1.5` → `3.1.5` | 3.1.2 → 3.1.8 | cleared by update; Local preview/schema URI parsing. No M1 API validating visitor schemas; hostile URI/schema input is the relevant precondition. |
| [GHSA-f65p-4m7j-42xc](https://github.com/fastify/fast-uri/security/advisories/GHSA-f65p-4m7j-42xc) | high | `>= 2.3.1, < 2.4.5` → `2.4.5` | 3.1.2 → 3.1.8 | cleared by update; Local preview/schema URI parsing. No M1 API validating visitor schemas; hostile URI/schema input is the relevant precondition. |
| [GHSA-fph4-wmhf-6fwf](https://github.com/fastify/fast-uri/security/advisories/GHSA-fph4-wmhf-6fwf) | high | `>= 3.1.2, < 3.1.6` → `3.1.6` | 3.1.2 → 3.1.8 | cleared by update; Local preview/schema URI parsing. No M1 API validating visitor schemas; hostile URI/schema input is the relevant precondition. |
| [GHSA-jqff-g426-hqxp](https://github.com/fastify/fast-uri/security/advisories/GHSA-jqff-g426-hqxp) | high | `>= 2.3.1, < 2.4.5` → `2.4.5` | 3.1.2 → 3.1.8 | cleared by update; Local preview/schema URI parsing. No M1 API validating visitor schemas; hostile URI/schema input is the relevant precondition. |
| [GHSA-4c8g-83qw-93j6](https://github.com/fastify/fast-uri/security/advisories/GHSA-4c8g-83qw-93j6) | high | `>= 3.0.0, < 3.1.3` → `3.1.3` | 3.1.2 → 3.1.8 | cleared by update; Local preview/schema URI parsing. No M1 API validating visitor schemas; hostile URI/schema input is the relevant precondition. |
| [GHSA-qw65-cvwx-89v3](https://github.com/fastify/fast-uri/security/advisories/GHSA-qw65-cvwx-89v3) | high | `>= 3.0.0, < 3.1.7` → `3.1.7` | 3.1.2 → 3.1.8 | cleared by update; Local preview/schema URI parsing. No M1 API validating visitor schemas; hostile URI/schema input is the relevant precondition. |
| [GHSA-hrr3-gc8f-f4qj](https://github.com/fastify/fast-uri/security/advisories/GHSA-hrr3-gc8f-f4qj) | medium | `>= 3.0.0, < 3.1.8` → `3.1.8` | 3.1.2 → 3.1.8 | cleared by update; Local preview/schema URI parsing. No M1 API validating visitor schemas; hostile URI/schema input is the relevant precondition. |
| [GHSA-vcvr-r3jv-pc5j](https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j) | critical | `>= 16.2.0, < 16.3.6` → `16.3.6` | 16.3.4 → 16.3.8 | cleared by update; next/og ImageResponse with attacker SVG: no next/og import or generated image handler. |
| [GHSA-3w37-wq28-93x7](https://github.com/vercel/next.js/security/advisories/GHSA-3w37-wq28-93x7) | medium | `>= 16.3.0, < 16.3.8` → `16.3.8` | 16.3.4 → 16.3.8 | cleared by update; use-cache/draft request context: no request-time caches/server. |
| [GHSA-4jqv-mc3x-m676](https://github.com/vercel/next.js/security/advisories/GHSA-4jqv-mc3x-m676) | medium | `>= 16.0.0, < 16.3.8` → `16.3.8` | 16.3.4 → 16.3.8 | cleared by update; Pages Router self-hosted SSG/ISR: App Router static export, no ISR host. |
| [GHSA-39w2-rjm5-chcv](https://github.com/vercel/next.js/security/advisories/GHSA-39w2-rjm5-chcv) | low | `>= 16.0.0, < 16.3.8` → `16.3.8` | 16.3.4 → 16.3.8 | cleared by update; Development MCP cross-origin disclosure: developer browsing malicious content while dev server active is a relevant environment; patch applied. |
| [GHSA-f87g-xv8r-7p7x](https://github.com/vercel/next.js/security/advisories/GHSA-f87g-xv8r-7p7x) | medium | `>= 16.0.0, < 16.3.8` → `16.3.8` | 16.3.4 → 16.3.8 | cleared by update; Webpack metadata handler/cache poisoning: no dynamic image metadata handlers; static SEO. |
| [GHSA-mcj8-r9mp-w47p](https://github.com/vercel/next.js/security/advisories/GHSA-mcj8-r9mp-w47p) | medium | `>= 16.0.0, < 16.3.8` → `16.3.8` | 16.3.4 → 16.3.8 | cleared by update; Root catchall/request cache: no root catchall or production request cache. |
| [GHSA-cjq9-62q9-8jv4](https://github.com/vercel/next.js/security/advisories/GHSA-cjq9-62q9-8jv4) | high | `>= 16.0.0, < 16.3.8` → `16.3.8` | 16.3.4 → 16.3.8 | cleared by update; Remote image optimizer SSRF: images.unoptimized=true, no remotePatterns or optimizer host. |
| [GHSA-wq5f-xc86-pv6w](https://github.com/lovell/sharp/security/advisories/GHSA-wq5f-xc86-pv6w) | high | `< 0.35.5` → `0.35.5` | 0.35.4 → 0.35.5 | cleared by update; Build/native image processing; glibc CI exposure requires attacker SVG. Mac success does not prove Linux native acceptance. Images unoptimized; trusted repository assets only in current app. |
| [GHSA-68fv-2mgg-jv7q](https://github.com/7rulnik/source-map-js/releases/tag/v1.2.2) | high | `>= 1.0.0, < 1.2.2` → `1.2.2` | 1.2.1 → 1.2.2 | cleared by update; Build/test indexed-map parsing; hostile map offset can exhaust resources. No public map upload surface; scanner cleared after patch. |

## Dependency paths and compatibility

- **brace-expansion**: `eslint → minimatch → brace-expansion`; 1.1.18 → 1.1.21. Lint/build glob input; no exported runtime module. Untrusted repository/CLI patterns are the relevant precondition.
- **braces**: `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`; 3.0.3 → 3.0.3. Development/CI glob parsing; project supplies fixed patterns, not visitor strings. Contributor-controlled repository content remains a trust boundary. No supported patch; maintainers dispute treating untrusted patterns as safe.
- **compression**: `serve → compression`; 1.8.1 → 1.8.2. Local preview HTTP response abort; not S3 runtime. Patched abort-to-stream-destruction fixture passes.
- **fast-uri**: `serve → ajv → fast-uri`; 3.1.2 → 3.1.8. Local preview/schema URI parsing. No M1 API validating visitor schemas; hostile URI/schema input is the relevant precondition.
- **next**: `direct next`; 16.3.4 → 16.3.8. Static App Router build/dev only; no production Node host.
- **sharp**: `next optional → sharp`; 0.35.4 → 0.35.5. Build/native image processing; glibc CI exposure requires attacker SVG. Mac success does not prove Linux native acceptance. Images unoptimized; trusted repository assets only in current app.
- **source-map-js**: `postcss (Next / Tailwind / Vite) → source-map-js`; 1.2.1 → 1.2.2. Build/test indexed-map parsing; hostile map offset can exhaust resources. No public map upload surface; scanner cleared after patch.

Some Next maintainer notices retain placeholder fixed ranges while the global GitHub database resolves 16.3.8. We preserve both sources and corroborate availability with the [16.3.8 release](https://github.com/vercel/next.js/releases/tag/v16.3.8); we do not silently treat the placeholder as resolved upstream. source-map-js has a [reporter issue](https://github.com/7rulnik/source-map-js/issues/76) and maintainer release rather than a retrieved repository security notice. Vendor medium/low labels differ from aggregate npm package classifications; preserve them separately.

Next and eslint-config-next remain on matching 16.3.8; TypeScript 6, ESLint 9, React 19 and Node 22 types are retained. Lockfile generated by npm, no forced fixes/alert ignores. Updated optional Sharp/libvips platform packages follow its patch release; Linux-native behavior is a CI follow-up, not demonstrated by macOS testing.

## Scoped override and remaining alert

`serve@14.2.6` is still the latest parent and pins `compression@1.8.1` exactly. The override is confined to `serve.compression=1.8.2`, a same-API supported patch compatible with Node 22. [Abort regression](../knowledge-base.md#knowledge-base) (KB: `wiki/Operations/security-evidence-2026-10-09/compression-regression.json`), static preview/browser checks and full checks passed. Remove the override when an adopted serve release admits compression >=1.8.2; review October 16, 2026 or upon a serve release/advisory change.

SEC-01 remains **confirmed upstream advisory / open project disposition**, owner Roman. npm suggests eslint-config-next 14.2.35; this incompatible downgrade is rejected. Current 16.3.8 and latest parent 16.4.0 retain fast-glob 3.3.1. Do not introduce a mismatched braces major or scanner ignore. No visitor-driven glob entry point was found. Keep lint/CI inputs trusted, do not feed arbitrary globs, and recheck upon maintainer patch/parent change (review October 16). This is a documented open alert, not an owner-approved residual-risk waiver.

Lifecycle metadata before/after: only fsevents2.3.3 and unrs-resolver1.12.2 retain hasInstallScript, unchanged; no newly flagged lifecycle-script package in the lock. npm integrity/resolved metadata inspected; installation success/integrity is not independent maintainer-authenticity certification.
