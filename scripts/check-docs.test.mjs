import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync, renameSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { CANONICAL_SITE_DOCUMENTS } from "./documentation-roots.mjs";

const checker = fileURLToPath(new URL("./check-docs.mjs", import.meta.url));
function makeSite() {
  const root = mkdtempSync(join(tmpdir(), "uaroute-doc-links-"));
  for (const name of ["README.md", "AGENTS.md", "CLAUDE.md", "CUTOVER.md"]) writeFileSync(join(root, name), "# Fixture\n");
  for (const name of CANONICAL_SITE_DOCUMENTS) {
    const path = join(root, "docs", name);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, "# Canonical fixture\n");
  }
  return root;
}

function check(root, args = [], env = {}) {
  return spawnSync(process.execPath, [checker, ...args], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, DOCS_ALLOW_MISSING_EVIDENCE: "0", ...env },
  });
}

function addDoc(root, name, content) {
  const path = join(root, "docs", name);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

test("strict local mode rejects missing ignored evidence", () => {
  const root = makeSite();
  try {
    addDoc(root, "record.md", "[Evidence](../output/missing.json)");
    const result = check(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /missing .*output\/missing.json/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("site mode with DOCS_ALLOW_MISSING_EVIDENCE still fails on missing evidence", () => {
  const root = makeSite();
  try {
    addDoc(root, "record.md", "[Evidence](../output/missing.json)");
    const result = check(root, [], { DOCS_ALLOW_MISSING_EVIDENCE: "1" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /missing .*output\/missing.json/);
    assert.doesNotMatch(result.stdout, /UNVERIFIED/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("CI mode keeps missing documentation and source links fatal", () => {
  const root = makeSite();
  try {
    addDoc(root, "record.md", "[Doc](missing.md)\n[Source](../src/missing.ts)");
    const result = check(root, [], { DOCS_ALLOW_MISSING_EVIDENCE: "1" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /missing missing.md/);
    assert.match(result.stderr, /missing .*src\/missing.ts/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("decoded traversal cannot turn a source path into exempt evidence", () => {
  const root = makeSite();
  try {
    addDoc(root, "record.md", "[Source](../output/%2E%2E/src/missing.ts)");
    const result = check(root, [], { DOCS_ALLOW_MISSING_EVIDENCE: "1" });
    assert.equal(result.status, 1);
    assert.doesNotMatch(result.stdout, /UNVERIFIED/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("KB mode traversal escape is never UNVERIFIED", () => {
  const root = mkdtempSync(join(tmpdir(), "uaroute-kb-vault-"));
  try {
    mkdirSync(join(root, "wiki"));
    mkdirSync(join(root, "output"));
    writeFileSync(join(root, "README.md"), "[Source](output/%2E%2E/wiki/missing.md)\n");
    writeFileSync(join(root, "AGENTS.md"), "# Local instructions\n");
    const result = check(root, ["--kb"], { UAROUTE_KB_ROOT: root, DOCS_ALLOW_MISSING_EVIDENCE: "1" });
    assert.equal(result.status, 1);
    assert.doesNotMatch(result.stdout, /UNVERIFIED/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("missing canonical site contracts fail while custom bundles need no site inventory", () => {
  const root = makeSite();
  try {
    rmSync(join(root, "docs", CANONICAL_SITE_DOCUMENTS[0]));
    const siteResult = check(root);
    assert.equal(siteResult.status, 1);
    assert.match(siteResult.stderr, /required canonical site document is missing/);
    const custom = join(root, "bundle");
    mkdirSync(custom);
    writeFileSync(join(custom, "note.md"), "# Note\n");
    const bundleResult = check(root, ["--root", custom]);
    assert.equal(bundleResult.status, 0, bundleResult.stderr);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("custom non-KB mode with DOCS_ALLOW_MISSING_EVIDENCE still fails on missing evidence", () => {
  const root = makeSite();
  try {
    const custom = join(root, "bundle");
    mkdirSync(custom);
    writeFileSync(join(custom, "note.md"), "[Evidence](output/missing.json)\n");
    const result = check(root, ["--root", custom], { DOCS_ALLOW_MISSING_EVIDENCE: "1" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /missing .*output\/missing.json/);
    assert.doesNotMatch(result.stdout, /UNVERIFIED/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("missing source and contract links always fail regardless of mode", () => {
  const root = makeSite();
  try {
    addDoc(root, "record.md", "[Source](../src/missing.ts)\n[Contract](../contracts/missing.md)");
    const result = check(root, [], { DOCS_ALLOW_MISSING_EVIDENCE: "1" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /missing .*src\/missing.ts/);
    assert.match(result.stderr, /missing .*contracts\/missing.md/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("canonical site documents required even when docs is a symlink", () => {
  const root = makeSite();
  try {
    const realDocs = join(root, "real-docs");
    renameSync(join(root, "docs"), realDocs);
    symlinkSync(realDocs, join(root, "docs"), "dir");
    const valid = check(root);
    assert.equal(valid.status, 0, valid.stderr);
    rmSync(join(realDocs, CANONICAL_SITE_DOCUMENTS[0]));
    const result = check(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /required canonical site document is missing/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("unknown, incomplete, and unrestricted evidence arguments fail", () => {
  const root = makeSite();
  try {
    assert.equal(check(root, ["--wat"]).status, 1);
    assert.equal(check(root, ["--root"]).status, 1);
    const invalidEvidence = check(root, ["--evidence-root", "src"]);
    assert.equal(invalidEvidence.status, 1);
    assert.match(invalidEvidence.stderr, /must be site\/output/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("evidence symlink escape is never UNVERIFIED", () => {
  const root = makeSite();
  const outside = mkdtempSync(join(tmpdir(), "uaroute-evidence-outside-"));
  try {
    mkdirSync(join(root, "output"));
    symlinkSync(outside, join(root, "output", "escaped"), "dir");
    addDoc(root, "record.md", "[Evidence](../output/escaped/missing.json)");
    const result = check(root, [], { DOCS_ALLOW_MISSING_EVIDENCE: "1" });
    assert.equal(result.status, 1);
    assert.doesNotMatch(result.stdout, /UNVERIFIED/);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  }
});

test("KB mode symlink escape is never UNVERIFIED even with DOCS_ALLOW_MISSING_EVIDENCE", () => {
  const root = mkdtempSync(join(tmpdir(), "uaroute-kb-vault-"));
  const outside = mkdtempSync(join(tmpdir(), "uaroute-kb-outside-"));
  try {
    mkdirSync(join(root, "wiki"));
    mkdirSync(join(root, "output"));
    symlinkSync(outside, join(root, "output", "escaped"), "dir");
    writeFileSync(join(root, "README.md"), "[Evidence](output/escaped/missing.json)\n");
    writeFileSync(join(root, "AGENTS.md"), "# Local instructions\n");
    const result = check(root, ["--kb"], { UAROUTE_KB_ROOT: root, DOCS_ALLOW_MISSING_EVIDENCE: "1" });
    assert.equal(result.status, 1);
    assert.doesNotMatch(result.stdout, /UNVERIFIED/);
    assert.match(result.stderr, /symlink escapes evidence root|unresolved symlink in local path/);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  }
});

test("KB checks require an explicit configured root and use wiki-root links", () => {
  const site = makeSite();
  const vault = mkdtempSync(join(tmpdir(), "uaroute-kb-root-"));
  try {
    const wiki = join(vault, "wiki");
    mkdirSync(join(wiki, "Product"), { recursive: true });
    writeFileSync(join(wiki, "Product", "note.md"), "# Note\n");
    writeFileSync(join(vault, "README.md"), "[Note](/Product/note.md)\n");
    writeFileSync(join(vault, "AGENTS.md"), "# Local instructions\n");
    mkdirSync(join(vault, "ops"));
    writeFileSync(join(vault, "ops", "task.md"), "[Note](../wiki/Product/note.md)\n");
    mkdirSync(join(vault, "ops", "migration"));
    const nestedReport = join(vault, "ops", "migration", "report.md");
    writeFileSync(nestedReport, "[Missing report](../../wiki/Product/missing.md)\n");
    const missingRoot = check(site, ["--kb"], { UAROUTE_KB_ROOT: "" });
    assert.equal(missingRoot.status, 1);
    assert.match(missingRoot.stderr, /requires UAROUTE_KB_ROOT/);
    const missingNestedLink = check(site, ["--kb"], { UAROUTE_KB_ROOT: vault });
    assert.equal(missingNestedLink.status, 1);
    assert.match(missingNestedLink.stderr, /ops\/migration\/report\.md: missing .*wiki\/Product\/missing\.md/);
    writeFileSync(nestedReport, "[Note](../../wiki/Product/note.md)\n");
    const result = check(site, ["--kb"], { UAROUTE_KB_ROOT: vault });
    assert.equal(result.status, 0, result.stderr);
  } finally {
    rmSync(site, { recursive: true, force: true });
    rmSync(vault, { recursive: true, force: true });
  }
});

test("KB mode with DOCS_ALLOW_MISSING_EVIDENCE allows UNVERIFIED for missing evidence", () => {
  const root = mkdtempSync(join(tmpdir(), "uaroute-kb-vault-"));
  try {
    mkdirSync(join(root, "wiki"));
    mkdirSync(join(root, "output"));
    writeFileSync(join(root, "README.md"), "[Evidence](output/missing.json)\n");
    writeFileSync(join(root, "AGENTS.md"), "# Local instructions\n");
    const result = check(root, ["--kb"], { UAROUTE_KB_ROOT: root, DOCS_ALLOW_MISSING_EVIDENCE: "1" });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /1 ignored output\/ artifact references unavailable \(UNVERIFIED/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("KB mode without DOCS_ALLOW_MISSING_EVIDENCE fails on missing evidence", () => {
  const root = mkdtempSync(join(tmpdir(), "uaroute-kb-vault-"));
  try {
    mkdirSync(join(root, "wiki"));
    mkdirSync(join(root, "output"));
    writeFileSync(join(root, "README.md"), "[Evidence](output/missing.json)\n");
    writeFileSync(join(root, "AGENTS.md"), "# Local instructions\n");
    const result = check(root, ["--kb"], { UAROUTE_KB_ROOT: root, DOCS_ALLOW_MISSING_EVIDENCE: "0" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /missing .*output\/missing.json/);
    assert.doesNotMatch(result.stdout, /UNVERIFIED/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
