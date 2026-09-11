#!/usr/bin/env bash
# Static-export analogue of Next.js `next start` cache headers (Sep 2026):
# hashed /_next/static is immutable; HTML and RSC flight payloads (.txt) revalidate
# so client navigations cannot mix two builds (stale HTML + missing .txt).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/out"
BUCKET="${S3_BUCKET:-s3://uaroute.com}"
IMMUTABLE="public, max-age=31536000, immutable"
REVALIDATE="public, max-age=0, must-revalidate"

if [[ ! -d "$OUT" ]]; then
  echo "deploy: missing $OUT — run npm run check first" >&2
  exit 1
fi

if [[ ! -f "$OUT/index.html" ]]; then
  echo "deploy: $OUT/index.html is missing — refusing to sync" >&2
  exit 1
fi

if [[ ! -d "$OUT/_next/static" ]]; then
  echo "deploy: $OUT/_next/static is missing — refusing to sync" >&2
  exit 1
fi

if [[ -z "${CLOUDFRONT_DISTRIBUTION_ID:-}" ]]; then
  echo "deploy: set CLOUDFRONT_DISTRIBUTION_ID" >&2
  exit 1
fi

if ! command -v aws >/dev/null; then
  echo "deploy: aws CLI is not installed" >&2
  exit 1
fi

aws sts get-caller-identity >/dev/null

# 1. Publish new hashed chunks first so new HTML never points at missing JS.
aws s3 sync "$OUT/_next/static/" "$BUCKET/_next/static/" \
  --no-progress \
  --cache-control "$IMMUTABLE"

# 2. HTML, RSC .txt payloads, sitemap, robots, public files. --delete drops
# leftover CRA /static/js. Excluding _next/static keeps old hashes live until step 4.
aws s3 sync "$OUT/" "$BUCKET/" \
  --no-progress \
  --delete \
  --exclude "_next/static/*" \
  --exclude ".DS_Store" \
  --exclude "**/.DS_Store" \
  --cache-control "$REVALIDATE"

# 3. HTML must be text/html; charset=utf-8 (S3 MIME guess is not enough for all keys).
aws s3 cp "$OUT/" "$BUCKET/" \
  --recursive \
  --no-progress \
  --exclude "*" \
  --include "*.html" \
  --content-type "text/html; charset=utf-8" \
  --cache-control "$REVALIDATE"

# 4. Drop hashed files from previous builds now that HTML references the new ones.
aws s3 sync "$OUT/_next/static/" "$BUCKET/_next/static/" \
  --no-progress \
  --delete \
  --cache-control "$IMMUTABLE"

# Directory indexes (/routes/foo/) and RSC .txt are separate CloudFront keys from
# *.html. A single /* path is required with trailingSlash: true.
aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/*"
