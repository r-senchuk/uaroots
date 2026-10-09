# UARoute release artifact and recovery tooling

The CI workflow checks pull requests and main. Successful main builds package `release-candidate-<SHA>` for review, including hidden export files. The artifact contains `identity.json`, `manifest.json`, `out/` and `edge.js`. Artifact retention is 30 days; it is not permanent/offsite recovery. Manual production promotion and rollback are implemented by the workflows below; a local pass is distinct from a verified production Actions run.

## Candidate identity

```sh
node scripts/release-bundle.mjs pack --out out --edge infra/cloudfront/seo-viewer-request.v1.js --to /path/to/empty-candidate --sha FULL_COMMIT_SHA --runId RUN_ID --repository r-senchuk/uaroots
node scripts/release-bundle.mjs verify --bundle /path/to/retrieved-candidate --sha FULL_COMMIT_SHA --runId RUN_ID --expectedHash REVIEWED_RELEASE_HASH --expectedEdgeHash REVIEWED_EDGE_HASH --run /path/to/authenticated-github-run.json
```

Obtain the run JSON independently through the authenticated GitHub Actions run API, not from the downloaded artifact. Verification requires a completed successful main push for this repository and CI workflow, matching commit/run IDs and both reviewed hashes. It rejects changed export/edge bytes and symlinks. Packaging alone is not publication.

## Schema 2 local recovery tool

```sh
node scripts/recovery-tool.mjs capture --to /path/to/empty-recovery --bucket uaroute.com --distribution E3L95CZFIU6533 --account 863809951348
node scripts/recovery-tool.mjs verify --bundle /path/to/retrieved-recovery --expectedHash REVIEWED_BUNDLE_HASH --bucket uaroute.com --distribution E3L95CZFIU6533 --account 863809951348
node scripts/recovery-tool.mjs restore-plan --bundle /path/to/retrieved-recovery --expectedHash REVIEWED_BUNDLE_HASH --bucket uaroute.com --distribution E3L95CZFIU6533 --account 863809951348
node scripts/recovery-tool.mjs rehearse --bundle /path/to/retrieved-recovery --to /path/to/empty-rehearsal --expectedHash REVIEWED_BUNDLE_HASH --bucket uaroute.com --distribution E3L95CZFIU6533 --account 863809951348
```

Capture makes authenticated read-only AWS calls and local writes. It stores all S3 keys as hashed blob paths (so `about` and `about/index.html` cannot collide), object metadata, distribution configuration and associated LIVE function code/configuration. Inventory/config/function drift aborts capture. Independently retrieve and verify the complete bundle against its reviewed hash.

`restore-plan` only prints the required operations; `rehearse` copies and hash-checks locally. Neither writes production or proves remote recovery/rollback. Schema 2 is not accepted by the existing manual apply gate in `scripts/seo-release.mjs`; do not pass it to `make deploy` or claim that integration exists. Keep the schema 1 manual release gates documented in [CUTOVER.md](../CUTOVER.md). AWS credentials and recovery artifacts stay outside Git.

Run `npm run test:seo-release` for artifact identity, tampering, inventory-drift and recovery-layout regression checks. Operational release facts remain dated evidence in the local vault.

## Production workflows

`deploy-production.yml` accepts successful main CI run ID, full source SHA, reviewed manifest hash and edge hash. It verifies the independently authenticated run and retrieved candidate before assuming the dedicated OIDC role. It captures a fresh schema 2 recovery bundle, uploads to a private versioned/encrypted bucket, independently retrieves and verifies it before any production upload. The exact candidate bytes are published assets first, without rebuilding or deleting old objects. Distribution configuration drift stops publication. Edge updates require exclusive association, fresh ETags and runtime acceptance. Invalidation must complete; all uploaded object hashes, the live receiver contract and the HTTP acceptance matrix must pass.

`rollback-production.yml` accepts `releases/<run>-<attempt>` and its recorded manifest hash. It first captures the current state into a new durable recovery prefix, retrieves the selected prior bundle, verifies its hash and target, and restores object bytes and metadata plus LIVE edge code/configuration. It refuses distribution configuration changes: the role cannot change infrastructure or other distributions. Old keys remain to support in-flight clients. Verify live behavior after rollback; object recovery alone does not establish passenger outcomes.

Both workflows use the same noncancelable production writer concurrency group, main-only production environment and short-lived OIDC credentials. No independent reviewer is configured for this sole-owner manual promotion policy. Tracked trust/policy templates are in `infra/github-actions/`; provision separately, never from a pull request workflow. The role has no object deletion, IAM administration, other-site write or distribution update grant. `ListDistributions` is the single read-only wildcard for edge blast-radius validation.

Recovery bucket: `uaroute-recovery-863809951348-eu-central-1`, minimum 30-day window, currently no expiry policy. Backup objects and full capture remain private; only hashes/receipts, invalidation status and public HTTP results are uploaded as Actions evidence. No credentials belong in Git. Artifacts expire after 30 days; durable S3 recovery is separate. Expired candidates require a new CI run and review.
