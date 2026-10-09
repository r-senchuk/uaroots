import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";

import { inspectExport } from "../../scripts/inspect-out.mjs";

const routes = [
  ["lviv-hannover", "Львів", "Ганновер", false, ""],
  ["dolyna-celle", "Долина", "Целле", true, "вокзал старе місто"],
  ["celle-dolyna", "Целле", "Долина", true, "вокзал старе місто"],
  ["dolyna-wolfsburg", "Долина", "Вольфсбург", true, "Фаллерслебен Форсфельде"],
  ["wolfsburg-dolyna", "Вольфсбург", "Долина", true, "Фаллерслебен Форсфельде"],
  ["dolyna-braunschweig", "Долина", "Брауншвейг", true, "вокзал центральної частини"],
  ["braunschweig-dolyna", "Брауншвейг", "Долина", true, "вокзал центральної частини"],
  ["lviv-celle", "Львів", "Целле", true, "вокзал старе місто"],
  ["celle-lviv", "Целле", "Львів", true, "вокзал старе місто"],
  ["ivano-frankivsk-wolfsburg", "Івано-Франківськ", "Вольфсбург", true, "Фаллерслебен Форсфельде"],
  ["wolfsburg-ivano-frankivsk", "Вольфсбург", "Івано-Франківськ", true, "Фаллерслебен Форсфельде"],
] as const;
const mainPages = ["/", "/routes/", "/about/", "/imprint/", "/privacy/"];
const editorialRoutes = ["lviv-hamburg", "lviv-berlin"] as const;
const hubs = [
  ["lviv", "зі Львова", "Львів Львова", [["Шверін", "Schwerin"], ["Люнебург", "Lüneburg"], ["Любек", "Lübeck"], ["Целле", "Celle"], ["Вольфсбург", "Wolfsburg"], ["Брауншвейг", "Braunschweig"]], ["lviv-hannover", "lviv-celle", "celle-lviv"], "/cities/ivano-frankivsk/"],
  ["ivano-frankivsk", "з Івано-Франківська", "Івано-Франківськ Івано-Франківська", [["Шверін", "Schwerin"], ["Люнебург", "Lüneburg"], ["Любек", "Lübeck"], ["Целле", "Celle"], ["Вольфсбург", "Wolfsburg"], ["Брауншвейг", "Braunschweig"]], ["ivano-frankivsk-wolfsburg", "wolfsburg-ivano-frankivsk"], "/cities/lviv/"],
] as const;
const temporaryRoots: string[] = [];

function write(root: string, path: string, content = "") {
  const file = join(root, path);
  mkdirSync(file.slice(0, file.lastIndexOf("/")), { recursive: true });
  writeFileSync(file, content);
}

function page(path: string, title: string, body: string, links: string[] = []) {
  return `<!doctype html><html lang="uk"><head><title>${title}</title><meta name="description" content="Унікальний опис ${title}"><link rel="canonical" href="https://uaroute.com${path}"></head><body>${body}${links.map((href) => `<a href="${href}">Відкрити</a>`).join("")}</body></html>`;
}

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "uaroute-inspect-"));
  temporaryRoots.push(root);
  const candidates = routes.filter(([, , , candidate]) => candidate).map(([slug]) => `/routes/${slug}/`);
  const legal = "Оператор Roman Senchuk. Crew Bravo є брендом сайту, а не окремою юридичною особою.";

  for (const path of mainPages) {
    const name = path === "/" ? "home" : path.slice(1, -1);
    const heading = path === "/" || path === "/routes/"
      ? "Поїздки між Україною та Німеччиною"
      : path === "/imprint/" ? "Вихідні дані" : path === "/privacy/" ? "Політика конфіденційності" : name;
    const body = `<h1>${heading}</h1><p>${path === "/imprint/" || path === "/privacy/" ? legal : "UARoute"}</p>`;
    const links = path === "/routes/"
      ? [...candidates, ...hubs.map(([slug]) => `/cities/${slug}/`)]
      : path === "/" ? candidates : ["/routes/"];
    write(root, `${path === "/" ? "" : path.slice(1)}index.html`, page(path, `Назва ${name}`, body, links));
    if (path === "/") {
      for (const file of ["__next._tree.txt", "__next._full.txt", "__next.__PAGE__.txt"]) write(root, file, "RSC");
    } else {
      for (const file of ["index.txt", "__next._tree.txt", "__next._full.txt", `__next.${path.slice(1, -1)}.__PAGE__.txt`]) {
        write(root, `${path.slice(1)}${file}`, "RSC");
      }
    }
  }

  for (const [slug, origin, destination, candidate, practical] of routes) {
    const path = `/routes/${slug}/`;
    const counterpart = routes.find(([, reverseOrigin, reverseDestination]) => reverseOrigin === destination && reverseDestination === origin);
    const reverse = counterpart ? `/routes/${counterpart[0]}/` : "/routes/";
    const copy = candidate
      ? `<p>Уточніть можливість поїздки на бажану дату. Перевізник Коваль перевірить можливість поїздки, чи може виконати поїздку між цими містами на обрану дату. Повідомлення не резервує місце.</p><p>${practical}</p>`
      : "Публічна сторінка маршруту.";
    const citySource = slug.includes("celle")
      ? "https://www.celle-tourismus.de/info-besucherservice/tourist-information/anreise-parken"
      : slug.includes("wolfsburg")
        ? "https://www.wolfsburg.de/en/bauenwohnen/wolfsburg-als-wohnort"
        : slug.includes("braunschweig")
          ? "https://www.braunschweig.de/tourismus/ihr-besuch-in-braunschweig/anreise_bahn_bus.php"
          : "";
    write(root, `routes/${slug}/index.html`, page(path, `Назва ${slug}`, `<h1>${origin} → ${destination}</h1>${copy}`, [reverse, "/routes/", ...(candidate ? [citySource] : [])]));
    for (const file of ["index.txt", "__next._tree.txt", "__next._full.txt", "__next.routes.$d$slug.__PAGE__.txt"]) {
      write(root, `routes/${slug}/${file}`, "RSC");
    }
  }

  for (const [slug, headingCity, cityForms, destinations, linkedRoutes, crossHub] of hubs) {
    const path = `/cities/${slug}/`;
    const resource = slug === "lviv"
      ? ["https://lviv.travel/ua/news/gaid-lvivskim-gromadskim-transportom", "Офіційний довідник громадського транспорту Львова"]
      : ["https://booking.uz.gov.ua/", "Офіційний пошук квитків Укрзалізниці"];
    const role = slug === "lviv"
      ? "UARoute допомагає знайти напрямок зі Львова до потрібного міста Німеччини або назад"
      : "UARoute допомагає знайти напрямок з Івано-Франківська до потрібного міста Німеччини або назад";
    const purpose = slug === "lviv" ? "Перевірити актуальні правила доїзду в місті" : "Окремо перевірити потрібну попередню або подальшу ділянку";
    const outbound = slug === "lviv"
      ? "Якщо спочатку добираєтеся до Львова, погодьте точку та час зустрічі."
      : "Якщо до міста плануєте їхати потягом, перевірте варіанти після погодження зустрічі.";
    const returning = slug === "lviv"
      ? "Не вважайте залізничний вокзал чи інший орієнтир автоматично погодженою зупинкою."
      : "Для подальшої поїздки потягом перевірте доступні варіанти окремо; пересування містом і стиковка не гарантуються зверненням до Коваль.";
    const body = `<h1>Поїздки ${headingCity} до Німеччини та назад</h1><p>${role}</p><script>window.fixtureOnlyFiller = "x".repeat(4096)</script><section aria-labelledby="search-heading"><h2 id="search-heading" tabindex="-1">Куди хочете їхати?</h2><p>Можливість поїздки на вашу дату, наявність місць, місця посадки й висадки та ціну підтверджує перевізник Коваль у відповідь на звернення.</p></section><section aria-labelledby="nearby-places-heading"><h2 id="nearby-places-heading">Якщо ви живете неподалік</h2><p>У приватному повідомленні WhatsApp назвіть своє фактичне місце. Вибір міста не означає посадку у вашому населеному пункті.</p><a href="#search-heading">Повернутися до пошуку поїздки</a></section><section><h2>Підготуйте виїзд</h2><p>${outbound}</p><h2>Підготуйте повернення</h2><p>${returning}</p><ul><li><a href="${resource[0]}">${resource[1]}</a><p>${purpose}</p><p>Довідник переглянуто <time datetime="2026-10-09">2026-10-09</time></p></li></ul><p>Редакційні поради переглянуто <time datetime="2026-10-09">2026-10-09</time></p></section><p>${cityForms} ${destinations.flat().join(" ")}</p>`;
    write(root, `cities/${slug}/index.html`, page(path, `Поїздки ${headingCity} | UARoute`, body, [...linkedRoutes.map((routeSlug) => `/routes/${routeSlug}/`), crossHub]));
    for (const file of ["index.txt", "__next._tree.txt", "__next._full.txt", "__next.cities.$d$slug.__PAGE__.txt"]) {
      write(root, `cities/${slug}/${file}`, "RSC");
    }
  }

  for (const slug of editorialRoutes) {
    const path = `/routes/${slug}/`;
    write(root, `routes/${slug}/index.html`, `${page(path, `Редакційний напрямок ${slug}`, `<h1>Напрямок ${slug}</h1>`, ["/routes/"]).replace("<head>", '<head><meta name="robots" content="noindex, follow">')}`);
    for (const file of ["index.txt", "__next._tree.txt", "__next._full.txt", "__next.routes.$d$slug.__PAGE__.txt"]) {
      write(root, `routes/${slug}/${file}`, "RSC");
    }
  }

  const redirects: Record<string, string> = {
    contact: "/about/", contacts: "/about/", carriers: "/routes/", packages: "/about/", gallery: "/",
  };
  for (const [slug, destination] of Object.entries(redirects)) {
    write(root, `${slug}/index.html`, `<meta http-equiv="refresh" content="0;url=${destination}"><script>location.replace('${destination}')</script>`);
  }
  write(root, "index.txt", "RSC");
  write(root, "404.html", "<h1>Цю сторінку не знайдено</h1>");
  write(root, "robots.txt", "User-agent: *");
  const sitemapPaths = [...mainPages, ...hubs.map(([slug]) => `/cities/${slug}/`), ...routes.map(([slug]) => `/routes/${slug}/`)];
  write(root, "sitemap.xml", `<urlset>${sitemapPaths.map((path) => `<url><loc>https://uaroute.com${path}</loc>${path.startsWith("/cities/") ? "<lastmod>2026-10-09</lastmod>" : ""}</url>`).join("")}</urlset>`);
  write(root, "assets/site.css", "body { color: black; }");
  for (const asset of ["arrival-560.webp", "arrival-1120.webp", "crewbravo-logo.svg", "icon.svg", "_next/static/media/font.woff2"]) {
    write(root, asset, "fixture asset");
  }
  return root;
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("inspectExport", () => {
  it("accepts the fixed eleven-route export, selected hubs, and legal pages", () => {
    expect(inspectExport(fixture())).toEqual([]);
  });

  it("reports missing candidate notice, operational claims, editorial sitemap URLs, and remote fonts", () => {
    const root = fixture();
    write(root, "routes/dolyna-celle/index.html", page(
      "/routes/dolyna-celle/",
      "Назва dolyna-celle",
      "<h1>Долина → Целле</h1><p>Прямі рейси без пересадок</p><p>вокзал старе місто</p>",
      ["/routes/"],
    ));
    write(root, "assets/site.css", '@import url("https://fonts.googleapis.com/css2?family=Test");');
    write(root, "sitemap.xml", "<urlset><url><loc>https://uaroute.com/routes/lviv-hamburg/</loc></url></urlset>");
    const errors = inspectExport(root);
    expect(errors.some((error) => error.includes("feasibility-first"))).toBe(true);
    expect(errors.some((error) => error.includes("carrier operational claim"))).toBe(true);
    expect(errors.some((error) => error.includes("sitemap.xml must contain exactly"))).toBe(true);
    expect(errors.some((error) => error.includes("requests Google Fonts"))).toBe(true);
  });

  it("requires both city hubs to expose all six cities, inflected headings, manual context, discovery links, and correct canonicals", () => {
    const root = fixture();
    write(root, "cities/lviv/index.html", page(
      "/cities/ivano-frankivsk/",
      "Поїздки з Львова | UARoute",
      "<h1>Поїздки з Львова до Німеччини</h1><p>Поїздка в обидва боки. Перевізник Коваль перевірить.</p><p>Шверін Schwerin Люнебург Любек Целле Celle Вольфсбург Брауншвейг</p>",
      ["/routes/lviv-hamburg/"],
    ));
    const errors = inspectExport(root);
    expect(errors.some((error) => error.includes("cities/lviv/") && error.includes("canonical"))).toBe(true);
    expect(errors.some((error) => error.includes("missing German pilot city"))).toBe(true);
    expect(errors.some((error) => error.includes("missing direction guidance or manual-confirmation context"))).toBe(true);
    expect(errors.some((error) => error.includes("links to a route outside the explicit commercial route set: /routes/lviv-hamburg/"))).toBe(true);
  });

  it("rejects a candidate link to the wrong reverse pair even when both route pages exist", () => {
    const root = fixture();
    write(root, "routes/dolyna-wolfsburg/index.html", page(
      "/routes/dolyna-wolfsburg/",
      "Назва dolyna-wolfsburg",
      "<h1>Долина → Вольфсбург</h1><p>Уточніть можливість поїздки на бажану дату. Перевізник Коваль перевірить можливість поїздки на дату. Повідомлення не резервує місце.</p><p>Фаллерслебен Форсфельде</p>",
      ["/routes/dolyna-braunschweig/"],
    ));
    const errors = inspectExport(root);
    expect(errors).toContain("/routes/dolyna-wolfsburg/ is missing its reverse-direction link");
  });

  it("requires manual-confirmation context on each city hub", () => {
    const root = fixture();
    write(root, "cities/ivano-frankivsk/index.html", page(
      "/cities/ivano-frankivsk/",
      "Поїздки з Івано-Франківська | UARoute",
      "<h1>Поїздки з Івано-Франківська до Німеччини</h1><p>Підготуйте виїзд і підготуйте повернення.</p><p>Івано-Франківськ Івано-Франківська Шверін Schwerin Люнебург Lüneburg Любек Lübeck Целле Celle Вольфсбург Wolfsburg Брауншвейг Braunschweig</p>",
      ["/routes/ivano-frankivsk-wolfsburg/", "/cities/lviv/"],
    ));
    expect(inspectExport(root)).toContain("/cities/ivano-frankivsk/ is missing direction guidance or manual-confirmation context");
  });

  it("independently requires visible expected resource links and rejects unsafe source substitutions", () => {
    const root = fixture();
    const path = "cities/lviv/index.html";
    const original = readFileSync(join(root, path), "utf8");
    write(root, path, original.replace(/<a href="https:\/\/lviv\.travel[^>]*>[\s\S]*?<\/a>/, ""));
    expect(inspectExport(root)).toContain("/cities/lviv/ is missing the expected visible city planning resource");

    const unsafe = fixture();
    const unsafeHtml = readFileSync(join(unsafe, path), "utf8").replace("https://lviv.travel/ua/news/gaid-lvivskim-gromadskim-transportom", "https://user:secret@lviv.travel/guide?token=private");
    write(unsafe, path, unsafeHtml);
    expect(inspectExport(unsafe)).toContain("/cities/lviv/ is missing the expected visible city planning resource");
  });

  it("ignores resource markup hidden in scripts and binds the editorial date to its own label", () => {
    const scriptOnly = fixture();
    const path = "cities/lviv/index.html";
    const html = readFileSync(join(scriptOnly, path), "utf8");
    const hiddenCard = html.replace(/<ul><li><a href="https:\/\/lviv\.travel[\s\S]*?<\/li><\/ul>/, (card) => `<script type="text/plain">${card}</script>`);
    write(scriptOnly, path, hiddenCard);
    expect(inspectExport(scriptOnly)).toContain("/cities/lviv/ is missing the expected visible city planning resource");

    const missingEditorialTime = fixture();
    const withoutEditorialTime = readFileSync(join(missingEditorialTime, path), "utf8")
      .replace(/<p>Редакційні поради переглянуто <time[^>]*>[\s\S]*?<\/time><\/p>/, "<p>Редакційні поради переглянуто</p>");
    write(missingEditorialTime, path, withoutEditorialTime);
    expect(inspectExport(missingEditorialTime)).toContain("/cities/lviv/ is missing the editorial review date and scope");
  });

  it("rejects unsupported hub service guarantees while allowing explicit uncertainty", () => {
    const root = fixture();
    const path = "cities/lviv/index.html";
    const html = readFileSync(join(root, path), "utf8").replace("</body>", "<p>Гарантуємо місце у транспорті.</p></body>");
    write(root, path, html);
    expect(inspectExport(root)).toContain("/cities/lviv/ includes an unsupported service guarantee: гарантуємо місце");
  });

  it("continues to reject a real visible section-order regression", () => {
    const root = fixture();
    const path = "cities/lviv/index.html";
    const html = readFileSync(join(root, path), "utf8").replace(
      '<section aria-labelledby="nearby-places-heading">',
      '<h2>Підготуйте виїзд</h2><section aria-labelledby="nearby-places-heading">',
    );
    write(root, path, html);
    expect(inspectExport(root)).toContain("/cities/lviv/ must focus the search heading and order search, nearby guidance, then preparation");
  });

  it("requires lastmod only on the two reviewed city hubs with exact editorial dates", () => {
    const missingHubDate = fixture();
    const sitemapPath = "sitemap.xml";
    const missingXml = readFileSync(join(missingHubDate, sitemapPath), "utf8").replace("<lastmod>2026-10-09</lastmod>", "");
    write(missingHubDate, sitemapPath, missingXml);
    expect(inspectExport(missingHubDate)).toContain("sitemap.xml https://uaroute.com/cities/lviv/ must have lastmod 2026-10-09");

    const unrelatedDate = fixture();
    const unrelatedXml = readFileSync(join(unrelatedDate, sitemapPath), "utf8").replace("<loc>https://uaroute.com/about/</loc>", "<loc>https://uaroute.com/about/</loc><lastmod>2026-10-09</lastmod>");
    write(unrelatedDate, sitemapPath, unrelatedXml);
    expect(inspectExport(unrelatedDate)).toContain("sitemap.xml https://uaroute.com/about/ must not have an unverified lastmod");

    const wrongDate = fixture();
    const wrongXml = readFileSync(join(wrongDate, sitemapPath), "utf8").replace("<lastmod>2026-10-09</lastmod>", "<lastmod>2035-10-09</lastmod>");
    write(wrongDate, sitemapPath, wrongXml);
    expect(inspectExport(wrongDate)).toContain("sitemap.xml https://uaroute.com/cities/lviv/ must have lastmod 2026-10-09");
  });

  it("rejects missing nearby navigation and a reappearing no-transfer claim", () => {
    const root = fixture();
    const lvivPath = join(root, "cities/lviv/index.html");
    const lvivHtml = readFileSync(lvivPath, "utf8")
      .replace('<a href="#search-heading">', '<a href="/routes/">')
      .replace("</body>", '<a href="#search-heading">Unrelated link</a></body>');
    writeFileSync(lvivPath, lvivHtml);
    write(root, "about/index.html", page(
      "/about/",
      "Назва about",
      "<h1>Про нас</h1><p>Прямі рейси без пересадок</p>",
      ["/routes/"],
    ));

    const errors = inspectExport(root);
    expect(errors).toContain("/cities/lviv/ nearby guidance must link back to the search heading");
    expect(errors).toContain("about/index.html includes the removed no-transfer claim");
  });

  it("requires both editorial documents to remain self-canonical and noindex, outside sitemap", () => {
    const root = fixture();
    write(root, "routes/lviv-hamburg/index.html", page(
      "/routes/lviv-hamburg/", "Hamburg", "<h1>Hamburg</h1>", ["/routes/"],
    ));
    write(root, "sitemap.xml", `<urlset><url><loc>https://uaroute.com/routes/lviv-hamburg/</loc></url></urlset>`);
    const errors = inspectExport(root);
    expect(errors).toContain("/routes/lviv-hamburg/ must remain noindex, follow");
    expect(errors).toContain("/routes/lviv-hamburg/ is editorial and must not appear in sitemap.xml");
    expect(errors).not.toContain("/routes/lviv-berlin/ must remain noindex, follow");
  });

  it("rejects a 404 export that points search engines to the homepage", () => {
    const root = fixture();
    write(root, "404.html", '<html><head><link rel="canonical" href="https://uaroute.com/"></head><body><h1>404</h1></body></html>');
    expect(inspectExport(root)).toContain("404.html must not declare the homepage as canonical");
  });
});
