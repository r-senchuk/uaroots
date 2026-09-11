# UARoute (uaroots)

Canonical project map: [README.md](README.md). Product docs start at [docs/00-project-constitution.md](docs/00-project-constitution.md).

Passenger-route atlas for journeys **from Ukraine to Europe**. Product name: **UARoute**. UARoute owns discovery and travel intent; Koval owns the transaction and booking. Production [uaroute.com](https://uaroute.com) is still the legacy CRA catalog until cutover.

## Stack

- Next.js 16 App Router, TypeScript, React 19
- Tailwind CSS v4 (`src/app/globals.css`)
- Static export to `./out` for S3 + CloudFront (`output: "export"`, `trailingSlash: true`)
- Typed content: `src/data/` (cities, routes, carriers)
- WhatsApp inquiry: `src/lib/whatsapp.ts`
- Catalog check: `src/lib/validate-catalog.ts`
- Analytics façade: `src/lib/analytics.ts` → GA4 when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set

## Layout

- `src/app/` — routes (`layout.tsx` = header + main + footer)
- `src/components/` — product UI; `src/components/brand/` for atlas graphics
- Routes: `/`, `/routes/`, `/routes/[slug]/`, `/about/`
- HTML redirects for former URLs: `/contact/`, `/contacts/`, `/carriers/`, `/packages/`, `/gallery/`

## Commands

```bash
npm run dev
npm test
npm run lint       # eslint . (Next 16 has no next lint)
npm run check      # typecheck, lint, test, validate, build, inspect ./out
make deploy        # npm run check && scripts/deploy.sh (needs CLOUDFRONT_DISTRIBUTION_ID)
```

## Product rules

- User-facing copy is **Ukrainian**.
- No invented prices, ratings, timetables or durations.
- Commercial routes only in the index, sitemap, and search navigation; editorial routes are `noindex`.
- Client components only where there is UI state (search, inquiry, header, tracking clicks).
- Do not add Lovable packages, `__lovableEvents`, or the unused shadcn `components/ui` dump.
- After UI changes, verify in the browser (home search, route inquiry, about) and check view-source for the Ukrainian H1 on route pages.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
