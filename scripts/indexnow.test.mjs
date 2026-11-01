import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import * as yaml from 'js-yaml';
import { origin, sitemapUrls, assertIndexable, planSubmission, submitPlan } from './indexnow.mjs';

const key = '1234567890abcdef1234567890abcdef';
const html = (url, robots = 'index,follow') => `<head><link rel="canonical" href="${url}"><meta name="robots" content="${robots}"></head>`;
const xml = urls => `<urlset>${urls.map(url => `<url><loc>${url}</loc></url>`).join('')}</urlset>`;
const digest = value => createHash('sha256').update(value).digest('hex');

async function fixture(t, previous = []) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'uaroute-indexnow-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const outDir = path.join(directory, 'out'), previousDir = path.join(directory, 'previous');
  await mkdir(path.join(outDir, 'cities/lviv'), { recursive: true });
  await mkdir(previousDir);
  await writeFile(path.join(outDir, `${key}.txt`), key + '\n');
  await writeFile(path.join(outDir, 'sitemap.xml'), xml([`${origin}/`, `${origin}/cities/lviv/`]));
  await writeFile(path.join(outDir, 'index.html'), html(`${origin}/`));
  await writeFile(path.join(outDir, 'cities/lviv/index.html'), html(`${origin}/cities/lviv/`));
  await writeFile(path.join(previousDir, 'recovery-manifest.json'), JSON.stringify({ schemaVersion: 2, target: { bucket: 'uaroute.com' }, objects: previous }));
  return { outDir, previousDir, key };
}

test('only canonical UARoute document URLs can leave the site', () => {
  assert.deepEqual(sitemapUrls(xml([`${origin}/`, `${origin}/cities/lviv/`])), [`${origin}/`, `${origin}/cities/lviv/`]);
  for (const url of ['https://other.example/', 'http://uaroute.com/', `${origin}/?phone=123`, `${origin}/#name`, 'https://user@uaroute.com/', `${origin}/cities/lviv`, `${origin}/a/../`, `${origin}/%2e%2e/`, `${origin}/index.txt`]) {
    assert.throws(() => sitemapUrls(xml([url])));
  }
  assert.throws(() => sitemapUrls(xml([`${origin}/`, `${origin}/`])));
  assert.throws(() => sitemapUrls('<sitemapindex/>'));
  for (const robots of ['noindex,follow', 'none']) assert.throws(() => assertIndexable(html(`${origin}/`, robots), `${origin}/`));
  assert.throws(() => assertIndexable(html('https://other.example/'), `${origin}/`));
  assert.throws(() => assertIndexable(html(`${origin}/`) + '<meta content="noindex" name="bingbot">', `${origin}/`));
});

test('first publication bootstraps sitemap pages, excluding editorial and removed files', async t => {
  const fixtureOptions = await fixture(t, [{ key: 'routes/removed/index.html', sha256: 'old' }]);
  await mkdir(path.join(fixtureOptions.outDir, 'routes/editorial'), { recursive: true });
  await writeFile(path.join(fixtureOptions.outDir, 'routes/editorial/index.html'), html(`${origin}/routes/editorial/`, 'noindex'));
  const plan = await planSubmission(fixtureOptions);
  assert.equal(plan.bootstrap, true);
  assert.deepEqual(plan.urlList, [`${origin}/`, `${origin}/cities/lviv/`]);
  assert.equal(plan.keyLocation, `${origin}/${key}.txt`);
});

test('later releases notify only added or changed public HTML; unchanged releases skip network', async t => {
  const fixtureOptions = await fixture(t, [{ key: `${key}.txt`, sha256: digest(key + '\n') }, { key: 'index.html', sha256: digest(html(`${origin}/`)) }]);
  let plan = await planSubmission(fixtureOptions);
  assert.equal(plan.bootstrap, false);
  assert.deepEqual(plan.urlList, [`${origin}/cities/lviv/`]);
  const previous = JSON.parse(await readFile(path.join(fixtureOptions.previousDir, 'recovery-manifest.json'), 'utf8'));
  previous.objects.push({ key: 'cities/lviv/index.html', sha256: digest(html(`${origin}/cities/lviv/`)) });
  await writeFile(path.join(fixtureOptions.previousDir, 'recovery-manifest.json'), JSON.stringify(previous));
  plan = await planSubmission(fixtureOptions);
  assert.deepEqual(await submitPlan(plan, () => { throw Error('unexpected network'); }), { status: 'skipped-unchanged', submittedUrls: 0 });
  await writeFile(path.join(fixtureOptions.outDir, 'index.html'), html(`${origin}/`) + '<p>Updated</p>');
  assert.deepEqual((await planSubmission(fixtureOptions)).urlList, [`${origin}/`]);
});

test('invalid export, key and recovery data fail before submission', async t => {
  const fixtureOptions = await fixture(t);
  await assert.rejects(() => planSubmission({ ...fixtureOptions, key: '../bad' }));
  await writeFile(path.join(fixtureOptions.outDir, `${key}.txt`), 'wrong');
  await assert.rejects(() => planSubmission(fixtureOptions), /key mismatch/);
  await writeFile(path.join(fixtureOptions.outDir, `${key}.txt`), key);
  await writeFile(path.join(fixtureOptions.outDir, 'cities/lviv/index.html'), html(`${origin}/cities/lviv/`, 'noindex'));
  await assert.rejects(() => planSubmission(fixtureOptions), /indexable/);
  await writeFile(path.join(fixtureOptions.previousDir, 'recovery-manifest.json'), '{}');
  await assert.rejects(() => planSubmission(fixtureOptions), /recovery manifest/);
});

test('submission checks live key and sitemap before sending the exact public URL payload', async t => {
  const plan = await planSubmission(await fixture(t));
  for (const status of [200, 202]) {
    const calls = [];
    const result = await submitPlan(plan, async (url, options) => {
      calls.push({ url, options });
      if (calls.length === 1) return new Response(key + '\n', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
      if (calls.length === 2) return new Response(xml(plan.urlList));
      return new Response(null, { status });
    });
    assert.equal(calls[0].url, plan.keyLocation);
    assert.equal(calls[1].url, `${origin}/sitemap.xml`);
    assert.equal(calls[2].url, 'https://api.indexnow.org/indexnow');
    assert.equal(calls[2].options.method, 'POST');
    assert.deepEqual(JSON.parse(calls[2].options.body), { host: 'uaroute.com', key, keyLocation: plan.keyLocation, urlList: plan.urlList });
    assert.equal(result.status, status === 200 ? 'received' : 'pending-key-validation');
    assert.equal(result.submittedUrls, 2);
    assert.ok(!JSON.stringify(result).includes('indexed'));
  }
});

test('live mismatch prevents POST; API failures are surfaced without retries', async t => {
  const plan = await planSubmission(await fixture(t));
  let calls = 0;
  await assert.rejects(() => submitPlan(plan, async () => { calls++; return new Response('wrong'); }), /verification file mismatch/);
  assert.equal(calls, 1);
  calls = 0;
  await assert.rejects(() => submitPlan(plan, async () => {
    calls++;
    return calls === 1 ? new Response(key, { headers: { 'content-type': 'text/plain' } }) : new Response('stale sitemap');
  }), /sitemap differs/);
  assert.equal(calls, 2);
  calls = 0;
  await assert.rejects(() => submitPlan(plan, async () => {
    calls++;
    if (calls === 1) return new Response(key, { headers: { 'content-type': 'text/plain' } });
    if (calls === 2) return new Response(xml(plan.urlList));
    return new Response(null, { status: 429 });
  }), /HTTP 429/);
  assert.equal(calls, 3);
});

test('repository verification key and post-deployment workflow stay aligned', async () => {
  const { key: configuredKey } = JSON.parse(await readFile('scripts/indexnow-config.json', 'utf8'));
  assert.match(configuredKey, /^[a-f0-9]{32}$/);
  assert.equal((await readFile(`public/${configuredKey}.txt`, 'utf8')).trim(), configuredKey);
  const workflow = yaml.load(await readFile('.github/workflows/deploy-production.yml', 'utf8'));
  const steps = workflow.jobs.deploy.steps;
  const publication = steps.findIndex(step => step.name === 'Recoverable publication and live acceptance');
  const notification = steps.findIndex(step => step.name === 'Notify IndexNow after verified publication');
  assert.ok(notification > publication);
  assert.equal(steps[notification].if, 'success()');
  assert.equal(steps[notification]['continue-on-error'], true);
  assert.match(steps[notification].run, /--previous private-evidence\/retrieved/);
  assert.match(steps[notification].run, /--out candidate\/out/);
  assert.match(steps[notification].run, /--submit/);
  assert.ok(steps.some(step => step.name === 'Publish sanitized result' && step.run.includes('indexnow.json')));
  assert.ok(!steps.some(step => step.run?.includes('npm run build')));
});
