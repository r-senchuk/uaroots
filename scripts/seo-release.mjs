#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { cp, lstat, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const canonical = (value) => `${JSON.stringify(value, null, 2)}\n`;

async function walkFiles(root, current = root) {
  const items = await readdir(current, { withFileTypes: true });
  const files = [];
  for (const item of items) {
    const absolute = path.join(current, item.name);
    if (item.isDirectory()) files.push(...await walkFiles(root, absolute));
    else if (item.isFile() && item.name !== '.DS_Store') files.push(absolute);
    else if (!item.isDirectory() && !item.isFile()) throw new Error(`unsupported export entry: ${absolute}`);
  }
  return files;
}

export async function createManifest(outDir) {
  const root = path.resolve(outDir);
  const rootStat = await stat(root);
  if (!rootStat.isDirectory()) throw new Error(`export path is not a directory: ${root}`);
  const paths = (await walkFiles(root)).map((file) => path.relative(root, file).split(path.sep).join('/')).sort();
  if (!paths.includes('index.html')) throw new Error('export is missing index.html');
  if (!paths.some((file) => file.startsWith('_next/static/'))) throw new Error('export is missing _next/static assets');
  const files = await Promise.all(paths.map(async (relativePath) => {
    const absolute = path.join(root, ...relativePath.split('/'));
    const bytes = await readFile(absolute);
    return { path: relativePath, size: bytes.length, sha256: sha256(bytes) };
  }));
  const manifest = { schemaVersion: 1, files };
  return { ...manifest, releaseSha256: sha256(canonical(manifest)) };
}

export function createReleasePlan(manifest) {
  return {
    releaseSha256: manifest.releaseSha256,
    files: manifest.files.length,
    uploadOrder: ['/_next/static/**', 'remaining export files', '*.html content-type repair', 'CloudFront /* invalidation'],
    retain: ['existing /_next/static hashed chunks', 'unrelated and legacy S3 keys'],
    deletionCommands: [],
  };
}

export async function createReleaseSnapshot(outDir, manifestPath, snapshotDir) {
  const root = path.resolve(outDir);
  const destination = path.resolve(snapshotDir);
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const expectedFingerprint = sha256(canonical({ schemaVersion: manifest.schemaVersion, files: manifest.files }));
  if (manifest.schemaVersion !== 1 || manifest.releaseSha256 !== expectedFingerprint) throw new Error('release manifest fingerprint mismatch');
  const actual = await createManifest(root);
  if (actual.releaseSha256 !== manifest.releaseSha256) throw new Error('reviewed release manifest does not match current export');
  await mkdir(destination, { recursive: true });
  if ((await readdir(destination)).length > 0) throw new Error(`snapshot destination must be empty: ${destination}`);
  for (const entry of manifest.files) {
    const relativePath = safeRelativePath(entry.path, 'release manifest file.path');
    const source = path.join(root, ...relativePath.split('/'));
    const target = path.join(destination, ...relativePath.split('/'));
    const sourceBytes = await readFile(source);
    if (sha256(sourceBytes) !== entry.sha256 || sourceBytes.length !== entry.size) throw new Error(`source changed during snapshot: ${relativePath}`);
    await mkdir(path.dirname(target), { recursive: true });
    await cp(source, target, { errorOnExist: true, force: false });
    const snapshotBytes = await readFile(target);
    if (sha256(snapshotBytes) !== entry.sha256 || snapshotBytes.length !== entry.size) throw new Error(`snapshot hash mismatch: ${relativePath}`);
  }
  return { releaseSha256: manifest.releaseSha256, files: manifest.files.length, snapshotDir: destination };
}

function safeRelativePath(value, label) {
  if (typeof value !== 'string' || value.length === 0 || path.isAbsolute(value)) throw new Error(`${label} must be a relative file path`);
  const normalized = path.posix.normalize(value.replaceAll('\\', '/'));
  if (normalized === '..' || normalized.startsWith('../') || normalized.startsWith('/')) throw new Error(`${label} escapes its bundle`);
  return normalized;
}

async function verifyFile(bundleRoot, entry, label) {
  if (!entry || typeof entry !== 'object') throw new Error(`${label} is missing`);
  const relativePath = safeRelativePath(entry.path, `${label}.path`);
  if (!/^[a-f0-9]{64}$/.test(entry.sha256 ?? '')) throw new Error(`${label}.sha256 must be a SHA-256 digest`);
  const absolutePath = path.join(bundleRoot, ...relativePath.split('/'));
  let current = bundleRoot;
  for (const component of relativePath.split('/')) {
    current = path.join(current, component);
    const componentStat = await lstat(current);
    if (componentStat.isSymbolicLink()) throw new Error(`${label} contains a symbolic link: ${relativePath}`);
  }
  const bytes = await readFile(absolutePath);
  const digest = sha256(bytes);
  if (digest !== entry.sha256) throw new Error(`${label} hash mismatch: ${relativePath}`);
  if (entry.size !== undefined && entry.size !== bytes.length) throw new Error(`${label} size mismatch: ${relativePath}`);
  return { path: relativePath, size: bytes.length, sha256: digest };
}

function matchesS3Origin(domainName, bucket) {
  const escaped = bucket.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}\\.s3(?:\\.dualstack)?(?:\\.[a-z0-9-]+|-website-[a-z0-9-]+)?\\.amazonaws\\.com$`).test(domainName ?? '');
}

export async function verifyRecoveryBundle(bundleDir) {
  const root = path.resolve(bundleDir);
  const manifestPath = path.join(root, 'recovery-manifest.json');
  const recovery = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (recovery.schemaVersion !== 1) throw new Error('recovery manifest schemaVersion must be 1');
  const artifact = recovery.artifact;
  if (!artifact || !Array.isArray(artifact.files) || artifact.files.length === 0) throw new Error('recovery artifact must list HTML/RSC/assets files');
  const artifactPaths = new Set();
  for (const entry of artifact.files) {
    const relative = safeRelativePath(entry?.path, 'recovery artifact file.path');
    if (!relative.startsWith('artifact/')) throw new Error(`recovery artifact file must be under artifact/: ${relative}`);
    if (artifactPaths.has(relative)) throw new Error(`duplicate recovery artifact path: ${relative}`);
    const verified = await verifyFile(root, entry, 'recovery artifact file');
    artifactPaths.add(verified.path);
  }
  const actualArtifactPaths = (await walkFiles(path.join(root, 'artifact')))
    .map((file) => path.relative(root, file).split(path.sep).join('/')).sort();
  const listedArtifactPaths = [...artifactPaths].sort();
  if (JSON.stringify(actualArtifactPaths) !== JSON.stringify(listedArtifactPaths)) {
    throw new Error('recovery artifact manifest does not cover the complete artifact directory');
  }
  if (!artifactPaths.has('artifact/index.html')) throw new Error('recovery artifact is missing artifact/index.html');
  if (![...artifactPaths].some((file) => file.endsWith('.txt'))) throw new Error('recovery artifact has no RSC .txt payload');
  if (![...artifactPaths].some((file) => file.startsWith('artifact/_next/static/'))) throw new Error('recovery artifact has no hashed Next assets');
  for (const htmlPath of [...artifactPaths].filter((file) => file.endsWith('/index.html') || file === 'artifact/index.html')) {
    const directory = path.posix.dirname(htmlPath);
    const rscPath = `${directory === '.' ? '' : `${directory}/`}index.txt`;
    if (!artifactPaths.has(rscPath)) throw new Error(`recovery artifact is missing matching RSC payload for ${htmlPath}`);
    const html = await readFile(path.join(root, ...htmlPath.split('/')), 'utf8');
    for (const match of html.matchAll(/(?:src|href)=["'](\/_next\/static\/[^"']+)["']/g)) {
      const assetPath = `artifact${match[1]}`;
      if (!artifactPaths.has(assetPath)) throw new Error(`recovery artifact is missing HTML-referenced asset ${assetPath}`);
    }
  }
  const artifactFingerprint = sha256(canonical({ schemaVersion: 1, files: artifact.files }));
  if (artifact.releaseSha256 !== artifactFingerprint) throw new Error('recovery artifact manifest fingerprint mismatch');

  const cloudFront = recovery.cloudFront;
  if (!cloudFront || typeof cloudFront.distributionConfigVersion !== 'string' || !cloudFront.distributionConfigVersion.trim()) {
    throw new Error('recovery manifest needs cloudFront.distributionConfigVersion');
  }
  if (!cloudFront.function || !/^arn:aws:cloudfront::\d{12}:function\/[A-Za-z0-9_-]+$/.test(cloudFront.function.arn ?? '')) {
    throw new Error('recovery manifest needs a valid unqualified CloudFront function ARN');
  }
  if (cloudFront.function.stage !== 'LIVE' || typeof cloudFront.function.etag !== 'string' || !cloudFront.function.etag.trim()) {
    throw new Error('recovery manifest needs the captured LIVE function stage and ETag');
  }
  const config = await verifyFile(root, cloudFront.distributionConfig, 'CloudFront distribution config');
  const functionCode = await verifyFile(root, cloudFront.function, 'CloudFront function code');
  const functionConfig = await verifyFile(root, cloudFront.function.config, 'CloudFront function config');
  const testEvent = await verifyFile(root, cloudFront.function.testEvent, 'CloudFront function test event');
  const configData = JSON.parse(await readFile(path.join(root, ...config.path.split('/')), 'utf8'));
  if (!Array.isArray(configData.Origins?.Items) || !configData.Origins.Items.some((origin) => matchesS3Origin(origin.DomainName, recovery.target?.bucket ?? ''))) {
    throw new Error('CloudFront config does not contain the declared target bucket origin');
  }
  const functionConfigData = JSON.parse(await readFile(path.join(root, ...functionConfig.path.split('/')), 'utf8'));
  if (typeof functionConfigData.Comment !== 'string' || !['cloudfront-js-1.0', 'cloudfront-js-2.0'].includes(functionConfigData.Runtime)) {
    throw new Error('CloudFront function config must preserve its Comment and supported Runtime');
  }
  JSON.parse(await readFile(path.join(root, ...testEvent.path.split('/')), 'utf8'));
  if (typeof cloudFront.function.arn !== 'string' || !cloudFront.function.arn.trim()) throw new Error('CloudFront function ARN is required');
  if (!Array.isArray(cloudFront.documentAssociations) || cloudFront.documentAssociations.length === 0) {
    throw new Error('recovery manifest must list document viewer-request function associations');
  }
  for (const expected of cloudFront.documentAssociations) {
    if (expected.eventType !== 'viewer-request' || expected.functionArn !== cloudFront.function.arn) {
      throw new Error('recovery document associations must name the declared viewer-request function version');
    }
    let behavior;
    if (expected.behavior === 'default') behavior = configData.DefaultCacheBehavior;
    else behavior = (configData.CacheBehaviors?.Items ?? []).find((entry) => entry.PathPattern === expected.behavior);
    const found = behavior?.FunctionAssociations?.Items?.some((association) =>
      association.EventType === expected.eventType && association.FunctionARN === expected.functionArn);
    if (!found) throw new Error(`CloudFront config is missing expected viewer-request association on ${expected.behavior}`);
  }
  if (typeof recovery.target?.bucket !== 'string' || !recovery.target.bucket.trim() || typeof recovery.target?.distributionId !== 'string' || !recovery.target.distributionId.trim()) {
    throw new Error('recovery manifest must identify its target bucket and distribution');
  }

  if (recovery.verification?.retrievalVerified !== true || recovery.verification?.checksumsVerified !== true) {
    throw new Error('recovery bundle must record verified retrieval and checksum comparison');
  }
  if (typeof recovery.verification.retrievedAt !== 'string' || !recovery.verification.retrievedAt.trim()) {
    throw new Error('recovery bundle must record retrieval time');
  }

  return {
    artifactFiles: artifact.files.length,
    distributionConfigVersion: cloudFront.distributionConfigVersion,
    functionVersion: `LIVE ETag ${cloudFront.function.etag}`,
    verifiedHashes: artifact.files.length + 4,
    config,
    functionCode,
  };
}

function argsToObject(args) {
  const values = {};
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    if (!key.startsWith('--') || !args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`expected ${key} VALUE`);
    values[key.slice(2)] = args[index + 1];
    index += 1;
  }
  return values;
}

async function main() {
  const [, , command, ...rawArgs] = process.argv;
  const options = argsToObject(rawArgs);
  if (command === 'manifest') {
    const manifest = await createManifest(options.out);
    await writeFile(options.write, canonical(manifest));
    console.log(`releaseSha256=${manifest.releaseSha256} files=${manifest.files.length} manifest=${options.write}`);
    return;
  }
  if (command === 'plan') {
    const manifest = JSON.parse(await readFile(options.manifest, 'utf8'));
    const computed = sha256(canonical({ schemaVersion: manifest.schemaVersion, files: manifest.files }));
    if (computed !== manifest.releaseSha256) throw new Error('release manifest fingerprint mismatch');
    const actual = await createManifest(options.out);
    if (actual.releaseSha256 !== manifest.releaseSha256) throw new Error('release manifest does not match current export');
    console.log(canonical(createReleasePlan(actual)));
    return;
  }
  if (command === 'snapshot') {
    const result = await createReleaseSnapshot(options.out, options.manifest, options.to);
    console.log(`release snapshot frozen: ${result.releaseSha256} files=${result.files} path=${result.snapshotDir}`);
    return;
  }
  if (command === 'verify-recovery') {
    const result = await verifyRecoveryBundle(options.bundle);
    const manifest = JSON.parse(await readFile(path.join(path.resolve(options.bundle), 'recovery-manifest.json'), 'utf8'));
    if (manifest.target.bucket !== options.bucket) throw new Error(`recovery bucket mismatch: expected ${options.bucket}`);
    if (manifest.target.distributionId !== options.distribution) throw new Error(`recovery distribution mismatch: expected ${options.distribution}`);
    console.log(`recovery verified: ${result.artifactFiles} artifact files, ${result.verifiedHashes} hashes, CloudFront config ${result.distributionConfigVersion}, function ${result.functionVersion}`);
    return;
  }
  throw new Error('usage: seo-release.mjs manifest --out DIR --write FILE | plan --out DIR --manifest FILE | snapshot --out DIR --manifest FILE --to DIR | verify-recovery --bundle DIR');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`seo-release: ${error.message}`);
    process.exitCode = 1;
  });
}
