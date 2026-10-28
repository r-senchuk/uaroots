# P0 baseline — 2026-10-28

**Status: ready for continuation.** Baseline captured at `15725cba20f4f83475f0df8241e66f31836ce1d4` on `main` before these evidence files were written. The worktree was already dirty. Its complete pre-edit status, staged and unstaged diff fingerprints, and tracked/untracked file hashes are retained in the private baseline record; personal or private file identities are not included here.

## Gates

- All four frozen S03/S04 inputs match the SHA-256 values specified in `s05-work-plan.md`.
- The accepted Hannover board verification binds the same repository HEAD and frozen copy hash. Its acceptance is limited to one standalone 375px initial-state board; it does not establish other viewports, interactive states, application behavior, or usability results.
- All eight dirty application/script paths checked are byte-identical to release `ff1e4d095e96cab9f5c75cbf19854f532d6273b9`. Their pre-edit hashes are in the private record. These files were left untouched.
- `npm run state:check` was requested for this baseline handoff; it passed: eight dated observations are consistent; no live-state verification was performed.

## Scope and limits

No application files were changed. No commit, push, deployment, external request, account change, or configuration change was made. Actual runtime metrics were not reported and were not measured in P0. The baseline records prerequisites and local evidence only; it makes no claim about production behavior or mitigation outcomes.
