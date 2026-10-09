import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";

// Synthetic evaluation only. Every request is fulfilled locally or blocked.
const root = resolve(process.env.UAROUTE_OUT_DIR ?? "out");
const output = resolve(process.env.DISCOVERY_QA_OUTPUT_DIR ?? "/private/tmp/uaroute-discovery-qa");
const live = process.env.DISCOVERY_LIVE === "1";
if (live && process.env.POC_LIVE_DEPLOY_CONFIRMED !== "1") throw new Error("Live discovery checks require explicit deployed-release confirmation");
const origin = live ? "https://uaroute.com" : "http://uaroute.test";
const ukIds = ["lviv", "ivano-frankivsk", "dolyna", "kalush", "stryi", "halych", "burshtyn", "pustomyty", "briukhovychi", "horodok-lviv", "mykolaiv-lviv", "novyi-rozdil", "nadvirna", "zhydachiv"];
const deIds = ["schwerin", "lueneburg", "luebeck", "celle", "wolfsburg", "braunschweig"];
const selected = [
  ["dolyna", "celle", "dolyna-celle"], ["celle", "dolyna", "celle-dolyna"],
  ["dolyna", "wolfsburg", "dolyna-wolfsburg"], ["wolfsburg", "dolyna", "wolfsburg-dolyna"],
  ["dolyna", "braunschweig", "dolyna-braunschweig"], ["braunschweig", "dolyna", "braunschweig-dolyna"],
  ["lviv", "celle", "lviv-celle"], ["celle", "lviv", "celle-lviv"],
  ["ivano-frankivsk", "wolfsburg", "ivano-frankivsk-wolfsburg"], ["wolfsburg", "ivano-frankivsk", "wolfsburg-ivano-frankivsk"],
];
const report = { generatedAt: new Date().toISOString(), mode: live ? "live" : "local", checks: [], viewportChecks: [], screenshots: [], runtimeErrors: [], outgoingMessagesChecked: 0, blockedRequests: 0 };
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".txt": "text/x-component", ".woff2": "font/woff2", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
const ensure = (value, message) => { if (!value) throw new Error(message); };

async function check(name, fn) {
  try { report.checks.push({ name, passed: true, detail: await fn() }); }
  catch (error) { report.checks.push({ name, passed: false, error: error.message }); }
}

async function intercept(route) {
  const url = new URL(route.request().url());
  if (live && ["uaroute.com", "www.uaroute.com"].includes(url.hostname)) { await route.continue(); return; }
  if (url.origin !== origin) { report.blockedRequests++; await route.abort("blockedbyclient"); return; }
  let path = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  if (!path || path.endsWith("/")) path += url.searchParams.has("_rsc") || route.request().headers().rsc === "1" ? "index.txt" : "index.html";
  const file = resolve(root, path);
  const inside = relative(root, file);
  if (inside === ".." || inside.startsWith(`..${sep}`) || !existsSync(file)) {
    await route.fulfill({ status: 404, body: "Missing export" }); return;
  }
  await route.fulfill({ status: 200, contentType: mime[extname(file)] ?? "application/octet-stream", body: readFileSync(file) });
}

async function load(page, path) {
  await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
  const refusal = page.getByRole("button", { name: "Без аналітики", exact: true });
  if (await refusal.isVisible()) await refusal.click();
}

async function choose(page, uk, de, backwards = false) {
  await page.getByRole("button", { name: backwards ? "До України" : "До Німеччини", exact: true }).click();
  await page.getByRole("combobox", { name: "Українське місто", exact: true }).selectOption(uk);
  await page.getByRole("combobox", { name: "Місто в Німеччині", exact: true }).selectOption(de);
}

const candidate = (page) => page.locator('section[aria-labelledby$="-candidate-inquiry-title"]');
async function assertOptions(page) {
  for (const [label, ids] of [["Українське місто", ukIds], ["Місто в Німеччині", deIds]]) {
    const values = await page.getByRole("combobox", { name: label, exact: true }).locator("option").evaluateAll((options) => options.map((option) => option.value).filter(Boolean));
    ensure(values.length === ids.length && ids.every((id) => values.includes(id)), `${label} option coverage differs`);
  }
  const regional = page.getByRole("combobox", { name: "Українське місто", exact: true }).locator('option[value="mykolaiv-lviv"]');
  ensure((await regional.textContent()).includes("Львів"), "Mykolaiv is not region-qualified");
}

async function verifyMessage(page, path, backwards = false) {
  await load(page, path);
  const uk = path.includes("ivano-frankivsk") ? "ivano-frankivsk" : "lviv";
  await choose(page, uk, "luebeck", backwards);
  const from = await page.getByLabel("Звідки", { exact: true }).inputValue();
  const to = await page.getByLabel("Куди", { exact: true }).inputValue();
  await page.getByRole("button", { name: "Знайти маршрут", exact: true }).click();
  await candidate(page).waitFor({ state: "visible" });
  await page.getByLabel("Бажана дата поїздки", { exact: true }).fill("2099-12-31");
  await page.getByLabel("Телефон для зв’язку", { exact: true }).fill("+380501234567");
  const count = await page.evaluate(() => window.__discoveryOpened.length);
  await page.getByRole("button", { name: "Уточнити поїздку в WhatsApp", exact: true }).click();
  const text = await page.evaluate((previous) => {
    const next = window.__discoveryOpened[previous];
    return next ? new URL(next).searchParams.get("text") : null;
  }, count);
  ensure(text?.includes("Джерело: UARoute"), "Outgoing message lacks UARoute attribution");
  ensure(/UR-[A-Z0-9-]+/.test(text), "Outgoing message lacks request code");
  ensure(text.includes(from) && text.includes(to), "Outgoing message lost endpoint names");
  ensure(text.includes(`https://uaroute.com${path}`), "Outgoing message lost canonical source path");
  ensure(text.includes("31.12.2099"), "Outgoing message lost requested date");
  report.outgoingMessagesChecked++;
  // No full message, date/phone or outgoing URL is written to the report.
  return { path, backwards, sourceAndEndpoints: true, requestCode: true };
}

mkdirSync(output, { recursive: true });
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH ?? "playwright");
const chrome = process.env.PLAYWRIGHT_EXECUTABLE_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ headless: true, ...(existsSync(chrome) ? { executablePath: chrome } : {}) });
try {
  const context = await browser.newContext({ locale: "uk-UA", reducedMotion: "reduce" });
  context.setDefaultTimeout(8000);
  await context.route("**/*", intercept);
  await context.addInitScript(() => {
    window.__discoveryOpened = [];
    window.open = (url) => { window.__discoveryOpened.push(String(url)); return null; };
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => report.runtimeErrors.push(error.message));

  await check("return direction visibly reverses fields and preserves cities", async () => {
    await load(page, "/");
    await choose(page, "lviv", "celle");
    await page.getByRole("button", { name: "До України", exact: true }).click();
    ensure(await page.getByRole("button", { name: "До України", exact: true }).getAttribute("aria-pressed") === "true", "Return direction not selected");
    const selects = page.locator("select");
    ensure(await selects.nth(0).inputValue() === "celle" && await selects.nth(1).inputValue() === "lviv", "Departure/arrival order or city preservation failed");
    ensure((await selects.nth(0).locator("..").innerText()).includes("Звідки · Німеччина"), "Return departure label missing");
    await page.getByText("Пошук за іншою назвою міста", { exact: true }).click();
    const from = page.getByRole("combobox", { name: "Звідки", exact: true });
    await from.fill("Івано-Франківськ");
    ensure(await page.getByRole("listbox").count() === 0, "Ukrainian city offered as return departure");
    await from.fill("Celle");
    await page.getByRole("listbox").getByRole("option").filter({ hasText: "Целле" }).first().waitFor({state:"visible"});
    await from.press("Enter");
    await page.setViewportSize({width:375,height:812});
    await page.screenshot({path:join(output,"return-selection-375.png"),fullPage:true});
    await page.setViewportSize({width:1440,height:1000});
    await page.screenshot({path:join(output,"return-selection-1440.png"),fullPage:false});
    await page.getByRole("button", { name: "Знайти маршрут", exact: true }).click();
    await page.waitForURL("**/routes/celle-lviv/");
    await load(page, "/");
    await choose(page, "lviv", "celle", true);
    await page.getByRole("button", { name: "До Німеччини", exact: true }).click();
    ensure(await page.locator("select").nth(0).inputValue() === "lviv" && await page.locator("select").nth(1).inputValue() === "celle", "Outbound reversal lost cities");
    return { preservedCities: true, returnNavigation: true, wrongCountryExcluded: true };
  });

  await check("same-country aliases excluded in both directions", async () => {
    for (const backwards of [false, true]) {
      await load(page, "/");
      await choose(page, "lviv", "celle", backwards);
      await page.getByText("Пошук за іншою назвою міста", { exact: true }).click();
      for (const [side, query] of [["Звідки", backwards ? "Львів" : "Celle"], ["Куди", backwards ? "Celle" : "Івано-Франківськ"]]) {
        const field = page.getByRole("combobox", { name: side, exact: true });
        await field.fill(query);
        ensure(await page.getByRole("listbox").count() === 0, `Wrong-country suggestion offered: ${side} ${query}`);
      }
      await page.getByRole("button", { name: "Знайти маршрут", exact: true }).click();
      ensure(new URL(page.url()).pathname === "/", "Unselected alias navigated to a route");
      await page.getByText("Оберіть місто відправлення та місто призначення.", { exact: true }).waitFor({state:"visible"});
      ensure(await candidate(page).count() === 0, "Invalid pair created an inquiry");
    }
    return { outbound: true, return: true, invalidSubmissionBlocked: true };
  });

  await check("all 168 directional city choices", async () => {
    await load(page, "/routes/");
    await assertOptions(page);
    let exactPages = 0;
    let inlineInquiries = 0;
    for (const backwards of [false, true]) for (const uk of ukIds) for (const de of deIds) {
      await choose(page, uk, de, backwards);
      const from = await page.getByLabel("Звідки", { exact: true }).inputValue();
      const to = await page.getByLabel("Куди", { exact: true }).inputValue();
      const pair = selected.find(([a, b]) => a === (backwards ? de : uk) && b === (backwards ? uk : de));
      await page.getByRole("button", { name: "Знайти маршрут", exact: true }).click();
      if (pair) {
        await page.waitForURL(`**/routes/${pair[2]}/`);
        exactPages++;
        await load(page, "/routes/");
      } else {
        await candidate(page).waitFor({ state: "visible" });
        const section = candidate(page).locator("..");
        ensure((await section.innerText()).includes(`${from} → ${to}`), `Wrong inquiry context ${uk}/${de}/${backwards}`);
        ensure(new URL(page.url()).pathname === "/routes/", "Unpublished pair navigated to a made-up URL");
        inlineInquiries++;
      }
    }
    return { pairs: exactPages + inlineInquiries, exactPages, inlineInquiries };
  });

  await check("edit and direction changes reset transient inquiry", async () => {
    await load(page, "/routes/");
    await choose(page, "lviv", "luebeck");
    await page.getByRole("button", { name: "Знайти маршрут", exact: true }).click();
    await candidate(page).waitFor({ state: "visible" });
    await page.getByLabel("Телефон для зв’язку", { exact: true }).fill("+380501234567");
    await page.getByRole("combobox", { name: "Українське місто", exact: true }).selectOption("kalush");
    ensure(await candidate(page).count() === 0, "Old inquiry remains after endpoint change");
    await page.getByRole("button", { name: "Знайти маршрут", exact: true }).click();
    ensure(await page.getByLabel("Телефон для зв’язку", { exact: true }).inputValue() === "", "Old phone persists across pair change");
    await page.getByRole("button", { name: "До України", exact: true }).click();
    ensure(await candidate(page).count() === 0, "Old inquiry remains after direction change");
    return { clearedOnCityAndDirection: true };
  });

  await check("hub navigation resets cities and preserves first-touch acquisition", async () => {
    await load(page, "/?utm_source=google&utm_medium=organic&utm_campaign=m1");
    await page.locator('main a[href="/cities/lviv/"]').first().click();
    await page.waitForURL("**/cities/lviv/");
    await choose(page, "lviv", "luebeck");
    await page.getByRole("button", { name: "Знайти маршрут", exact: true }).click();
    await candidate(page).waitFor({ state: "visible" });
    await page.getByLabel("Телефон для зв’язку", { exact: true }).fill("+380501234567");
    await page.locator('main a[href="/cities/ivano-frankivsk/"]').first().click();
    await page.waitForURL("**/cities/ivano-frankivsk/");
    ensure(await page.getByRole("combobox", { name: "Українське місто", exact: true }).inputValue() === "ivano-frankivsk", "Hub navigation retained the previous origin");
    ensure(await candidate(page).count() === 0, "Hub navigation retained the previous private form");
    await choose(page, "ivano-frankivsk", "luebeck");
    await page.getByRole("button", { name: "Знайти маршрут", exact: true }).click();
    await candidate(page).waitFor({ state: "visible" });
    ensure(await page.getByLabel("Телефон для зв’язку", { exact: true }).inputValue() === "", "Private form data carried between hubs");
    const events = await page.evaluate(() => window.__uarouteEvents ?? []);
    const search = events.filter((event) => event.event === "route_search_completed").at(-1);
    ensure(search?.landingPage === "/" && search?.targetPath === "/cities/ivano-frankivsk/", "Current page overwrote first-touch acquisition");
    ensure(search?.source === "google" && search?.medium === "organic", "Acquisition source changed during internal navigation");
    ensure(!JSON.stringify(events).includes("+380501234567"), "Analytics contains private form data");
    return { hubOriginReset: true, firstTouchPreserved: true, privateDataExcluded: true };
  });

  for (const path of ["/routes/", "/cities/lviv/", "/cities/ivano-frankivsk/"]) {
    for (const backwards of [false, true]) await check(`message context ${path} ${backwards ? "return" : "outbound"}`, () => verifyMessage(page, path, backwards));
  }

  await check("aliases remain keyboard searchable and editorial routes stay excluded", async () => {
    await load(page, "/routes/");
    await page.getByText("Пошук за іншою назвою міста", { exact: true }).click();
    for (const [query, expected, side] of [["Львів", "Львів", "Звідки"], ["Львов", "Львів", "Звідки"], ["Lüneburg", "Люнебург", "Куди"], ["Kałusz", "Калуш", "Звідки"], ["Celle", "Целле", "Куди"]]) {
      const field = page.getByRole("combobox", { name: side, exact: true });
      await field.fill(query);
      await page.getByRole("listbox").getByRole("option").filter({ hasText: expected }).first().waitFor({ state: "visible" });
      await field.press("Enter");
      ensure(await field.inputValue() === expected, `Alias selection failed ${query}`);
    }
    const from = page.getByRole("combobox", { name: "Звідки", exact: true });
    await from.fill("Львів"); await from.press("Enter");
    const to = page.getByRole("combobox", { name: "Куди", exact: true });
    await to.fill("Гамбург"); await to.press("Enter");
    await page.getByRole("button", { name: "Знайти маршрут", exact: true }).click();
    await page.getByRole("heading", { name: "Ми поки не маємо інформації про цей маршрут.", exact: true }).waitFor({ state: "visible" });
    ensure(new URL(page.url()).pathname === "/routes/", "Editorial route entered search navigation");
    await to.fill("Hannover");
    await page.getByRole("listbox").getByRole("option").filter({ hasText: "Ганновер" }).first().click();
    await page.getByText("Пошук за іншою назвою міста", { exact: true }).click();
    const visibleCity = page.getByRole("combobox", { name: "Місто в Німеччині", exact: true });
    ensure(await visibleCity.inputValue() === "hannover", "Selected nonpilot alias is hidden by the native picker");
    ensure((await visibleCity.locator("option:checked").textContent()).includes("Ганновер"), "Native picker hides the submitted city");
    return { aliasLanguages: 5, editorialExcluded: true };
  });

  for (const width of [375, 768, 1440]) for (const path of ["/", "/routes/", "/cities/lviv/", "/cities/ivano-frankivsk/", ...selected.slice(6).map(([, , slug]) => `/routes/${slug}/`)]) {
    await check(`viewport ${width} ${path}`, async () => {
      await page.setViewportSize({ width, height: width === 375 ? 812 : 1000 });
      await load(page, path);
      const metrics = await page.evaluate(() => ({ width: innerWidth, documentWidth: document.documentElement.scrollWidth, h1: document.querySelector("h1")?.textContent, headings: document.querySelectorAll("h1").length }));
      ensure(metrics.headings === 1, "Expected one H1");
      ensure(metrics.documentWidth <= width + 1, "Page overflows horizontally");
      if (path === "/routes/") {
        const row = page.locator('main a[href="/routes/lviv-celle/"]').first();
        ensure((await row.innerText()).includes("Переглянути напрямок"), "Route action is not visible");
        const box = await row.boundingBox(); ensure(box?.height >= 44, "Route target is too small");
      }
      report.viewportChecks.push({ path, ...metrics });
      if (width === 375 && (path === "/routes/" || path === "/cities/ivano-frankivsk/")) {
        const screenshot = join(output, path === "/routes/" ? "routes-375.png" : "ivano-frankivsk-375.png");
        await page.screenshot({ path: screenshot, fullPage: true }); report.screenshots.push(screenshot);
      }
      return metrics;
    });
  }

  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  await noJs.route("**/*", intercept);
  const staticPage = await noJs.newPage();
  for (const path of ["/routes/", "/cities/lviv/", "/cities/ivano-frankivsk/", "/routes/lviv-celle/"]) {
    await check(`no JavaScript ${path}`, async () => {
      await load(staticPage, path);
      ensure(await staticPage.locator("h1").count() === 1, "No static H1");
      if (path.includes("/cities/")) {
        ensure(await staticPage.locator('a[href*="4k-koval.com"]').count() > 0, "Hub lacks usable operator fallback");
        for (const name of ["Целле", "Вольфсбург", "Брауншвейг", "Шверін", "Люнебург", "Любек"]) ensure((await staticPage.locator("main").innerText()).includes(name), `Static hub lost ${name}`);
      }
      return { staticContent: true };
    });
  }
  await noJs.close();
  await context.close();
} finally {
  await browser.close();
  writeFileSync(join(output, "report.json"), JSON.stringify(report, null, 2));
}
const failures = report.checks.filter((check) => !check.passed);
console.log(JSON.stringify({ passed: report.checks.length - failures.length, failed: failures, viewportChecks: report.viewportChecks.length, messagesChecked: report.outgoingMessagesChecked, runtimeErrors: report.runtimeErrors, report: join(output, "report.json") }, null, 2));
if (failures.length || report.runtimeErrors.length) process.exitCode = 1;
