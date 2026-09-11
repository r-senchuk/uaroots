---
name: edit-catalog
description: >-
  Edits UARoute typed catalog (cities, routes, carriers, desks, claims) without
  inventing operational facts. Use when changing src/data/**, commercial vs
  editorial status, aliases, desks, or claims.
---

# Edit catalog

1. Follow [src/data/AGENTS.md](../../../src/data/AGENTS.md) and `src/data/types.ts`.
2. If changing `status`, read the matrix linked from that file.
3. `npm run validate`. Add `npm test` only if search or inquiry behavior changed.
