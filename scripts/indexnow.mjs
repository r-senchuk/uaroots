#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getAffectedRoutes,
  publicRoutes,
  toCanonicalUrl,
} from './route-sources.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const INDEXNOW_API_ENDPOINT = 'https://api.indexnow.org/indexnow';
const KEY_REGEX = /^[0-9a-f]{32}\.txt$/i;

export const origin = 'https://uaroute.com';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

function assert(condition, message) {
  if (!condition) throw Error(message);
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1];
}

export function sitemapUrls(xml) {
  assert(/<urlset\b/.test(xml) && /<\/urlset>/.test(xml), 'expected a URL sitemap');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, value]) => value.trim());
  assert(urls.length > 0 && urls.length <= 10000, 'sitemap must contain 1–10000 URLs');
  assert(new Set(urls).size === urls.length, 'duplicate sitemap URL');
  for (const value of urls) {
    const url = new URL(value);
    assert(url.origin === origin && !url.username && !url.password && !url.search && !url.hash &&
      value === `${origin}${url.pathname}` && url.pathname.endsWith('/') &&
      /^\/(?:[a-z0-9-]+\/)*$/.test(url.pathname), 'unexpected sitemap URL');
  }
  return urls;
}

export function assertIndexable(html, url) {
  const tags = html.match(/<(?:meta|link)\b[^>]*>/gi) ?? [];
  const canonical = tags.filter((tag) => attribute(tag, 'rel') === 'canonical').map((tag) => attribute(tag, 'href'));
  assert(canonical.length === 1 && canonical[0] === url, 'sitemap page must be self-canonical');
  const robots = tags.filter((tag) => /^(robots|bingbot)$/i.test(attribute(tag, 'name') ?? ''));
  assert(!robots.some((tag) => /\b(noindex|none)\b/i.test(attribute(tag, 'content') ?? '')), 'sitemap page must be indexable');
}

export async function planSubmission({ outDir, previousDir, key }) {
  assert(/^[a-f0-9]{32}$/.test(key), 'invalid IndexNow key');
  assert((await readFile(join(outDir, `${key}.txt`), 'utf8')).trim() === key, 'exported IndexNow key mismatch');
  const xml = await readFile(join(outDir, 'sitemap.xml'), 'utf8');
  const urls = sitemapUrls(xml);
  const previous = JSON.parse(await readFile(join(previousDir, 'recovery-manifest.json'), 'utf8'));
  assert(previous.schemaVersion === 2 && previous.target?.bucket === 'uaroute.com' &&
    Array.isArray(previous.objects), 'expected verified UARoute recovery manifest');
  const objects = new Map(previous.objects.map((file) => [file.key, file.sha256]));
  const bootstrap = !objects.has(`${key}.txt`);
  const urlList = [];
  for (const url of urls) {
    const pathname = new URL(url).pathname;
    const filename = pathname === '/' ? 'index.html' : `${pathname.slice(1)}index.html`;
    const html = await readFile(join(outDir, filename), 'utf8');
    assertIndexable(html, url);
    if (bootstrap || objects.get(filename) !== hash(html)) urlList.push(url);
  }
  return {
    host: 'uaroute.com', key, keyLocation: `${origin}/${key}.txt`, urlList,
    sitemapSha256: hash(xml), bootstrap, sitemapUrls: urls.length,
  };
}

export async function submitPlan(plan, request = fetch) {
  if (plan.urlList.length === 0) return { status: 'skipped-unchanged', submittedUrls: 0 };
  const keyResponse = await request(plan.keyLocation, { redirect: 'error', signal: AbortSignal.timeout(20000) });
  assert(keyResponse.status === 200 && (keyResponse.headers.get('content-type') ?? '').includes('text/plain') &&
    (await keyResponse.text()).trim() === plan.key, 'live IndexNow verification file mismatch');
  const sitemap = await request(`${origin}/sitemap.xml`, { redirect: 'error', signal: AbortSignal.timeout(20000) });
  assert(sitemap.status === 200 && hash(await sitemap.text()) === plan.sitemapSha256, 'live sitemap differs from deployed candidate');
  const { host, key, keyLocation, urlList } = plan;
  const response = await request(INDEXNOW_API_ENDPOINT, {
    method: 'POST', redirect: 'error', headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation, urlList }), signal: AbortSignal.timeout(20000),
  });
  assert(response.status === 200 || response.status === 202, `IndexNow returned HTTP ${response.status}`);
  return { status: response.status === 200 ? 'received' : 'pending-key-validation', httpStatus: response.status, submittedUrls: urlList.length };
}

export function resolveIndexNowKey(publicDir = join(REPO_ROOT, 'public'), host = 'uaroute.com') {
  const files = readdirSync(publicDir);
  const keyFiles = files.filter((f) => KEY_REGEX.test(f));

  if (keyFiles.length === 0) {
    throw new Error(`No IndexNow key file matching ^[0-9a-f]{32}\\.txt$ found in ${publicDir}`);
  }
  if (keyFiles.length > 1) {
    throw new Error(`Multiple IndexNow key files found in ${publicDir}: ${keyFiles.join(', ')}`);
  }

  const filename = keyFiles[0];
  const stem = basename(filename, '.txt');
  const content = readFileSync(join(publicDir, filename), 'utf8').trim();

  if (content.toLowerCase() !== stem.toLowerCase()) {
    throw new Error(`IndexNow key content mismatch in ${filename}: content "${content}" !== stem "${stem}"`);
  }

  return { key: stem, keyFile: filename, keyLocation: `https://${host}/${filename}` };
}

export function isFullReindexTriggered(changedFiles, keyFile) {
  return changedFiles.some(
    (file) =>
      file === `public/${keyFile}` ||
      file === 'public/key-fallback' ||
      file === 'scripts/indexnow.mjs' ||
      file === 'scripts/route-sources.mjs' ||
      file.startsWith('.github/workflows/deploy')
  );
}

export function getGitChangedFiles(baseSha, headSha = 'HEAD', cwd = REPO_ROOT) {
  if (baseSha && /^0+$/.test(baseSha)) return ['public/key-fallback'];

  const diffTarget = baseSha ? `${baseSha}...${headSha}` : 'HEAD~1...HEAD';
  try {
    const output = execFileSync('git', ['diff', '--name-only', diffTarget], { cwd, encoding: 'utf8' }).trim();
    return output ? output.split('\n').filter(Boolean) : [];
  } catch {
    if (baseSha) {
      try {
        const fallback = execFileSync('git', ['diff', '--name-only', 'HEAD~1...HEAD'], { cwd, encoding: 'utf8' }).trim();
        return fallback ? fallback.split('\n').filter(Boolean) : [];
      } catch {
        return [];
      }
    }
    return [];
  }
}

export function resolveTargetUrls({
  forceAll = false,
  explicitUrls = [],
  changedFiles = [],
  keyFile = '',
  eventName = '',
  host = 'uaroute.com',
  isBaseAllZeros = false,
}) {
  if (explicitUrls.length > 0) {
    for (const rawUrl of explicitUrls) {
      let parsed;
      try {
        parsed = new URL(rawUrl);
      } catch {
        throw new Error(`Invalid URL provided: "${rawUrl}"`);
      }
      if (parsed.hostname !== host) {
        throw new Error(`Explicit URL hostname "${parsed.hostname}" does not match target host "${host}": ${rawUrl}`);
      }
    }
    return explicitUrls;
  }

  const siteUrl = `https://${host}`;
  if (forceAll || eventName === 'workflow_dispatch' || isBaseAllZeros || isFullReindexTriggered(changedFiles, keyFile)) {
    return publicRoutes.map((r) => toCanonicalUrl(r, siteUrl));
  }

  const affectedRoutes = getAffectedRoutes(changedFiles);
  return affectedRoutes.map((r) => toCanonicalUrl(r, siteUrl));
}

export async function verifyPreflightKey({
  host,
  key,
  keyFile,
  maxAttempts = 5,
  initialBackoffMs = 1000,
  fetchFn = globalThis.fetch,
}) {
  const url = `https://${host}/${keyFile}`;
  let backoff = initialBackoffMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetchFn(url, { headers: { 'Cache-Control': 'no-cache' } });
      if (res.status === 200) {
        const text = (await res.text()).trim();
        if (text.toLowerCase() === key.toLowerCase()) return true;
      }
    } catch {}

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, backoff));
      backoff *= 1.5;
    }
  }
  return false;
}

export async function submitToIndexNow({ host, key, keyLocation, urlList, fetchFn = globalThis.fetch }) {
  const response = await fetchFn(INDEXNOW_API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation, urlList }),
  });

  const status = response.status;
  let text = '';
  try { text = await response.text(); } catch {}

  if (status === 200 || status === 202) {
    return { status, ok: true, message: `Successfully submitted ${urlList.length} URLs (HTTP ${status}).` };
  }
  return { status, ok: false, message: `IndexNow submission failed (HTTP ${status}): ${text}` };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--out')) {
    const submit = args.includes('--submit');
    const options = {};
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--submit') continue;
      assert(['--out', '--previous', '--output'].includes(args[i]) && args[i + 1], 'use --out DIR --previous DIR --output FILE [--submit]');
      options[args[i].slice(2)] = args[++i];
    }
    assert(options.out && options.previous && options.output, 'out, previous and output are required');
    const report = { checkedAt: new Date().toISOString(), status: 'failed', submittedUrls: 0 };
    try {
      let key = null;
      try {
        const config = JSON.parse(await readFile(join(REPO_ROOT, 'scripts/indexnow-config.json'), 'utf8'));
        key = config.key;
      } catch {
        key = resolveIndexNowKey(join(REPO_ROOT, 'public')).key;
      }
      const plan = await planSubmission({ outDir: options.out, previousDir: options.previous, key });
      Object.assign(report, { bootstrap: plan.bootstrap, sitemapUrls: plan.sitemapUrls, urls: plan.urlList });
      Object.assign(report, submit ? await submitPlan(plan) : { status: 'dry-run', plannedUrls: plan.urlList.length });
    } catch (error) {
      report.error = error.message.startsWith('IndexNow returned HTTP ') ? error.message : 'IndexNow validation or request failed; see checks before retrying';
      process.exitCode = 1;
    }
    await mkdir(dirname(options.output), { recursive: true });
    await writeFile(options.output, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`IndexNow: ${report.status}; ${report.submittedUrls} URLs received/submitted. This does not establish indexing or AI citations.`);
    return;
  }

  let forceAll = false;
  let dryRun = false;
  let skipPreflight = false;
  let host = process.env.INDEXNOW_HOST || 'uaroute.com';
  const explicitUrls = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--all') forceAll = true;
    else if (arg === '--dry-run') dryRun = true;
    else if (arg === '--skip-preflight') skipPreflight = true;
    else if (arg === '--host' && args[i + 1]) host = args[++i];
    else if (arg.startsWith('http://') || arg.startsWith('https://')) explicitUrls.push(arg);
  }

  const { key, keyFile, keyLocation } = resolveIndexNowKey(join(REPO_ROOT, 'public'), host);
  const baseSha = process.env.GITHUB_EVENT_BEFORE;
  const targetUrls = resolveTargetUrls({
    forceAll,
    explicitUrls,
    changedFiles: getGitChangedFiles(baseSha, process.env.GITHUB_SHA || 'HEAD'),
    keyFile,
    eventName: process.env.GITHUB_EVENT_NAME,
    host,
    isBaseAllZeros: Boolean(baseSha && /^0+$/.test(baseSha)),
  });

  if (targetUrls.length === 0) {
    console.log('[indexnow] No public routes affected. Skipping submission.');
    return;
  }

  console.log(`[indexnow] URLs to submit (${targetUrls.length}):\n${targetUrls.map((u) => `  - ${u}`).join('\n')}`);

  if (dryRun) {
    console.log('[indexnow] Dry-run payload:\n', JSON.stringify({ host, key, keyLocation, urlList: targetUrls }, null, 2));
    return;
  }

  if (!skipPreflight) {
    console.log(`[indexnow] Preflight checking https://${host}/${keyFile}...`);
    const isLive = await verifyPreflightKey({ host, key, keyFile });
    if (!isLive) {
      console.error(`[indexnow] Preflight failed: https://${host}/${keyFile} not serving key yet.`);
      process.exit(1);
    }
  }

  const result = await submitToIndexNow({ host, key, keyLocation, urlList: targetUrls });
  if (result.ok) {
    console.log(`[indexnow] SUCCESS: ${result.message}`);
  } else {
    console.error(`[indexnow] FAILURE: ${result.message}`);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`[indexnow] Fatal: ${err.message}`);
    process.exit(1);
  });
}
