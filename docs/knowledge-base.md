---
type: Operational
title: "Local knowledge base"
description: "How to use the optional local UARoute knowledge vault and its checked wiki bundle."
tags: [uaroute, documentation, operational]
---

# Knowledge base

The knowledge vault is a separate local working copy for notes and navigation. It is not part of the UARoute site repository, is not synchronized by this repository, and is not required for `npm run check`.

Set `UAROUTE_KB_ROOT` in the calling shell or task environment to the path of the local vault root. The path is machine-specific configuration and must not be committed here. The checked/indexed bundle is exactly `UAROUTE_KB_ROOT/wiki`. The tools do not search for an Obsidian vault or infer its location.

The local vault may contain `README.md`, `AGENTS.md`, and Markdown files in `ops/`. The wiki bundle keeps these areas:

- `wiki/Product/`
- `wiki/Marketing/`
- `wiki/Operations/`
- `wiki/Operations/Agentic/Memory/`
- `wiki/Operations/Agentic/Operational/platform-guidance-2026-10.md`

Run `npm run kb:index` to rebuild its generated navigation and `npm run kb:check` to check the vault links and bundle. These commands require a configured, existing `UAROUTE_KB_ROOT` and `wiki/` directory. They do not modify or synchronize the vault when checking.

The canonical product and operational contracts remain in the site repository, including [the constitution](00-project-constitution.md), [the repository contract](Operations/Agentic/Operational/repository-contract.md), and [the working agreement](Operations/Agentic/Operational/working-agreement.md). Link from local vault notes to those repository files with ordinary relative Markdown paths computed from the local file's location. Do not copy owner-machine absolute paths into shared Markdown links. This guide is the stable reference for the optional local knowledge base; use its `#knowledge-base` section when a moved note needs a stable pointer back here.

Memory notes are dated evidence and context. They do not become authority, authorization, or proof that a source, deployment, or operational state is current. A missing local vault only blocks a task that explicitly needs its local notes; it does not block site documentation checks or `npm run check`.
