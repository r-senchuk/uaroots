#!/usr/bin/env bash
# Safe static-export release. Old _next chunks and unrelated bucket objects are retained.
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/deploy.sh --dry-run [--manifest PATH]
  scripts/deploy.sh --apply --rollback-dir PATH [--manifest PATH]

--dry-run is local-only and never calls AWS. --apply writes to S3/CloudFront only
after scripts/seo-release.mjs verifies the supplied recovery bundle.
USAGE
}

mode=""
rollback_dir=""
manifest=""
manifest_provided="false"
while (($#)); do
  case "$1" in
    --dry-run|--apply)
      if [[ -n "$mode" ]]; then usage >&2; exit 2; fi
      mode="${1#--}"
      ;;
    --rollback-dir)
      (($# >= 2)) || { usage >&2; exit 2; }
      rollback_dir="$2"
      shift
      ;;
    --manifest)
      (($# >= 2)) || { usage >&2; exit 2; }
      manifest="$2"
      manifest_provided="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "deploy: unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

[[ -n "$mode" ]] || { echo "deploy: choose --dry-run or --apply" >&2; usage >&2; exit 2; }
if [[ "$mode" == "dry-run" && -n "$rollback_dir" ]]; then
  echo "deploy: --rollback-dir applies only with --apply" >&2
  exit 2
fi
if [[ "$mode" == "apply" && -z "$rollback_dir" ]]; then
  echo "deploy: --apply requires --rollback-dir with a verified recovery bundle" >&2
  exit 2
fi
if [[ "$mode" == "apply" && "$manifest_provided" != "true" ]]; then
  echo "deploy: --apply requires an explicit reviewed --manifest path" >&2
  exit 2
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/out"
BUCKET="${S3_BUCKET:-s3://uaroute.com}"
DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"
IMMUTABLE="public, max-age=31536000, immutable"
REVALIDATE="public, max-age=0, must-revalidate"

[[ -d "$OUT" && -f "$OUT/index.html" && -d "$OUT/_next/static" ]] || {
  echo "deploy: expected non-empty static export at $OUT; run npm run check first" >&2
  exit 1
}

if [[ "$mode" == "dry-run" && "$manifest_provided" != "true" ]]; then
  manifest="$(mktemp "${TMPDIR:-/tmp}/uaroute-release-manifest.XXXXXX")"
  node "$ROOT/scripts/seo-release.mjs" manifest --out "$OUT" --write "$manifest"
elif [[ "$mode" == "dry-run" ]]; then
  node "$ROOT/scripts/seo-release.mjs" manifest --out "$OUT" --write "$manifest"
elif [[ "$manifest_provided" != "true" ]]; then
  manifest="$(mktemp "${TMPDIR:-/tmp}/uaroute-release-manifest.XXXXXX")"
  node "$ROOT/scripts/seo-release.mjs" manifest --out "$OUT" --write "$manifest"
fi
echo "deploy: release manifest: $manifest"
node "$ROOT/scripts/seo-release.mjs" plan --out "$OUT" --manifest "$manifest"

if [[ "$mode" == "dry-run" ]]; then
  echo "deploy: dry-run complete; no AWS credentials or cloud APIs were used"
  exit 0
fi

[[ -n "$DISTRIBUTION_ID" ]] || { echo "deploy: set CLOUDFRONT_DISTRIBUTION_ID" >&2; exit 1; }
command -v aws >/dev/null || { echo "deploy: aws CLI is not installed" >&2; exit 1; }
node "$ROOT/scripts/seo-release.mjs" verify-recovery --bundle "$rollback_dir" \
  --bucket "${BUCKET#s3://}" --distribution "$DISTRIBUTION_ID"
snapshot_dir="$(mktemp -d "${TMPDIR:-/tmp}/uaroute-release-snapshot.XXXXXX")"
trap 'rm -rf -- "$snapshot_dir"' EXIT
node "$ROOT/scripts/seo-release.mjs" snapshot --out "$OUT" --manifest "$manifest" --to "$snapshot_dir"
aws sts get-caller-identity >/dev/null

# Publish every file in the frozen SHA-checked snapshot. `cp --recursive` uploads
# every source key instead of skipping by size/mtime; no operation deletes keys.
aws s3 cp "$snapshot_dir/_next/static/" "$BUCKET/_next/static/" \
  --recursive --no-progress --cache-control "$IMMUTABLE"
aws s3 cp "$snapshot_dir/" "$BUCKET/" \
  --recursive \
  --no-progress \
  --exclude "_next/static/*" \
  --exclude ".DS_Store" \
  --exclude "**/.DS_Store" \
  --cache-control "$REVALIDATE"
aws s3 cp "$snapshot_dir/" "$BUCKET/" \
  --recursive --no-progress --exclude "*" --include "*.html" \
  --content-type "text/html; charset=utf-8" \
  --cache-control "$REVALIDATE"

# Intentionally no hashed-chunk cleanup; retention window is owner-approved.
aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*"
