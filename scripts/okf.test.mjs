import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseDocument, run } from "./okf.mjs";
import { CANONICAL_SITE_DOCUMENTS } from "./documentation-roots.mjs";

test("accept unknown types/extensions and bare verification maps; reject fabricated shape", () => {
  const result = parseDocument('---\ntype: A new domain type\nx_private_extension: yes\nverified: {by: "process:check", at: "2026-10-07T10:00:00Z"}\n---\n# Topic\n', "topic.md");
  assert.equal(result.metadata.type, "A new domain type");
  assert.throws(() => parseDocument('---\ntype: ""\n---\n# Topic', "topic.md"), /nonempty type/);
  assert.throws(() => parseDocument('---\ntype: Reference\nverified: {by: "anonymous", at: "2026-10-07"}\n---\n# Topic', "topic.md"), /actor/);
});

test("reserved navigation differs from concepts and root declaration", () => {
  assert.doesNotThrow(() => parseDocument('# Section\n- [Topic](topic.md) — Answer.\n', "section/index.md"));
  assert.doesNotThrow(() => parseDocument('---\nokf_version: "0.2"\n---\n# Bundle\n', "index.md", true));
  assert.throws(() => parseDocument('---\nokf_version: "0.2"\n---\n# Section\n', "section/index.md"), /bundle-root/);
  assert.throws(() => parseDocument('# Log\n## October 7\n- Change.\n', "log.md"), /YYYY-MM-DD/);
});

test("indexes and graph detect added documents and metadata changes", () => {
  const root = mkdtempSync(join(tmpdir(), "uaroute-okf-test-"));
  try {
    mkdirSync(join(root, "Marketing"));
    const file = join(root, "Marketing/topic.md");
    writeFileSync(file, '---\ntype: Plan\ntitle: Topic\ndescription: One useful answer.\n---\n# Topic\n');
    run(root, true);
    assert.equal(run(root).concepts, 1);
    writeFileSync(file, '---\ntype: Plan\ntitle: Changed topic\ndescription: A different answer.\n---\n# Topic\n');
    assert.throws(() => run(root), /stale/);
    run(root, true);
    writeFileSync(join(root, "Marketing/another.md"), '---\ntype: Reference\n---\n# Another\n');
    assert.throws(() => run(root), /stale/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});


test("site bundle is required while the optional local vault stays outside site checks", () => {
  const root = mkdtempSync(join(tmpdir(), "uaroute-docs-checkout-"));
  const checker = fileURLToPath(new URL("./check-docs.mjs", import.meta.url));
  const okf = fileURLToPath(new URL("./okf.mjs", import.meta.url));
  try {
    for (const file of ["README.md", "AGENTS.md", "CLAUDE.md", "CUTOVER.md"]) {
      writeFileSync(join(root, file), "# Repository\n");
    }
    assert.equal(spawnSync(process.execPath, [checker], { cwd: root }).status, 1);
    assert.equal(spawnSync(process.execPath, [okf, "--check"], { cwd: root }).status, 1);
    for (const file of CANONICAL_SITE_DOCUMENTS) {
      const path = join(root, "docs", file);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, '---\ntype: Reference\n---\n# Repository contract fixture\n');
    }
    for (const [file, title] of [["README.md", "Human navigation"], ["map.md", "Knowledge map"], ["okf-profile.md", "OKF profile"]]) {
      writeFileSync(join(root, "docs", file), `---\ntype: Reference\ntitle: ${title}\ndescription: Valid local navigation fixture.\n---\n# ${title}\n`);
    }
    const indexed = spawnSync(process.execPath, [okf, "--write"], { cwd: root, encoding: "utf8" });
    assert.equal(indexed.status, 0, indexed.stderr);
    assert.equal(spawnSync(process.execPath, [checker], { cwd: root }).status, 0);
    assert.equal(spawnSync(process.execPath, [okf, "--check"], { cwd: root }).status, 0);
    writeFileSync(join(root, "README.md"), "[Broken repository link](missing.ts)\n");
    assert.equal(spawnSync(process.execPath, [checker], { cwd: root }).status, 1);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("OKF CLI rejects unknown arguments and a missing explicit KB root", () => {
  const root = mkdtempSync(join(tmpdir(), "uaroute-okf-cli-"));
  const okf = fileURLToPath(new URL("./okf.mjs", import.meta.url));
  try {
    assert.equal(spawnSync(process.execPath, [okf, "--unknown"], { cwd: root }).status, 1);
    const missingRoot = spawnSync(process.execPath, [okf, "--kb", "--check"], {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, UAROUTE_KB_ROOT: "" },
    });
    assert.equal(missingRoot.status, 1);
    assert.match(missingRoot.stderr, /requires UAROUTE_KB_ROOT/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});


test("OS metadata does not make shared indexes depend on local Finder state", () => {
  const root = mkdtempSync(join(tmpdir(), "uaroute-okf-os-"));
  try {
    writeFileSync(join(root, ".DS_Store"), "local metadata");
    writeFileSync(join(root, "evidence.json"), "{}");
    run(root, true);
    assert.doesNotMatch(readFileSync(join(root, "index.md"), "utf8"), /DS_Store/);
    assert.match(readFileSync(join(root, "index.md"), "utf8"), /evidence.json/);
    rmSync(join(root, ".DS_Store"));
    assert.doesNotThrow(() => run(root));
  } finally { rmSync(root, { recursive: true, force: true }); }
});
