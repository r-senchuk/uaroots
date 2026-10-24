import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { validateState } from "./agent-state.mjs";

const register = JSON.parse(readFileSync(new URL("../ops/agent-state.json", import.meta.url), "utf8"));
function fixture(run) {
  const root = mkdtempSync(join(tmpdir(), "uaroute-state-"));
  writeFileSync(join(root, "contract.md"), "# Disposable contract\n");
  const value = structuredClone(register);
  value.next_task.contract = "contract.md";
  try { run(value, root); } finally { rmSync(root, { recursive: true, force: true }); }
}
test("portable snapshot survives without output artifacts or a KB", () => fixture((s, r) => assert.deepEqual(validateState(s, r), [])));
test("conflicting current facts and duplicate IDs are rejected", () => fixture((s, r) => {
  s.observations.push({ ...s.observations[0], value: "different" });
  const errors = validateState(s, r).join(" ");
  assert.match(errors, /duplicate id/); assert.match(errors, /duplicate current/);
}));
test("out-of-scope resources and unsupported evidence claims fail", () => fixture((s, r) => {
  s.observations[0].resource = "ads:another-business";
  s.observations[0].evidence = { kind: "unavailable", summary: "No readback" };
  const errors = validateState(s, r).join(" ");
  assert.match(errors, /outside declared scope/); assert.match(errors, /cannot support observed/);
}));
test("missing evidence and invented unknown values fail", () => fixture((s, r) => {
  s.observations[0].evidence = {};
  s.observations[1].verification = "unknown";
  const errors = validateState(s, r).join(" ");
  assert.match(errors, /evidence kind/); assert.match(errors, /unknown must use null/);
}));
test("impossible dates and observations after the register date fail", () => fixture((s, r) => {
  s.observations[0].observed_at = "2026-02-30";
  s.observations[1].observed_at = "2026-10-25";
  assert.equal(validateState(s, r).filter((e) => /observation date/.test(e)).length, 2);
}));
test("handoff cannot depend on missing, absolute, escaping or output-only contracts", () => fixture((s, r) => {
  for (const path of ["missing.md", "/tmp/private.md", "../outside.md", "output/evidence.md"]) {
    s.next_task.contract = path;
    assert.ok(validateState(s, r).some((e) => e.startsWith("next_task.contract")));
  }
}));
test("unknown states remain explicit and malformed input fails without crashing", () => fixture((s, r) => {
  Object.assign(s.observations[0], { value: null, verification: "unknown", evidence: { kind: "unavailable", summary: "Provider unavailable" } });
  assert.deepEqual(validateState(s, r), []);
  assert.ok(validateState(null, r).length);
  s.observations.push(null);
  assert.ok(validateState(s, r).length);
}));
