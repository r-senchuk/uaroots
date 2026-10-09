import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";

const outDir = resolve(process.env.UAROUTE_OUT_DIR ?? join(process.cwd(), "out"));
const qaDir = resolve(process.env.POC_BROWSER_OUTPUT_DIR ?? "/private/tmp/uaroute-poc-qa");
const uarouteOrigin = "http://uaroute.test";
const kovalHost = "www.4k-koval.com";
const kovalDist = process.env.KOVAL_DIST_PATH ? resolve(process.env.KOVAL_DIST_PATH) : undefined;
const analyticsExpected = process.env.POC_ANALYTICS_EXPECTED === "enabled";
const googleHost = /(?:^|\.)(?:google[a-z0-9-]*\.[a-z.]+|gstatic\.com|doubleclick\.net)$/i;
const result = {
  generatedAt: new Date().toISOString(),
  uarouteOut: outDir,
  kovalDist: kovalDist ?? null,
  viewportChecks: [],
  targetSizeChecks: [],
  flows: [],
  interceptedPartnerUrls: [],
  interceptedWhatsAppUrls: [],
  blockedExternalRequests: [],
  blockedExternalRequestContexts: [],
  googleRequestAttempts: [],
  consentBridgeStates: [],
  runtimeErrors: [],
  consoleErrors: [],
  requestCounts: {
    mode: analyticsExpected ? "enabled-mock" : "disabled",
    mockedGtmRequests: 0,
    blockedGoogleRequests: 0,
    blockedNonlocalRequests: 0,
    locallyServedPartnerRequests: 0,
  },
  externalRequestPolicy: { serviceWorkers: "blocked", nonlocal: "local-fixture-or-abort", realGoogleNetwork: "prevented by routing; not an independently measured counter" },
  errors: [],
  screenshots: [],
};

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

function mediaType(file) {
  return mimeTypes[extname(file).toLowerCase()] ?? "application/octet-stream";
}

function exportedFile(root, pathname, isRsc = false, isKoval = false) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    decoded = pathname;
  }
  let routePath = decoded.replace(/^\/+/, "");
  if (isRsc && (!routePath || routePath.endsWith("/"))) {
    routePath = `${routePath}index.txt`;
  } else if (!routePath) {
    routePath = "index.html";
  } else if (routePath.endsWith("/")) {
    routePath = `${routePath}index.html`;
  }
  let file = resolve(root, routePath);
  const relativeFile = relative(root, file);
  if (relativeFile.startsWith(`..${sep}`) || relativeFile === "..") return undefined;
  if (existsSync(file)) return file;
  if (isKoval) {
    const fallback = join(root, "index.html");
    return existsSync(fallback) ? fallback : undefined;
  }
  return undefined;
}

async function fulfillFromExport(route, root, url, isKoval = false) {
  const request = route.request();
  const isRsc = request.headers().rsc === "1" || url.searchParams.has("_rsc");
  const file = exportedFile(root, url.pathname, isRsc, isKoval);
  if (!file) {
    await route.fulfill({ status: 404, contentType: "text/plain; charset=utf-8", body: "Export file not found" });
    return;
  }
  let contentType = mediaType(file);
  if (isRsc || file.endsWith(".txt")) contentType = "text/x-component; charset=utf-8";
  await route.fulfill({ status: 200, contentType, body: readFileSync(file) });
}

async function runCheck(name, fn) {
  try {
    const detail = await fn();
    result.flows.push({ name, passed: true, ...(detail === undefined ? {} : { detail }) });
  } catch (error) {
    const message = sanitizeDiagnostic(error instanceof Error ? error.message : String(error));
    result.flows.push({ name, passed: false, error: message });
    result.errors.push(`${name}: ${message}`);
  }
}

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

function sanitizeDiagnostic(value) {
  return String(value)
    .replace(/https?:\/\/[^\s"']+/g, (url) => {
      try { const parsed = new URL(url); return `${parsed.origin}${parsed.pathname}`; } catch { return "[url]"; }
    })
    .replace(/UR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}/g, "[request-code]")
    .replace(/\+?\d[\d ()-]{7,}\d/g, "[phone]")
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, "[date]");
}

function sanitizeUrl(value) {
  try {
    const parsed = new URL(value);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return sanitizeDiagnostic(value);
  }
}

function uarouteGoogleRequests() {
  return result.googleRequestAttempts.filter(({ initiatedBy }) =>
    new URL(initiatedBy).origin === uarouteOrigin,
  );
}

async function selectCity(page, label, query, expectedName) {
  const aliases = page.getByText("Пошук за іншою назвою міста", { exact: true });
  if (await aliases.count() && !await page.getByRole("combobox", { name: label, exact: true }).isVisible()) await aliases.click();
  const field = page.getByRole("combobox", { name: label });
  await field.fill(query);
  const option = page.getByRole("listbox").getByRole("option").filter({ hasText: expectedName }).first();
  await option.waitFor({ state: "visible", timeout: 5000 });
  await option.click();
  ensure((await field.inputValue()) === expectedName, `The ${label} field did not select ${expectedName}`);
}

async function assertNoHorizontalOverflow(page, label, result) {
  const metrics = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  result.viewportChecks.push({ label, ...metrics, passed: metrics.documentWidth <= metrics.viewportWidth + 1 });
  ensure(metrics.documentWidth <= metrics.viewportWidth + 1, `${label} overflows horizontally (${metrics.documentWidth}px wide)`);
}

async function assertMinimumTouchTargets(page, label, result) {
  const targetSizes = await page.locator('a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="link"], [role="combobox"]').evaluateAll((elements) => elements
    .filter((element) => {
      const style = getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) !== 0 && element.getClientRects().length > 0;
    })
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }));
  const undersizedCount = targetSizes.filter(({ width, height }) => width < 44 || height < 44).length;
  result.targetSizeChecks.push({ label, checked: targetSizes.length, undersized: undersizedCount, passed: targetSizes.length > 0 && undersizedCount === 0 });
  ensure(targetSizes.length > 0 && undersizedCount === 0, `${label} has ${undersizedCount} visible interactive targets below 44px`);
}

async function captureOpenedUrl(page) {
  return page.evaluate(() => window.__pocOpenedUrls?.at(-1) ?? null);
}

async function run() {
  if (!existsSync(join(outDir, "index.html"))) throw new Error(`Static export not found at ${outDir}; build UARoute before running this evaluator.`);
  if (kovalDist && !existsSync(join(kovalDist, "index.html"))) throw new Error(`KOVAL_DIST_PATH has no index.html: ${kovalDist}`);

  const playwrightModule = process.env.PLAYWRIGHT_MODULE_PATH ?? "playwright";
  const { chromium } = await import(playwrightModule);
  const chromePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const launchOptions = { headless: true };
  if (existsSync(chromePath)) launchOptions.executablePath = chromePath;
  const browser = await chromium.launch(launchOptions);

  try {
    async function createContext() {
      const context = await browser.newContext({ locale: "uk-UA", reducedMotion: "reduce", serviceWorkers: "block", hasTouch: true });
      context.setDefaultTimeout(8000);
      context.setDefaultNavigationTimeout(10000);
      context.on("page", (page) => {
        page.on("pageerror", (error) => result.runtimeErrors.push(sanitizeDiagnostic(error.message)));
        page.on("console", (message) => {
          if (message.type() === "error") result.consoleErrors.push(sanitizeDiagnostic(message.text()));
        });
      });
      await context.exposeBinding("__pocCaptureConsentState", (_source, state) => {
        result.consentBridgeStates.push(state);
      });
      await context.addInitScript(() => {
        window.__pocOpenedUrls = [];
        window.__pocConsentBridgeCalls = [];
        window.__pocConsentBridgeCapturedCount = 0;
        window.open = (url) => {
          window.__pocOpenedUrls.push(String(url));
          return null;
        };
      });

      await context.route("**/*", async (route) => {
        const url = new URL(route.request().url());
        if (url.origin === uarouteOrigin) {
          await fulfillFromExport(route, outDir, url);
          return;
        }
        if ([`https://${kovalHost}`, "https://4k-koval.com"].includes(url.origin) && kovalDist) {
          result.requestCounts.locallyServedPartnerRequests += 1;
          if (url.searchParams.has("utm_source") || url.searchParams.has("ref_code")) {
            result.interceptedPartnerUrls.push(url.toString());
          }
          // The staged operator export is also served locally; no partner request leaves this harness.
          await fulfillFromExport(route, kovalDist, url, true);
          return;
        }

        let initiatedBy = "about:blank";
        try {
          initiatedBy = route.request().frame().url();
        } catch {
          // A browser-owned request may not have an initiating frame.
        }
        const isGoogle = googleHost.test(url.hostname);
        if (analyticsExpected && url.origin === "https://www.googletagmanager.com" && url.pathname === "/gtm.js") {
          result.requestCounts.mockedGtmRequests += 1;
          result.googleRequestAttempts.push({ url: url.toString(), initiatedBy, outcome: "mocked-gtm" });
          const consentTemplate = readFileSync(join(process.cwd(), "infra/analytics/uaroute-basic-consent.txt"), "utf8");
          await route.fulfill({
            contentType: "text/javascript; charset=utf-8",
            body: `(function(require,data){${consentTemplate}\n})(function(name){function record(state){window.__pocConsentBridgeCalls.push(state);return window.__pocCaptureConsentState(state).then(function(){window.__pocConsentBridgeCapturedCount+=1;});}return {setDefaultConsentState:record,updateConsentState:record,callInWindow:function(name,callback){window[name](callback);}}[name];},{gtmOnSuccess:function(){}});`,
          });
          return;
        }

        result.requestCounts.blockedNonlocalRequests += 1;
        if (isGoogle) {
          result.requestCounts.blockedGoogleRequests += 1;
          result.googleRequestAttempts.push({ url: url.toString(), initiatedBy, outcome: "blocked" });
        }
        if (url.hostname === kovalHost || url.hostname === "4k-koval.com") {
          if (url.searchParams.has("utm_source") || url.searchParams.has("ref_code")) result.interceptedPartnerUrls.push(url.toString());
        } else if (url.hostname === "wa.me") {
          result.interceptedWhatsAppUrls.push(url.toString());
        } else {
          result.blockedExternalRequests.push(url.toString());
          result.blockedExternalRequestContexts.push({ url: url.toString(), initiatedBy });
        }
        await route.abort("blockedbyclient");
      });
      return context;
    }

    const context = await createContext();

    await runCheck("general browsing records an explicit analytics refusal", async () => {
      const page = await context.newPage();
      const googleAttemptsBeforeChoice = result.googleRequestAttempts.length;
      await page.goto(`${uarouteOrigin}/`, { waitUntil: "domcontentloaded" });
      if (analyticsExpected) {
        await page.getByRole("button", { name: "Без аналітики", exact: true }).waitFor({ state: "visible" });
        await page.getByRole("button", { name: "Без аналітики", exact: true }).click();
      } else {
        await page.getByRole("button", { name: "Налаштування приватності", exact: true }).click();
        await page.getByRole("button", { name: "Зберегти без аналітики", exact: true }).click();
      }
      ensure(await page.evaluate(() => window.__uarouteAnalyticsConsent) === false, "General browsing did not record an explicit refusal");
      ensure(result.googleRequestAttempts.length === googleAttemptsBeforeChoice, "General browsing made a Google request before or after refusal");
      await page.close();
      return { choice: "refused", mode: result.requestCounts.mode };
    });

    await runCheck("UTM acquisition survives SPA navigation and stays separate from footer referral", async () => {
      const page = await context.newPage();
      await page.goto(`${uarouteOrigin}/cities/lviv/?utm_source=telegram&utm_medium=social&utm_campaign=route_launch&utm_content=ignored_private_text`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle");
      await page.locator('a[href="/routes/lviv-celle/"]').first().click();
      await page.waitForURL("**/routes/lviv-celle/");
      const footer = page.locator("footer").getByRole("link", { name: "Сайт перевізника Коваль ↗", exact: true });
      await footer.focus();
      const [popup] = await Promise.all([page.waitForEvent("popup"), footer.press("Enter")]);
      const url = new URL(await footer.getAttribute("href"));
      ensure(url.searchParams.get("utm_source") === "uaroute" && url.searchParams.get("utm_campaign") === "koval_poc", "Footer forwarded acquisition instead of referral labels");
      ensure(/^UR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}$/.test(url.searchParams.get("ref_code") ?? ""), "Keyboard footer handoff lacks sender code");
      const event = await page.evaluate(() => window.__uarouteEvents?.filter((event) => event.event === "koval_site_click").at(-1));
      ensure(event?.source === "telegram" && event?.medium === "social" && event?.campaign === "route_launch" && event?.landingPage === "/cities/lviv/" && event?.targetPath === "/routes/lviv-celle/", "SPA acquisition/current target was overwritten");
      ensure(!JSON.stringify(event).includes("ignored_private_text"), "Raw acquisition content leaked into events");
      await popup.close(); await page.close();
      return { firstLanding: "/cities/lviv/", acquisition: "telegram/social/route_launch", partner: "uaroute/referral/koval_poc", keyboard: true };
    });

    await runCheck("candidate secondary website link carries sender code and cities on middle click", async () => {
      const page = await context.newPage();
      await page.goto(`${uarouteOrigin}/`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle");
      await selectCity(page, "Звідки", "Lviv", "Львів");
      await selectCity(page, "Куди", "Celle", "Целле");
      // Use an unpublished pair to display CandidateInquiry rather than a route-page result.
      await selectCity(page, "Куди", "Lubeck", "Любек");
      await page.getByRole("button", { name: "Знайти маршрут" }).click();
      const link = page.getByRole("link", { name: "Перейдіть на сайт Коваль", exact: true });
      await link.waitFor({ state: "visible" });
      await link.click({ button: "middle" });
      const href = await link.getAttribute("href");
      const opened = await page.evaluate(() => window.__pocOpenedUrls.at(-1));
      ensure(opened === href, "Middle-click did not open the prepared referral URL");
      const url = new URL(href);
      ensure(/^UR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}$/.test(url.searchParams.get("ref_code") ?? ""), "Secondary middle-click lacks sender code");
      ensure(url.searchParams.get("origin_city_id") === "lviv" && url.searchParams.get("destination_city_id") === "luebeck", "Secondary link lost selected cities");
      ensure(url.searchParams.get("utm_content") === "candidate_inquiry", "Secondary link placement changed");
      await page.close();
      return { origin: "lviv", destination: "luebeck", middleClick: true, handoffIntercepted: true };
    });

    const mobile = await context.newPage();
    await mobile.setViewportSize({ width: 375, height: 812 });
    await mobile.goto(`${uarouteOrigin}/`, { waitUntil: "domcontentloaded" });
    await mobile.waitForLoadState("networkidle");
    await assertNoHorizontalOverflow(mobile, "mobile home 375px", result);
    const mobileShot = join(qaDir, "mobile-home-375.png");
    mkdirSync(qaDir, { recursive: true });
    await mobile.screenshot({ path: mobileShot, fullPage: true });
    result.screenshots.push(mobileShot);

    await runCheck("city aliases in Ukrainian, Russian, German, Polish, and English", async () => {
      await mobile.getByText("Пошук за іншою назвою міста", { exact: true }).click();
      const examples = [
        ["Львів", "Львів", "Звідки"],
        ["Львов", "Львів", "Звідки"],
        ["Lüneburg", "Люнебург", "Куди"],
        ["Kałusz", "Калуш", "Звідки"],
        ["Celle", "Целле", "Куди"],
      ];
      for (const [query, expected, side] of examples) {
        const field = mobile.getByRole("combobox", { name: side });
        await field.fill(query);
        await mobile.getByRole("listbox").getByRole("option").filter({ hasText: expected }).first().waitFor({ state: "visible" });
        await field.fill("");
      }
      return { aliasesChecked: examples.length };
    });

    await runCheck("Celle hub defaults, fourteen Ukrainian choices, route directions and responsive navigation", async () => {
      const cellePage = await context.newPage();
      await context.tracing.start({ screenshots: true, snapshots: true, sources: false });
      await cellePage.setViewportSize({ width: 360, height: 800 });
      await cellePage.goto(`${uarouteOrigin}/cities/celle/`, { waitUntil: "networkidle" });
      await cellePage.getByRole("heading", { level: 1, name: "Поїздки з Целле до України та назад" }).waitFor();
      await cellePage.getByText("Пошук за іншою назвою міста", { exact: true }).click();
      ensure(await cellePage.getByRole("button", { name: "До України", exact: true }).getAttribute("aria-pressed") === "true", "Celle hub did not default to Germany → Ukraine");
      ensure(await cellePage.getByRole("combobox", { name: "Звідки" }).inputValue() === "Целле", "Celle was not selected as the departure city");

      const ukrainianChoices = ["Львів", "Івано-Франківськ", "Долина", "Калуш", "Стрий", "Галич", "Бурштин", "Пустомити", "Брюховичі", "Городок (Львівська область)", "Миколаїв (Львівська область)", "Новий Розділ", "Надвірна", "Жидачів"];
      const choices = await cellePage.getByLabel("Українське місто").locator("option").allTextContents();
      ensure(JSON.stringify(choices.slice(1)) === JSON.stringify(ukrainianChoices), "Celle hub Ukrainian choices or order changed");

      for (const width of [360, 375, 1440]) {
        await cellePage.setViewportSize({ width, height: width === 1440 ? 1000 : 812 });
        await assertNoHorizontalOverflow(cellePage, `Celle hub ${width}px`, result);
        const buttonSizes = await cellePage.getByRole("group", { name: "Напрямок поїздки" }).getByRole("button").evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().height));
        const searchButtonSize = await cellePage.getByRole("button", { name: "Знайти маршрут" }).evaluate((button) => button.getBoundingClientRect().height);
        ensure(buttonSizes.every((height) => height >= 44) && searchButtonSize >= 44, `Celle primary search actions are smaller than 44px at ${width}px`);
        await assertMinimumTouchTargets(cellePage, `Celle hub ${width}px`, result);
        const shot = join(qaDir, `celle-hub-${width}.png`);
        await cellePage.screenshot({ path: shot, fullPage: true });
        result.screenshots.push(shot);
      }

      await cellePage.setViewportSize({ width: 375, height: 812 });
      const ukrainianDestination = cellePage.getByRole("combobox", { name: "Куди" });
      await ukrainianDestination.fill("Celle");
      ensure(await cellePage.getByRole("listbox").getByRole("option").count() === 0, "German Celle alias appeared in the Ukrainian destination suggestions");
      await ukrainianDestination.fill("");
      await cellePage.getByLabel("Українське місто").selectOption("lviv");
      await cellePage.getByRole("button", { name: "Знайти маршрут" }).click();
      await cellePage.waitForURL("**/routes/celle-lviv/");
      ensure(await cellePage.locator('link[rel="canonical"]').getAttribute("href") === "https://uaroute.com/routes/celle-lviv/", "Celle → Lviv did not use the existing route page");
      await cellePage.goto(`${uarouteOrigin}/cities/celle/`, { waitUntil: "networkidle" });
      await selectCity(cellePage, "Куди", "Lviv", "Львів");
      const reverseButton = cellePage.getByRole("button", { name: "До Німеччини", exact: true });
      await reverseButton.tap();
      await cellePage.waitForFunction(() => {
        const fields = [...document.querySelectorAll('input[role="combobox"]')];
        return document.querySelector('button[aria-pressed="true"]')?.textContent?.includes("До Німеччини") &&
          fields[0]?.value === "Львів" && fields[1]?.value === "Целле";
      });
      ensure(await cellePage.getByRole("combobox", { name: "Звідки" }).inputValue() === "Львів" && await cellePage.getByRole("combobox", { name: "Куди" }).inputValue() === "Целле", "Direction switch did not preserve and reverse the selected city pair");
      await cellePage.getByRole("button", { name: "Знайти маршрут" }).click();
      await cellePage.waitForURL("**/routes/lviv-celle/");

      await cellePage.goto(`${uarouteOrigin}/cities/celle/`, { waitUntil: "networkidle" });
      await cellePage.getByText("Пошук за іншою назвою міста", { exact: true }).click();
      await selectCity(cellePage, "Куди", "Stryi", "Стрий");
      await cellePage.getByRole("button", { name: "Знайти маршрут" }).click();
      await cellePage.locator('section[aria-labelledby$="-candidate-inquiry-title"]').waitFor({ state: "visible" });
      ensure(new URL(cellePage.url()).pathname === "/cities/celle/", "Celle → Stryi created an unselected public route URL");

      const nearbyLink = cellePage.locator('section[aria-labelledby="nearby-places-heading"] a[href="#search-heading"]');
      await nearbyLink.focus();
      await nearbyLink.press("Enter");
      ensure(await cellePage.evaluate(() => document.activeElement?.id) === "search-heading", "Nearby return link did not restore keyboard focus to search");
      ensure(await cellePage.locator('a[href="/cities/lviv/"]').count() > 0 && await cellePage.locator('a[href="/cities/ivano-frankivsk/"]').count() > 0, "Celle hub related-hub HTML links are missing");
      const footerHref = await cellePage.locator("footer").getByRole("link", { name: "Сайт перевізника Коваль ↗", exact: true }).getAttribute("href");
      const footerUrl = new URL(footerHref);
      ensure(!footerUrl.searchParams.has("origin_city_id") && !footerUrl.searchParams.has("destination_city_id"), "Incomplete Celle footer handoff included only part of a city pair");

      const trace = join(qaDir, "celle-ui-trace.zip");
      await context.tracing.stop({ path: trace });
      result.traces = [trace];

      const dateCanary = "2030-12-31";
      const formattedDateCanary = "31.12.2030";
      const phoneCanary = "+48111222333";
      const beforeForm = await cellePage.evaluate(() => JSON.stringify({
        events: window.__uarouteEvents ?? [], dataLayer: window.dataLayer ?? [],
        local: Object.keys(localStorage).map((key) => [key, localStorage.getItem(key)]),
        session: Object.keys(sessionStorage).map((key) => [key, sessionStorage.getItem(key)]),
      }));
      ensure(!beforeForm.includes(dateCanary) && !beforeForm.includes(phoneCanary), "Celle browser state already contains a synthetic form canary");
      await cellePage.getByLabel("Бажана дата поїздки", { exact: true }).fill(dateCanary);
      await cellePage.getByLabel("Телефон для зв’язку", { exact: true }).fill(phoneCanary);
      await cellePage.getByLabel("Пасажирів", { exact: true }).selectOption("2");
      await cellePage.getByRole("button", { name: "Уточнити поїздку в WhatsApp" }).click();
      const handoff = new URL(await captureOpenedUrl(cellePage));
      ensure(handoff.hostname === "wa.me", "Celle inline inquiry did not use the intercepted WhatsApp handoff");
      const generatedMessage = handoff.searchParams.get("text") ?? "";
      ensure(generatedMessage.includes(formattedDateCanary) && generatedMessage.includes(phoneCanary), "Intercepted Celle handoff omitted its formatted synthetic form canaries");
      const afterForm = await cellePage.evaluate(() => JSON.stringify({
        events: window.__uarouteEvents ?? [], dataLayer: window.dataLayer ?? [],
        local: Object.keys(localStorage).map((key) => [key, localStorage.getItem(key)]),
        session: Object.keys(sessionStorage).map((key) => [key, sessionStorage.getItem(key)]),
      }));
      ensure(!afterForm.includes(dateCanary) && !afterForm.includes(formattedDateCanary) && !afterForm.includes(phoneCanary) && !afterForm.includes(generatedMessage), "Celle form canaries leaked into analytics or browser storage");
      return { choices: ukrainianChoices.length, outboundRoute: "celle-lviv", reversedRoute: "lviv-celle", unselectedPair: "inline inquiry", trace: "celle-ui-trace.zip" };
    });

    await runCheck("Celle first-touch acquisition survives an existing route navigation", async () => {
      const page = await context.newPage();
      const privateContentCanary = "celle-private-utm-content";
      await page.goto(`${uarouteOrigin}/cities/celle/?utm_source=telegram&utm_medium=social&utm_campaign=route_launch&utm_content=${privateContentCanary}`, { waitUntil: "networkidle" });
      await selectCity(page, "Куди", "Lviv", "Львів");
      await page.getByRole("button", { name: "Знайти маршрут" }).click();
      await page.waitForURL("**/routes/celle-lviv/");
      const events = await page.evaluate(() => window.__uarouteEvents ?? []);
      const search = events.find((event) => event.event === "route_search_completed");
      const routeView = events.find((event) => event.event === "route_view" && event.routeId === "celle-lviv");
      ensure(search?.landingPage === "/cities/celle/" && search?.targetPath === "/cities/celle/", "Celle route search lost its first landing or current search path");
      ensure(routeView?.landingPage === "/cities/celle/" && routeView?.source === "telegram" && routeView?.medium === "social" && routeView?.campaign === "route_launch", "Celle route view lost its first-touch acquisition");
      const footer = page.locator("footer").getByRole("link", { name: "Сайт перевізника Коваль ↗", exact: true });
      const [popup] = await Promise.all([page.waitForEvent("popup"), footer.click()]);
      const contactEvent = await page.evaluate(() => window.__uarouteEvents?.filter((event) => event.event === "koval_site_click").at(-1));
      ensure(contactEvent?.landingPage === "/cities/celle/" && contactEvent?.targetPath === "/routes/celle-lviv/", "Celle operator contact event did not separate first landing from current route target");
      ensure(contactEvent?.source === "telegram" && contactEvent?.medium === "social" && contactEvent?.campaign === "route_launch", "Celle operator contact event lost approved acquisition fields");
      await popup.close();
      ensure(JSON.stringify(events).includes("telegram") && JSON.stringify(events).includes("route_launch"), "Celle approved acquisition fields were not retained");
      const serializedEvents = JSON.stringify(await page.evaluate(() => window.__uarouteEvents ?? []));
      ensure(!serializedEvents.includes(privateContentCanary), "Celle raw utm_content leaked into analytics");
      await page.close();
      return { landingPage: "/cities/celle/", targetPath: "/routes/celle-lviv/", route: "celle-lviv", contactEvent: true, rawUtmContentStored: false };
    });

    await runCheck("keyboard autocomplete selects route endpoints", async () => {
      const origin = mobile.getByRole("combobox", { name: "Звідки" });
      const destination = mobile.getByRole("combobox", { name: "Куди" });
      await origin.fill("Dolina");
      await origin.press("ArrowDown");
      await origin.press("Enter");
      ensure((await origin.inputValue()) === "Долина", "Arrow/Enter did not select Dolyna");
      await destination.fill("Celle");
      await destination.press("ArrowDown");
      await destination.press("Enter");
      ensure((await destination.inputValue()) === "Целле", "Arrow/Enter did not select Celle");
      return { selectedByKeyboard: ["Долина", "Целле"] };
    });

    await runCheck("legal pages and legacy redirect pages", async () => {
      for (const [path, heading, operatorName] of [
        ["/imprint/", "Відомості про оператора", "Roman Senchuk"],
        ["/privacy/", "Приватність", "Crew Bravo"],
      ]) {
        await mobile.goto(`${uarouteOrigin}${path}`, { waitUntil: "domcontentloaded" });
        await mobile.getByRole("heading", { level: 1, name: heading }).waitFor({ state: "visible" });
        ensure((await mobile.locator("body").innerText()).includes(operatorName), `${path} is missing operator/brand identity`);
      }
      const redirects = [
        ["/contact/", "/about/"], ["/contacts/", "/about/"], ["/carriers/", "/routes/"],
        ["/packages/", "/about/"], ["/gallery/", "/"],
      ];
      for (const [from, to] of redirects) {
        await mobile.goto(`${uarouteOrigin}${from}`, { waitUntil: "domcontentloaded" });
        await mobile.waitForURL(`**${to}`);
      }
      return { legalPages: 2, redirects: redirects.length };
    });

    await runCheck("all six candidate detail pages link to their reverse route and fit mobile", async () => {
      const candidateSlugs = [
        "dolyna-celle", "celle-dolyna", "dolyna-wolfsburg", "wolfsburg-dolyna",
        "dolyna-braunschweig", "braunschweig-dolyna",
      ];
      for (const slug of candidateSlugs) {
        await mobile.goto(`${uarouteOrigin}/routes/${slug}/`, { waitUntil: "domcontentloaded" });
        await mobile.waitForLoadState("networkidle");
        await mobile.getByText("Уточніть можливість поїздки на бажану дату.").waitFor({ state: "visible" });
        const [origin, destination] = slug.split("-").reduce((parts, segment, index) => {
          const citySegments = new Set(["dolyna", "celle", "wolfsburg", "braunschweig"]);
          const candidate = citySegments.has(segment) ? segment : "";
          if (candidate) parts[index === 0 ? 0 : 1] = candidate;
          return parts;
        }, ["", ""]);
        const reverse = `${destination}-${origin}`;
        ensure(await mobile.locator(`a[href="/routes/${reverse}/"]`).count() > 0, `${slug} has no reverse-direction route link`);
        await assertNoHorizontalOverflow(mobile, `mobile route ${slug} 375px`, result);
        const screenshot = join(qaDir, `mobile-route-${slug}-375.png`);
        await mobile.screenshot({ path: screenshot, fullPage: true });
        result.screenshots.push(screenshot);
      }
      return { candidatePagesChecked: candidateSlugs.length };
    });

    const desktop = await context.newPage();
    await desktop.setViewportSize({ width: 1440, height: 1000 });
    await desktop.goto(`${uarouteOrigin}/?utm_source=google&utm_medium=organic&utm_campaign=m1`, { waitUntil: "domcontentloaded" });
    await desktop.waitForLoadState("networkidle");
    await assertNoHorizontalOverflow(desktop, "desktop home 1440px", result);

    await runCheck("Dolyna → Celle search and first-touch analytics", async () => {
      await selectCity(desktop, "Звідки", "Dolina", "Долина");
      await selectCity(desktop, "Куди", "Celle", "Целле");
      await desktop.getByRole("button", { name: "Знайти маршрут" }).click();
      await desktop.waitForURL("**/routes/dolyna-celle/");
      await desktop.getByText("Уточніть можливість поїздки на бажану дату.").waitFor({ state: "visible" });
      const events = await desktop.evaluate(() => window.__uarouteEvents ?? []);
      ensure(events.some((event) => event.event === "route_search_completed"), "Route-search event was not buffered");
      ensure(events.some((event) => event.event === "route_view" && event.routeId === "dolyna-celle"), "Route-view event or route ID is missing");
      ensure(events.every((event) => event.source === "google" && event.medium === "organic" && event.campaign === "m1" && event.landingPage === "/"), "First-touch acquisition was not retained across SPA navigation");

      await desktop.locator("#inquiry-date").fill("2030-12-31");
      await desktop.locator("#inquiry-phone").fill("+48111222333");
      await desktop.locator("#inquiry-passengers").selectOption("2");
      await desktop.getByRole("button", { name: "Уточнити поїздку в WhatsApp" }).click();
      const opened = await captureOpenedUrl(desktop);
      ensure(opened, "The route inquiry did not open a handoff URL");
      const handoff = new URL(opened);
      ensure(handoff.hostname === "wa.me", "The route inquiry did not target WhatsApp");
      const message = handoff.searchParams.get("text") ?? "";
      ensure(message.includes("Джерело: UARoute"), "The WhatsApp message is missing UARoute attribution");
      ensure(message.includes("Долина → Целле"), "The WhatsApp message has the wrong route endpoints");
      ensure(message.includes("Це запит про поїздку, а не бронювання."), "The message does not say this is not a confirmed booking");
      ensure(/Код: UR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}/.test(message), "The WhatsApp message has no valid opaque inquiry code");

      const afterHandoff = await desktop.evaluate(() => window.__uarouteEvents ?? []);
      const serialized = JSON.stringify(afterHandoff);
      ensure(!serialized.includes("2030-12-31"), "Analytics buffer contains the selected travel date");
      ensure(!serialized.includes("+48111222333"), "Analytics buffer contains the entered phone number");
      ensure(afterHandoff.every((event) => event.landingPage === "/"), "Acquisition landing page changed after client navigation");
      const externalScripts = await desktop.locator("script[src]").evaluateAll((scripts) => scripts.map((script) => script.src));
      ensure(!externalScripts.some((src) => /googleapis\.com|googletagmanager\.com|gstatic\.com/i.test(src)), "A Google script loaded without consent");
      return { eventCount: afterHandoff.length, handoffHost: handoff.hostname, inquiryCodePresent: true };
    });

    await runCheck("reverse Celle → Dolyna search", async () => {
      await desktop.goto(`${uarouteOrigin}/`, { waitUntil: "domcontentloaded" });
      await desktop.waitForLoadState("networkidle");
      await desktop.getByRole("button", { name: "До України", exact: true }).click();
      await selectCity(desktop, "Звідки", "Celle", "Целле");
      await selectCity(desktop, "Куди", "Dolina", "Долина");
      await desktop.getByRole("button", { name: "Знайти маршрут" }).click();
      await desktop.waitForURL("**/routes/celle-dolyna/");
      await desktop.getByRole("heading", { name: /Целле.*Долина/ }).waitFor({ state: "visible" });
      return { route: new URL(desktop.url()).pathname };
    });

    await runCheck("bounded inline inquiry for Lviv → Lübeck", async () => {
      await mobile.goto(`${uarouteOrigin}/`, { waitUntil: "domcontentloaded" });
      await mobile.waitForLoadState("networkidle");
      await selectCity(mobile, "Звідки", "Lviv", "Львів");
      await selectCity(mobile, "Куди", "Lübeck", "Любек");
      await mobile.getByRole("button", { name: "Знайти маршрут" }).click();
      await mobile.locator('section[aria-labelledby$="-candidate-inquiry-title"]').waitFor({ state: "visible" });
      ensure(new URL(mobile.url()).pathname === "/", "An unselected candidate pair created an extra route landing page");
      await mobile.getByLabel("Бажана дата поїздки", { exact: true }).fill("2030-12-31");
      await mobile.getByLabel("Телефон для зв’язку", { exact: true }).fill("+48111222333");
      await mobile.getByLabel("Пасажирів", { exact: true }).selectOption("2");
      await mobile.getByRole("button", { name: "Уточнити поїздку в WhatsApp" }).click();
      const opened = await captureOpenedUrl(mobile);
      ensure(opened, "The inline candidate inquiry did not open a handoff URL");
      const handoff = new URL(opened);
      const message = handoff.searchParams.get("text") ?? "";
      ensure(handoff.hostname === "wa.me", "The inline candidate inquiry did not target WhatsApp");
      ensure(message.includes("Львів → Любек"), "Candidate inquiry has incorrect origin/destination");
      ensure(message.includes("Джерело: UARoute"), "Candidate inquiry is missing source attribution");
      ensure(message.includes("підтвердьте можливість поїздки на цю дату"), "Candidate message does not request feasibility confirmation");
      ensure(message.includes("Це запит про поїздку, а не бронювання."), "Candidate message implies a confirmed booking");
      ensure(/Код: UR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}/.test(message), "Candidate inquiry has no valid opaque code");
      const text = await mobile.locator("body").innerText();
      ensure(text.includes("Коваль перевірить можливість поїздки на вашу дату"), "Candidate form does not explain trip feasibility confirmation");
      const events = await mobile.evaluate(() => window.__uarouteEvents ?? []);
      const serializedEvents = JSON.stringify(events);
      ensure(!serializedEvents.includes("2030-12-31"), "Analytics buffer contains the candidate travel date");
      ensure(!serializedEvents.includes("+48111222333"), "Analytics buffer contains the candidate phone number");
      await assertNoHorizontalOverflow(mobile, "mobile candidate inquiry 375px", result);
      const candidateShot = join(qaDir, "mobile-candidate-inquiry-375.png");
      await mobile.screenshot({ path: candidateShot, fullPage: true });
      result.screenshots.push(candidateShot);
      return { route: new URL(mobile.url()).pathname, handoffHost: handoff.hostname };
    });

    await runCheck("editorial Lviv → Hamburg remains a search miss", async () => {
      await mobile.goto(`${uarouteOrigin}/`, { waitUntil: "domcontentloaded" });
      await mobile.waitForLoadState("networkidle");
      await selectCity(mobile, "Звідки", "Львів", "Львів");
      await selectCity(mobile, "Куди", "Hamburg", "Гамбург");
      await mobile.getByRole("button", { name: "Знайти маршрут" }).click();
      await mobile.getByRole("heading", { name: "Ми поки не маємо інформації про цей маршрут." }).waitFor({ state: "visible" });
      ensure(await mobile.locator('section[aria-labelledby$="-candidate-inquiry-title"]').count() === 0, "Editorial search miss received candidate inquiry UI");
      ensure(new URL(mobile.url()).pathname === "/", "Editorial search navigated to a route page");
      return { route: new URL(mobile.url()).pathname };
    });

    await runCheck("editorial pages show carrier contact without inquiry forms", async () => {
      for (const slug of ["lviv-hamburg", "lviv-berlin"]) {
        await mobile.goto(`${uarouteOrigin}/routes/${slug}/`, { waitUntil: "domcontentloaded" });
        await mobile.waitForLoadState("networkidle");
        ensure(await mobile.locator("#inquiry-date, #inquiry-phone, #inquiry-anchor").count() === 0, `${slug} shows an inquiry form despite its editorial notice`);
        await mobile.getByRole("link", { name: /Сайт Коваль/ }).waitFor({ state: "visible" });
        await mobile.getByText("Довідка про напрямок", { exact: false }).waitFor({ state: "visible" });
        await mobile.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        ensure(await mobile.locator("div.fixed button").count() === 0, `${slug} shows a sticky inquiry action`);
      }
      return { editorialPagesChecked: 2 };
    });

    await runCheck("missing/past date and invalid phone block the mobile sticky handoff", async () => {
      await mobile.goto(`${uarouteOrigin}/routes/dolyna-celle/`, { waitUntil: "domcontentloaded" });
      await mobile.waitForLoadState("networkidle");
      await mobile.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      const stickyButton = mobile.locator("div.fixed button").first();
      await stickyButton.waitFor({ state: "visible" });
      await stickyButton.click();
      ensure(await mobile.locator("#inquiry-date-error").isVisible(), "Missing date was not reported");
      ensure(await mobile.evaluate(() => document.activeElement?.id) === "inquiry-date", "Missing date did not receive focus");
      ensure(await mobile.evaluate(() => window.__pocOpenedUrls.length) === 0, "An incomplete request opened a handoff");

      await mobile.locator("#inquiry-date").fill("2020-01-01");
      await mobile.locator("#inquiry-phone").fill("invalid-phone");
      await mobile.getByRole("button", { name: "Уточнити поїздку в WhatsApp" }).click();
      ensure(await mobile.locator("#inquiry-date-error").isVisible(), "Past date was not rejected");
      ensure(await mobile.evaluate(() => document.activeElement?.id) === "inquiry-date", "Past date did not receive focus");
      ensure(await mobile.evaluate(() => window.__pocOpenedUrls.length) === 0, "A past-date request opened a handoff");

      await mobile.locator("#inquiry-date").fill("2030-12-31");
      await mobile.locator("#inquiry-phone").fill("invalid-phone");
      await mobile.getByRole("button", { name: "Уточнити поїздку в WhatsApp" }).click();
      ensure(await mobile.locator("#inquiry-phone-error").isVisible(), "Invalid phone was not reported");
      ensure(await mobile.evaluate(() => document.activeElement?.id) === "inquiry-phone", "Invalid phone did not receive focus");
      ensure(await mobile.evaluate(() => window.__pocOpenedUrls.length) === 0, "An invalid-phone request opened a handoff");
      return { blockedSubmissions: 3, focusedFields: ["inquiry-date", "inquiry-date", "inquiry-phone"] };
    });

    await runCheck("route A → reverse → A counts the revisit", async () => {
      const revisitPage = await context.newPage();
      await revisitPage.goto(`${uarouteOrigin}/routes/dolyna-celle/`, { waitUntil: "domcontentloaded" });
      await revisitPage.waitForFunction(() => (window.__uarouteEvents ?? []).some((event) => event.event === "route_view" && event.routeId === "dolyna-celle"));
      await revisitPage.locator('a[href="/routes/celle-dolyna/"]').first().click();
      await revisitPage.waitForURL("**/routes/celle-dolyna/");
      await revisitPage.waitForFunction(() => (window.__uarouteEvents ?? []).some((event) => event.event === "route_view" && event.routeId === "celle-dolyna"));
      await revisitPage.locator('a[href="/routes/dolyna-celle/"]').first().click();
      await revisitPage.waitForURL("**/routes/dolyna-celle/");
      await revisitPage.waitForFunction(() => (window.__uarouteEvents ?? []).filter((event) => event.event === "route_view" && event.routeId === "dolyna-celle").length === 2);
      const counts = await revisitPage.evaluate(() => Object.fromEntries(
        ["dolyna-celle", "celle-dolyna"].map((routeId) => [routeId, window.__uarouteEvents.filter((event) => event.event === "route_view" && event.routeId === routeId).length]),
      ));
      ensure(counts["dolyna-celle"] === 2 && counts["celle-dolyna"] === 1, "Route revisit counts do not match A → B → A");
      return counts;
    });

    await runCheck("Koval referral keeps UARoute code and selected city IDs", async () => {
      await desktop.goto(`${uarouteOrigin}/routes/dolyna-celle/`, { waitUntil: "domcontentloaded" });
      await desktop.waitForLoadState("networkidle");
      const kovalLink = desktop.getByRole("link", { name: /Сайт Коваль/ }).first();
      const [popup] = await Promise.all([desktop.waitForEvent("popup"), kovalLink.click()]);
      if (kovalDist) await popup.waitForLoadState("domcontentloaded");
      const candidate = result.interceptedPartnerUrls.at(-1);
      ensure(candidate, "No partner navigation was intercepted");
      const referral = new URL(candidate);
      ensure(referral.searchParams.get("utm_source") === "uaroute", "Koval referral is missing UARoute source attribution");
      ensure(/^UR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}$/.test(referral.searchParams.get("ref_code") ?? ""), "Koval referral has no valid ref_code");
      ensure(referral.searchParams.get("origin_city_id") === "dolyna", "Koval referral has the wrong origin city ID");
      ensure(referral.searchParams.get("destination_city_id") === "celle", "Koval referral has the wrong destination city ID");
      return { originCityId: "dolyna", destinationCityId: "celle", refCodePresent: true };
    });

    if (kovalDist) {
      await runCheck("staged Koval form receives attribution and prepares a handoff", async () => {
        const referralUrl = result.interceptedPartnerUrls.at(-1);
        ensure(referralUrl, "No Koval referral was captured for the staged form");
        const koval = await context.newPage();
        await koval.goto(referralUrl, { waitUntil: "domcontentloaded" });
        await koval.waitForLoadState("networkidle");
        const fromField = koval.getByLabel("Місто відправлення");
        const toField = koval.getByLabel("Місто прибуття");
        await fromField.fill("Долина");
        await toField.fill("Целле");
        const startValue = await fromField.inputValue();
        const endValue = await toField.inputValue();
        await koval.getByLabel("Дата поїздки").fill("2030-12-31");
        await koval.getByLabel("Контактний телефон").fill("+48111222333");
        const blocked = koval.waitForEvent("requestfailed", {
          predicate: (request) => new URL(request.url()).hostname === "wa.me",
        });
        await koval.locator("form").getByRole("button", { name: /WhatsApp|запит/i }).click({ noWaitAfter: true });
        const whatsapp = (await blocked).url();
        ensure(whatsapp, "Koval submit did not attempt a WhatsApp handoff");
        const message = new URL(whatsapp).searchParams.get("text") ?? "";
        ensure(message.includes("UARoute"), "Koval WhatsApp message lost UARoute source");
        ensure(/UR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}/.test(message), "Koval WhatsApp message lost the inquiry code");
        ensure(message.includes("Долина → Целле"), "Koval WhatsApp message lost the current route endpoints");
        ensure(message.includes("Це запит про поїздку, а не бронювання."), "Koval message does not say the trip needs manual confirmation");
        ensure(message.includes("+48111222333"), "The passenger's phone was not present in the operator-directed message");
        return { origin: startValue, destination: endValue, sourceAndCodePresent: true };
      });

      await runCheck("four new route referrals survive Koval contact in both directions", async () => {
        const pairs = [
          ["lviv-celle", "lviv", "celle", "Львів", "Целле"],
          ["celle-lviv", "celle", "lviv", "Целле", "Львів"],
          ["ivano-frankivsk-wolfsburg", "ivano-frankivsk", "wolfsburg", "Івано-Франківськ", "Вольфсбург"],
          ["wolfsburg-ivano-frankivsk", "wolfsburg", "ivano-frankivsk", "Вольфсбург", "Івано-Франківськ"],
        ];
        for (const [slug, originId, destinationId, from, to] of pairs) {
          await desktop.goto(`${uarouteOrigin}/routes/${slug}/`, { waitUntil: "networkidle" });
          const [koval] = await Promise.all([
            desktop.waitForEvent("popup"), desktop.getByRole("link", { name: /Сайт Коваль/ }).first().click(),
          ]);
          await koval.waitForLoadState("networkidle");
          const referralUrl = result.interceptedPartnerUrls.at(-1);
          ensure(referralUrl, "New route referral was not intercepted");
          const referral = new URL(referralUrl);
          ensure(referral.searchParams.get("origin_city_id") === originId && referral.searchParams.get("destination_city_id") === destinationId, "New referral lost route endpoints");
          const code = referral.searchParams.get("ref_code");
          ensure(/^UR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}$/.test(code ?? ""), "New referral lacks a request code");
          await koval.getByLabel("Місто відправлення").fill(from);
          await koval.getByLabel("Місто прибуття").fill(to);
          await koval.getByLabel("Дата поїздки").fill("2030-12-31");
          await koval.getByLabel("Контактний телефон").fill("+48111222333");
          const blocked = koval.waitForEvent("requestfailed", { predicate: (request) => new URL(request.url()).hostname === "wa.me" });
          await koval.locator("form").getByRole("button", { name: /WhatsApp|запит/i }).click({ noWaitAfter: true });
          const message = new URL((await blocked).url()).searchParams.get("text") ?? "";
          ensure(message.includes("UARoute") && message.includes(code) && message.includes(`${from} → ${to}`), "New Koval handoff lost source, original code or current pair");
          ensure(message.includes("Це запит про поїздку, а не бронювання."), "New Koval handoff implies automatic confirmation");
          await koval.close();
        }
        return { newPairsChecked: pairs.length, sameCodeRetained: true, bothDirections: true, messagesBlocked: true };
      });
    }

    if (analyticsExpected) {
      await runCheck("analytics refusal, reacceptance, revocation, and current view location", async () => {
        // This isolated context starts without a stored choice; general route checks keep their explicit refusal.
        const analyticsContext = await createContext();
        const consentPage = await analyticsContext.newPage();
        await consentPage.setViewportSize({ width: 1440, height: 1000 });
        const googleAttemptsAtFreshContext = result.googleRequestAttempts.length;
        await consentPage.goto(`${uarouteOrigin}/`, { waitUntil: "domcontentloaded" });
        await consentPage.waitForLoadState("networkidle");
        await consentPage.getByRole("button", { name: "Без аналітики" }).waitFor({ state: "visible" });
        const beforeChoiceCount = result.googleRequestAttempts.length - googleAttemptsAtFreshContext;
        ensure(beforeChoiceCount === 0, "A Google request occurred before the first consent choice");
        ensure(await consentPage.locator("script[src]").evaluateAll((scripts) => scripts.every((script) => {
          const host = new URL(script.src).hostname;
          return !/(?:^|\.)(?:google[a-z0-9-]*\.[a-z.]+|gstatic\.com|doubleclick\.net)$/i.test(host);
        })), "A Google-hosted script element exists before consent choice");
        await consentPage.getByRole("button", { name: "Без аналітики" }).click();
        ensure(await consentPage.evaluate(() => window.__uarouteAnalyticsConsent) === false, "Consent refusal did not disable analytics");
        const afterRefusalCount = result.googleRequestAttempts.length - googleAttemptsAtFreshContext;
        ensure(afterRefusalCount === beforeChoiceCount, "A Google request occurred after consent refusal");
        await consentPage.reload({ waitUntil: "networkidle" });
        const acceptButtonsAfterReturn = await consentPage.getByRole("button", { name: "Дозволити аналітику", exact: true }).count();
        ensure(acceptButtonsAfterReturn === 0, "Refusal was not remembered in the isolated context");
        await consentPage.getByRole("button", { name: "Налаштування приватності", exact: true }).click();
        const googleAttemptsBeforeAccept = result.googleRequestAttempts.length;
        await consentPage.getByRole("button", { name: "Дозволити аналітику" }).click();
        await consentPage.waitForFunction(() => window.__uarouteAnalyticsProviderReady === true);
        ensure(await consentPage.evaluate(() => window.__uarouteAnalyticsConsent) === true, "Reaccepted consent was not applied");
        await consentPage.waitForFunction(() => [...document.scripts].some((script) => /googletagmanager\.com/i.test(script.src)));
        await consentPage.waitForFunction(() => window.__pocConsentBridgeCalls.length >= 2 && window.__pocConsentBridgeCapturedCount === window.__pocConsentBridgeCalls.length);
        const googleAttemptsAfterAccept = result.googleRequestAttempts.slice(googleAttemptsBeforeAccept);
        ensure(googleAttemptsAfterAccept.length === 1 && googleAttemptsAfterAccept[0].outcome === "mocked-gtm", "Acceptance must load only the mocked GTM script and no Google collection endpoints");
        const statesAfterAccept = result.consentBridgeStates.slice();
        ensure(statesAfterAccept[0]?.analytics_storage === "denied" && statesAfterAccept.at(-1)?.analytics_storage === "granted", "Mock consent bridge did not apply denied then granted at acceptance");
        ensure(statesAfterAccept.every((state) => state.ad_storage === "denied" && state.ad_user_data === "denied" && state.ad_personalization === "denied"), "The consent bridge granted advertising consent");

        await selectCity(consentPage, "Звідки", "Dolina", "Долина");
        await selectCity(consentPage, "Куди", "Celle", "Целле");
        await consentPage.getByRole("button", { name: "Знайти маршрут" }).click();
        await consentPage.waitForURL("**/routes/dolyna-celle/");
        await consentPage.waitForFunction(() => Array.isArray(window.dataLayer) && window.dataLayer.some((item) => (item?.[0] === "event" && item?.[1] === "route_view") || (item?.event === "uaroute_analytics" && item?.uaroute?.event_name === "route_view")), undefined, { timeout: 8000 });
        const viewsBeforeRevoke = await consentPage.evaluate(() => (window.dataLayer ?? []).filter((item) => (item?.[0] === "event" && item?.[1] === "route_view") || (item?.event === "uaroute_analytics" && item?.uaroute?.event_name === "route_view")).length);
        const gtagPageLocation = await consentPage.evaluate(() => { const view = window.dataLayer.find((item) => (item?.[0] === "event" && item?.[1] === "route_view") || (item?.event === "uaroute_analytics" && item?.uaroute?.event_name === "route_view")); return view?.uaroute?.parameters?.page_location ?? view?.[2]?.page_location; });
        ensure(gtagPageLocation === "https://uaroute.com/routes/dolyna-celle/", `gtag route view has wrong page_location: ${gtagPageLocation}`);

        await consentPage.getByRole("button", { name: "Налаштування приватності", exact: true }).click();
        const googleAttemptsBeforeWithdrawal = result.googleRequestAttempts.length;
        const bridgeStatesBeforeWithdrawal = result.consentBridgeStates.length;
        const withdrawalNavigation = consentPage.waitForNavigation({ waitUntil: "networkidle" });
        await consentPage.getByRole("button", { name: "Без аналітики" }).click();
        await withdrawalNavigation;
        await consentPage.waitForLoadState("networkidle");
        await consentPage.waitForFunction(() => window.__uarouteAnalyticsConsent === false);
        ensure(result.consentBridgeStates.length > bridgeStatesBeforeWithdrawal, "Withdrawal reload did not capture a consent bridge update");
        const statesAfterWithdrawal = result.consentBridgeStates.slice();
        ensure(statesAfterWithdrawal.at(-1)?.analytics_storage === "denied", "Withdrawal did not send denied consent to the bridge");
        ensure(statesAfterWithdrawal.every((state) => state.ad_storage === "denied" && state.ad_user_data === "denied" && state.ad_personalization === "denied"), "The consent bridge granted advertising consent");
        await consentPage.locator('a[href="/routes/celle-dolyna/"]').first().click();
        await consentPage.waitForURL("**/routes/celle-dolyna/");
        const viewsAfterRevoke = await consentPage.evaluate(() => (window.dataLayer ?? []).filter((item) => (item?.[0] === "event" && item?.[1] === "route_view") || (item?.event === "uaroute_analytics" && item?.uaroute?.event_name === "route_view")).length);
        ensure(viewsAfterRevoke === 0, "Analytics received a route view after withdrawal reload");
        const afterWithdrawalCount = result.googleRequestAttempts.length - googleAttemptsBeforeWithdrawal;
        ensure(afterWithdrawalCount === 0, "A Google request occurred after withdrawal");
        ensure(statesAfterAccept[0]?.analytics_storage === "denied" && statesAfterAccept.at(-1)?.analytics_storage === "granted" && statesAfterWithdrawal.at(-1)?.analytics_storage === "denied", "Consent bridge did not apply denied → granted → denied at the corresponding user choices");
        await analyticsContext.close();
        return { gtagPageLocation, routeViewsBeforeRevocation: viewsBeforeRevoke, routeViewsAfterRevocation: viewsAfterRevoke, googleRequestPhases: { beforeChoice: beforeChoiceCount, afterRefusal: afterRefusalCount, afterAcceptance: googleAttemptsAfterAccept.length, afterWithdrawal: afterWithdrawalCount }, mockedGtmRequests: result.requestCounts.mockedGtmRequests };
      });
    } else {
      await runCheck("Google analytics scripts stay absent without consent", async () => {
        const page = desktop;
        const googleScripts = await page.locator("script[src]").evaluateAll((scripts) => scripts.map((script) => script.src).filter((src) => /googletagmanager\.com|google-analytics\.com/i.test(src)));
        const googleRequests = uarouteGoogleRequests();
        ensure(googleScripts.length === 0, "Google script element exists without consent");
        ensure(googleRequests.length === 0, `Google script requested without consent: ${googleRequests[0]}`);
        return { googleScripts: 0, googleRequests: 0 };
      });
    }

    await runCheck("desktop route page has no horizontal overflow", async () => {
      await desktop.goto(`${uarouteOrigin}/routes/dolyna-celle/`, { waitUntil: "domcontentloaded" });
      await desktop.waitForLoadState("networkidle");
      await assertNoHorizontalOverflow(desktop, "desktop candidate route 1440px", result);
      const desktopShot = join(qaDir, "desktop-candidate-route-1440.png");
      await desktop.screenshot({ path: desktopShot, fullPage: true });
      result.screenshots.push(desktopShot);
    });

    await context.close();
  } finally {
    await browser.close();
  }
}

try {
  mkdirSync(qaDir, { recursive: true });
  await run();
} catch (error) {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  result.errors.push(sanitizeDiagnostic(message));
}

result.passed = result.errors.length === 0 && result.runtimeErrors.length === 0 && result.flows.every((flow) => flow.passed) && result.viewportChecks.every((check) => check.passed) && result.targetSizeChecks.every((check) => check.passed);
const resultPath = join(qaDir, "results.json");
const safeResult = {
  ...result,
  interceptedPartnerUrls: result.interceptedPartnerUrls.map(sanitizeUrl),
  interceptedWhatsAppUrls: result.interceptedWhatsAppUrls.map(sanitizeUrl),
  blockedExternalRequests: result.blockedExternalRequests.map(sanitizeUrl),
  blockedExternalRequestContexts: result.blockedExternalRequestContexts.map(({ url, initiatedBy }) => ({ url: sanitizeUrl(url), initiatedBy: sanitizeUrl(initiatedBy) })),
  googleRequestAttempts: result.googleRequestAttempts.map(({ url, initiatedBy, ...rest }) => ({ url: sanitizeUrl(url), initiatedBy: sanitizeUrl(initiatedBy), ...rest })),
  flows: result.flows.map((flow) => flow.error ? { ...flow, error: sanitizeDiagnostic(flow.error) } : flow),
};
writeFileSync(resultPath, `${JSON.stringify(safeResult, null, 2)}\n`);
console.log(JSON.stringify({ passed: result.passed, results: resultPath, flows: safeResult.flows, viewportChecks: result.viewportChecks, blockedExternalRequests: result.blockedExternalRequests.length, requestCounts: result.requestCounts, externalRequestPolicy: result.externalRequestPolicy }, null, 2));
if (!result.passed) process.exitCode = 1;
