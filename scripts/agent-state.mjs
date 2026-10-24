import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const nonempty = (value) => typeof value === "string" && value.trim().length > 0;
const date = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

/** Structural consistency only: this checker never contacts or certifies a provider. */
export function validateState(state, repositoryRoot = root) {
  const errors = [];
  if (!state || typeof state !== "object" || Array.isArray(state)) return ["register must be an object"];
  if (state.schema_version !== 1) errors.push("schema_version must be 1");
  if (!date(state.updated_at)) errors.push("updated_at must be a valid YYYY-MM-DD date");
  if (state.scope?.project !== "uaroute") errors.push("scope.project must be uaroute");
  const resources = state.scope?.resources;
  if (!Array.isArray(resources) || !resources.length || resources.some((r) => !nonempty(r))
      || new Set(resources).size !== resources.length) errors.push("scope.resources must contain unique resource identifiers");
  const allowed = new Set(Array.isArray(resources) ? resources : []);
  const ids = new Set(), claims = new Set();
  if (!Array.isArray(state.observations) || !state.observations.length) errors.push("observations must be nonempty");
  for (const [index, item] of (Array.isArray(state.observations) ? state.observations : []).entries()) {
    const label = `observations[${index}]`;
    if (!item || typeof item !== "object" || Array.isArray(item)) { errors.push(`${label} must be an object`); continue; }
    if (!nonempty(item.id) || ids.has(item.id)) errors.push(`${label}: missing or duplicate id`);
    ids.add(item.id);
    if (!allowed.has(item.resource)) errors.push(`${label}: resource outside declared scope`);
    if (!nonempty(item.claim)) errors.push(`${label}: claim is required`);
    const key = JSON.stringify([item.resource, item.claim]);
    if (claims.has(key)) errors.push(`${label}: conflicting duplicate current resource/claim`);
    claims.add(key);
    if (!Object.hasOwn(item, "value")) errors.push(`${label}: explicit value is required (null for unknown)`);
    if (!date(item.observed_at) || item.observed_at > state.updated_at) errors.push(`${label}: observation date invalid or later than register date`);
    if (!["observed", "unknown"].includes(item.verification)) errors.push(`${label}: verification must be observed or unknown`);
    if (item.verification === "unknown" && item.value !== null) errors.push(`${label}: unknown must use null, not a guessed value`);
    if (item.verification === "observed" && item.value === null) errors.push(`${label}: observed requires a non-null value`);
    if (item.recheck !== "before-dependent-action") errors.push(`${label}: recheck must be before-dependent-action`);
    if (!["raw-readback", "session-transcription", "artifact", "unavailable"].includes(item.evidence?.kind)
        || !nonempty(item.evidence?.summary)) errors.push(`${label}: evidence kind and summary required`);
    if (item.verification === "observed" && item.evidence?.kind === "unavailable") errors.push(`${label}: unavailable evidence cannot support observed`);
    if (["artifact", "raw-readback"].includes(item.evidence?.kind)) checkReference(item.evidence.reference, `${label}: evidence`);
  }
  function checkReference(reference, label) {
    if (!nonempty(reference)) { errors.push(`${label}: repository reference required`); return; }
    const path = resolve(repositoryRoot, reference);
    const rel = relative(repositoryRoot, path);
    if (isAbsolute(reference) || rel.startsWith("..") || isAbsolute(rel)
        || /^(output|\.git)(\/|$)/.test(rel.replaceAll("\\", "/"))) {
      errors.push(`${label}: reference must be portable and independent of ignored evidence`);
    } else if (!existsSync(path) || !statSync(path).isFile()) errors.push(`${label}: missing repository reference ${reference}`);
  }
  if (!nonempty(state.next_task?.summary)) errors.push("next_task.summary required");
  checkReference(state.next_task?.contract, "next_task.contract");
  if (!["local-only", "committed", "deployed", "unknown"].includes(state.next_task?.publication_state)) errors.push("next_task.publication_state invalid");
  for (const field of ["blockers", "boundaries"]) {
    const values = state.next_task?.[field];
    if (!Array.isArray(values) || values.some((v) => !nonempty(v))) errors.push(`next_task.${field} must be an explicit list`);
  }
  if (!state.next_task?.boundaries?.length) errors.push("next_task.boundaries must state the action scope");
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    if (args.length > 1) throw new Error("usage: node scripts/agent-state.mjs [register.json]");
    const path = resolve(root, args[0] ?? "ops/agent-state.json");
    const state = JSON.parse(readFileSync(path, "utf8"));
    const errors = validateState(state);
    if (errors.length) throw new Error(errors.join("\n"));
    console.log(`agent-state: ${state.observations.length} dated observations consistent; record updated ${state.updated_at}. No live-state verification performed.`);
    console.log(`Next: ${state.next_task.summary}`);
    console.log(`Scope: ${state.next_task.publication_state}; re-read providers before dependent action.`);
  } catch (error) {
    console.error(`agent-state: ${error.message}`);
    process.exitCode = 1;
  }
}
