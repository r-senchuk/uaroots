#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/out"
BUCKET="${S3_BUCKET:-s3://uaroute.com}"

if [[ ! -d "$OUT" ]]; then
  echo "deploy: missing $OUT — run npm run check first" >&2
  exit 1
fi

if [[ ! -f "$OUT/index.html" ]]; then
  echo "deploy: $OUT/index.html is missing — refusing to sync" >&2
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

# Exclude hashed assets from this pass so --delete does not remove them.
# AWS CLI also skips excluded destination keys when deleting.
aws s3 sync "$OUT/" "$BUCKET/" \
  --delete \
  --exclude "_next/static/*" \
  --exclude ".DS_Store" \
  --cache-control "public, max-age=0, must-revalidate"

aws s3 sync "$OUT/_next/static/" "$BUCKET/_next/static/" \
  --cache-control "public, max-age=31536000, immutable"

aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/*"
