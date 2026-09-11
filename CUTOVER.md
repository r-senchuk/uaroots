# UARoute — deploy and former URLs

Static HTML in `./out` is the Next.js M1 artifact. Upload it to S3 + CloudFront when cutting over. Until that deploy, production [uaroute.com](https://uaroute.com) remains the legacy CRA catalog (`legacy/`).

## Former URLs

These paths still exist as HTML pages (meta refresh + `location.replace`). Add CloudFront Functions or S3 routing rules for real **301**s at deploy time. Static export cannot emit HTTP 301s.

| Path | Target |
| --- | --- |
| `/contact/`, `/contacts/` | `/about/` |
| `/carriers/` | `/routes/` |
| `/packages/` | `/about/` |
| `/gallery/` | `/` |
| `/provider/:name` | 404 → `/routes/` |

## Deploy

```bash
make deploy
```

That runs `npm run check` (typecheck, lint, test, catalog validate, `next build`, inspect `./out`) then [`scripts/deploy.sh`](scripts/deploy.sh):

1. `aws s3 sync ./out/ s3://uaroute.com --delete` with `Cache-Control: public, max-age=0, must-revalidate` (except hashed assets)
2. `_next/static` with `Cache-Control: public, max-age=31536000, immutable`
3. CloudFront invalidation `/*`

Required environment:

- `CLOUDFRONT_DISTRIBUTION_ID`
- AWS credentials that can write the bucket and create invalidations (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`)

`--delete` removes leftover CRA `/static/js` and old hashed chunks. `inspect-out` must pass first so an empty `out/` cannot wipe production.

Push to `main` deploys the CI artifact the same way. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in the environment (or GitHub Actions secret) before that production build if GA4 should receive `track()` events.

Former-URL pages are HTML redirects (meta refresh + `location.replace`). They are not `next.config.ts` `redirects()` — static export cannot emit HTTP 301s. Add CloudFront Functions or S3 routing rules for real 301s when you are ready.

Do not install `@lovable.dev/*` or reconnect this repo to lovable.dev.
