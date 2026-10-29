# UARoute

Ukrainian passenger discovery atlas. **M1: UARoute owns discovery/intent; the carrier owns booking.** M2 is a gated development direction, not a released reservation service.

## Non-negotiable

- Ukrainian public copy; use neutral «перевізник», without surnames or carrier branding (owner decision 2026-10-20). Keep existing technical IDs, contacts and referral URLs; do not imply additional carriers are already connected. Never invent service, prices, schedules, stops or availability. `commercial` means published inquiry eligibility, not proof of operated service; editorial pages are `noindex` and excluded from search/index/sitemap.
- Keep Lviv/Ivano-Frankivsk acquisition priority. City-pair selection is not automatic page publication. Nearby settlements may be actual origins/destinations represented by the nearest selectable city; passengers privately specify the exact place, and the carrier confirms feasibility. Names are not aliases or coverage promises.
- Preserve city/route IDs, desks, classifications, referral allowlists and security changes. Search uses `findRouteByCities(..., { commercialOnly: true })`; reversing preserves the pair and expected countries.
- M1 stores no passenger names, phones or travel dates; never send those, credentials or messages to `track()`. Preserve first-touch acquisition separately from current `targetPath`, complete opposite-country referral pairs, and current-visit attribution.
- npm, TypeScript 6, Next.js static export to S3/CloudFront; no Node production server. Server Components by default; internal hrefs end in `/` except home. No dependency upgrades, account/global configuration changes or publication implied by a local edit.
- Preserve unrelated dirty files. Local tests use disposable fixtures; external collectors/handoffs must be intercepted. Commit/push/deployment require user authorization, which persists within its stated scope. Prefer GitHub Actions/OIDC for authorized deployment; follow [CUTOVER.md](CUTOVER.md).

## Read only what applies

Use the [expanded contract](docs/Operations/Agentic/Operational/repository-contract.md) for the relevant product/domain section, not every linked document. For product, content, SEO, inquiry, analytics or architecture changes, read [the constitution](docs/00-project-constitution.md) and the relevant domain contract; report contradictions rather than silently overriding Level 1.

| Task | Entry point |
| --- | --- |
| Agent workflow, verification, delegation | [Operational agreement](docs/Operations/Agentic/Operational/working-agreement.md) |
| Known pitfalls / prior session evidence | [Memory guide](docs/knowledge-base.md#knowledge-base) (KB: `wiki/Operations/Agentic/Memory/README.md`), only relevant records |
| Platform setup/version compatibility | [Codex/Vibe/Antigravity/OpenCode](docs/knowledge-base.md#knowledge-base) (KB: `wiki/Operations/Agentic/Operational/platform-guidance-2026-10.md`) |
| Catalog | [src/data/AGENTS.md](src/data/AGENTS.md), skill `edit-catalog` |
| UI/search/inquiry | skill `verify-pages`, `src/lib/whatsapp.ts` |
| SEO/acquisition, booking, analytics | Relevant section of [expanded contract](docs/Operations/Agentic/Operational/repository-contract.md) |
| Current demand / live state | [POC next steps](docs/knowledge-base.md#knowledge-base) (KB: `wiki/Operations/POC/next-steps.md`), [dated status](docs/knowledge-base.md#knowledge-base) (KB: `wiki/Operations/POC/poc-status.md`) |

## Checks and documentation

Node 22 follows `.nvmrc`; Node 24 is compatibility coverage when runtime/release scope requires it. `npm run dev`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run validate`. During edits run focused checks; run `npm run check` once on the stable application candidate. Documentation/instruction-only work: `npm run docs:index`, `npm run docs:check` and relevant instruction/tooling checks. Repeat broader tests only after affected changes/failures or explicit release requirements.

`docs/` contains Git-versioned canonical contracts; Project KB is a separate local vault (see [KB guide](docs/knowledge-base.md#knowledge-base)). `npm run check` never depends on that vault; `output/` and secrets/passenger data remain excluded. Generated indexes/maps come from `docs:index`. Memory is dated evidence, never new authority, authorization or proof of deployment. Record lessons there and promote accepted rules to Operational/scoped instructions. Keep this file a lean router. If a required contract is missing, report it; do not reconstruct it from memory.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
