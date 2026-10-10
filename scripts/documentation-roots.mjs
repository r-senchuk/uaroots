import { existsSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";

export const CANONICAL_SITE_DOCUMENTS = Object.freeze([
  "00-project-constitution.md",
  "Decisions/0001-nextjs-static-export.md",
  "Decisions/0002-gated-operator-booking-pilot.md",
  "Product/02-prd-milestone-1.md",
  "Product/03-ux-and-information-architecture.md",
  "Product/04-visual-design-system.md",
  "Product/06-data-model-and-content-governance.md",
  "Product/09-technical-architecture.md",
  "Product/Booking/domain-and-api.md",
  "Product/inquiry-handoff-development-spec-2026-10-07.md",
  "Product/pre-consent-measurement-plan-2026-10-07.md",
  "Product/gtm-ga4-activation-spec-2026-10-07.md",
  "Marketing/08-analytics-and-attribution.md",
  "Marketing/SEO/evaluation-contract-2026-10-06.md",
  "Operations/07-koval-integration-and-conversion.md",
  "Operations/security-advisory-register-2026-10-09.md",
  "Operations/Agentic/Operational/repository-contract.md",
  "Operations/Agentic/Operational/working-agreement.md",
]);

const inside = (root, target) => {
  const rel = relative(root, target);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
};

function requireDirectory(path, label) {
  if (!path || !existsSync(path) || !statSync(path).isDirectory()) {
    throw new Error(`${label} must be an existing directory: ${path || "(empty)"}`);
  }
  return realpathSync(path);
}

/** Parse and validate all shared documentation CLI options and roots. */
export function resolveDocumentationRoots(args = process.argv.slice(2), options = {}) {
  const env = options.env ?? process.env;
  const cwd = resolve(options.cwd ?? process.cwd());
  const parsed = { kb: false, write: false, check: false, rootArg: undefined, siteArg: undefined, evidenceArg: undefined };
  const seen = new Set();
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (["--kb", "--write", "--check"].includes(arg)) {
      if (seen.has(arg)) throw new Error(`duplicate argument: ${arg}`);
      seen.add(arg);
      if (arg === "--kb") parsed.kb = true;
      else parsed[arg.slice(2)] = true;
      continue;
    }
    const key = { "--root": "rootArg", "--site-root": "siteArg", "--evidence-root": "evidenceArg" }[arg];
    if (!key) throw new Error(`unknown argument: ${arg}`);
    if (seen.has(arg)) throw new Error(`duplicate argument: ${arg}`);
    seen.add(arg);
    const value = args[index + 1];
    if (typeof value !== "string" || value.trim() === "" || value.startsWith("--")) throw new Error(`${arg} requires a nonempty path`);
    parsed[key] = value;
    index += 1;
  }
  if (parsed.write && parsed.check) throw new Error("--write and --check cannot be used together");
  if (parsed.kb && parsed.rootArg) throw new Error("--root cannot be combined with --kb; the KB bundle is UAROUTE_KB_ROOT/wiki");

  const siteRoot = requireDirectory(resolve(cwd, parsed.siteArg ?? "."), "--site-root");
  let vaultRoot;
  let bundleRoot;
  if (parsed.kb) {
    if (typeof env.UAROUTE_KB_ROOT !== "string" || env.UAROUTE_KB_ROOT.trim() === "") {
      throw new Error("--kb requires UAROUTE_KB_ROOT to name the local knowledge vault");
    }
    vaultRoot = requireDirectory(resolve(env.UAROUTE_KB_ROOT), "UAROUTE_KB_ROOT");
    bundleRoot = requireDirectory(resolve(vaultRoot, "wiki"), "KB bundle (UAROUTE_KB_ROOT/wiki)");
  } else {
    bundleRoot = requireDirectory(resolve(siteRoot, parsed.rootArg ?? "docs"), parsed.rootArg ? "--root" : "site documentation root (docs)");
  }

  const siteOutputRoot = resolve(siteRoot, "output");
  let evidenceRoot = resolve(siteOutputRoot, parsed.evidenceArg ?? ".");
  if (parsed.evidenceArg) evidenceRoot = resolve(siteRoot, parsed.evidenceArg);
  if (!inside(siteOutputRoot, evidenceRoot)) throw new Error("--evidence-root must be site/output or a directory beneath it");
  // Check the normalized filesystem location too, so a symlinked output/evidence directory cannot widen the exception.
  if (existsSync(siteOutputRoot)) {
    const realOutput = realpathSync(siteOutputRoot);
    if (!inside(realpathSync(siteRoot), realOutput)) throw new Error("site/output resolves outside the site root");
    if (!inside(realOutput, realpathSync(evidenceRoot))) throw new Error("--evidence-root resolves outside site/output");
    evidenceRoot = realpathSync(evidenceRoot);
  } else if (parsed.evidenceArg) {
    throw new Error("--evidence-root must exist beneath site/output");
  }

  const siteDocumentation = !parsed.kb && resolve(siteRoot, parsed.rootArg ?? "docs") === resolve(siteRoot, "docs");
  return { kb: parsed.kb, write: parsed.write, check: parsed.check, siteDocumentation, siteRoot, bundleRoot, vaultRoot, siteOutputRoot, evidenceRoot };
}

export function isPathInside(root, target) {
  return inside(resolve(root), resolve(target));
}
