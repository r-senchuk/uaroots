import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import yaml from "js-yaml";

const posix = (path) => path.replaceAll("\\", "/");
const reserved = new Set(["index.md", "log.md"]);
const timestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const actor = /^(?:human:[^\s]+|process:[^\s]+|[^\s/]+\/[^\s/]+)$/;

/** Validate OKF structure without inventing authorship, review or freshness. */
export function parseDocument(source, path, isRootIndex = false) {
  const name = basename(path);
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  const metadata = match ? yaml.load(match[1], { schema: yaml.JSON_SCHEMA }) : undefined;
  const body = match ? source.slice(match[0].length) : source;
  if (reserved.has(name)) {
    if (name === "log.md" && match) throw new Error(`${path}: log.md must not have frontmatter`);
    if (name === "index.md" && match) {
      if (!isRootIndex || !metadata || Object.keys(metadata).some((key) => key !== "okf_version") || metadata.okf_version !== "0.2") {
        throw new Error(`${path}: only the bundle-root index may declare okf_version: "0.2"`);
      }
    }
    if (name === "log.md") {
      for (const heading of body.matchAll(/^## (.+)$/gm)) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(heading[1])) throw new Error(`${path}: log date must be YYYY-MM-DD`);
      }
    }
    return { metadata, body };
  }
  if (!metadata || Array.isArray(metadata) || typeof metadata !== "object" || typeof metadata.type !== "string" || !metadata.type.trim()) {
    throw new Error(`${path}: a concept requires YAML frontmatter with a nonempty type`);
  }
  for (const key of ["title", "description", "resource"]) {
    if (metadata[key] !== undefined && typeof metadata[key] !== "string") throw new Error(`${path}: ${key} must be a string`);
  }
  if (metadata.tags !== undefined && (!Array.isArray(metadata.tags) || metadata.tags.some((tag) => typeof tag !== "string"))) {
    throw new Error(`${path}: tags must be a list of strings`);
  }
  if (metadata.status !== undefined && !["draft", "stable", "deprecated"].includes(metadata.status)) throw new Error(`${path}: invalid lifecycle status`);
  const checkDate = (value, key) => {
    if (typeof value !== "string" || !timestamp.test(value) || !Number.isFinite(Date.parse(value))) throw new Error(`${path}: ${key} requires an ISO datetime with offset`);
  };
  const checkActor = (event, key, requireAt) => {
    if (!event || typeof event.by !== "string" || !actor.test(event.by)) throw new Error(`${path}: ${key}.by requires an actor`);
    if (requireAt || event.at !== undefined) checkDate(event.at, `${key}.at`);
  };
  if (metadata.generated !== undefined) checkActor(metadata.generated, "generated", false);
  if (metadata.verified !== undefined) {
    for (const event of Array.isArray(metadata.verified) ? metadata.verified : [metadata.verified]) checkActor(event, "verified", true);
  }
  if (metadata.stale_after !== undefined) checkDate(metadata.stale_after, "stale_after");
  if (metadata.sources !== undefined) {
    if (!Array.isArray(metadata.sources)) throw new Error(`${path}: sources must be a list`);
    const ids = new Set();
    for (const item of metadata.sources) {
      if (!item || typeof item.resource !== "string" || !item.resource.trim()) throw new Error(`${path}: source requires resource`);
      if (item.id !== undefined) {
        if (typeof item.id !== "string" || !item.id || ids.has(item.id)) throw new Error(`${path}: source IDs must be unique nonempty strings`);
        ids.add(item.id);
      }
      if (item.last_modified !== undefined) checkDate(item.last_modified, "source.last_modified");
    }
  }
  if (metadata.type === "Attested Computation") {
    if (typeof metadata.runtime !== "string" || !metadata.runtime.trim()) throw new Error(`${path}: computation requires runtime`);
  }
  return { metadata, body };
}

function collect(root) {
  const files = [], directories = [];
  function visit(directory) {
    directories.push(directory);
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, "en"))) {
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`${path}: symlinks are outside this bundle profile`);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) files.push(path);
    }
  }
  visit(root);
  return { files, directories };
}

export function buildNavigation(root) {
  const { files, directories } = collect(root);
  const records = new Map();
  for (const path of files.filter((file) => file.endsWith(".md"))) {
    records.set(path, parseDocument(readFileSync(path, "utf8"), posix(relative(root, path)), path === join(root, "index.md")));
  }
  const expected = new Map();
  for (const directory of directories) {
    const name = directory === root ? "UARoute knowledge bundle" : posix(relative(root, directory));
    let content = `${directory === root ? '---\nokf_version: "0.2"\n---\n\n' : ""}# ${name}\n\n`;
    if (directory === root) content += "Start with the [human navigation](README.md), [knowledge map](map.md) and [OKF profile](okf-profile.md). Generated listing: run `npm run docs:index` after document changes.\n\n";
    else content += `Parent: [${basename(dirname(directory))}](../index.md).\n\n`;
    const children = directories.filter((child) => dirname(child) === directory);
    if (children.length) {
      content += "## Sections\n\n";
      for (const child of children) content += `- [${basename(child)}](${basename(child)}/index.md) — Browse this section before loading its documents.\n`;
      content += "\n";
    }
    const concepts = files.filter((file) => dirname(file) === directory && file.endsWith(".md") && !reserved.has(basename(file)));
    if (concepts.length) {
      content += "## Concepts\n\n";
      for (const file of concepts) {
        const meta = records.get(file).metadata;
        content += `- [${meta.title ?? basename(file, ".md")}](${basename(file)}) — ${meta.description ?? meta.type}\n`;
      }
      content += "\n";
    }
    const assets = files.filter((file) => dirname(file) === directory && !file.endsWith(".md") && file !== join(root, "map.json"));
    if (assets.length) {
      content += "## Supporting artifacts\n\n";
      for (const file of assets) content += `- [${basename(file)}](${basename(file)}) — Non-concept artifact; preserve its original evidence meaning.\n`;
      content += "\n";
    }
    if (existsSync(join(directory, "log.md"))) content += "## History\n\n- [Update log](log.md) — Dated structural changes; not deployment certification.\n";
    if (directory === root) content += "\n## Machine navigation\n\n- [Inventory and link map](map.json) — Generated project extension, not an upstream-required OKF file.\n";
    expected.set(join(directory, "index.md"), content.trimEnd() + "\n");
  }
  const allFiles = [...new Set([...files, ...expected.keys(), join(root, "map.json")])].sort();
  const nodes = allFiles.map((file) => {
    const path = posix(relative(root, file)), meta = records.get(file)?.metadata;
    return { path, ...(meta?.type ? { id: path.slice(0, -3), type: meta.type, title: meta.title, description: meta.description } : { kind: file.endsWith(".md") ? "reserved" : "artifact" }) };
  });
  const links = [];
  const markdownFiles = allFiles.filter((file) => file.endsWith(".md"));
  for (const file of markdownFiles) {
    const body = (expected.get(file) ?? records.get(file).body).replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, "").replace(/`[^`\n]+`/g, "");
    for (const match of body.matchAll(/\[[^\]\n]*\]\(([^\s)]+)\)/g)) {
      const target = match[1];
      if (/^[a-z][a-z\d+.-]*:|^\/\/|^#/i.test(target)) continue;
      const path = target.split(/[?#]/)[0];
      const destination = path.startsWith("/") ? resolve(root, `.${path}`) : resolve(dirname(file), decodeURIComponent(path));
      const to = posix(relative(root, destination));
      links.push({ from: posix(relative(root, file)), to, scope: to.startsWith("../") ? "repository" : "bundle" });
    }
  }
  expected.set(join(root, "map.json"), JSON.stringify({ okf_version: "0.2", extension: "uaroute-document-map-v1", directories: directories.map((path) => posix(relative(root, path)) || "."), nodes, links }, null, 2) + "\n");
  return { expected, concepts: [...records.values()].filter((record) => record.metadata?.type).length, directories: directories.length };
}

export function run(root, write = false) {
  const result = buildNavigation(root), errors = [];
  for (const [file, content] of result.expected) {
    if (write) writeFileSync(file, content);
    else if (!existsSync(file) || readFileSync(file, "utf8") !== content) errors.push(`${posix(relative(root, file))}: missing or stale; run npm run docs:index`);
  }
  if (errors.length) throw new Error(errors.join("\n"));
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const root = resolve("docs");
    if (!existsSync(root) && !process.argv.includes("--write")) {
      console.log("okf: local ignored docs/ vault absent; bundle validation skipped");
      process.exit(0);
    }
    const result = run(root, process.argv.includes("--write"));
    console.log(`okf: ${result.concepts} concepts, ${result.directories} directory indexes and document map ${process.argv.includes("--write") ? "generated" : "pass"} (v0.2 + UARoute profile; no fact verification implied)`);
  } catch (error) {
    console.error(`okf: ${error.message}`);
    process.exitCode = 1;
  }
}
