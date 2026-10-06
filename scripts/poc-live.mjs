import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const uarouteOrigin = "https://uaroute.com";
const kovalOrigin = "https://www.4k-koval.com";
const qaDir = resolve(process.env.POC_LIVE_OUTPUT_DIR ?? "/private/tmp/uaroute-poc-live-qa");
const reportPath = join(qaDir, "report.json");
const timeoutMs = 8_000;
const navigationTimeoutMs = 20_000;
const candidateSlugs = [
  "dolyna-celle",
  "celle-dolyna",
  "dolyna-wolfsburg",
  "wolfsburg-dolyna",
  "dolyna-braunschweig",
  "braunschweig-dolyna",
  "lviv-celle",
  "celle-lviv",
  "ivano-frankivsk-wolfsburg",
  "wolfsburg-ivano-frankivsk",
];
const expectedCommercialRoutes = [
  ...candidateSlugs.map((slug) => `/routes/${slug}/`),
  "/routes/lviv-hannover/",
].sort();
const pilotCityNames = [
  "Долина", "Калуш", "Івано-Франківськ", "Стрий", "Галич", "Бурштин", "Пустомити",
  "Львів", "Брюховичі", "Городок (Львівська область)", "Миколаїв (Львівська область)",
  "Новий Розділ", "Надвірна", "Жидачів", "Шверін", "Люнебург", "Любек",
  "Целле", "Вольфсбург", "Брауншвейг",
];
const analyticsHost =
  /(?:google-analytics|googletagmanager|googleadservices|doubleclick|segment\.io|amplitude|mixpanel|hotjar|clarity\.ms|facebook\.net)/i;
const whatsappHost = /^(?:wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)$/i;

const result = {
  generatedAt: new Date().toISOString(),
  targets: {
    uaroute: uarouteOrigin,
    koval: kovalOrigin,
  },
  flows: [],
  liveResponses: [],
  routePages: [],
  sitemap: null,
  legalPages: [],
  viewportChecks: [],
  screenshots: [],
  blockedAnalyticsRequests: 0,
  blockedAnalyticsByOrigin: { uaroute: 0, koval: 0, other: 0 },
  interceptedWhatsAppRequests: 0,
  errors: [],
};

const privateCapture = {
  whatsappUrls: [],
  analyticsHosts: new Set(),
};

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

function safeError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/https?:\/\/[^\s"'<>]+/gi, "<url>")
    .replace(/\+?\d[\d ().-]{7,}\d/g, "<synthetic-contact>")
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, "<synthetic-date>");
}

async function runCheck(name, callback) {
  try {
    const detail = await callback();
    result.flows.push({ name, passed: true, ...(detail ? { detail } : {}) });
  } catch (error) {
    const message = safeError(error);
    result.flows.push({ name, passed: false, error: message });
    result.errors.push(`${name}: ${message}`);
  }
}

function isUARoute(url) {
  return url.hostname === "uaroute.com" || url.hostname === "www.uaroute.com";
}

function isKoval(url) {
  return url.hostname === "4k-koval.com" || url.hostname === "www.4k-koval.com";
}

async function addNetworkGuards(context) {
  await context.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (whatsappHost.test(requestUrl.hostname)) {
      privateCapture.whatsappUrls.push(requestUrl.toString());
      result.interceptedWhatsAppRequests += 1;
      await route.abort("blockedbyclient");
      return;
    }

    if (analyticsHost.test(requestUrl.hostname)) {
      privateCapture.analyticsHosts.add(requestUrl.hostname);
      result.blockedAnalyticsRequests += 1;
      let initiatorHost = "";
      try {
        initiatorHost = new URL(route.request().frame().url()).hostname;
      } catch {
        // Requests without a browser frame remain in the aggregate "other" bucket.
      }
      if (initiatorHost === "uaroute.com" || initiatorHost === "www.uaroute.com") {
        result.blockedAnalyticsByOrigin.uaroute += 1;
      } else if (initiatorHost === "4k-koval.com" || initiatorHost === "www.4k-koval.com") {
        result.blockedAnalyticsByOrigin.koval += 1;
      } else {
        result.blockedAnalyticsByOrigin.other += 1;
      }
      await route.abort("blockedbyclient");
      return;
    }

    if (isUARoute(requestUrl) || isKoval(requestUrl)) {
      await route.continue();
      return;
    }

    // External images, fonts, and other third-party resources are unnecessary
    // for acceptance and remain outside this live browser session.
    await route.abort("blockedbyclient");
  });
}

async function newContext(browser) {
  const context = await browser.newContext({ locale: "uk-UA", reducedMotion: "reduce" });
  context.setDefaultTimeout(timeoutMs);
  context.setDefaultNavigationTimeout(navigationTimeoutMs);
  await context.addInitScript(() => {
    if (location.hostname === "uaroute.com" || location.hostname === "www.uaroute.com") {
      window.__pocOpenedUrls = [];
      window.open = (url) => {
        window.__pocOpenedUrls.push(String(url));
        return null;
      };
    }
  });
  await addNetworkGuards(context);
  context.on("page", (page) => {
    page.on("pageerror", (error) => result.errors.push(`Browser runtime: ${safeError(error)}`));
  });
  return context;
}

async function navigate(page, url, expectedType = "text/html") {
  const response = await page.goto(url, { waitUntil: "domcontentloaded" });
  ensure(response, "Navigation returned no HTTP response");
  const status = response.status();
  const contentType = response.headers()["content-type"] ?? "";
  result.liveResponses.push({
    host: new URL(response.url()).hostname,
    status,
    contentType: contentType.split(";")[0] ?? "",
  });
  ensure(status === 200, `Expected HTTP 200, received ${status}`);
  if (expectedType) {
    ensure(contentType.toLowerCase().includes(expectedType), `Unexpected content type: ${contentType.split(";")[0]}`);
  }
  if (expectedType === "text/html") {
    // Static HTML arrives before deferred client bundles and React handlers.
    await page.waitForLoadState("networkidle");
  }
  return response;
}

async function selectCity(page, label, query, expectedName) {
  const aliases = page.getByText("Пошук за іншою назвою міста", { exact: true });
  if (await aliases.count() && !await page.getByRole("combobox", { name: label, exact: true }).isVisible()) await aliases.click();
  const field = page.getByRole("combobox", { name: label });
  await field.fill(query);
  const option = page.getByRole("listbox").getByRole("option").filter({ hasText: expectedName }).first();
  await option.waitFor({ state: "visible" });
  await option.click();
  ensure((await field.inputValue()) === expectedName, `Could not select the expected ${label} city`);
}

function syntheticDate(daysAhead = 21) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

async function assertNoOverflow(page, label) {
  const metrics = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  const passed = metrics.documentWidth <= metrics.viewportWidth + 1;
  result.viewportChecks.push({ label, ...metrics, passed });
  ensure(passed, `${label} has horizontal overflow`);
}

async function assertContactLayout(page) {
  const button = page.getByRole("button", { name: "Уточнити можливість у WhatsApp" });
  const metrics = await button.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const labels = [];
    while (walker.nextNode()) {
      if (!walker.currentNode.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(walker.currentNode);
      labels.push(...Array.from(range.getClientRects()));
    }
    return {
      touchTarget: bounds.height >= 44 && bounds.width >= 44,
      labelFits: labels.length > 0 && labels.every((rect) =>
        rect.top >= bounds.top - 1 && rect.bottom <= bounds.bottom + 1 &&
        rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1),
    };
  });
  ensure(metrics.touchTarget && metrics.labelFits, "Candidate WhatsApp button label or touch target does not fit its layout");
}

async function checkCanonicalAndNotice(page, slug) {
  const expectedCanonical = `${uarouteOrigin}/routes/${slug}/`;
  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  ensure(canonical === expectedCanonical, `${slug} has an incorrect canonical URL`);
  const body = await page.locator("body").innerText();
  ensure(body.includes("Можливість поїздки потрібно підтвердити у Koval."), `${slug} is missing the manual feasibility notice`);
  ensure(body.includes("Повідомлення не резервує місце."), `${slug} implies reservation or omits the no-reservation notice`);
}

async function fillKovalForm(page, from, to) {
  await page.getByLabel("Місто відправлення").fill(from);
  await page.getByLabel("Місто прибуття").fill(to);
  await page.getByLabel("Дата поїздки").fill(syntheticDate());
  await page.getByLabel("Контактний телефон").fill("+48111222333");
  const attempted = page.waitForRequest(
    (request) => whatsappHost.test(new URL(request.url()).hostname),
  );
  const blocked = page.waitForEvent("requestfailed", {
    predicate: (request) => whatsappHost.test(new URL(request.url()).hostname),
  });
  await page.locator("form").getByRole("button", { name: /whatsapp/i }).click({ noWaitAfter: true });
  const captured = (await attempted).url();
  const failedRequest = await blocked;
  ensure(failedRequest.failure()?.errorText.includes("ERR_BLOCKED_BY_CLIENT"), "WhatsApp request was not explicitly blocked by the test guard");
  ensure(privateCapture.whatsappUrls.includes(captured), "WhatsApp request did not pass through the interception guard");
  const capturedUrl = new URL(captured);
  const message = capturedUrl.searchParams.get("text") ?? "";
  ensure(capturedUrl.hostname === "wa.me", "Koval handoff did not target wa.me");
  return { message, capturedUrl };
}

async function checkSearchToRouteAndUARouteHandoff(page) {
  await navigate(
    page,
    `${uarouteOrigin}/?utm_source=google&utm_medium=organic&utm_campaign=m1`,
  );
  await selectCity(page, "Звідки", "Dolina", "Долина");
  await selectCity(page, "Куди", "Celle", "Целле");
  await page.getByRole("button", { name: "Знайти маршрут" }).click();
  await page.waitForURL("**/routes/dolyna-celle/");
  await checkCanonicalAndNotice(page, "dolyna-celle");
  const events = await page.evaluate(() => window.__uarouteEvents ?? []);
  ensure(events.some((event) => event.event === "route_search_completed"), "Route search was not recorded in the local analytics buffer");
  ensure(events.some((event) => event.event === "route_view" && event.routeId === "dolyna-celle"), "Selected route view was not recorded");
  ensure(
    events.every((event) => event.source === "google" && event.medium === "organic" && event.campaign === "m1" && event.landingPage === "/"),
    "Approved first-touch UTMs were not retained across the search transition",
  );

  await page.locator("#inquiry-date").fill(syntheticDate());
  await page.locator("#inquiry-phone").fill("+48111222333");
  await page.locator("#inquiry-passengers").selectOption("2");
  await page.getByRole("button", { name: "Уточнити можливість у WhatsApp" }).click();
  const openedUrl = await page.evaluate(() => window.__pocOpenedUrls?.at(-1) ?? null);
  ensure(openedUrl, "UARoute did not prepare a WhatsApp handoff URL");
  const prepared = new URL(openedUrl);
  const message = prepared.searchParams.get("text") ?? "";
  ensure(prepared.hostname === "wa.me", "UARoute handoff did not target wa.me");
  ensure(message.includes("Джерело: UARoute"), "UARoute handoff is missing its source marker");
  ensure(message.includes("Долина → Целле"), "UARoute handoff has incorrect endpoints");
  ensure(message.includes("не підтверджене бронювання"), "UARoute handoff does not state that it is not a confirmed booking");
  const codeMatch = message.match(/Код: (UR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10})/);
  ensure(codeMatch, "UARoute handoff is missing a valid opaque code");

  const referralLink = page.getByRole("link", { name: /Сайт Koval/ }).first();
  const [popup] = await Promise.all([page.waitForEvent("popup"), referralLink.click()]);
  await popup.waitForLoadState("domcontentloaded");
  await navigate(popup, popup.url());
  const referral = new URL(popup.url());
  ensure(isKoval(referral), "Referral link did not open the Koval site");
  ensure(referral.searchParams.get("utm_source") === "uaroute", "Koval URL is missing UARoute source attribution");
  ensure(/^UR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}$/.test(referral.searchParams.get("ref_code") ?? ""), "Koval URL has no valid referral code");
  ensure(referral.searchParams.get("origin_city_id") === "dolyna", "Koval URL has incorrect origin city context");
  ensure(referral.searchParams.get("destination_city_id") === "celle", "Koval URL has incorrect destination city context");
  ensure(!referral.search.includes(syntheticDate()) && !referral.search.includes("+48111222333"), "Koval URL contains synthetic form data");

  const kovalHandoff = await fillKovalForm(popup, "Долина", "Целле");
  ensure(kovalHandoff.message.includes("UARoute"), "Koval WhatsApp message lost the source marker");
  ensure(kovalHandoff.message.includes(referral.searchParams.get("ref_code")), "Koval WhatsApp message lost the referral code");
  ensure(kovalHandoff.message.includes("Долина → Целле"), "Koval WhatsApp message has incorrect current endpoints");
  ensure(kovalHandoff.message.includes("Контекст UARoute: Долина → Целле"), "Koval WhatsApp message lost matching referral city context");
  ensure(kovalHandoff.message.includes("не підтверджене бронювання"), "Koval WhatsApp message omits manual-confirmation wording");
  ensure(kovalHandoff.message.includes("+48111222333"), "Koval operator message omitted the synthetic contact field");
  await popup.close();

  return {
    referralUrl: referral.toString(),
    detail: {
      route: "/routes/dolyna-celle/",
      uarouteHandoff: { sourcePresent: true, codePresent: true, endpointsPresent: true },
      kovalReferral: { sourcePresent: true, codePresent: true, cityContextMatches: true },
      kovalHandoff: { sourcePresent: true, codeMatchesReferral: true, currentEndpointsPresent: true },
    },
  };
}

async function checkReverseDirection(browser) {
  const context = await newContext(browser);
  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await navigate(
    page,
    `${uarouteOrigin}/?utm_source=koval&utm_medium=referral&utm_campaign=koval_poc`,
  );
  await selectCity(page, "Звідки", "Celle", "Целле");
  await selectCity(page, "Куди", "Dolina", "Долина");
  await page.getByRole("button", { name: "Знайти маршрут" }).click();
  await page.waitForURL("**/routes/celle-dolyna/");
  await page.locator("#inquiry-date").fill(syntheticDate());
  await page.locator("#inquiry-phone").fill("+48111222333");
  await page.getByRole("button", { name: "Уточнити можливість у WhatsApp" }).click();
  const openedUrl = await page.evaluate(() => window.__pocOpenedUrls?.at(-1) ?? null);
  ensure(openedUrl, "Reverse-direction UARoute handoff was not prepared");
  const prepared = new URL(openedUrl);
  const message = prepared.searchParams.get("text") ?? "";
  ensure(message.includes("Целле → Долина"), "Reverse-direction handoff has incorrect endpoints");
  ensure(message.includes("Джерело: UARoute"), "Reverse-direction handoff lost its source marker");
  ensure(/Код: UR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}/.test(message), "Reverse-direction handoff has no valid code");

  const [popup] = await Promise.all([
    page.waitForEvent("popup"),
    page.getByRole("link", { name: /Сайт Koval/ }).first().click(),
  ]);
  await popup.waitForLoadState("domcontentloaded");
  await navigate(popup, popup.url());
  const referral = new URL(popup.url());
  ensure(referral.searchParams.get("origin_city_id") === "celle", "Reverse referral lost German origin context");
  ensure(referral.searchParams.get("destination_city_id") === "dolyna", "Reverse referral lost Ukrainian destination context");
  ensure(/^UR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}$/.test(referral.searchParams.get("ref_code") ?? ""), "Reverse referral lost its code");
  const handoff = await fillKovalForm(popup, "Целле", "Долина");
  ensure(handoff.message.includes("UARoute"), "Reverse Koval handoff lost its source");
  ensure(handoff.message.includes(referral.searchParams.get("ref_code")), "Reverse Koval handoff lost its code");
  ensure(handoff.message.includes("Контекст UARoute: Целле → Долина"), "Reverse Koval handoff lost its direction");
  await context.close();
  return { route: "/routes/celle-dolyna/", sourceAndCodePresent: true, cityContextMatches: true };
}

async function checkDirectKoval(browser) {
  const context = await newContext(browser);
  const page = await context.newPage();
  await navigate(page, kovalOrigin);
  ensure(!new URL(page.url()).searchParams.has("utm_source"), "Direct Koval visit unexpectedly has a source marker");
  const { message } = await fillKovalForm(page, "Долина", "Целле");
  ensure(!message.includes("UARoute"), "Direct Koval message incorrectly claims UARoute attribution");
  ensure(!/UR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8,16}/.test(message), "Direct Koval message incorrectly contains a UARoute code");
  await context.close();
  return { sourceMarkerPresent: false, referralCodePresent: false };
}

async function checkKovalCitySuggestions(browser) {
  const context = await newContext(browser);
  try {
    const page = await context.newPage();
    await navigate(page, kovalOrigin);
    await page.getByRole("heading", { name: "Бронювання поїздки", exact: true }).waitFor();
    for (const label of ["Місто відправлення", "Місто прибуття"]) {
      const input = page.getByLabel(label);
      const options = await input.evaluate((element) =>
        Array.from(element.list?.options ?? [], (option) => option.value),
      );
      ensure(pilotCityNames.every((city) => options.includes(city)), `${label} is missing a pilot city suggestion`);
      ensure(new Set(options).size === options.length, `${label} has duplicate suggestions`);
      for (const city of pilotCityNames) {
        await input.fill(city);
        ensure(await input.inputValue() === city, `${label} cannot accept a pilot city`);
      }
      await input.fill("Інше місто");
      ensure(await input.inputValue() === "Інше місто", `${label} rejects free-text inquiries`);
    }
    return { pilotCitiesPerField: 20, fieldsChecked: 2, freeTextPreserved: true };
  } finally {
    await context.close();
  }
}

async function checkChangedPairSuppressesContext(browser, referralUrl) {
  const context = await newContext(browser);
  const page = await context.newPage();
  await navigate(page, referralUrl);
  const referralCode = new URL(referralUrl).searchParams.get("ref_code");
  const handoff = await fillKovalForm(page, "Львів", "Берлін");
  ensure(handoff.message.includes("UARoute"), "Changing the pair incorrectly erased source attribution");
  ensure(handoff.message.includes(referralCode), "Changing the pair incorrectly erased the source code");
  ensure(handoff.message.includes("Львів → Берлін"), "Changed Koval pair was not used in the outgoing message");
  ensure(!handoff.message.includes("Контекст UARoute: Долина → Целле"), "Stale UARoute city context survived a changed route pair");
  await context.close();
  return { sourceAndCodeRetained: true, changedEndpointsPresent: true, staleCityContextSuppressed: true };
}

async function checkCandidatePages(page) {
  for (const slug of candidateSlugs) {
    const response = await navigate(page, `${uarouteOrigin}/routes/${slug}/`);
    await checkCanonicalAndNotice(page, slug);
    result.routePages.push({ slug, status: response.status(), canonicalAndManualNotice: true });
  }
  return { candidatePagesChecked: result.routePages.length };
}

async function checkSitemap(page) {
  await navigate(page, `${uarouteOrigin}/sitemap.xml`, "application/xml");
  const actual = (await page.locator("loc").allTextContents())
    .map((location) => location.trim())
    .filter((location) => /^\/routes\/[^/]+\/$/.test(new URL(location).pathname))
    .map((location) => new URL(location).pathname)
    .sort();
  ensure(actual.length === expectedCommercialRoutes.length, `Expected eleven commercial route URLs in sitemap, found ${actual.length}`);
  ensure(JSON.stringify(actual) === JSON.stringify(expectedCommercialRoutes), "Sitemap commercial route set differs from the approved eleven routes");
  ensure(!actual.some((path) => /hamburg|berlin/i.test(path)), "Sitemap exposes a Hamburg or Berlin candidate route");
  result.sitemap = { commercialRouteCount: actual.length, exactApprovedSet: true, excludesHamburgAndBerlin: true };
  return result.sitemap;
}

async function checkLegalPages(page) {
  for (const [path, heading] of [["/imprint/", "Відомості про оператора"], ["/privacy/", "Приватність"]]) {
    await navigate(page, `${uarouteOrigin}${path}`);
    await page.getByRole("heading", { level: 1, name: heading }).waitFor({ state: "visible" });
    const body = await page.locator("body").innerText();
    ensure(body.includes("Roman Senchuk"), `${path} is missing Roman Senchuk`);
    ensure(body.includes("Crew Bravo"), `${path} is missing Crew Bravo`);
    result.legalPages.push({ path, status: 200, operatorIdentityPresent: true, brandPresent: true });
  }
  return { pagesChecked: result.legalPages.length, operator: "Roman Senchuk", brand: "Crew Bravo" };
}

async function checkNoAnalytics(page) {
  const scripts = await page.locator("script[src]").evaluateAll((items) => items.map((item) => item.src));
  const googleScripts = scripts.filter((src) => analyticsHost.test(new URL(src).hostname));
  ensure(googleScripts.length === 0, "UARoute loaded an analytics script before consent");
  ensure(result.blockedAnalyticsByOrigin.uaroute === 0, "UARoute attempted a blocked analytics or tracking request");
  return { analyticsScripts: 0, analyticsRequests: 0 };
}

async function captureScreenshots(page, qaDir) {
  await page.setViewportSize({ width: 375, height: 812 });
  await navigate(page, uarouteOrigin);
  await assertNoOverflow(page, "UARoute home at 375px");
  const mobilePath = join(qaDir, "uaroute-home-375.png");
  await page.screenshot({ path: mobilePath, fullPage: true });
  result.screenshots.push(mobilePath);

  await navigate(page, `${uarouteOrigin}/routes/dolyna-celle/`);
  await assertNoOverflow(page, "UARoute candidate route at 375px");
  await assertContactLayout(page);
  const mobileRoutePath = join(qaDir, "uaroute-candidate-route-375.png");
  await page.screenshot({ path: mobileRoutePath, fullPage: true });
  result.screenshots.push(mobileRoutePath);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await navigate(page, `${uarouteOrigin}/routes/dolyna-celle/`);
  await assertNoOverflow(page, "UARoute candidate route at 1440px");
  await assertContactLayout(page);
  const desktopPath = join(qaDir, "uaroute-candidate-route-1440.png");
  await page.screenshot({ path: desktopPath, fullPage: true });
  result.screenshots.push(desktopPath);
  return { viewportsChecked: [375, 1440] };
}

async function run() {
  if (process.env.POC_LIVE_DEPLOY_CONFIRMED !== "1") {
    throw new Error("Live checks require POC_LIVE_DEPLOY_CONFIRMED=1 after the owner confirms both deployments are complete.");
  }
  const playwrightModule = process.env.PLAYWRIGHT_MODULE_PATH ?? "playwright";
  const { chromium } = await import(playwrightModule);
  const defaultChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const chromePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH ?? defaultChrome;
  const launchOptions = { headless: true };
  if (existsSync(chromePath)) launchOptions.executablePath = chromePath;
  const browser = await chromium.launch(launchOptions);

  mkdirSync(qaDir, { recursive: true });
  try {
    const context = await newContext(browser);
    const page = await context.newPage();
    await page.setViewportSize({ width: 1440, height: 1000 });

    let capturedReferralUrl = null;
    await runCheck("approved landing, Dolyna → Celle search, and captured UARoute/Koval handoff", async () => {
      const flow = await checkSearchToRouteAndUARouteHandoff(page);
      capturedReferralUrl = flow.referralUrl;
      return flow.detail;
    });
    await context.close();

    await runCheck("six selected candidate pages return HTML 200 with canonical and manual-feasibility copy", async () => {
      const routeContext = await newContext(browser);
      const routePage = await routeContext.newPage();
      const detail = await checkCandidatePages(routePage);
      await routeContext.close();
      return detail;
    });

    await runCheck("sitemap lists exactly eleven commercial routes and excludes Hamburg/Berlin", async () => {
      const sitemapContext = await newContext(browser);
      const sitemapPage = await sitemapContext.newPage();
      const detail = await checkSitemap(sitemapPage);
      await sitemapContext.close();
      return detail;
    });

    await runCheck("Imprint and privacy identify Roman Senchuk and Crew Bravo", async () => {
      const legalContext = await newContext(browser);
      const legalPage = await legalContext.newPage();
      const detail = await checkLegalPages(legalPage);
      await legalContext.close();
      return detail;
    });

    await runCheck("reverse Celle → Dolyna referral preserves source, code, and direction", () =>
      checkReverseDirection(browser),
    );

    await runCheck("direct Koval form has no UARoute source or code", () => checkDirectKoval(browser));

    await runCheck("Koval booking form offers all twenty pilot cities in both directions", () =>
      checkKovalCitySuggestions(browser),
    );

    await runCheck("changing the Koval route suppresses stale UARoute city context", async () => {
      ensure(capturedReferralUrl, "The primary flow did not capture its Koval referral URL");
      return checkChangedPairSuppressesContext(browser, capturedReferralUrl);
    });

    await runCheck("default UARoute page loads no analytics scripts or tracking requests", async () => {
      const analyticsContext = await newContext(browser);
      const analyticsPage = await analyticsContext.newPage();
      await navigate(analyticsPage, uarouteOrigin);
      const detail = await checkNoAnalytics(analyticsPage);
      await analyticsContext.close();
      return detail;
    });

    await runCheck("mobile and desktop pages fit their viewports and screenshots are captured", async () => {
      const screenshotContext = await newContext(browser);
      const screenshotPage = await screenshotContext.newPage();
      const detail = await captureScreenshots(screenshotPage, qaDir);
      await screenshotContext.close();
      return detail;
    });
  } finally {
    await browser.close();
    result.finishedAt = new Date().toISOString();
    result.interceptedWhatsAppRequests = privateCapture.whatsappUrls.length;
    result.blockedAnalyticsHosts = [...privateCapture.analyticsHosts].sort();
    result.passed = result.errors.length === 0 && result.flows.length > 0;
    writeFileSync(reportPath, `${JSON.stringify(result, null, 2)}\n`, { mode: 0o600 });
    console.log(`Live acceptance report: ${reportPath}`);
    console.log(`Result: ${result.passed ? "PASS" : "FAIL"} (${result.flows.filter((flow) => flow.passed).length}/${result.flows.length} flows)`);
    if (!result.passed) {
      process.exitCode = 1;
      for (const error of result.errors) console.error(error);
    }
  }
}

run().catch((error) => {
  const message = safeError(error);
  result.errors.push(message);
  result.passed = false;
  mkdirSync(qaDir, { recursive: true });
  result.finishedAt = new Date().toISOString();
  writeFileSync(reportPath, `${JSON.stringify(result, null, 2)}\n`, { mode: 0o600 });
  console.error(message);
  console.error(`Live acceptance report: ${reportPath}`);
  process.exitCode = 1;
});
