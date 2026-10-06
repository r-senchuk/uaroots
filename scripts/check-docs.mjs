import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const root = process.cwd();
const files = ["README.md", "AGENTS.md", "CLAUDE.md", "CUTOVER.md"].map((file) => join(root, file));

function collect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) collect(path);
    else if (entry.name.endsWith(".md")) files.push(path);
  }
}

const docsRoot = join(root, "docs");
const hasDocs = existsSync(docsRoot);
if (hasDocs) collect(docsRoot);
else console.log("docs:check: local ignored docs/ vault absent; checking repository links only");
const errors = [];
let checked = 0;

for (const file of files) {
  // Check inline Markdown file links, excluding fenced examples and inline code.
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
      const destination = path.startsWith("/") && file.startsWith(join(root, "docs") + "/")
        ? resolve(root, "docs", `.${decodeURIComponent(path)}`)
        : resolve(dirname(file), decodeURIComponent(path));
      if (!hasDocs && (destination === docsRoot || destination.startsWith(docsRoot + "/"))) continue;
      if (!existsSync(destination)) errors.push(`${relative(root, file)}: missing ${target}`);
    } catch {
      errors.push(`${relative(root, file)}: invalid path ${target}`);
    }
  }
}

if (errors.length) {
  console.error(errors.map((error) => `docs:check: ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`docs:check: ${checked} local file links in ${files.length} Markdown files pass (anchors/external links not checked)`);
}
