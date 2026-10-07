# UARoute — deploy and former URLs

`./out` is the static Next.js artifact. The dated [POC release record](docs/Operations/POC/poc-status.md) says `uaroute.com` was published and its live attribution path verified on 2026-10-06. That record does not verify operator receipt or completed journeys. Do not infer outage or a need for another cutover from older fetch failures; record new production evidence before claiming a later release.

## Former URLs

The exported former-URL pages are fallback HTML redirects, not HTTP redirects. The SEO release spec calls for an explicit edge map for these known paths. After that edge change is implemented and verified, unknown `/provider/:name` paths must return a real 404 page whose content links to `/routes/`; they must not redirect to the route index through a wildcard. This is the target contract, not a claim about current live edge behavior.

| Path | Target |
| --- | --- |
| `/contact/`, `/contacts/` | `/about/` |
| `/carriers/` | `/routes/` |
| `/packages/` | `/about/` |
| `/gallery/` | `/` |
| Unknown `/provider/:name` | Target after edge fix: 404 page with a `/routes/` link |

## Planned GitHub Actions production deployment

The [Actions deployment plan](docs/Operations/github-actions-production-deployment-plan-2026-10-07.md) records the October 7 read-only readiness review and implementation/evaluation steps. Current Actions only runs checks and preflight; production deployment/rollback workflows and a scoped UARoute OIDC role are not implemented. The manual production release is separate evidence.

## Local Actions tooling increment

See [tracked artifact/recovery commands](infra/github-actions-release.md). CI candidate packaging and local verification/rehearsal tooling are implemented; remote deployment and schema 2 recovery integration remain pending. Existing manual apply gates are unchanged.

## Release preflight and publication

The main-branch GitHub workflow runs checks and a local release preflight. It does not have AWS credentials and does not publish. `make release-preflight` runs the same local checks and prints a dry-run plan. The manifest includes every exported file's byte count and SHA-256 and a fingerprint of the complete manifest.

```bash
npm run check
./scripts/deploy.sh --dry-run --manifest /tmp/uaroute-release-manifest.json
```

Review the manifest, exact source changes, export, and the dry-run plan. The plan uploads `/_next/static/` first, then the remaining export, repairs HTML content types, and invalidates CloudFront. No upload deletes keys: old hashed chunks, old rollback files, and legacy keys remain in S3. Keep them for the recovery window agreed by the release owner; this repository does not prescribe its duration.

Production writes require a separately prepared and retrieved recovery bundle, a reviewed manifest matching the exact `out/`, and an explicit invocation:

```bash
./scripts/deploy.sh --apply \
  --manifest /path/to/reviewed-release-manifest.json \
  --rollback-dir /path/to/verified-recovery-bundle
```

The bundle's `recovery-manifest.json` must hash-check the full prior HTML/RSC/assets artifact, identify the matching S3 bucket and CloudFront distribution, include the distribution config and CloudFront Function's unqualified ARN, `LIVE` stage ETag, code, captured function config, a synthetic test event, and expected viewer-request document behaviors, and record retrieval/checksum verification. The verifier checks that the config contains the declared S3 bucket origin and each declared viewer-request association. Missing files, changed hashes, target mismatch, incomplete artifact inventory, or a manifest mismatch stop before AWS writes. Use the output of `node scripts/seo-release.mjs verify-recovery --bundle DIR --bucket uaroute.com --distribution DISTRIBUTION_ID` to inspect that gate. The 2026-10-06 POC backups were verified locally but are not durable/offsite recovery and have no versioning; do not call them release-ready without rechecking retrieval and completeness for this release.

GitHub main pushes only create preflight artifacts; they do not publish. The manual `make deploy RELEASE_MODE=apply RELEASE_MANIFEST=/path/to/reviewed-release-manifest.json ROLLBACK_DIR=/path/to/verified-recovery-bundle` applies the already-built `./out` without rebuilding it. Run checks and create/review the manifest first. If `./out` changes after review, repeat preflight and review the new manifest before applying. UARoute vendor analytics stays disabled: do not pass `NEXT_PUBLIC_GA_MEASUREMENT_ID` or enable analytics through a release environment.

## Recovery procedure

Use the prior artifact and edge configuration from the verified bundle as one compatible set. First restore every file from the complete frozen static artifact without deletion. Restore the CloudFront Function code by updating its DEVELOPMENT stage with the current ETag and captured function config, test it, publish it to LIVE, then restore the recorded distribution configuration and invalidate. Publishing updates every behavior already associated with that function, so preflight all associations before restoring. CloudFront Function ARNs are unqualified; the ETag identifies the stage version, and publishing copies DEVELOPMENT to LIVE ([AWS PublishFunction API](https://docs.aws.amazon.com/cloudfront/latest/APIReference/API_PublishFunction.html), [AWS function stages](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/update-function.html)). Repeat the release HTTP/browser matrix after propagation. These are command patterns only; substitute values from the verified bundle and fresh AWS ETags:

```bash
aws s3 cp /path/to/verified-recovery-bundle/artifact/_next/static/ s3://uaroute.com/_next/static/ \
  --recursive --no-progress --cache-control 'public, max-age=31536000, immutable'
aws s3 cp /path/to/verified-recovery-bundle/artifact/ s3://uaroute.com/ \
  --recursive --no-progress --exclude '_next/static/*' --cache-control 'public, max-age=0, must-revalidate'
aws s3 cp /path/to/verified-recovery-bundle/artifact/ s3://uaroute.com/ \
  --recursive --no-progress --exclude '*' --include '*.html' \
  --content-type 'text/html; charset=utf-8' --cache-control 'public, max-age=0, must-revalidate'
aws cloudfront describe-function --name "$CLOUDFRONT_FUNCTION_NAME" --stage DEVELOPMENT
aws cloudfront update-function \
  --name "$CLOUDFRONT_FUNCTION_NAME" \
  --if-match "$CURRENT_DEVELOPMENT_ETAG" \
  --function-config file:///path/to/verified-recovery-bundle/cloudfront/function-config.json \
  --function-code fileb:///path/to/verified-recovery-bundle/cloudfront/function.js
aws cloudfront test-function --name "$CLOUDFRONT_FUNCTION_NAME" \
  --if-match "$UPDATED_DEVELOPMENT_ETAG" --stage DEVELOPMENT \
  --event-object fileb:///path/to/verified-recovery-bundle/cloudfront/test-event.json
aws cloudfront publish-function --name "$CLOUDFRONT_FUNCTION_NAME" --if-match "$UPDATED_DEVELOPMENT_ETAG"
aws cloudfront update-distribution \
  --id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --if-match "$CURRENT_DISTRIBUTION_ETAG" \
  --distribution-config file:///path/to/verified-recovery-bundle/cloudfront/distribution-config.json
aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" --paths '/*'
```

The CloudFront update uses the matching distribution config captured by the bundle; it retains the function's unqualified ARN association after restoring code to LIVE. Do not restore HTML alone: stale browser tabs may still request the old RSC payloads and hashed chunks. This is a code-level restore procedure, not evidence that a durable backup or rollback rehearsal currently exists.

### Initial distribution without a function

The October 7 authenticated capture found no CloudFront Function association. Such a recovery bundle explicitly records `cloudFront.mode: "no-function"`, `function: null`, and an empty `documentAssociations` list. The verifier checks the complete artifact, matching bucket origin, distribution configuration fingerprint, and zero function associations across all behaviors. Missing metadata is not treated as absence. Restore the captured distribution config with a fresh ETag and invalidate; do not publish a nonexistent previous function. The newly created release function can remain unattached after recovery.

Recovery resolves percent-encoded HTML asset URLs to actual S3 keys (for example `[slug]`). Next's static `404/index.html` has no required RSC sibling; ordinary document siblings remain mandatory. The regional `s3-website.REGION.amazonaws.com` origin form is accepted with an exact bucket match. Regression tests cover these production layouts.

Do not install `@lovable.dev/*` or reconnect this repo to lovable.dev.
