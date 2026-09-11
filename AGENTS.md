# UARoute (uaroots)

Canonical project map: [README.md](README.md). Product docs start at [docs/00-project-constitution.md](docs/00-project-constitution.md).

Passenger-route atlas for journeys **from Ukraine to Europe**. Live site: [uaroute.com](https://uaroute.com). Product name: **UARoute**. UARoute owns discovery and travel intent; Koval owns the transaction and booking.

## Stack

- Next.js 15 App Router, TypeScript, React 19
- Tailwind CSS v4 (`src/app/globals.css`)
- Static export to `./out` for S3 + CloudFront (`output: "export"`, `trailingSlash: true`)
- Typed content: `src/data/` (cities, routes, carriers)
- WhatsApp inquiry: `src/lib/whatsapp.ts`
- Analytics façade: `src/lib/analytics.ts` → GA4 when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set

## Layout

- `src/app/` — routes (`layout.tsx` = header + main + footer)
- `src/components/` — product UI; `src/components/brand/` for atlas graphics
- Routes: `/`, `/routes/`, `/routes/[slug]/`, `/about/`
- Legacy HTML redirects: `/contact/`, `/contacts/`, `/carriers/`, `/packages/`, `/gallery/`
- CRA rollback: `legacy/`. Lovable spec: `new_design/` (gitignored, do not deploy)

## Commands

```bash
npm run dev
npm test
npm run build      # ./out
make deploy
```

## Product rules

- User-facing copy is **Ukrainian**.
- No invented prices, ratings, timetables or durations.
- Commercial routes only in the index and sitemap; editorial routes are `noindex`.
- Client components only where there is UI state (search, inquiry, header, tracking clicks).
- Do not add Lovable packages, `__lovableEvents`, or the unused shadcn `components/ui` dump.
- After UI changes, verify in the browser (home search, route inquiry, about) and check view-source for the Ukrainian H1 on route pages.
