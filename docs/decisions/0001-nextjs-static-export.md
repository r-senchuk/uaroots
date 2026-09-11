# ADR 0001 — Next.js App Router static export

**Status:** Accepted  
**Date:** 2026-09-11  
**Product:** UARoute M1

---

## Context

The project constitution (§17) and technical architecture (docs/09 §3, §4.1, §46, §56) specified TanStack Start with build-time prerendered HTML on S3 + CloudFront.

The owned application is a Next.js App Router rewrite with `output: "export"` (currently Next.js 16). Live hosting remains S3 + CloudFront. Milestone 1 has no application database, no booking API, and no Node server.

“SSR” in conversation means React Server Components at **build time**, not a request-time Node host. A Node SSR host would break the S3/CloudFront model and the M1 no-backend rule.

---

## Decision

M1 ships as:

- **Framework:** Next.js App Router, TypeScript, React 19, Tailwind CSS v4 (package versions in `package.json`)
- **Rendering:** static export (`output: "export"` in `next.config.ts`). There is **no Node SSR host** in M1
- **URLs:** `trailingSlash: true`. Canonical form: `https://uaroute.com/routes/lviv-hannover/` (trailing slash). Older documentation examples without a slash refer to the same resource
- **Artifact:** `npm run build` writes `./out`; `make deploy` uploads that directory to `s3://uaroute.com`, then CloudFront is invalidated
- **Layout:** `src/app/`, `src/components/`, `src/data/`, `src/lib/`, `src/config/` — not `src/routes/` + `src/content/`

This supersedes “use TanStack Start” in constitution §17 and the TanStack baseline, diagram, repository sketch, and first Definition-of-Done checkbox in docs/09.

---

## Non-goals

- Node server / request-time SSR
- Booking API
- Lead database
- Marketplace
- Moving files or pinning npm ranges as part of this decision
- Expanding Koval desk coverage (separate research)

---

## Consequences

- Crawlable HTML and S3 hosting stay constitution-compatible.
- Request-time SSR requires a later host change and a new ADR.
- Identifier names (desk IDs, `ctaLocation`) are not part of this decision; they are documented against the implemented TypeScript vocabulary elsewhere.
