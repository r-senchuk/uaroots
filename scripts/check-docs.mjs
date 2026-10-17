import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { CANONICAL_SITE_DOCUMENTS, isPathInside, resolveDocumentationRoots } from "./documentation-roots.mjs";

function collectMarkdown(directory, files) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) collectMarkdown(path, files);
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(path);
  }
}

function safeRealPath(path) {
  let current = path;
  while (!existsSync(current)) {
    const parent = dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
  return realpathSync(current);
}

function hasSymlinkAncestor(path) {
  let current = path;
  while (true) {
    try {
      if (lstatSync(current).isSymbolicLink()) return true;
    } catch { /* Continue to the nearest existing parent. */ }
    const parent = dirname(current);
    if (parent === current) return false;
    current = parent;
  }
}

try {
  const roots = resolveDocumentationRoots();
  const { siteRoot, bundleRoot, vaultRoot, evidenceRoot, kb } = roots;
  const files = [];
  const errors = [];
  const unavailableEvidence = [];
  const allowMissingEvidence = kb && process.env.DOCS_ALLOW_MISSING_EVIDENCE === "1" && isPathInside(siteRoot, evidenceRoot) && isPathInside(resolve(siteRoot, "output"), evidenceRoot);

  if (kb) {
    for (const name of ["README.md", "AGENTS.md"]) {
      const path = join(vaultRoot, name);
      if (existsSync(path)) files.push(path);
    }
    const opsRoot = join(vaultRoot, "ops");
    if (existsSync(opsRoot) && statSync(opsRoot).isDirectory()) collectMarkdown(opsRoot, files);
    collectMarkdown(bundleRoot, files);
  } else {
    for (const name of ["README.md", "AGENTS.md", "CLAUDE.md", "CUTOVER.md"]) {
      const path = join(siteRoot, name);
      if (existsSync(path)) files.push(path);
      else errors.push(`${relative(siteRoot, path)}: required repository documentation is missing`);
    }
    collectMarkdown(bundleRoot, files);
    if (roots.siteDocumentation) {
      for (const path of CANONICAL_SITE_DOCUMENTS) {
        if (!existsSync(join(bundleRoot, path))) errors.push(`docs/${path}: required canonical site document is missing`);
      }
    }
  }

  let checked = 0;
  for (const file of files) {
    const source = readFileSync(file, "utf8")
      .replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, "")
      .replace(/`[^`\n]+`/g, "");
    for (const match of source.matchAll(/!?\[[^\]\n]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+"[^"]*")?\s*\)/g)) {
      const target = match[1] ?? match[2];
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(target)) continue;
      const path = target.split(/[?#]/, 1)[0];
      if (!path) continue;
      checked += 1;
      try {
        const decoded = decodeURIComponent(path);
        const destination = decoded.startsWith("/")
          ? resolve(bundleRoot, `.${decoded}`)
          : resolve(dirname(file), decoded);
        if (existsSync(destination)) {
          const real = realpathSync(destination);
          if (isPathInside(evidenceRoot, destination) && !isPathInside(evidenceRoot, real)) {
            errors.push(`${relative(siteRoot, file)}: symlink escapes evidence root: ${target}`);
          }
          continue;
        }
        if (hasSymlinkAncestor(destination)) {
          errors.push(`${relative(siteRoot, file)}: unresolved symlink in local path: ${target}`);
          continue;
        }
        const nearestReal = safeRealPath(destination);
        const outputExists = existsSync(roots.siteOutputRoot);
        const missingEvidence = allowMissingEvidence && isPathInside(evidenceRoot, destination) &&
          (outputExists ? (!nearestReal || isPathInside(evidenceRoot, nearestReal)) : (!nearestReal || isPathInside(siteRoot, nearestReal)));
        if (missingEvidence) unavailableEvidence.push(`${relative(siteRoot, file)}: unavailable ${target}`);
        else errors.push(`${relative(siteRoot, file)}: missing ${target}`);
      } catch {
        errors.push(`${relative(siteRoot, file)}: invalid path ${target}`);
      }
    }
  }

  if (unavailableEvidence.length) {
    console.log(`docs:check: ${unavailableEvidence.length} ignored output/ artifact references unavailable (UNVERIFIED; not evidence acceptance)`);
  }
  if (errors.length) {
    console.error(errors.map((error) => `docs:check: ${error}`).join("\n"));
    process.exitCode = 1;
  } else {
    console.log(`docs:check: ${checked - unavailableEvidence.length} available local file links in ${files.length} Markdown files pass (anchors/external links not checked)`);
  }
} catch (error) {
  console.error(`docs:check: ${error.message}`);
  process.exitCode = 1;
}
