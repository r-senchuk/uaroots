# UARoute release artifact and recovery tooling

The CI workflow checks pull requests and main. Successful main builds package `release-candidate-<SHA>` for review, including hidden export files. The artifact contains `identity.json`, `manifest.json`, `out/` and `edge.js`. Artifact retention is 30 days; it is not permanent/offsite recovery. These commands do not implement a production deployment workflow or a rollback workflow.

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
