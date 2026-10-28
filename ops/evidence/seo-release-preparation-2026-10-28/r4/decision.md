# R4 independent release decision — 28 October 2026

**Preparation accepted, ready with explicit unknowns. Promotion is not ready; no release is cleared or performed.** R1, R2 instructions, final R3, R7 and R9 outputs were read. [Decision](decision.json) records named owners/closure actions; [independent verification](verification.json) freezes exact input hashes and the proposed combined source diff.

| Independent check | Result |
| --- | --- |
| Selected root / isolated source | 167/167 each, no mismatch |
| Export and recomputed deployment manifest | 258/258; no missing/extra/symlink; 7,830,419 bytes |
| Essential frozen inputs / config-tooling identities | 26/26 and 14/14 |
| Compiled disabled analytics modules | 2/2; no enabled-provider claim |
| Local verification failures / new application defects | 0 / 0 |
| Actual iPhone R2 checks | 0 passed, 0 failed, 6 NOT RUN of 6 |

Source-map hash `3c114ad623fd49d791eea58ea2210170801e45613fb557ad4fdf0313c3cae29e`; export-map hash `40a5db56e1a7ae1aa8b6d06ebabf05f3d1adde1229dc2c25517adfaa89636572`. Independently recomputed release fingerprint `ed5adc3a5964701aaa5da34296ffd2db1348bd86f4593abe82b99f1620f2c974`; edge `b9bae15fec6705a1834115a492849980eaf552ce29bc6d50cf1c6663fe492f2d`. These are distinct identities by design. The selected source manifest does not attest the whole repository.

The [portable dry-run receipt](../r3/dry-run.txt) matches its recorded hash and is byte-identical to the original executed log. The final R3 note and reproduction-script hashes are bound in `verification.json`; this portability update did not rerun the dry-run. Actual matching `deploy.sh`/`seo-release.mjs` code exits the local manifest/plan path before cloud calls. R3 used the cached lock-matched Node22 candidate; R4 independently recomputed entries/fingerprint and inspected provenance, without rerunning the producer, building or touching root output. This proves local preparation, not current recovery or production state.

Promotion has four named prerequisites:

1. **Owner/R5 — authorization and exact protected Git scope.** HEAD `15725cba20f4f83475f0df8241e66f31836ce1d4` does not contain the candidate or the earlier calendar-release commit. The 26 proposed source/script paths include 25 mitigation changes plus carried `inquiry.tsx`; seven overlap pre-existing dirty source work. Review the exact combined hunks frozen in `verification.json`, retain calendar safeguards, and protect all other dirty work. The scope record is not staging approval.
2. **Owner device tester/coordinator — existing S09 physical dependency.** The owner selected instructions for later. Six real iPhone Chrome checks remain NOT RUN, including direct date, calendar, keyboard, sticky/consent and return navigation. A verified isolated exact-candidate preview and actual receipt are required before S10 acceptance. Desktop/emulation and the old production retest cannot pass this candidate. Keep screen-reader applicability explicit; no new mandatory human study is imposed.
3. **R5 — successful matching main CI and resolved build mode.** Independently authenticate/download/verify the full source SHA/run and candidate hashes. CI variables can change compiled public IDs and analytics mode; record resolved values and preserve the accepted disabled mode. S09 staged checks do not equal one successful full command. Rebuilt/environment-different bytes require documented comparison and affected reacceptance. Enabled analytics requires its separate activation/compiled-provider/privacy gates; deployment cannot toggle this artifact.
4. **R5 — fresh recoverability.** Capture current complete schema2 state through the authorized Actions/OIDC path, reject drift, durably store then independently retrieve/hash-verify it before production writes. Retain the external prefix/hash and full private bundle. Historical calendar recovery is insufficient; schema2 does not satisfy schema1 manual apply. Existing rollback-rehearsal limitations remain disclosed.

After those prerequisites and actual release authorization, require the deployment/source/run/artifact/edge receipts, completed invalidation, every uploaded object's size/hash, preserved old keys and independent R6 live routing/content/inquiry/consent readback. Stop and inspect state after a failed or uncertain write; use recovery only under applicable authorization.

R7 remains 3/3 unposted: two drafts are prepared subject to live/channel/authorization gates; draft 2 requires factual correction of «розрахунку багажу» before posting. This is one S11 copy finding, not an application blocker. Exact live destination checks are 0/3 verified; named channel rules/permission are unknown. R9 obtained no new provider evidence: metrics for 7/7 priority pages remain unknown. Missing field/search/AI/operator outcomes, unchanged-provider ingestion and a separate human study do not create new release vetoes or become zero results.

**Next authorized action:** coordinator integration and documentation checks. Later R2 execution needs an authorized isolated preview. Commit/push/deployment/posting remain separately authorized actions; this review supplies none. No source edits, build, Git writes, browser operation, credential access or cloud/network mutation occurred in R4; only this directory was written.
