---
type: Operational
title: "Agent setup — completed increment and continuation backlog"
description: "Saved implementation results, remaining evidence/tooling gaps and proportionate follow-up acceptance criteria."
tags: [uaroute, agents, continuity, verification, backlog]
---

# Agent setup continuation

Updated 24 October 2026. Implements the owner's instruction to save results and carry unfinished setup work into the general development strategy. This document records local implementation scope and planned follow-up; it grants no external access, publication or spending authority. See [constitution §43](../../../00-project-constitution.md#43-agent-continuity-and-verification-development-2026-10-24).

## Saved implementation result

- [ops/agent-state.json](../../../../ops/agent-state.json): six dated operational observations with explicit session-transcription provenance, resource scope, blockers and next task. It is version-control eligible, not yet committed by this task.
- [State checker](../../../../scripts/agent-state.mjs): checks required fields, dates, duplicate/current claims, evidence declarations, resource membership and portable repository references; prints the next task. It makes no provider calls and cannot certify live facts or arbitrary narrative consistency.
- [Regression tests](../../../../scripts/agent-state.test.mjs): seven cases covering portability without output/KB, conflicting records, scope/evidence failures, unknown values, date errors, bad references and malformed input. Included in the existing tooling suite.
- [Package commands](../../../../package.json): `state:check`, `test:agent-state`; state validation is included in `docs:check`, and tests are included in `test:okf`.
- [Working agreement](working-agreement.md): selective resume/preflight, saved-state readback after external writes, inspect-before-retry and sanitized evidence guidance. Stale present-tense conversion claims in the constitution were replaced by the state-register reference; the older analytics activation section is explicitly historical.

At implementation acceptance: all 28 documentation/tooling tests passed, including seven new checker tests; docs indexing/link/state checks, JavaScript syntax checks and focused ESLint passed. No full application build was run for this tooling/documentation-only increment. No external configuration, application source, credentials, commit, push or deployment was changed.

## Remaining work, in order

| ID | Gap / current limit | Next bounded action | Acceptance / scope |
|---|---|---|---|
| C1 | Current observations are honest transcriptions, not saved raw provider readbacks | During the next necessary provider read/write, capture a minimal sanitized result immediately, with resource/date/method and before/after where applicable | No retrospective relabelling as raw evidence. No credentials, payment details, passenger data, inquiry codes or messages. Shared handoff stays usable without ignored artifacts. |
| C2 | Checker detects structural conflicts inside the register, not every contradictory prose claim | During ordinary documentation edits, replace mutable present-tense copies with register references. Add a narrowly scoped managed-reference check only if drift recurs | Test a real stale-copy failure and valid historical snapshot; do not use a broad regex to rewrite historical documents automatically. |
| C3 | Tool availability/isolation/read-write support can change between sessions | Use one narrow preflight for the resource needed by the next task. Record a compact capability map if repeated lookups justify it | Correct property/customer and permitted operation verified; read-only MCP distinguished from write-capable UI. No incidental OAuth, allowlist, subscription or global configuration expansion. |
| C4 | Browser save/editor state may not persist; interrupted actions can be ambiguous | On the next applicable workflow, checkpoint a completed stage and reopen/read the saved state before claiming completion | No duplicate mutation after timeout; no default budget/bidding substitution. A recoverable unfinished draft is not a published/paused campaign. |
| C5 | Cross-repository referral vocabulary can drift without breaking the whole referral | Build a focused sender-versus-reviewed-receiver contract comparison when referral vocabulary next changes | Exact content/city/tuple/code-policy comparison and separate source/deployment evidence. A fixture pass is not operator receipt. Do not modify or publish the receiver repository without the relevant scope. |
| C6 | Detailed history and screenshots mostly remain local in ignored output/; optional KB root is not configured | When the intended historical store is explicitly configured, file a sanitized dated retrospective/handoff there and retain canonical-contract pointers | Do not infer a vault path, duplicate canonical rules, commit raw browser inventories or make site checks depend on the vault. Local artifacts are not a shared backup. |
| C7 | New practices have not yet demonstrated efficiency across resumed work | Evaluate the next three bounded tasks | Record repeated reads, recovery outcomes, stale-state errors, necessary checks and elapsed time where actually measured. Runtime/token/cost values remain unknown unless supplied; no invented savings claims. |

C1, C3 and C4 are working practices to apply during normal authorized work, not separate infrastructure projects. C2/C5 automation and C6 filing are not implemented by the initial increment. No extra approval is needed for already authorized local work; approval requirements for external actions remain scoped to the actual action and applicable policy.

## Product continuation remains first

The next development task remains the [existing passenger remediation and acquisition increment](../../../Marketing/SEO/priority-acquisition-increment-2026-10-24.md): finish mobile/reflow/navigation/contact/referral/form fixes, complete the missing priority URL inspections, then improve existing Lviv/IF discovery and the Lviv–Hannover search entry point. Preserve unrelated dirty work and the dated current-state register; do not restart completed investigations.

Still-open product/operational gates are not solved by this setup increment: fresh per-resource observations before dependent actions; real Google conversion ingestion/attribution; privately confirmed received carrier inquiries; accepted local passenger changes and separately authorized release; appropriate route-page indexing; and a complete verified Ads configuration before any separately authorized activation. No new indexed city pairs or M2 release is implied.

## Archive/resume record

Before ending a meaningful work session, update the register only for changed observations or next-task state, run `state:check`, and state local/commit/deploy status. Keep older evidence dated. The saved continuation contract and register should identify the next action without loading the whole chat. Archiving a conversation does not commit files, preserve ignored output on another machine or execute the remaining backlog.
