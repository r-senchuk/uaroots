---
name: verify-pages
description: "Use when reviewing UARoute UI after copy, layout, search, city-hub or inquiry changes. Skip documentation-only changes."
---

# Verify changed pages

## When To Use

After public UI/copy or search/inquiry changes. Do not use for documentation-only edits, general agent setup or unrelated backend work.

## Inputs To Collect First

Changed page/flow, exact candidate/export, build configuration and available browser harness. Obtain the actual catalog/search behavior from source; do not invent a route from a city pair.

## Procedure

### Step 1 — Check the relevant flow

Click changed behavior; a screenshot alone is not verification. For copy-only work inspect readable changed-section text, actual H1/metadata and nearby navigation. For search/inquiry work check departure/arrival order, country-restricted suggestions and reversal preserving the pair.

Current core regression: `/cities/celle/` → Celle → Lviv uses `/routes/celle-lviv/`; Celle → Stryi stays inline inquiry. Outside the approved selectable pair set, retain the no-information fallback; editorial routes remain excluded. Read actual data before choosing other fixtures. Check `/about/` and `/contact/` redirect only if navigation/release scope affects them.

### Step 2 — Use proportional browser coverage

Prefer existing `scripts/poc-browser.mjs` for full POC scope and its configuration/export/output options. Do not modify the harness only to narrow a one-page review. For an affected page check keyboard/focus and 360/375/1440px as appropriate, no overflow and actionable targets≥44px. Capture the changed section at readable size.

Intercept every external collector/operator handoff before filling synthetic date/phone fields or clicking inquiry actions. Never send a real QA inquiry. When interception is unavailable, inspect only and state which interaction is unverified. Check past-date/phone validation and canary absence in telemetry/storage when the inquiry flow changed or acceptance requires it.

### Step 3 — Preserve evidence and limits

Record candidate/build configuration, checked behaviors, screenshot/trace and console/runtime failures. Use concrete sanitized failure reports and rerun affected checks after changes. No browser? Inspect exported HTML after the required build and explicitly mark click/keyboard/touch behavior UNVERIFIED. A missing tool is not a passing browser result.

## Completion Checks

- Changed behavior/copy inspected, not only pictured.
- No invented URLs/operational claims or editorial route navigation.
- External requests/handoffs intercepted before QA interactions.
- Result tied to the current candidate; unavailable checks disclosed.

## References

[Root instructions](../../../AGENTS.md), [POC harness](../../../scripts/poc-browser.mjs), [catalog](../../../src/data/AGENTS.md). For release-wide verification use the active acceptance contract and [CUTOVER](../../../CUTOVER.md).
