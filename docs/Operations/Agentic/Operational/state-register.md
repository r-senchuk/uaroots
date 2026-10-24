---
type: Operational
title: "Checked state register and archive handoff"
description: "Portable dated observations, evidence provenance and next-task boundaries for cross-session recovery."
tags: [uaroute, agents, evidence, handoff]
---

# Checked state register

Use [ops/agent-state.json](../../../../ops/agent-state.json) for the small current handoff: dated observations, their scope/provenance, blockers and the next bounded task. It is version-control eligible, not automatically committed. Detailed dated history stays in the separately configured [Project KB](../../../knowledge-base.md#knowledge-base); large/raw local evidence may remain in ignored output/. The register must be useful without either store.

Run `npm run state:check` to validate consistency and display the next task. It also runs as part of `docs:check`. Run `npm run test:agent-state` after changing the checker/schema. These commands are local, read-only and make no Google requests. A passing check does not establish provider access, consent compliance, deployment, conversion receipt, live indexing or fresh state.

## Record format

- `schema_version`, `updated_at`: the supported format and actual record-maintenance date. Do not change observation dates merely because the file was reviewed.
- `scope.resources`: explicit intended resources. This is an explanatory scope list, not a permission grant or substitute for connector isolation.
- `observations`: one current entry per resource/claim. Keep stable IDs; put older observations in dated history instead of accumulating conflicting current rows. `observed_at` records when the provider/source was read; `verification` is `observed` or `unknown`. Unknown values are null, not guessed zeroes.
- `evidence`: distinguish a portable raw-readback/artifact reference from an explicitly labelled session transcription. Include the method and limits in a concise summary. Artifact references must exist inside the repository, independent of output/; do not copy secrets or private data to satisfy this rule. A transcription is weaker evidence than a saved raw result and must never be relabelled as one.
- `recheck`: always `before-dependent-action`. Dated snapshots do not become current just because structural validation passes. Selectively re-read needed mutable state on resume and before a dependent mutation.
- `next_task`: summary, portable contract reference, publication state, explicit blockers (empty when none), and boundaries. This describes the intended next task; it is not authorization. Git status and source/export identity must still be observed before editing; do not keep an implicitly current dirty-file list in this register.

The checker detects missing provenance/scope/next-task fields, invalid dates, duplicate IDs and conflicting current resource/claim rows, unknown values presented as facts, and nonportable/missing references. It does not interpret arbitrary prose, verify a screenshot, compare every external system or detect all sensitive content. Human/agent review remains necessary.

## Workflow

1. Read the register and linked next-task contract. Confirm only the tools/resource scope required for that action; prefer scoped connectors and a documented UI fallback when appropriate.
2. Before changing external state, compare the necessary fresh readback with the intended setting and existing user authorization. Preserve other projects/accounts; do not duplicate existing actions.
3. After writing, wait for the actual saved-state signal and re-read. For interrupted or uncertain operations, read before retrying. If persistence cannot be verified, record unknown/blocker and continue independent work; do not substitute default budget/bidding to finish a wizard.
4. Save sanitized evidence immediately. Record before/after where useful and distinguish source/local/export/deployed/provider-received/operator-received. Never store auth callbacks, tokens, payment details, passenger identifiers, inquiry codes or message contents.
5. Update the appropriate observation and next task, leaving unrelated dirty work intact. Run the checker. Update canonical requirements only for accepted rules; narrative documents link to this register for mutable operational state rather than making conflicting present-tense copies.

No automatic provider polling, credential repair, Google mutation, archive action, publication or new multi-agent topology is introduced by this contract.

The [setup continuation backlog](setup-continuation.md) records the completed increment, evidence limitations and unfinished automation/filing work. Keep its priorities subordinate to the current product task; it is not an instruction to broaden setup scope on every resume.
