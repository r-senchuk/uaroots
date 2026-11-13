import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const origin = 'https://uaroute.com';
const endpoint = 'https://api.indexnow.org/indexnow';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

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
  const canonical = tags.filter(tag => attribute(tag, 'rel') === 'canonical').map(tag => attribute(tag, 'href'));
  assert(canonical.length === 1 && canonical[0] === url, 'sitemap page must be self-canonical');
  const robots = tags.filter(tag => /^(robots|bingbot)$/i.test(attribute(tag, 'name') ?? ''));
  assert(!robots.some(tag => /\b(noindex|none)\b/i.test(attribute(tag, 'content') ?? '')), 'sitemap page must be indexable');
}

export async function planSubmission({ outDir, previousDir, key }) {
  assert(/^[a-f0-9]{32}$/.test(key), 'invalid IndexNow key');
  assert((await readFile(path.join(outDir, `${key}.txt`), 'utf8')).trim() === key, 'exported IndexNow key mismatch');
  const xml = await readFile(path.join(outDir, 'sitemap.xml'), 'utf8');
  const urls = sitemapUrls(xml);
  // The deploy workflow supplies its independently retrieved, verified pre-release recovery bundle.
  const previous = JSON.parse(await readFile(path.join(previousDir, 'recovery-manifest.json'), 'utf8'));
  assert(previous.schemaVersion === 2 && previous.target?.bucket === 'uaroute.com' &&
    Array.isArray(previous.objects), 'expected verified UARoute recovery manifest');
  const objects = new Map(previous.objects.map(file => [file.key, file.sha256]));
  const bootstrap = !objects.has(`${key}.txt`);
  const urlList = [];
  for (const url of urls) {
    const pathname = new URL(url).pathname;
    const filename = pathname === '/' ? 'index.html' : `${pathname.slice(1)}index.html`;
    const html = await readFile(path.join(outDir, filename), 'utf8');
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
  const response = await request(endpoint, {
    method: 'POST', redirect: 'error', headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation, urlList }), signal: AbortSignal.timeout(20000),
  });
  assert(response.status === 200 || response.status === 202, `IndexNow returned HTTP ${response.status}`);
  return { status: response.status === 200 ? 'received' : 'pending-key-validation', httpStatus: response.status, submittedUrls: urlList.length };
}

async function main() {
  const args = process.argv.slice(2);
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
    const { key } = JSON.parse(await readFile(path.join(root, 'scripts/indexnow-config.json'), 'utf8'));
    const plan = await planSubmission({ outDir: options.out, previousDir: options.previous, key });
    Object.assign(report, { bootstrap: plan.bootstrap, sitemapUrls: plan.sitemapUrls, urls: plan.urlList });
    Object.assign(report, submit ? await submitPlan(plan) : { status: 'dry-run', plannedUrls: plan.urlList.length });
  } catch (error) {
    // Only persist known messages, never arbitrary network diagnostics or response bodies.
    const safeErrors = new Set([
      'live IndexNow verification file mismatch',
      'live sitemap differs from deployed candidate',
      'exported IndexNow key mismatch',
      'invalid IndexNow key',
      'expected verified UARoute recovery manifest',
    ]);
    const message = error instanceof Error ? error.message : '';
    report.error = safeErrors.has(message) || /^IndexNow returned HTTP [0-9]{3}$/.test(message)
      ? message
      : 'IndexNow validation or request failed; inspect deployment prerequisites and network access';
    process.exitCode = 1;
  }
  await mkdir(path.dirname(options.output), { recursive: true });
  await writeFile(options.output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`IndexNow: ${report.status}; ${report.submittedUrls} URLs received/submitted. This does not establish indexing or AI citations.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
