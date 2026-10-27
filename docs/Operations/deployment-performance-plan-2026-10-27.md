---
type: Operational
title: "Production deployment performance plan"
description: "Measured 2026-10-26 GitHub Actions deployment and a safety-preserving plan to reduce serial AWS transfer time."
tags: [uaroute, operations, deployment, performance, recovery]
---

# Production deployment performance plan

## Measured production result — 2026-10-26

Production release `265888aaae0b927ffe4332fea4e76e1ff72eb79e` completed successfully in about 25 minutes. CI run [40400774338](https://github.com/r-senchuk/uaroots/actions/runs/40400774338) produced the reviewed candidate; deployment run [40401056083](https://github.com/r-senchuk/uaroots/actions/runs/40401056083) deployed it. The release passed candidate identity/hash checks, production recovery verification, publication, CloudFront invalidation and live acceptance. An independent live mobile check confirmed both Ivano-Frankivsk ↔ Hannover inquiry directions and the visible, focused search-miss result. No inquiry was sent.

| Stage | Evidence and elapsed time | Finding |
| --- | --- | --- |
| Fresh production recovery | 464 existing objects were captured, uploaded to the private recovery bucket, independently retrieved and verified. Recovery receipt retrieval completed at 21:13:17 UTC; the deployment began at 21:03:23 UTC. About 10 minutes. | `capture()` downloads each object in a serial loop. Recovery upload/retrieval and integrity checks also remain required. |
| Publish and invalidation | 258 candidate objects were published; CloudFront invalidation completed at 21:18:54 UTC, about 5 minutes after the recovery stage. | `deploy()` awaits a separate AWS CLI process for every file, although static assets are ordered first. |
| Verify and accept | Deployment completed at 21:28:44 UTC, about 10 minutes after invalidation. All 258 published objects passed verification. | `verifyPublished()` serially runs `head-object`, downloads each object again with `get-object`, then compares its full SHA-256. |

The stage durations are approximate, derived from the authenticated Actions run and its sanitized recovery, invalidation and success receipts. They are observations from this release, not a benchmark guarantee. CloudFront propagation and live acceptance remain part of elapsed deployment time.

## Implementation plan

Implement this as bounded parallel I/O while keeping all production gates intact. Start with a fixed concurrency of 8; measure a representative release before considering a change to that limit. Do not run unbounded work or add an operator-controlled setting in the first increment.

1. Add a small shared concurrency helper. Preserve input/result order, stop scheduling new items after a failure, and wait for all in-flight operations to settle before reporting failure. Test the concurrency ceiling and failure behavior.
2. Apply it to production recovery object downloads. Keep the sorted source inventory and deterministic manifest ordering, then preserve the post-capture inventory, distribution-config and function-drift checks. Keep recovery upload, independent retrieval and complete-bundle verification before any production write.
3. Apply it to candidate uploads in two explicit phases: `_next/static/` first, then remaining export files. Await every asset upload before starting document uploads. Keep metadata/content-type behavior, old-object retention, edge checks and CloudFront waits unchanged.
4. Replace the serial published-object HEAD plus GET sequence with bounded full-object GET/hash verification. Check content length and all expected metadata from the GET response before removing the separate HEAD call. Keep full-byte SHA-256 checks; an S3 ETag is not a substitute.
5. Add sanitized per-stage timings and aggregate object counts. Publish only allowlisted timing evidence, with no object keys, credentials or recovery contents. Keep timing data separate from passenger analytics.

## Acceptance gates

- Recovery remains first: verify the exact AWS account, bucket versioning and public-access block, full recovery artifact/hash, independent retrieval, target configuration, inventory/config/function drift, and exclusive edge-function association before writes.
- A failed transfer schedules no further work and does not return while already-started operations can still write. Any failed recovery or candidate hash check stops deployment.
- Upload order remains assets before documents. Preserve content types/cache metadata, non-deletion of existing S3 keys, edge runtime checks, completed CloudFront invalidation, receiver-contract verification and the live HTTP acceptance matrix.
- Tests cover the helper's maximum active work, deterministic result order, worker failure with in-flight operations, recovery inventory ordering, asset-before-document sequencing, and verification failures for bytes, size and metadata.
- Compare timings at similar file counts to this 464-object recovery / 258-object release baseline. Report stage measurements and correctness evidence together; do not claim a speedup before collecting the next run.

## Scope and status

This is a tracked implementation plan, not an implementation or release authorization. No production transfer algorithm, IAM permission, AWS setting or deployment workflow was changed while recording it. The existing [release and recovery contract](../../infra/github-actions-release.md) and [cutover gates](../../CUTOVER.md) continue to govern all promotions. The owner requested the analysis and plan using GPT-6.1 Sol; the independent review identified the same serial loops and recommended bounded concurrency with deterministic manifests and in-flight failure settlement.
