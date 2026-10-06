import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createManifest, createReleasePlan, createReleaseSnapshot, verifyRecoveryBundle } from './seo-release.mjs';

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const canonical = (value) => `${JSON.stringify(value, null, 2)}\n`;

async function put(root, relative, content) {
  const absolute = path.join(root, relative);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, content);
  return { path: relative, size: Buffer.byteLength(content), sha256: sha256(content) };
}

async function recoveryFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'uaroute-recovery-'));
  const files = [
    await put(root, 'artifact/index.html', '<html><script src="/_next/static/chunks/app.js"></script></html>'),
    await put(root, 'artifact/index.txt', 'root RSC payload'),
    await put(root, 'artifact/routes/index.txt', 'RSC payload'),
    await put(root, 'artifact/_next/static/chunks/app.js', 'hashed chunk'),
  ];
  const config = {
    Origins: { Items: [{ DomainName: 'uaroute.com.s3.eu-central-1.amazonaws.com' }] },
    DefaultCacheBehavior: { FunctionAssociations: { Items: [{ EventType: 'viewer-request', FunctionARN: 'arn:aws:cloudfront::123456789012:function/seo' }] } },
  };
  const distributionConfig = await put(root, 'cloudfront/distribution-config.json', JSON.stringify(config));
  const functionFile = await put(root, 'cloudfront/seo-function.js', 'function handler(event) { return event.request; }');
  const functionConfig = await put(root, 'cloudfront/function-config.json', JSON.stringify({ Comment: 'captured', Runtime: 'cloudfront-js-2.0' }));
  const testEvent = await put(root, 'cloudfront/test-event.json', JSON.stringify({ Records: [{ cf: { request: { method: 'GET', uri: '/' } } }] }));
  const artifactCore = { schemaVersion: 1, files };
  const recovery = {
    schemaVersion: 1,
    target: { bucket: 'uaroute.com', distributionId: 'E3L95CZFIU6533' },
    artifact: { ...artifactCore, releaseSha256: sha256(canonical(artifactCore)) },
    cloudFront: {
      distributionConfigVersion: 'ETAG-12',
      distributionConfig,
      function: { ...functionFile, config: functionConfig, testEvent, stage: 'LIVE', etag: 'ETAG-FUNCTION-7', arn: 'arn:aws:cloudfront::123456789012:function/seo' },
      documentAssociations: [{ behavior: 'default', eventType: 'viewer-request', functionArn: 'arn:aws:cloudfront::123456789012:function/seo' }],
    },
    verification: { retrievalVerified: true, checksumsVerified: true, retrievedAt: '2026-10-07T12:00:00Z' },
  };
  await writeFile(path.join(root, 'recovery-manifest.json'), canonical(recovery));
  return { root, recovery };
}

test('release manifest fingerprints the complete export and plan retains old objects', async () => {
  const out = await mkdtemp(path.join(os.tmpdir(), 'uaroute-export-'));
  try {
    await put(out, 'index.html', '<html>current</html>');
    await put(out, '_next/static/chunks/new.js', 'new hashed chunk');
    await put(out, 'about/__next.about.txt', 'current RSC');
    const manifest = await createManifest(out);
    assert.match(manifest.releaseSha256, /^[a-f0-9]{64}$/);
    assert.equal(manifest.files.length, 3);
    const plan = createReleasePlan(manifest);
    assert.deepEqual(plan.deletionCommands, []);
    assert.ok(plan.retain.some((entry) => entry.includes('hashed chunks')));
    assert.ok(plan.retain.some((entry) => entry.includes('legacy')));
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});

test('verified recovery source accepts complete matching artifact and versioned edge config', async () => {
  const fixture = await recoveryFixture();
  try {
    const verified = await verifyRecoveryBundle(fixture.root);
    assert.equal(verified.artifactFiles, 4);
    assert.equal(verified.distributionConfigVersion, 'ETAG-12');
    assert.equal(verified.functionVersion, 'LIVE ETag ETAG-FUNCTION-7');
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('recovery gate fails closed for missing prerequisites, tampering, and incomplete manifests', async () => {
  const fixture = await recoveryFixture();
  try {
    const recoveryPath = path.join(fixture.root, 'recovery-manifest.json');
    const original = await readFile(recoveryPath, 'utf8');
    const recovery = JSON.parse(original);

    await writeFile(recoveryPath, canonical({ ...recovery, verification: { retrievalVerified: false, checksumsVerified: true, retrievedAt: 'now' } }));
    await assert.rejects(verifyRecoveryBundle(fixture.root), /verified retrieval/);

    await writeFile(recoveryPath, original);
    await writeFile(path.join(fixture.root, 'artifact/index.html'), 'tampered');
    await assert.rejects(verifyRecoveryBundle(fixture.root), /hash mismatch/);

    await writeFile(path.join(fixture.root, 'artifact/index.html'), '<html><script src="/_next/static/chunks/app.js"></script></html>');
    const missingIndex = { ...recovery, artifact: { ...recovery.artifact, files: recovery.artifact.files.filter((file) => file.path !== 'artifact/index.html') } };
    await writeFile(recoveryPath, canonical(missingIndex));
    await assert.rejects(verifyRecoveryBundle(fixture.root), /complete artifact directory/);

    const missingRsc = { ...recovery, artifact: { ...recovery.artifact, files: recovery.artifact.files.filter((file) => file.path !== 'artifact/index.txt') } };
    await writeFile(recoveryPath, canonical(missingRsc));
    await assert.rejects(verifyRecoveryBundle(fixture.root), /complete artifact directory/);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('release snapshot copies only the reviewed manifest bytes and rejects later export changes', async () => {
  const out = await mkdtemp(path.join(os.tmpdir(), 'uaroute-source-'));
  const temp = await mkdtemp(path.join(os.tmpdir(), 'uaroute-snapshot-test-'));
  try {
    await put(out, 'index.html', '<html>frozen</html>');
    await put(out, '_next/static/chunks/app.js', 'frozen chunk');
    const manifest = await createManifest(out);
    const manifestPath = path.join(temp, 'reviewed.json');
    const snapshotPath = path.join(temp, 'snapshot');
    await writeFile(manifestPath, canonical(manifest));
    const result = await createReleaseSnapshot(out, manifestPath, snapshotPath);
    assert.equal(result.releaseSha256, manifest.releaseSha256);
    assert.equal(await readFile(path.join(snapshotPath, 'index.html'), 'utf8'), '<html>frozen</html>');
    await writeFile(path.join(out, 'index.html'), '<html>changed after review</html>');
    await assert.rejects(createReleaseSnapshot(out, manifestPath, path.join(temp, 'changed-snapshot')), /does not match current export/);
  } finally {
    await rm(out, { recursive: true, force: true });
    await rm(temp, { recursive: true, force: true });
  }
});

test('recovery gate rejects wrong bucket origin and unsafe artifact paths', async () => {
  const fixture = await recoveryFixture();
  try {
    const recoveryPath = path.join(fixture.root, 'recovery-manifest.json');
    const configPath = path.join(fixture.root, fixture.recovery.cloudFront.distributionConfig.path);
    const config = JSON.parse(await readFile(configPath, 'utf8'));
    config.Origins.Items[0].DomainName = 'other-bucket.s3.amazonaws.com';
    await writeFile(configPath, JSON.stringify(config));
    fixture.recovery.cloudFront.distributionConfig.sha256 = sha256(JSON.stringify(config));
    fixture.recovery.cloudFront.distributionConfig.size = Buffer.byteLength(JSON.stringify(config));
    await writeFile(recoveryPath, canonical(fixture.recovery));
    await assert.rejects(verifyRecoveryBundle(fixture.root), /target bucket origin/);

    fixture.recovery.artifact.files[0].path = '../outside.html';
    await writeFile(recoveryPath, canonical(fixture.recovery));
    await assert.rejects(verifyRecoveryBundle(fixture.root), /escapes its bundle/);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('recovery gate requires the exact document viewer-request association', async () => {
  const fixture = await recoveryFixture();
  try {
    const configPath = path.join(fixture.root, fixture.recovery.cloudFront.distributionConfig.path);
    const config = JSON.parse(await readFile(configPath, 'utf8'));
    config.DefaultCacheBehavior.FunctionAssociations.Items[0].EventType = 'viewer-response';
    const bytes = JSON.stringify(config);
    await writeFile(configPath, bytes);
    fixture.recovery.cloudFront.distributionConfig.sha256 = sha256(bytes);
    fixture.recovery.cloudFront.distributionConfig.size = Buffer.byteLength(bytes);
    await writeFile(path.join(fixture.root, 'recovery-manifest.json'), canonical(fixture.recovery));
    await assert.rejects(verifyRecoveryBundle(fixture.root), /missing expected viewer-request association/);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});
