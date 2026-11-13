import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
  getGitChangedFiles,
  isFullReindexTriggered,
  resolveIndexNowKey,
  resolveTargetUrls,
  submitToIndexNow,
  verifyPreflightKey,
} from '../scripts/indexnow.mjs';
import {
  getAffectedRoutes,
  productionSiteUrl,
  publicRoutes,
  toCanonicalUrl,
} from '../scripts/route-sources.mjs';

describe('IndexNow route sources and change detection', () => {
  it('defines canonical production URL with https and no trailing slash', () => {
    assert.equal(productionSiteUrl, 'https://uaroute.com');
  });

  it('formats canonical URLs with baseUrl and trailing slash', () => {
    assert.equal(toCanonicalUrl('/', 'https://uaroute.com'), 'https://uaroute.com/');
    assert.equal(toCanonicalUrl('/about', 'https://uaroute.com'), 'https://uaroute.com/about/');
    assert.equal(toCanonicalUrl('/about/', 'https://uaroute.com/'), 'https://uaroute.com/about/');
    assert.equal(toCanonicalUrl('/cities/lviv', 'https://uaroute.com'), 'https://uaroute.com/cities/lviv/');
  });

  it('returns all public routes when shared sources change', () => {
    const sharedFiles = [
      'src/app/layout.tsx',
      'src/app/globals.css',
      'src/components/Header.tsx',
      'src/components/brand/Logo.tsx',
    ];
    for (const file of sharedFiles) {
      const affected = getAffectedRoutes([file]);
      assert.deepEqual(affected, publicRoutes);
    }
  });

  it('detects route-specific changes accurately', () => {
    const aboutAffected = getAffectedRoutes(['src/app/about/page.tsx']);
    assert.deepEqual(aboutAffected, ['/about']);

    const bicycleAffected = getAffectedRoutes(['src/components/BicycleInquiryCta.tsx']);
    assert.deepEqual(bicycleAffected, ['/guides/perevezennya-velosypeda']);

    const routesAffected = getAffectedRoutes(['src/app/routes/[slug]/page.tsx']);
    assert.ok(routesAffected.includes('/routes/lviv-hannover'));
    assert.ok(routesAffected.includes('/routes/celle-stryi'));
    assert.ok(!routesAffected.includes('/cities/lviv'));

    const citiesAffected = getAffectedRoutes(['src/data/cities.ts']);
    assert.ok(citiesAffected.includes('/cities/lviv'));
    assert.ok(citiesAffected.includes('/cities/ivano-frankivsk'));
    assert.ok(!citiesAffected.includes('/about'));
  });

  it('returns empty array when unrelated files change', () => {
    const affected = getAffectedRoutes(['docs/README.md', 'ops/agent-state.json', 'scripts/inspect-out.mjs']);
    assert.deepEqual(affected, []);
  });
});

describe('IndexNow key resolution', () => {
  it('resolves valid 32-char hex key matching content and stem', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'indexnow-key-test-'));
    try {
      const validKey = '0123456789abcdef0123456789abcdef';
      writeFileSync(join(tempDir, `${validKey}.txt`), `${validKey}\n`);

      const result = resolveIndexNowKey(tempDir, 'uaroute.com');
      assert.equal(result.key, validKey);
      assert.equal(result.keyFile, `${validKey}.txt`);
      assert.equal(result.keyLocation, `https://uaroute.com/${validKey}.txt`);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('fails when no 32-hex key file is found', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'indexnow-key-test-'));
    try {
      writeFileSync(join(tempDir, 'invalid-key.txt'), 'invalid-key');
      writeFileSync(join(tempDir, '12345.txt'), '12345');
      assert.throws(() => resolveIndexNowKey(tempDir), /No IndexNow key file matching/);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('fails when multiple key files exist', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'indexnow-key-test-'));
    try {
      const key1 = '0123456789abcdef0123456789abcdef';
      const key2 = 'fedcba9876543210fedcba9876543210';
      writeFileSync(join(tempDir, `${key1}.txt`), key1);
      writeFileSync(join(tempDir, `${key2}.txt`), key2);
      assert.throws(() => resolveIndexNowKey(tempDir), /Multiple IndexNow key files found/);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('fails when key content does not match filename stem', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'indexnow-key-test-'));
    try {
      const key = '0123456789abcdef0123456789abcdef';
      writeFileSync(join(tempDir, `${key}.txt`), 'mismatchedcontent12345678901234');
      assert.throws(() => resolveIndexNowKey(tempDir), /content mismatch/);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

describe('IndexNow target URLs and fallback logic', () => {
  const keyFile = '0123456789abcdef0123456789abcdef.txt';

  it('triggers full reindex on workflow_dispatch or all-zeros base commit', () => {
    const dispatchUrls = resolveTargetUrls({
      eventName: 'workflow_dispatch',
      keyFile,
      host: 'uaroute.com',
    });
    assert.equal(dispatchUrls.length, publicRoutes.length);

    const zeroBaseUrls = resolveTargetUrls({
      isBaseAllZeros: true,
      keyFile,
      host: 'uaroute.com',
    });
    assert.equal(zeroBaseUrls.length, publicRoutes.length);

    const forceAllUrls = resolveTargetUrls({
      forceAll: true,
      keyFile,
      host: 'uaroute.com',
    });
    assert.equal(forceAllUrls.length, publicRoutes.length);
  });

  it('triggers full reindex when indexnow or deployment infrastructure changes', () => {
    assert.ok(isFullReindexTriggered([`public/${keyFile}`], keyFile));
    assert.ok(isFullReindexTriggered(['scripts/indexnow.mjs'], keyFile));
    assert.ok(isFullReindexTriggered(['scripts/route-sources.mjs'], keyFile));
    assert.ok(isFullReindexTriggered(['.github/workflows/deploy-production.yml'], keyFile));
    assert.ok(!isFullReindexTriggered(['docs/README.md'], keyFile));
  });

  it('handles git diff with all-zero baseSha', () => {
    const files = getGitChangedFiles('0000000000000000000000000000000000000000');
    assert.deepEqual(files, ['public/key-fallback']);
  });

  it('validates explicit URLs and blocks foreign hostnames or invalid formats', () => {
    const valid = resolveTargetUrls({
      explicitUrls: ['https://uaroute.com/about/', 'https://uaroute.com/routes/'],
      host: 'uaroute.com',
    });
    assert.deepEqual(valid, ['https://uaroute.com/about/', 'https://uaroute.com/routes/']);

    assert.throws(
      () => resolveTargetUrls({ explicitUrls: ['https://evil.example.com/about/'], host: 'uaroute.com' }),
      /does not match target host/
    );

    assert.throws(
      () => resolveTargetUrls({ explicitUrls: ['invalid-url'], host: 'uaroute.com' }),
      /Invalid URL provided/
    );
  });
});

describe('IndexNow preflight verification', () => {
  it('returns true when preflight serves 200 with matching key', async () => {
    const mockFetch = async () => new Response('0123456789abcdef0123456789abcdef\n', { status: 200 });
    const ok = await verifyPreflightKey({
      host: 'uaroute.com',
      key: '0123456789abcdef0123456789abcdef',
      keyFile: '0123456789abcdef0123456789abcdef.txt',
      fetchFn: mockFetch,
    });
    assert.equal(ok, true);
  });

  it('retries with backoff and succeeds if transient 404 resolves to 200', async () => {
    let attempt = 0;
    const mockFetch = async () => {
      attempt++;
      if (attempt === 1) return new Response('Not Found', { status: 404 });
      return new Response('0123456789abcdef0123456789abcdef', { status: 200 });
    };

    const ok = await verifyPreflightKey({
      host: 'uaroute.com',
      key: '0123456789abcdef0123456789abcdef',
      keyFile: '0123456789abcdef0123456789abcdef.txt',
      maxAttempts: 3,
      initialBackoffMs: 10,
      fetchFn: mockFetch,
    });
    assert.equal(ok, true);
    assert.equal(attempt, 2);
  });

  it('fails closed when CDN repeatedly serves non-200 or mismatched key', async () => {
    const mockFetch = async () => new Response('wrong-content', { status: 200 });
    const ok = await verifyPreflightKey({
      host: 'uaroute.com',
      key: '0123456789abcdef0123456789abcdef',
      keyFile: '0123456789abcdef0123456789abcdef.txt',
      maxAttempts: 2,
      initialBackoffMs: 10,
      fetchFn: mockFetch,
    });
    assert.equal(ok, false);
  });
});

describe('IndexNow API submission response handling', () => {
  it('handles 200 and 202 as successful submissions', async () => {
    const mock200 = async () => new Response('OK', { status: 200 });
    const res200 = await submitToIndexNow({
      host: 'uaroute.com',
      key: 'key',
      keyLocation: 'https://uaroute.com/key.txt',
      urlList: ['https://uaroute.com/'],
      fetchFn: mock200,
    });
    assert.equal(res200.ok, true);
    assert.equal(res200.status, 200);

    const mock202 = async () => new Response('Accepted', { status: 202 });
    const res202 = await submitToIndexNow({
      host: 'uaroute.com',
      key: 'key',
      keyLocation: 'https://uaroute.com/key.txt',
      urlList: ['https://uaroute.com/'],
      fetchFn: mock202,
    });
    assert.equal(res202.ok, true);
    assert.equal(res202.status, 202);
  });

  it('handles 400, 403, 422, and 429 as errors with descriptive status', async () => {
    for (const status of [400, 403, 422, 429]) {
      const mockFail = async () => new Response(`Error ${status}`, { status });
      const res = await submitToIndexNow({
        host: 'uaroute.com',
        key: 'key',
        keyLocation: 'https://uaroute.com/key.txt',
        urlList: ['https://uaroute.com/'],
        fetchFn: mockFail,
      });
      assert.equal(res.ok, false);
      assert.equal(res.status, status);
      assert.match(res.message, new RegExp(`HTTP ${status}`));
    }
  });
});
