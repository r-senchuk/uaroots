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
npm run build
aws s3 cp ./out/ s3://uaroute.com --recursive
```

Then invalidate CloudFront.

Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` before a production build if GA4 should receive `track()` events.

Do not install `@lovable.dev/*` or reconnect this repo to lovable.dev.
