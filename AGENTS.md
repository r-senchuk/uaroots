# UARoute

Passenger-route atlas (Ukraine → Europe). **UARoute owns discovery and travel intent; Koval owns booking.**

Human map: [README.md](README.md). Do not dump the whole `docs/` tree into context.

Production [uaroute.com](https://uaroute.com) is still the CRA catalog (`legacy/`) until `./out` is deployed.

## Start here

| Task | Read first |
| --- | --- |
| Product / copy / SEO | [docs/00-project-constitution.md](docs/00-project-constitution.md), then the relevant `docs/0N-*.md` |
| Catalog (cities, routes, carriers, desks, claims) | [src/data/AGENTS.md](src/data/AGENTS.md) |
| Inquiry / WhatsApp / desks | `src/lib/whatsapp.ts`, [docs/07-koval-integration-and-conversion.md](docs/07-koval-integration-and-conversion.md) |
| Analytics | `src/lib/analytics.ts` (do not invent `ctaLocation` values) |
| Stack / hosting | [docs/decisions/0001-nextjs-static-export.md](docs/decisions/0001-nextjs-static-export.md) |
| Cutover / old URLs | [CUTOVER.md](CUTOVER.md) |
| UI verification | skill `verify-pages` |

If a lower-level doc conflicts with the constitution, stop. Do not silently override Level 1.

## Commands

```bash
npm run dev          # http://localhost:3000
npm test
npm run lint         # eslint .  (Next 16 has no next lint)
npm run typecheck
npm run check        # typecheck, lint, test, validate, build, inspect ./out
make deploy          # npm run check && scripts/deploy.sh (CLOUDFRONT_DISTRIBUTION_ID)
```

Need Node ≥ 20.9. Run the smallest check that covers the edit; `npm run check` before calling a slice done.

## Layout

- Owned app: `src/app/`, `src/components/`, `src/data/`, `src/lib/`, `src/config/`
- Frozen CRA: `legacy/` — do not restyle or “port” it
- `new_design/` and `Route Planner Pro/` — gitignored Lovable specs; not a source of truth; do not deploy

Public URLs: `/`, `/routes/`, `/routes/[slug]/`, `/about/`. HTML redirects: `/contact/`, `/contacts/` → `/about/`; `/carriers/` → `/routes/`; `/packages/` → `/about/`; `/gallery/` → `/`.

## Hard rules

- User-facing copy is **Ukrainian**.
- Do not invent prices, ratings, timetables, durations, stop lists, or availability.
- Only `commercial` routes belong in the index, sitemap, and search navigation. Editorial pages are `noindex`.
- Search uses `findRouteByCities(..., { commercialOnly: true })`.
- Do not store names, phones, or travel dates. Do not send phones or names through `track()`.
- Do not add Lovable packages, `__lovableEvents`, or a shadcn `components/ui` dump.
- Default to Server Components. `"use client"` only for UI state, effects, or click tracking.
- Internal hrefs end with `/` except home `/`. Static export: `output: "export"`, `trailingSlash: true` — no Node SSR host, no `redirects()` in `next.config.ts`.
- Keep modules server-safe. Request-time SSR needs a new ADR.

## Skills

[`.agents/skills/`](.agents/skills/) — Cursor, Codex, and OpenCode.

## Code review

Flag invented operational facts, English UI copy, editorial routes in index/sitemap/search, phones in `track()`, and unnecessary `"use client"`. Do not require restyling `legacy/` or a Node host.

When corrected, update this file (or [src/data/AGENTS.md](src/data/AGENTS.md) for catalog).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
