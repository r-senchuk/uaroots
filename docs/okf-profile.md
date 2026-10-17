---
type: Specification
title: "Site documentation profile"
description: "OKF structural conventions for canonical repository contracts."
tags: [uaroute, documentation]
---

# Site documentation profile

This bundle retains the existing OKF v0.2 project profile: YAML concept metadata, generated per-directory index.md and map.json, log.md with dated headings, extensible types including Operational. Tooling remains canonical in scripts/. README and map describe this bundle only; domain originals are not duplicated in KB. The broader KB format profile is `wiki/okf-profile.md`.

Generate with `npm run docs:index`; validate with `npm run docs:check`. Missing canonical contracts fail. Site mode remains strict even when DOCS_ALLOW_MISSING_EVIDENCE=1. Only explicit KB mode may label unavailable historical output references UNVERIFIED; never evidence acceptance.
