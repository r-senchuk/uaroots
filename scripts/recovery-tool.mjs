import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  mkdir,
  readFile,
  readdir,
  writeFile,
  cp,
  lstat,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const exec = promisify(execFile),
  hash = (b) => createHash("sha256").update(b).digest("hex"),
  json = (v) => `${JSON.stringify(v, null, 2)}\n`;
export const aws = async (args) =>
  JSON.parse(
    (
      await exec("aws", [...args, "--output", "json"], {
        maxBuffer: 20 * 1024 * 1024,
      })
    ).stdout,
  );
const inventory = (d) =>
  (d.Contents ?? [])
    .map((x) => ({ key: x.Key, size: x.Size, etag: x.ETag }))
    .sort((a, b) => a.key.localeCompare(b.key));
export async function capture(
  { to, bucket, distribution, account },
  call = aws,
) {
  if (
    bucket !== "uaroute.com" ||
    distribution !== "E3L95CZFIU6533" ||
    account !== "863809951348"
  )
    throw Error("unexpected production target");
  if ((await call(["sts", "get-caller-identity"])).Account !== account)
    throw Error("AWS account mismatch");
  await mkdir(to, { recursive: true });
  if ((await readdir(to)).length)
    throw Error("capture destination must be empty");
  const before = inventory(
    await call(["s3api", "list-objects-v2", "--bucket", bucket]),
  );
  if (!before.length) throw Error("empty inventory");
  await mkdir(path.join(to, "objects"));
  const config = await call([
    "cloudfront",
    "get-distribution-config",
    "--id",
    distribution,
  ]);
  if (
    !config.DistributionConfig.Origins.Items.some((o) =>
      o.DomainName.startsWith(`${bucket}.s3`),
    )
  )
    throw Error("origin mismatch");
  const files = [];
  async function put(name, bytes) {
    await mkdir(path.dirname(path.join(to, name)), { recursive: true });
    await writeFile(path.join(to, name), bytes);
    return { path: name, size: bytes.length, sha256: hash(bytes) };
  }
  for (const obj of before) {
    const name = `objects/${hash(obj.key)}`;
    const meta = await call([
      "s3api",
      "get-object",
      "--bucket",
      bucket,
      "--key",
      obj.key,
      path.join(to, name),
    ]);
    const bytes = await readFile(path.join(to, name));
    if (bytes.length !== obj.size || meta.ETag !== obj.etag)
      throw Error("object changed during capture");
    files.push({ ...obj, path: name, sha256: hash(bytes), metadata: meta });
  }
  const configFile = await put(
    "cloudfront/distribution.json",
    Buffer.from(json(config)),
  );
  const functions = [];
  const associations = [
    config.DistributionConfig.DefaultCacheBehavior,
    ...(config.DistributionConfig.CacheBehaviors?.Items ?? []),
  ].flatMap((b) => b.FunctionAssociations?.Items ?? []);
  for (const arn of [...new Set(associations.map((a) => a.FunctionARN))]) {
    const name = arn.split("/").at(-1);
    const desc = await call([
      "cloudfront",
      "describe-function",
      "--name",
      name,
      "--stage",
      "LIVE",
    ]);
    const codePath = `cloudfront/${name}.js`;
    const get = await call([
      "cloudfront",
      "get-function",
      "--name",
      name,
      "--stage",
      "LIVE",
      path.join(to, codePath),
    ]);
    if (get.ETag !== desc.ETag) throw Error("function changed during capture");
    functions.push({
      arn,
      testEvent: await put(
        `cloudfront/${name}-test.json`,
        Buffer.from(
          json({
            version: "1.0",
            context: { eventType: "viewer-request" },
            viewer: { ip: "192.0.2.1" },
            request: {
              method: "GET",
              uri: "/contacts",
              querystring: { utm_source: { value: "uaroute" } },
              headers: { host: { value: "uaroute.com" } },
              cookies: {},
            },
          }),
        ),
      ),
      description: await put(
        `cloudfront/${name}.json`,
        Buffer.from(json(desc)),
      ),
      code: await put(codePath, await readFile(path.join(to, codePath))),
    });
  }
  if (
    json(before) !==
      json(
        inventory(await call(["s3api", "list-objects-v2", "--bucket", bucket])),
      ) ||
    json(config) !==
      json(
        await call([
          "cloudfront",
          "get-distribution-config",
          "--id",
          distribution,
        ]),
      )
  )
    throw Error("capture drift");
  for (const f of functions) {
    const d = JSON.parse(
      await readFile(path.join(to, f.description.path), "utf8"),
    );
    if (
      (
        await call([
          "cloudfront",
          "describe-function",
          "--name",
          f.arn.split("/").at(-1),
          "--stage",
          "LIVE",
        ])
      ).ETag !== d.ETag
    )
      throw Error("function drift");
  }
  const core = {
    schemaVersion: 2,
    target: { bucket, distribution, account },
    objects: files,
    config: configFile,
    functions,
  };
  const manifest = { ...core, bundleSha256: hash(json(core)) };
  await writeFile(path.join(to, "recovery-manifest.json"), json(manifest));
  return manifest;
}
export async function verify({
  bundle,
  expectedHash,
  bucket,
  distribution,
  account,
}) {
  const m = JSON.parse(
    await readFile(path.join(bundle, "recovery-manifest.json"), "utf8"),
  );
  const { bundleSha256, ...core } = m;
  if (
    m.schemaVersion !== 2 ||
    bundleSha256 !== expectedHash ||
    hash(json(core)) !== expectedHash
  )
    throw Error("recovery identity mismatch");
  if (json(m.target) !== json({ bucket, distribution, account }))
    throw Error("recovery target mismatch");
  if (!Array.isArray(m.objects) || !m.objects.length)
    throw Error("empty recovery");
  const keys = new Set(),
    paths = new Set();
  const all = [
    ...m.objects,
    m.config,
    ...m.functions.flatMap((f) => [f.description, f.code, f.testEvent]),
  ];
  for (const e of all) {
    if (
      !/^(objects\/[a-f0-9]{64}|cloudfront\/[A-Za-z0-9_.-]+)$/.test(e.path) ||
      paths.has(e.path)
    )
      throw Error("unsafe or duplicate recovery path");
    paths.add(e.path);
    for (const dir of [
      bundle,
      path.join(bundle, e.path.split("/")[0]),
      path.join(bundle, e.path),
    ])
      if ((await lstat(dir)).isSymbolicLink()) throw Error("recovery symlink");
    const bytes = await readFile(path.join(bundle, e.path));
    if (bytes.length !== e.size || hash(bytes) !== e.sha256)
      throw Error("recovery checksum mismatch");
  }
  for (const e of m.objects) {
    if (
      keys.has(e.key) ||
      e.path !== `objects/${hash(e.key)}` ||
      !e.metadata ||
      e.metadata.ETag !== e.etag ||
      e.metadata.ContentLength !== e.size
    )
      throw Error("recovery inventory metadata mismatch");
    keys.add(e.key);
  }
  for (const dir of ["objects", "cloudfront"])
    for (const name of await readdir(path.join(bundle, dir)))
      if (!paths.has(`${dir}/${name}`)) throw Error("unlisted recovery object");
  const config = JSON.parse(
    await readFile(path.join(bundle, m.config.path), "utf8"),
  );
  if (
    !config.ETag ||
    !config.DistributionConfig.Origins.Items.some((o) =>
      o.DomainName.startsWith(`${bucket}.s3`),
    )
  )
    throw Error("invalid recovery config");
  const arns = [
    ...new Set(
      [
        config.DistributionConfig.DefaultCacheBehavior,
        ...(config.DistributionConfig.CacheBehaviors?.Items ?? []),
      ]
        .flatMap((b) => b.FunctionAssociations?.Items ?? [])
        .map((a) => a.FunctionARN),
    ),
  ].sort();
  if (json(arns) !== json(m.functions.map((f) => f.arn).sort()))
    throw Error("incomplete function recovery");
  for (const f of m.functions) {
    const d = JSON.parse(
      await readFile(path.join(bundle, f.description.path), "utf8"),
    );
    if (
      d.FunctionSummary?.FunctionMetadata?.FunctionARN !== f.arn ||
      d.FunctionSummary?.FunctionMetadata?.Stage !== "LIVE" ||
      !d.ETag
    )
      throw Error("invalid LIVE function capture");
  }
  return m;
}
export async function restorePlan(options) {
  const m = await verify(options);
  return {
    mode: "review-only; no AWS writes",
    target: m.target,
    bundleSha256: m.bundleSha256,
    objects: m.objects.map((e) => ({
      operation: "s3api put-object",
      key: e.key,
      body: path.join(options.bundle, e.path),
      metadata: Object.fromEntries(
        [
          "ContentType",
          "CacheControl",
          "ContentEncoding",
          "ContentDisposition",
          "ContentLanguage",
          "Expires",
          "Metadata",
          "WebsiteRedirectLocation",
        ]
          .filter((k) => e.metadata[k] !== undefined)
          .map((k) => [k, e.metadata[k]]),
      ),
    })),
    edge: {
      config: m.config,
      functions: m.functions,
      requires:
        "Fresh ETags; test DEVELOPMENT then publish captured LIVE code; inspect all associations before restore",
    },
    finish: [
      "restore distribution config with fresh ETag",
      "wait distribution Deployed",
      "create invalidation and wait Completed",
      "verify prior live contract/HTTP bytes",
    ],
  };
}
export async function rehearse(options) {
  const m = await verify(options);
  await mkdir(options.to, { recursive: true });
  if ((await readdir(options.to)).length)
    throw Error("rehearsal destination must be empty");
  await cp(options.bundle, options.to, { recursive: true });
  await verify({ ...options, bundle: options.to });
  return {
    bundleSha256: m.bundleSha256,
    objects: m.objects.length,
    mode: "local copy/hash rehearsal; no production restore or remote retrieval proof",
  };
}
async function main() {
  const [command, ...args] = process.argv.slice(2);
  const o = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!args[i].startsWith("--") || !args[i + 1])
      throw Error("expected --key value");
    o[args[i].slice(2)] = args[i + 1];
  }
  if (command === "capture") console.log(json(await capture(o)));
  else if (command === "verify") console.log(json(await verify(o)));
  else if (command === "restore-plan") console.log(json(await restorePlan(o)));
  else if (command === "rehearse") console.log(json(await rehearse(o)));
  else throw Error("use capture, verify or rehearse");
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
