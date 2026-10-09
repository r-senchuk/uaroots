import { createHash } from "node:crypto";
import {
  cp,
  lstat,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createManifest, createReleaseSnapshot } from "./seo-release.mjs";
const hash = (b) => createHash("sha256").update(b).digest("hex");
const json = (v) => `${JSON.stringify(v, null, 2)}\n`;
export async function pack({ out, edge, to, sha, runId, repository }) {
  if (
    !/^[a-f0-9]{40}$/.test(sha) ||
    !/^\d+$/.test(runId) ||
    repository !== "r-senchuk/uaroots"
  )
    throw Error("invalid release identity");
  await mkdir(to, { recursive: true });
  if ((await readdir(to)).length)
    throw Error("bundle destination must be empty");
  const manifest = await createManifest(out);
  await writeFile(path.join(to, "manifest.json"), json(manifest));
  await createReleaseSnapshot(
    out,
    path.join(to, "manifest.json"),
    path.join(to, "out"),
  );
  await cp(edge, path.join(to, "edge.js"));
  const identity = {
    schemaVersion: 1,
    repository,
    sourceSha: sha,
    runId,
    event: "push",
    ref: "refs/heads/main",
    releaseSha256: manifest.releaseSha256,
    edgeSha256: hash(await readFile(path.join(to, "edge.js"))),
  };
  await writeFile(path.join(to, "identity.json"), json(identity));
  return identity;
}
export async function verify({
  bundle,
  sha,
  runId,
  expectedHash,
  expectedEdgeHash,
  run,
}) {
  // run must come from authenticated GitHub API, never from artifact claims.
  if (
    run.repository?.full_name !== "r-senchuk/uaroots" ||
    run.event !== "push" ||
    run.head_branch !== "main" ||
    run.status !== "completed" ||
    run.conclusion !== "success" ||
    run.head_sha !== sha ||
    String(run.id) !== runId ||
    run.path !== ".github/workflows/ci.yml"
  )
    throw Error("ineligible CI run");
  for (const name of ["", "identity.json", "manifest.json", "edge.js", "out"])
    if ((await lstat(path.join(bundle, name))).isSymbolicLink())
      throw Error("release symlink");
  if (!/^[a-f0-9]{64}$/.test(expectedEdgeHash ?? ""))
    throw Error("reviewed edge hash required");
  const identity = JSON.parse(
    await readFile(path.join(bundle, "identity.json"), "utf8"),
  );
  if (
    identity.repository !== "r-senchuk/uaroots" ||
    identity.sourceSha !== sha ||
    identity.runId !== runId ||
    identity.releaseSha256 !== expectedHash ||
    identity.edgeSha256 !== expectedEdgeHash ||
    identity.event !== "push" ||
    identity.ref !== "refs/heads/main"
  )
    throw Error("release identity mismatch");
  const manifest = JSON.parse(
    await readFile(path.join(bundle, "manifest.json"), "utf8"),
  );
  const actual = await createManifest(path.join(bundle, "out"));
  if (
    manifest.releaseSha256 !== expectedHash ||
    actual.releaseSha256 !== expectedHash ||
    json(manifest) !== json(actual) ||
    hash(await readFile(path.join(bundle, "edge.js"))) !== identity.edgeSha256
  )
    throw Error("release bytes mismatch");
  return identity;
}
async function main() {
  const [command, ...args] = process.argv.slice(2);
  const o = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!args[i].startsWith("--") || !args[i + 1])
      throw Error("expected --key value");
    o[args[i].slice(2)] = args[i + 1];
  }
  if (command === "pack") console.log(json(await pack(o)));
  else if (command === "verify") {
    o.run = JSON.parse(await readFile(o.run, "utf8"));
    console.log(json(await verify(o)));
  } else throw Error("use pack or verify");
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
