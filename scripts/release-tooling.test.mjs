import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm, cp } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { pack, verify as verifyRelease } from "./release-bundle.mjs";
import { capture, verify, rehearse, restorePlan } from "./recovery-tool.mjs";
const sha = "a".repeat(40);
test("candidate promotion verifies authenticated run identity and immutable bytes", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "release-test-"));
  try {
    await mkdir(path.join(root, "out/_next/static"), { recursive: true });
    await writeFile(path.join(root, "out/index.html"), "HTML");
    await writeFile(
      path.join(root, "out/_next/static/.hidden"),
      "hidden asset",
    );
    await writeFile(path.join(root, "edge.js"), "edge");
    const bundle = path.join(root, "bundle");
    const id = await pack({
      out: path.join(root, "out"),
      edge: path.join(root, "edge.js"),
      to: bundle,
      sha,
      runId: "123",
      repository: "r-senchuk/uaroots",
    });
    const run = {
      repository: { full_name: "r-senchuk/uaroots" },
      event: "push",
      head_branch: "main",
      status: "completed",
      conclusion: "success",
      head_sha: sha,
      id: 123,
      path: ".github/workflows/ci.yml",
    };
    const opts = {
      bundle,
      sha,
      runId: "123",
      expectedHash: id.releaseSha256,
      expectedEdgeHash: id.edgeSha256,
      run,
    };
    assert.equal((await verifyRelease(opts)).sourceSha, sha);
    for (const patch of [
      { event: "pull_request" },
      { head_branch: "feature" },
      { conclusion: "failure" },
      { id: 124 },
      { head_sha: "b".repeat(40) },
      { repository: { full_name: "other/repo" } },
    ])
      await assert.rejects(
        verifyRelease({ ...opts, run: { ...run, ...patch } }),
        /ineligible/,
      );
    await assert.rejects(
      verifyRelease({ ...opts, expectedHash: "0".repeat(64) }),
      /mismatch/,
    );
    await writeFile(path.join(bundle, "edge.js"), "tampered");
    await assert.rejects(verifyRelease(opts), /bytes mismatch/);
    await writeFile(path.join(bundle, "edge.js"), "edge");
    await writeFile(path.join(bundle, "out/index.html"), "changed");
    await assert.rejects(verifyRelease(opts), /bytes mismatch/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
const arn = "arn:aws:cloudfront::863809951348:function/seo";
function fakeAws({ drift = false } = {}) {
  let lists = 0;
  return async (args) => {
    if (args[0] === "sts") return { Account: "863809951348" };
    if (args[1] === "list-objects-v2") {
      lists++;
      return {
        Contents: [
          { Key: "about", Size: 1, ETag: "a" },
          {
            Key: "about/index.html",
            Size: 1,
            ETag: drift && lists > 1 ? "changed" : "b",
          },
        ],
      };
    }
    if (args[1] === "get-object") {
      const key = args[args.indexOf("--key") + 1];
      await writeFile(args.at(-1), "x");
      return {
        ContentLength: 1,
        ETag: key === "about" ? "a" : "b",
        ContentType: "text/html",
        CacheControl: "no-cache",
        Metadata: {},
      };
    }
    if (args[1] === "get-distribution-config")
      return {
        ETag: "config",
        DistributionConfig: {
          Origins: {
            Items: [
              {
                DomainName: "uaroute.com.s3-website.eu-central-1.amazonaws.com",
              },
            ],
          },
          DefaultCacheBehavior: {
            FunctionAssociations: {
              Items: [{ FunctionARN: arn, EventType: "viewer-request" }],
            },
          },
        },
      };
    if (args[1] === "describe-function")
      return {
        ETag: "live",
        FunctionSummary: {
          FunctionConfig: { Runtime: "cloudfront-js-2.0", Comment: "seo" },
          FunctionMetadata: { FunctionARN: arn, Stage: "LIVE" },
        },
      };
    if (args[1] === "get-function") {
      await writeFile(args.at(-1), "function handler(){}");
      return { ETag: "live" };
    }
    throw Error("unexpected AWS operation");
  };
}
test("recovery captures colliding keys, metadata and LIVE function; verifies retrieved copy and rehearses locally", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "recovery-test-"));
  try {
    const target = {
      bucket: "uaroute.com",
      distribution: "E3L95CZFIU6533",
      account: "863809951348",
    };
    const bundle = path.join(root, "capture");
    const m = await capture({ to: bundle, ...target }, fakeAws());
    assert.notEqual(m.objects[0].path, m.objects[1].path);
    assert.equal(m.objects[0].metadata.ContentType, "text/html");
    assert.equal(m.functions.length, 1);
    const retrieved = path.join(root, "retrieved");
    await cp(bundle, retrieved, { recursive: true });
    const opts = { bundle: retrieved, expectedHash: m.bundleSha256, ...target };
    assert.equal((await verify(opts)).objects.length, 2);
    const plan = await restorePlan(opts);
    assert.equal(plan.objects[0].metadata.ContentType, "text/html");
    assert.equal(plan.objects[0].key, "about");
    assert.equal(plan.mode, "review-only; no AWS writes");
    assert.equal(
      (await rehearse({ ...opts, to: path.join(root, "rehearsal") })).objects,
      2,
    );
    await assert.rejects(
      verify({ ...opts, bucket: "other" }),
      /target mismatch/,
    );
    await assert.rejects(
      verify({ ...opts, expectedHash: "0".repeat(64) }),
      /identity mismatch/,
    );
    await writeFile(path.join(retrieved, m.functions[0].code.path), "bad");
    await assert.rejects(verify(opts), /checksum/);
    await cp(bundle, retrieved, { recursive: true });
    await rm(path.join(retrieved, m.objects[0].path));
    await assert.rejects(verify(opts));
    await assert.rejects(
      capture(
        { to: path.join(root, "drift"), ...target },
        fakeAws({ drift: true }),
      ),
      /drift/,
    );
    await assert.rejects(
      capture(
        { to: path.join(root, "wrong"), ...target, account: "other" },
        fakeAws(),
      ),
      /target/,
    );
    assert.equal(
      JSON.parse(
        await readFile(path.join(bundle, "recovery-manifest.json"), "utf8"),
      ).bundleSha256,
      m.bundleSha256,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
