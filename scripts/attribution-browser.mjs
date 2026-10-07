import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, relative, resolve, sep } from "node:path";

// Synthetic local receiver evaluation: no live requests or real messages.
const root = resolve(process.env.KOVAL_DIST_PATH ?? "../4k-trans/dist");
const output = resolve(
  process.env.ATTRIBUTION_QA_OUTPUT_DIR ??
    "output/attribution-task-1-2026-10-07/browser",
);
const origin = "https://www.4k-koval.com";
const code = "UR-ABCDEFGHJK";
const query = `?utm_source=uaroute&utm_medium=referral&utm_campaign=koval_poc&utm_content=lviv-celle_partner_card&ref_code=${code}&origin_city_id=lviv&destination_city_id=celle`;
const report = {
  checks: [],
  runtimeErrors: [],
  blockedExternalRequests: 0,
  realMessagesSent: 0,
};
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
};
const ensure = (value, message) => {
  if (!value) throw new Error(message);
};
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE_PATH ?? "playwright"
);
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.PLAYWRIGHT_EXECUTABLE_PATH ??
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
mkdirSync(output, { recursive: true });
async function check(name, work) {
  try {
    await work();
    report.checks.push({ name, passed: true });
  } catch (error) {
    report.checks.push({ name, passed: false, error: error.message });
  }
}
try {
  const context = await browser.newContext({
    locale: "uk-UA",
    reducedMotion: "reduce",
  });
  context.setDefaultTimeout(8000);
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) {
      report.blockedExternalRequests++;
      await route.abort();
      return;
    }
    let key = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    if (!key || !extname(key))
      key = `${key.replace(/\/$/, "")}${key ? "/" : ""}index.html`;
    const file = resolve(root, key),
      inside = relative(root, file);
    if (inside === ".." || inside.startsWith(`..${sep}`) || !existsSync(file)) {
      await route.fulfill({ status: 404, body: "Local missing object" });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: mime[extname(file)] ?? "application/octet-stream",
      body: readFileSync(file),
    });
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => report.runtimeErrors.push(error.message));
  const load = (path) => page.goto(origin + path, { waitUntil: "networkidle" });
  const mainContact = () =>
    page.getByRole("link", { name: "Контакти", exact: true }).first();
  const firstWhatsApp = () =>
    page.getByRole("link", { name: "WhatsApp", exact: true }).first();
  await check(
    "tagged landing keeps the producer UTM context through SPA contact navigation",
    async () => {
      await load("/" + query);
      await mainContact().click();
      await firstWhatsApp().waitFor();
      const params = new URL(page.url()).searchParams;
      for (const [key, value] of new URLSearchParams(query))
        ensure(params.get(key) === value, `Lost ${key}`);
      ensure(
        new URL(await firstWhatsApp().getAttribute("href")).searchParams
          .get("text")
          .includes(`Код: ${code}`),
        "WhatsApp lost source code",
      );
    },
  );
  await check(
    "tagged contact reload preserves code and leaves browser storage empty",
    async () => {
      await page.reload({ waitUntil: "networkidle" });
      ensure(
        (await firstWhatsApp().getAttribute("href")).includes(
          encodeURIComponent(code),
        ),
        "Reload lost code",
      );
      ensure(
        await page.evaluate(
          () =>
            !localStorage.getItem("koval.uaroute.v1") &&
            !sessionStorage.getItem("koval.uaroute.v1"),
        ),
        "Referral persisted in storage",
      );
    },
  );
  await check(
    "a native new tab from the contact href retains source/code",
    async () => {
      const href = await mainContact().getAttribute("href");
      const tab = await context.newPage();
      await tab.goto(origin + href, { waitUntil: "networkidle" });
      const text = new URL(
        await tab
          .getByRole("link", { name: "WhatsApp", exact: true })
          .first()
          .getAttribute("href"),
      ).searchParams.get("text");
      ensure(text.includes(`Код: ${code}`), "New tab lost code");
      await tab.close();
    },
  );
  await check(
    "an untagged later contact visit in the same browser is not attributed",
    async () => {
      await load("/contacts");
      ensure(
        !new URL(await firstWhatsApp().getAttribute("href")).searchParams.has(
          "text",
        ),
        "Direct contact falsely attributed",
      );
    },
  );
  await check(
    "a code-less tagged landing gets a stable safe code in its reload URL",
    async () => {
      await load("/?utm_source=uaroute&utm_campaign=koval_poc");
      const generated = new URL(page.url()).searchParams.get("ref_code");
      ensure(
        /^UR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8,16}$/.test(generated ?? ""),
        "Missing generated code",
      );
      await page.reload({ waitUntil: "networkidle" });
      ensure(
        new URL(page.url()).searchParams.get("ref_code") === generated,
        "Code changed on reload",
      );
    },
  );
  await check(
    "unapproved UTM labels and arbitrary personal query fields are not propagated",
    async () => {
      await load(
        "/" +
          query.replace("koval_poc", "private-name") +
          "&phone=private&message=private&utm_term=private",
      );
      await mainContact().click();
      const params = new URL(page.url()).searchParams;
      for (const key of ["phone", "message", "utm_term", "utm_campaign"])
        ensure(!params.has(key), `Forwarded ${key}`);
      const text = new URL(
        await firstWhatsApp().getAttribute("href"),
      ).searchParams.get("text");
      ensure(
        !text.includes("private") && !text.includes("utm_"),
        "Raw query reached message",
      );
    },
  );
  await check(
    "parcel navigation does not receive passenger referral fields",
    async () => {
      await load("/" + query);
      const href = await page
        .getByRole("link", { name: "Посилки", exact: true })
        .first()
        .getAttribute("href");
      ensure(
        !href.includes("ref_code") && !href.includes("utm_"),
        "Parcel link carried passenger attribution",
      );
    },
  );
  await context.close();
} finally {
  await browser.close();
}
writeFileSync(resolve(output, "report.json"), JSON.stringify(report, null, 2));
const failed = report.checks.filter((item) => !item.passed);
console.log(
  JSON.stringify(
    {
      passed: report.checks.length - failed.length,
      failed,
      runtimeErrors: report.runtimeErrors,
      report: resolve(output, "report.json"),
    },
    null,
    2,
  ),
);
if (failed.length || report.runtimeErrors.length) process.exitCode = 1;
