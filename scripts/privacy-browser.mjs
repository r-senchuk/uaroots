import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

// Frozen static export. Runs the real consent template with mocked Google APIs; no collection.
const root = resolve(process.env.UAROUTE_OUT_DIR ?? "out");
const enabled = process.env.PRIVACY_QA_ENABLED === "1";
const output = resolve(process.env.PRIVACY_QA_OUTPUT_DIR ?? "output/privacy-qa");
const origin = "https://uaroute.test";
const key = "uaroute:privacy-choice:v2";
const lifetime = 180 * 24 * 60 * 60 * 1000;
const report = { mode: enabled ? "enabled-mock" : "disabled", checks: [], runtimeErrors: [], screenshots: [], realGoogleRequests: 0 };
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".txt": "text/x-component", ".woff2": "font/woff2", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
const ensure = (value, message) => { if (!value) throw new Error(message); };
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH ?? "playwright");
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
mkdirSync(output, { recursive: true });
async function check(name, fn) {
  try { await fn(); report.checks.push({ name, passed: true }); }
  catch (error) { report.checks.push({ name, passed: false, error: error.message }); }
}
async function context(options = {}) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const requests = [];
  const consentStates = [];
  await ctx.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) {
      requests.push(url.hostname);
      if (url.hostname === "www.googletagmanager.com" && url.pathname === "/gtm.js") {
        await route.fulfill({ contentType: "text/javascript", body: `(function(require,data){${readFileSync("infra/analytics/uaroute-basic-consent.txt", "utf8")}
})(function(name){return {setDefaultConsentState:function(state){console.log("consent-fixture:"+JSON.stringify(state));},updateConsentState:function(state){console.log("consent-fixture:"+JSON.stringify(state));},callInWindow:function(name,callback){window[name](callback);}}[name];},{gtmOnSuccess:function(){}});` });
      } else await route.abort("blockedbyclient");
      return;
    }
    let path = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    if (!path || path.endsWith("/")) path += url.searchParams.has("_rsc") || route.request().headers().rsc === "1" ? "index.txt" : "index.html";
    const file = resolve(root, path);
    if (relative(root, file).startsWith("..") || !existsSync(file)) { await route.fulfill({ status: 404, body: "Missing export" }); return; }
    await route.fulfill({ contentType: mime[extname(file)] ?? "application/octet-stream", body: readFileSync(file) });
  });
  if (options.blockStorage) await ctx.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error("Storage unavailable"); };
    Storage.prototype.setItem = () => { throw new Error("Storage unavailable"); };
    Storage.prototype.removeItem = () => { throw new Error("Storage unavailable"); };
  });
  if (options.seed) await ctx.addInitScript(({ key, record }) => localStorage.setItem(key, record), options.seed);
  const page = await ctx.newPage();
  page.on("console", (message) => { if (message.text().startsWith("consent-fixture:")) consentStates.push(JSON.parse(message.text().slice(16))); });
  page.on("pageerror", (error) => report.runtimeErrors.push(error.message));
  return { ctx, page, requests, consentStates };
}
const load = (page, path = "/privacy/") => page.goto(origin + path, { waitUntil: "networkidle" });
const settings = (page) => page.getByRole("button", { name: "Налаштування приватності", exact: true }).first();
try {
  await check("static policy, responsive content and privacy settings", async () => {
    const { ctx, page, requests } = await context();
    await load(page);
    ensure(await page.locator("h1").count() === 1, "Policy must have one H1");
    ensure(await page.locator("main").innerText().then((text) => text.includes("180 днів") && text.includes("UODO")), "Policy lacks retention/rights");
    ensure(requests.length === 0, "Provider requested before consent");
    if (!enabled) {
      await settings(page).click();
      await page.getByRole("button", { name: "Зберегти без аналітики", exact: true }).click();
      ensure(await page.evaluate(() => window.__uarouteAnalyticsConsent) === false, "Disabled build accepted analytics");
      ensure(await page.getByRole("button", { name: "Дозволити аналітику" }).count() === 0, "Disabled build offers acceptance");
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    const initial = join(output, "privacy-consent-375.png");
    await page.screenshot({ path: initial }); report.screenshots.push(initial);
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => window.scrollTo(0, 0));
      ensure(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow at ${width}`);
      const file = join(output, `privacy-${width}.png`);
      await page.screenshot({ path: file, fullPage: true }); report.screenshots.push(file);
    }
    await ctx.close();
  });
  if (enabled) {
    await check("Celle hub consent refusal, mocked acceptance and withdrawal", async () => {
      const { ctx, page, requests } = await context();
      await load(page, "/cities/celle/");
      ensure(requests.length === 0, "Celle hub requested a provider before consent");
      await page.getByRole("button", { name: "Без аналітики", exact: true }).click();
      ensure(requests.length === 0 && await page.evaluate(() => window.__uarouteAnalyticsConsent) === false, "Celle refusal did not keep providers disabled");
      await settings(page).click();
      await page.getByRole("button", { name: "Дозволити аналітику", exact: true }).click();
      await page.waitForFunction(() => window.__uarouteAnalyticsProviderReady === true);
      ensure(requests.length === 1 && requests[0] === "www.googletagmanager.com", "Celle acceptance did not use only the mocked GTM fixture");
      await page.getByRole("button", { name: "Вимкнути аналітику", exact: true }).click();
      await page.waitForFunction(() => window.__uarouteAnalyticsConsent === false);
      await page.waitForLoadState("networkidle");
      ensure(requests.length === 1, "Celle withdrawal requested another provider");
      await ctx.close();
    });
    await check("refusal, return visit, acceptance and one-click withdrawal", async () => {
      const { ctx, page, requests, consentStates } = await context();
      await load(page, "/");
      await page.getByRole("button", { name: "Без аналітики", exact: true }).click();
      ensure(requests.length === 0, "Refusal requested Google");
      const choice = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), key);
      ensure(choice.analytics === false && choice.advertising === false && choice.expiresAt - choice.chosenAt === lifetime, "Refusal record incorrect");
      await page.reload({ waitUntil: "networkidle" });
      ensure(await page.getByRole("button", { name: "Дозволити аналітику", exact: true }).count() === 0, "Refusal not remembered");
      await settings(page).click();
      await page.getByRole("button", { name: "Дозволити аналітику", exact: true }).click();
      await page.waitForFunction(() => window.__uarouteAnalyticsProviderReady === true);
      ensure(requests.length === 1, "Provider fixture should load exactly once");
      await ctx.addCookies([{ name: "_ga", value: "synthetic", domain: "uaroute.test", path: "/" }, { name: "_ga_MOCK", value: "synthetic", domain: ".uaroute.test", path: "/" }, { name: "necessary", value: "keep", domain: "uaroute.test", path: "/" }]);
      await page.getByRole("button", { name: "Вимкнути аналітику", exact: true }).click();
      await page.waitForFunction(() => window.__uarouteAnalyticsConsent === false);
      await page.waitForLoadState("networkidle");
      ensure(requests.length === 1, "Withdrawal requested provider again");
      ensure(consentStates[0]?.analytics_storage === "denied" && consentStates.some((state) => state.analytics_storage === "granted") && consentStates.at(-1)?.analytics_storage === "denied", "Consent bridge did not grant then revoke");
      ensure(consentStates.every((state) => state.ad_storage === "denied" && state.ad_user_data === "denied" && state.ad_personalization === "denied"), "Advertising consent granted");
      const cookies = await ctx.cookies();
      ensure(!cookies.some((cookie) => /^_ga(?:_|$)/.test(cookie.name)), "GA cookies remain after withdrawal");
      ensure(cookies.some((cookie) => cookie.name === "necessary"), "Necessary cookie removed");
      await ctx.close();
    });
    for (const seed of ["legacy", "expired", "old-version"]) await check(`fresh choice required for ${seed}`, async () => {
      const now = Date.now();
      const chosenAt = seed === "expired" ? now - lifetime - 1000 : now;
      const record = { version: seed === "old-version" ? "old" : "2026-10-07", analytics: true, advertising: false, chosenAt, expiresAt: chosenAt + lifetime };
      const { ctx, page, requests } = await context({ seed: { key: seed === "legacy" ? "uaroute:analytics-choice:v1" : key, record: seed === "legacy" ? "accepted" : JSON.stringify(record) } });
      await load(page);
      await page.getByRole("button", { name: "Без аналітики", exact: true }).waitFor();
      ensure(requests.length === 0, "Invalid consent requested Google");
      await ctx.close();
    });
    await check("unavailable storage keeps choice only in current document", async () => {
      const { ctx, page, requests } = await context({ blockStorage: true });
      await load(page);
      await page.getByRole("button", { name: "Без аналітики", exact: true }).click();
      await settings(page).click();
      await page.getByRole("button", { name: "Дозволити аналітику", exact: true }).click();
      await page.waitForFunction(() => window.__uarouteAnalyticsProviderReady === true);
      await page.reload({ waitUntil: "networkidle" });
      await page.getByRole("button", { name: "Без аналітики", exact: true }).waitFor();
      ensure(requests.length === 1, "Storage failure should not auto-consent on reload");
      await ctx.close();
    });
    await check("expiry revokes an active document without another provider request", async () => {
      const { ctx, page, requests } = await context();
      await page.clock.install();
      await load(page);
      await page.getByRole("button", { name: "Дозволити аналітику", exact: true }).click();
      await page.waitForFunction(() => window.__uarouteAnalyticsProviderReady === true);
      const expiresAt = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).expiresAt, key);
      await page.clock.setSystemTime(expiresAt + 1);
      await page.evaluate(() => window.dispatchEvent(new Event("focus")));
      await page.getByRole("button", { name: "Без аналітики", exact: true }).waitFor();
      ensure(await page.evaluate(() => window.__uarouteAnalyticsConsent) !== true && requests.length === 1, "Expired document continues collection");
      await ctx.close();
    });
    await check("withdrawal synchronizes across tabs", async () => {
      const { ctx, page, requests } = await context();
      await load(page);
      await page.getByRole("button", { name: "Дозволити аналітику", exact: true }).click();
      await page.waitForFunction(() => window.__uarouteAnalyticsProviderReady === true);
      const other = await ctx.newPage(); await load(other);
      await other.waitForFunction(() => window.__uarouteAnalyticsProviderReady === true);
      await page.getByRole("button", { name: "Вимкнути аналітику", exact: true }).click();
      await other.waitForFunction(() => window.__uarouteAnalyticsConsent === false);
      await other.waitForLoadState("networkidle");
      ensure(requests.length === 2, "Withdrawal across tabs reloaded a provider");
      await ctx.close();
    });
  }
  await check("policy remains readable without JavaScript", async () => {
    const { ctx } = await context();
    const noJs = await browser.newContext({ javaScriptEnabled: false });
    await noJs.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== origin) { await route.abort(); return; }
      await route.fulfill({ contentType: "text/html", body: readFileSync(join(root, "privacy/index.html")) });
    });
    const page = await noJs.newPage(); await load(page);
    ensure(await page.locator("h1").count() === 1 && (await page.locator("main").innerText()).includes("UODO"), "Static policy absent");
    await noJs.close(); await ctx.close();
  });
} finally {
  await browser.close();
  writeFileSync(join(output, "report.json"), JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report, null, 2));
if (report.checks.some((check) => !check.passed) || report.runtimeErrors.length) process.exitCode = 1;
