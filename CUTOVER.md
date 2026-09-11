# UARoute — cutover from the legacy application

The live site is currently a CRA SPA on S3 + CloudFront (`legacy/`). The owned replacement is Next.js static HTML in `./out`.

## URL map

| Legacy URL | Decision | New target |
| --- | --- | --- |
| `/` | transform | discovery homepage |
| `/about` | keep | `/about/` |
| `/contact`, `/contacts` | redirect | `/about/` |
| `/carriers` | redirect | `/routes/` |
| `/packages` | redirect | `/about/` |
| `/gallery` | redirect | `/` |
| `/provider/:name` | drop | 404 → `/routes/` |

Static export cannot emit HTTP 301s. This app ships HTML redirect pages at the legacy paths (meta refresh + `location.replace`). Add CloudFront Functions or S3 routing rules for real **301**s at deploy time.

`next.config.ts` also lists the same redirects for a future Node/Vercel host.

## Deploy

```bash
npm run build
aws s3 cp ./out/ s3://uaroute.com --recursive
```

Then invalidate CloudFront. Keep `legacy/` as a one-release rollback.

Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` before a production build if GA4 should receive `track()` events.

## Lovable

`new_design/` is a frozen spec. Do not connect this git branch to lovable.dev. Do not install `@lovable.dev/*`.
