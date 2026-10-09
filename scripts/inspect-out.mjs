import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

export const pilotRoutes = [
  { slug: "lviv-hannover", originId: "lviv", destinationId: "hannover", origin: "Львів", destination: "Ганновер", candidate: false },
  { slug: "dolyna-celle", originId: "dolyna", destinationId: "celle", origin: "Долина", destination: "Целле", candidate: true },
  { slug: "celle-dolyna", originId: "celle", destinationId: "dolyna", origin: "Целле", destination: "Долина", candidate: true },
  { slug: "dolyna-wolfsburg", originId: "dolyna", destinationId: "wolfsburg", origin: "Долина", destination: "Вольфсбург", candidate: true },
  { slug: "wolfsburg-dolyna", originId: "wolfsburg", destinationId: "dolyna", origin: "Вольфсбург", destination: "Долина", candidate: true },
  { slug: "dolyna-braunschweig", originId: "dolyna", destinationId: "braunschweig", origin: "Долина", destination: "Брауншвейг", candidate: true },
  { slug: "braunschweig-dolyna", originId: "braunschweig", destinationId: "dolyna", origin: "Брауншвейг", destination: "Долина", candidate: true },
  { slug: "lviv-celle", originId: "lviv", destinationId: "celle", origin: "Львів", destination: "Целле", candidate: true },
  { slug: "celle-lviv", originId: "celle", destinationId: "lviv", origin: "Целле", destination: "Львів", candidate: true },
  { slug: "ivano-frankivsk-wolfsburg", originId: "ivano-frankivsk", destinationId: "wolfsburg", origin: "Івано-Франківськ", destination: "Вольфсбург", candidate: true },
  { slug: "wolfsburg-ivano-frankivsk", originId: "wolfsburg", destinationId: "ivano-frankivsk", origin: "Вольфсбург", destination: "Івано-Франківськ", candidate: true },
];

const sitePages = ["/", "/routes/", "/about/", "/imprint/", "/privacy/"];
const cityHubs = [
  { slug: "lviv", name: "Львів", headingCity: "зі Львова", heading: "Поїздки зі Львова до Німеччини та назад", cityForms: ["Львів", "Львова"], crossHubs: ["/cities/ivano-frankivsk/", "/cities/celle/"], title: "Поїздки зі Львова до Німеччини та назад | UARoute", description: "Поїздки зі Львова до Німеччини та назад: вибір міста, поради про місце зустрічі, доїзд до посадки й подальшу дорогу. Уточніть умови у перевізника Коваль.", cardSlugs: ["lviv-hannover", "lviv-celle", "celle-lviv"], destinations: [["Шверін", "Schwerin"], ["Люнебург", "Lüneburg"], ["Любек", "Lübeck"], ["Целле", "Celle"], ["Вольфсбург", "Wolfsburg"], ["Брауншвейг", "Braunschweig"]] },
  { slug: "ivano-frankivsk", name: "Івано-Франківськ", headingCity: "з Івано-Франківська", heading: "Поїздки з Івано-Франківська до Німеччини та назад", cityForms: ["Івано-Франківськ", "Івано-Франківська"], crossHubs: ["/cities/lviv/", "/cities/celle/"], title: "Поїздки з Івано-Франківська до Німеччини та назад | UARoute", description: "Івано-Франківськ ↔ Німеччина: оберіть місто й перегляньте поради про посадку, багаж та зустріч після прибуття. Погодьте поїздку з перевізником Коваль.", cardSlugs: ["ivano-frankivsk-wolfsburg", "wolfsburg-ivano-frankivsk"], destinations: [["Шверін", "Schwerin"], ["Люнебург", "Lüneburg"], ["Любек", "Lübeck"], ["Целле", "Celle"], ["Вольфсбург", "Wolfsburg"], ["Брауншвейг", "Braunschweig"]] },
  { slug: "celle", name: "Целле", headingCity: "із Целле", heading: "Поїздки з Целле до України та назад", cityForms: ["Целле"], crossHubs: ["/cities/lviv/", "/cities/ivano-frankivsk/"], title: "Поїздки з Целле до України та назад | UARoute", description: "Оберіть українське місто для поїздки з Целле або назад. Поради про зустріч, багаж і подальшу дорогу; умови підтверджує перевізник Коваль.", cardSlugs: ["celle-lviv", "lviv-celle", "celle-dolyna", "dolyna-celle"], destinations: [["Львів", "Львів"], ["Івано-Франківськ", "Івано-Франківськ"], ["Долина", "Долина"], ["Калуш", "Калуш"], ["Стрий", "Стрий"], ["Галич", "Галич"], ["Бурштин", "Бурштин"], ["Пустомити", "Пустомити"], ["Брюховичі", "Брюховичі"], ["Городок (Львівська область)", "Городок (Львівська область)"], ["Миколаїв (Львівська область)", "Миколаїв (Львівська область)"], ["Новий Розділ", "Новий Розділ"], ["Надвірна", "Надвірна"], ["Жидачів", "Жидачів"]] },
];
const cityHubPaths = ["/cities/lviv/", "/cities/ivano-frankivsk/", "/cities/celle/"];
const cityHubResources = {
  lviv: {
    url: "https://lviv.travel/ua/news/gaid-lvivskim-gromadskim-transportom",
    label: "Офіційний довідник громадського транспорту Львова",
    role: "UARoute допомагає знайти напрямок зі Львова до потрібного міста Німеччини або назад",
    outbound: "Якщо спочатку добираєтеся до Львова",
    returning: "Не вважайте залізничний вокзал чи інший орієнтир автоматично погодженою зупинкою",
    purpose: "Перевірити актуальні правила доїзду в місті",
    checkedAt: "2026-10-09",
    reviewedAt: "2026-10-09",
    contentUpdatedAt: "2026-10-09",
  },
  "ivano-frankivsk": {
    url: "https://booking.uz.gov.ua/",
    label: "Офіційний пошук квитків Укрзалізниці",
    role: "UARoute допомагає знайти напрямок з Івано-Франківська до потрібного міста Німеччини або назад",
    outbound: "Якщо до міста плануєте їхати потягом",
    returning: "пересування містом і стиковка не гарантуються зверненням до Коваль",
    purpose: "Окремо перевірити потрібну попередню або подальшу ділянку",
    checkedAt: "2026-10-09",
    reviewedAt: "2026-10-09",
    contentUpdatedAt: "2026-10-09",
  },
  celle: {
    url: "https://www.celle-tourismus.de/info-besucherservice/tourist-information/anreise-parken",
    label: "Офіційний довідник доїзду до Целле",
    role: "UARoute допомагає знайти потрібний напрямок і підготувати звернення до перевізника Коваль",
    outbound: "Якщо плануєте виїзд із Целле",
    returning: "Для прибуття до Целле заздалегідь погодьте місце висадки",
    purpose: "Перевірити місцевий доїзд перед зустріччю або подальшою дорогою",
    checkedAt: "2026-10-09",
    reviewedAt: "2026-10-09",
    contentUpdatedAt: "2026-10-09",
  },
};
const editorialRouteSlugs = ["lviv-hamburg", "lviv-berlin"];
const legacyRedirects = [
  ["contact", "/about/"],
  ["contacts", "/about/"],
  ["carriers", "/routes/"],
  ["packages", "/about/"],
  ["gallery", "/"],
];
const candidatePracticalTerms = {
  "dolyna-celle": ["вокзал", "старе місто"],
  "celle-dolyna": ["вокзал", "старе місто"],
  "dolyna-wolfsburg": ["Фаллерслебен", "Форсфельде"],
  "wolfsburg-dolyna": ["Фаллерслебен", "Форсфельде"],
  "dolyna-braunschweig": ["вокзал", "центральної частини"],
  "braunschweig-dolyna": ["вокзал", "центральної частини"],
  "lviv-celle": ["вокзал", "старе місто"],
  "celle-lviv": ["вокзал", "старе місто"],
  "ivano-frankivsk-wolfsburg": ["Фаллерслебен", "Форсфельде"],
  "wolfsburg-ivano-frankivsk": ["Фаллерслебен", "Форсфельде"],
};
const candidateSources = {
  "dolyna-celle": "https://www.celle-tourismus.de/info-besucherservice/tourist-information/anreise-parken",
  "celle-dolyna": "https://www.celle-tourismus.de/info-besucherservice/tourist-information/anreise-parken",
  "dolyna-wolfsburg": "https://www.wolfsburg.de/en/bauenwohnen/wolfsburg-als-wohnort",
  "wolfsburg-dolyna": "https://www.wolfsburg.de/en/bauenwohnen/wolfsburg-als-wohnort",
  "dolyna-braunschweig": "https://www.braunschweig.de/tourismus/ihr-besuch-in-braunschweig/anreise_bahn_bus.php",
  "braunschweig-dolyna": "https://www.braunschweig.de/tourismus/ihr-besuch-in-braunschweig/anreise_bahn_bus.php",
  "lviv-celle": "https://www.celle-tourismus.de/info-besucherservice/tourist-information/anreise-parken",
  "celle-lviv": "https://www.celle-tourismus.de/info-besucherservice/tourist-information/anreise-parken",
  "ivano-frankivsk-wolfsburg": "https://www.wolfsburg.de/en/bauenwohnen/wolfsburg-als-wohnort",
  "wolfsburg-ivano-frankivsk": "https://www.wolfsburg.de/en/bauenwohnen/wolfsburg-als-wohnort",
};
const forbiddenCandidateClaims = [
  "Пасажирські перевезення та посилки між Україною та Європою.",
  "Прямі рейси без пересадок",
  "Два професійні водії",
  "Адресна доставка пасажирів у Німеччині",
  "Бронювання без передоплати",
  "Мікроавтобуси Mercedes Sprinter",
];
const forbiddenCityHubClaims = [
  "гарантуємо місце",
  "гарантуємо посадку",
  "гарантована стиковка",
  "пересадка гарантована",
  "без пересадок",
];

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/gi, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function plainText(html) {
  return decodeHtml(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    const [, name, doubleQuoted, singleQuoted, unquoted] = match;
    result[name.toLowerCase()] = decodeHtml(doubleQuoted ?? singleQuoted ?? unquoted ?? "");
  }
  return result;
}

function pageMetadata(html) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const descriptionTag = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map(([tag]) => attributes(tag))
    .find((attrs) => attrs.name?.toLowerCase() === "description");
  const canonicals = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(([tag]) => attributes(tag))
    .filter((attrs) => attrs.rel?.toLowerCase().split(/\s+/).includes("canonical"));
  return {
    title: title ? plainText(title) : "",
    description: descriptionTag?.content?.trim() ?? "",
    canonicals,
  };
}

function jsonLdDocuments(html) {
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .flatMap(([, source]) => {
      try { return [JSON.parse(source ?? "")]; } catch { return []; }
    });
}

function graphNodes(documents) {
  return documents.flatMap((document) => Array.isArray(document?.["@graph"]) ? document["@graph"] : [document]);
}

function checkCityHubStructuredData(pagePath, html, expectedCards, name, errors) {
  const documents = jsonLdDocuments(html);
  const nodes = graphNodes(documents);
  const byId = new Map(nodes.filter((node) => typeof node?.["@id"] === "string").map((node) => [node["@id"], node]));
  const website = nodes.find((node) => node?.["@type"] === "WebSite");
  const page = nodes.find((node) => node?.["@type"] === "CollectionPage");
  const place = nodes.find((node) => node?.["@type"] === "Place");
  const list = nodes.find((node) => node?.["@type"] === "ItemList");
  const websiteId = "https://uaroute.com/#website";
  const pageId = `${canonicalUrl(pagePath)}#webpage`;
  const placeId = `${canonicalUrl(pagePath)}#place`;
  const listId = `${canonicalUrl(pagePath)}#directions`;
  const operatorId = "https://crewbravo.com/#operator";

  if (!website || website["@id"] !== websiteId || website.url !== "https://uaroute.com" || website.publisher?.["@id"] !== operatorId) {
    errors.push(`${pagePath} has a mismatched WebSite identity or publisher`);
  }
  if (!page || page["@id"] !== pageId || page.url !== canonicalUrl(pagePath) || page.isPartOf?.["@id"] !== websiteId ||
    page.about?.["@id"] !== placeId || page.mainEntity?.["@id"] !== listId || page.publisher?.["@id"] !== operatorId) {
    errors.push(`${pagePath} has an incomplete or unresolved CollectionPage graph`);
  }
  if (!place || place["@type"] !== "Place" || place["@id"] !== placeId || place.name !== name) {
    errors.push(`${pagePath} has no matching visible Place entity`);
  }
  const actualCards = list?.itemListElement?.map((entry) => entry?.item?.["@id"]?.match(/^https:\/\/uaroute\.com\/routes\/([^/]+)\/#webpage$/)?.[1]);
  if (list?.["@id"] !== listId || list?.itemListOrder !== "https://schema.org/ItemListOrderAscending" ||
    JSON.stringify(actualCards) !== JSON.stringify(expectedCards) ||
    list?.itemListElement?.some((entry, index) => entry?.["@type"] !== "ListItem" || entry.position !== index + 1)) {
    errors.push(`${pagePath} ItemList differs from the exact visible commercial card order`);
  }
  for (const node of nodes) {
    for (const key of ["isPartOf", "about", "mainEntity", "publisher"]) {
      const reference = node?.[key]?.["@id"];
      if (reference && !byId.has(reference)) errors.push(`${pagePath} structured data has an unresolved ${key} reference`);
    }
    if (["Offer", "BusTrip", "BusReservation", "Trip", "Product", "ReserveAction"].includes(node?.["@type"])) {
      errors.push(`${pagePath} includes unsupported operational structured data: ${node["@type"]}`);
    }
  }
  for (const entry of list?.itemListElement ?? []) {
    const reference = entry?.item?.["@id"];
    if (!reference || !byId.has(reference)) errors.push(`${pagePath} ItemList has an unresolved visible route reference`);
  }
  const breadcrumb = documents.find((document) => document?.["@type"] === "BreadcrumbList");
  if (!breadcrumb || !breadcrumb.itemListElement?.some((entry) => entry.item === canonicalUrl(pagePath))) {
    errors.push(`${pagePath} is missing its matching breadcrumb structured data`);
  }
}

function htmlFilesUnder(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return htmlFilesUnder(path);
    return entry.isFile() && entry.name.endsWith(".html") ? [path] : [];
  });
}

function filesUnder(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return filesUnder(path);
    return entry.isFile() ? [path] : [];
  });
}

function anchorHrefs(html) {
  return [...html.matchAll(/<a\b[^>]*>/gi)].map(([tag]) => attributes(tag).href).filter(Boolean);
}

function expectedFileForPath(root, rawPath) {
  const pathname = decodeURIComponent(rawPath.split(/[?#]/, 1)[0] ?? "");
  if (!pathname || pathname === "/") return join(root, "index.html");
  const relativePath = pathname.replace(/^\/+/, "");
  if (/\.[a-z\d]+$/i.test(relativePath)) return join(root, relativePath);
  return join(root, relativePath, "index.html");
}

function inspectLinks(root, errors) {
  for (const htmlPath of htmlFilesUnder(root)) {
    const html = readFileSync(htmlPath, "utf8");
    const htmlName = relative(root, htmlPath).split(sep).join("/");
    for (const href of anchorHrefs(html)) {
      if (/^(?:#|https?:|mailto:|tel:|sms:|javascript:|data:)/i.test(href)) continue;
      if (!href.startsWith("/")) {
        errors.push(`${htmlName} has a non-absolute internal link: ${href}`);
        continue;
      }
      const pathname = href.split(/[?#]/, 1)[0] ?? "";
      if (pathname !== "/" && !pathname.endsWith("/") && !/\.[a-z\d]+$/i.test(pathname)) {
        errors.push(`${htmlName} has an internal link without a trailing slash: ${href}`);
      }
      const target = expectedFileForPath(root, href);
      if (!existsSync(target)) errors.push(`${htmlName} links to missing export ${href}`);
    }
  }
}

function canonicalUrl(path) {
  return `https://uaroute.com${path}`;
}

export function inspectExport(root = join(process.cwd(), "out")) {
  const errors = [];
  const requiredFiles = [
    "index.html", "index.txt", "__next._tree.txt", "__next._full.txt", "__next.__PAGE__.txt",
    "404.html", "routes/index.html", "about/index.html",
    "imprint/index.html", "privacy/index.html", "sitemap.xml", "robots.txt",
    ...legacyRedirects.map(([slug]) => `${slug}/index.html`),
    ...sitePages.slice(1).map((path) => `${path.replace(/^\/+|\/+$/g, "")}/index.txt`),
    ...sitePages.slice(1).flatMap((path) => {
      const segment = path.replace(/^\/+|\/+$/g, "");
      return [`${segment}/__next._tree.txt`, `${segment}/__next._full.txt`, `${segment}/__next.${segment}.__PAGE__.txt`];
    }),
    ...pilotRoutes.flatMap(({ slug }) => [
      `routes/${slug}/index.html`,
      `routes/${slug}/index.txt`,
      `routes/${slug}/__next._tree.txt`,
      `routes/${slug}/__next._full.txt`,
      `routes/${slug}/__next.routes.$d$slug.__PAGE__.txt`,
    ]),
    ...editorialRouteSlugs.flatMap((slug) => [
      `routes/${slug}/index.html`,
      `routes/${slug}/index.txt`,
      `routes/${slug}/__next._tree.txt`,
      `routes/${slug}/__next._full.txt`,
      `routes/${slug}/__next.routes.$d$slug.__PAGE__.txt`,
    ]),
    ...cityHubs.flatMap(({ slug }) => [
      `cities/${slug}/index.html`,
      `cities/${slug}/index.txt`,
      `cities/${slug}/__next._tree.txt`,
      `cities/${slug}/__next._full.txt`,
      `cities/${slug}/__next.cities.$d$slug.__PAGE__.txt`,
    ]),
  ];
  for (const relativePath of requiredFiles) {
    if (!existsSync(join(root, relativePath))) errors.push(`Missing ${relativePath}`);
  }

  const requiredPagePaths = [
    ...sitePages,
    ...pilotRoutes.map(({ slug }) => `/routes/${slug}/`),
    ...cityHubPaths,
  ];
  const seenTitles = new Map();
  const seenDescriptions = new Map();
  const pages = new Map();
  for (const pagePath of requiredPagePaths) {
    const htmlPath = expectedFileForPath(root, pagePath);
    if (!existsSync(htmlPath)) continue;
    const html = readFileSync(htmlPath, "utf8");
    pages.set(pagePath, html);
    const metadata = pageMetadata(html);
    if (!metadata.title) errors.push(`${pagePath} has no title`);
    else if (seenTitles.has(metadata.title)) errors.push(`${pagePath} duplicates title from ${seenTitles.get(metadata.title)}`);
    else seenTitles.set(metadata.title, pagePath);
    if (!metadata.description) errors.push(`${pagePath} has no meta description`);
    else if (seenDescriptions.has(metadata.description)) errors.push(`${pagePath} duplicates description from ${seenDescriptions.get(metadata.description)}`);
    else seenDescriptions.set(metadata.description, pagePath);
    if (metadata.canonicals.length !== 1 || metadata.canonicals[0]?.href !== canonicalUrl(pagePath)) {
      errors.push(`${pagePath} must have exactly one absolute canonical URL (${canonicalUrl(pagePath)})`);
    }
  }

  const editorialPaths = editorialRouteSlugs.map((slug) => `/routes/${slug}/`);
  for (const pagePath of editorialPaths) {
    const htmlPath = expectedFileForPath(root, pagePath);
    if (!existsSync(htmlPath)) continue;
    const html = readFileSync(htmlPath, "utf8");
    const metadata = pageMetadata(html);
    if (metadata.canonicals.length !== 1 || metadata.canonicals[0]?.href !== canonicalUrl(pagePath)) {
      errors.push(`${pagePath} must have exactly one absolute self-canonical URL (${canonicalUrl(pagePath)})`);
    }
    const robots = [...html.matchAll(/<meta\b[^>]*>/gi)]
      .map(([tag]) => attributes(tag))
      .find((attrs) => attrs.name?.toLowerCase() === "robots")?.content?.toLowerCase().replace(/\s+/g, "");
    if (robots !== "noindex,follow") errors.push(`${pagePath} must remain noindex, follow`);
  }

  const homeHtml = pages.get("/") ?? "";
  const routeIndexHtml = pages.get("/routes/") ?? "";
  const homeWebsite = graphNodes(jsonLdDocuments(homeHtml)).find((node) => node?.["@type"] === "WebSite");
  if (homeWebsite?.["@id"] !== "https://uaroute.com/#website") errors.push("home page WebSite identity must match selected city hub graphs");
  const homeHeading = plainText(homeHtml.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");
  const routeIndexHeading = plainText(routeIndexHtml.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");
  if (!homeHeading.includes("Поїздки між Україною та Німеччиною")) {
    errors.push("home page H1 must introduce trips between Ukraine and Germany");
  }
  if (!routeIndexHeading.includes("Поїздки між Україною та Німеччиною")) {
    errors.push("route index H1 must introduce trips between Ukraine and Germany");
  }
  for (const { slug, origin, destination, candidate } of pilotRoutes) {
    const pagePath = `/routes/${slug}/`;
    const html = pages.get(pagePath);
    if (!html) continue;
    const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
    const headingText = headings[0] ? plainText(headings[0][1]) : "";
    if (headings.length !== 1 || !headingText.includes(origin) || !headingText.includes(destination)) {
      errors.push(`${pagePath} must have one Ukrainian H1 naming ${origin} and ${destination}`);
    }

    if (!candidate) continue;
    const text = plainText(html);
    if (!text.includes("Уточніть можливість поїздки на бажану дату.") ||
      !text.includes("Перевізник Коваль перевірить можливість поїздки") || !text.includes("не резервує місце")) {
      errors.push(`${pagePath} is missing the feasibility-first candidate inquiry notice`);
    }
    for (const term of candidatePracticalTerms[slug] ?? []) {
      if (!text.toLocaleLowerCase().includes(term.toLocaleLowerCase())) {
        errors.push(`${pagePath} is missing city-specific practical content: ${term}`);
      }
    }
    if (!html.includes(candidateSources[slug])) {
      errors.push(`${pagePath} is missing the official source for its city-specific practical content`);
    }
    for (const claim of forbiddenCandidateClaims) {
      if (text.toLocaleLowerCase().includes(claim.toLocaleLowerCase())) {
        errors.push(`${pagePath} includes a carrier operational claim: ${claim}`);
      }
    }
    if (/(?:"|&quot;)@type(?:"|&quot;)\s*:\s*(?:"|&quot;)(?:Offer|BusTrip|BusReservation|Trip|Product)(?:"|&quot;)/i.test(html)) {
      errors.push(`${pagePath} includes offer, bus trip, or inventory structured data`);
    }
  }

  const legalNames = ["/imprint/", "/privacy/"];
  for (const pagePath of legalNames) {
    const html = pages.get(pagePath);
    if (!html) continue;
    const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "";
    if (!/[А-Яа-яІіЇїЄєҐґ]/u.test(plainText(heading))) errors.push(`${pagePath} needs a Ukrainian H1`);
    const text = plainText(html);
    if (!/Roman Senchuk|Роман Сенчук/i.test(text)) errors.push(`${pagePath} is missing the legal operator name`);
    if (!text.includes("Crew Bravo") || !/бренд/i.test(text)) errors.push(`${pagePath} must explain Crew Bravo's role as a brand`);
  }

  for (const { slug } of pilotRoutes.filter(({ candidate }) => candidate)) {
    const routeHtml = pages.get(`/routes/${slug}/`) ?? "";
    for (const indexHtml of [homeHtml, routeIndexHtml]) {
      if (!anchorHrefs(indexHtml).includes(`/routes/${slug}/`)) {
        errors.push(`${slug} is missing from the home page or route index links`);
        break;
      }
    }
    const current = pilotRoutes.find((route) => route.slug === slug);
    const counterpart = pilotRoutes.find(({ originId, destinationId }) =>
      originId === current?.destinationId && destinationId === current?.originId,
    );
    if (!counterpart || !anchorHrefs(routeHtml).includes(`/routes/${counterpart.slug}/`)) {
      errors.push(`/routes/${slug}/ is missing its reverse-direction link`);
    }
  }

  for (const { slug, name, heading, cityForms, crossHubs, title, description, cardSlugs, destinations } of cityHubs) {
    const pagePath = `/cities/${slug}/`;
    const html = pages.get(pagePath);
    if (!html) continue;
    const text = plainText(html);
    const headingTexts = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(([, heading]) => plainText(heading ?? ""));
    if (headingTexts.length !== 1 || headingTexts[0] !== heading) {
      errors.push(`${pagePath} must have its exact reviewed Ukrainian H1`);
    }
    const metadata = pageMetadata(html);
    if (title && metadata.title !== title) errors.push(`${pagePath} has a different title from the reviewed content`);
    if (description && metadata.description !== description) errors.push(`${pagePath} has a different description from the reviewed content`);
    if (!cityForms.some((form) => text.includes(form))) {
      errors.push(`${pagePath} is missing the Ukrainian city name in server-rendered content`);
    }
    const expectedResource = cityHubResources[slug];
    if (!text.includes(expectedResource.role)) errors.push(`${pagePath} is missing its concise UARoute discovery role`);
    if (!text.includes(expectedResource.outbound) || !text.includes(expectedResource.returning)) errors.push(`${pagePath} is missing outbound or return planning guidance`);
    const visibleHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ");
    const resourceAnchor = [...visibleHtml.matchAll(/<a\b[^>]*href=(?:"([^"]*)"|'([^']*)')[^>]*>([\s\S]*?)<\/a>/gi)]
      .find(([, doubleHref, singleHref]) => (doubleHref ?? singleHref) === expectedResource.url);
    if (!resourceAnchor || !plainText(resourceAnchor[3] ?? "").includes(expectedResource.label)) {
      errors.push(`${pagePath} is missing the expected visible city planning resource`);
    }
    const resourceCard = resourceAnchor ? visibleHtml.slice(visibleHtml.lastIndexOf("<li", resourceAnchor.index), visibleHtml.indexOf("</li>", resourceAnchor.index) + 5) : "";
    if (!plainText(resourceCard).includes(expectedResource.purpose)) errors.push(`${pagePath} is missing the passenger action for its planning resource`);
    const resourceTime = [...resourceCard.matchAll(/<time\b[^>]*datetime=(?:"([^"]*)"|'([^']*)')[^>]*>([\s\S]*?)<\/time>/gi)]
      .find(([, doubleDate, singleDate, value]) => (doubleDate ?? singleDate) === expectedResource.checkedAt && plainText(value ?? "") === expectedResource.checkedAt);
    if (!resourceTime || !plainText(resourceCard).includes("Довідник переглянуто")) errors.push(`${pagePath} is missing a visible reviewed resource date`);
    const editorialDateParagraph = [...visibleHtml.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
      .map(([, paragraph]) => paragraph ?? "")
      .find((paragraph) => {
        if (!plainText(paragraph).includes("Редакційні поради переглянуто")) return false;
        return [...paragraph.matchAll(/<time\b[^>]*datetime=(?:"([^"]*)"|'([^']*)')[^>]*>([\s\S]*?)<\/time>/gi)]
          .some(([, doubleDate, singleDate, value]) => (doubleDate ?? singleDate) === expectedResource.reviewedAt && plainText(value ?? "") === expectedResource.reviewedAt);
      });
    if (!editorialDateParagraph) errors.push(`${pagePath} is missing the editorial review date and scope`);
    const hasDepartureHeading = text.includes(slug === "celle" ? "Підготуйте виїзд із Целле" : "Підготуйте виїзд");
    const hasArrivalHeading = text.includes(slug === "celle" ? "Сплануйте прибуття до Целле" : "Підготуйте повернення");
    if (!hasDepartureHeading || !hasArrivalHeading ||
      !text.includes("Можливість поїздки на вашу дату") || !text.includes("підтверджує перевізник Коваль")) {
      errors.push(`${pagePath} is missing direction guidance or manual-confirmation context`);
    }
    for (const claim of forbiddenCityHubClaims) {
      if (text.toLocaleLowerCase().includes(claim)) errors.push(`${pagePath} includes an unsupported service guarantee: ${claim}`);
    }
    const nearbySection = visibleHtml.match(/<section\b(?=[^>]*aria-labelledby="nearby-places-heading")[^>]*>[\s\S]*?<\/section>/i)?.[0] ?? "";
    const nearbyText = plainText(nearbySection);
    const privateContactContext = slug === "celle" ? "приватному повідомленні" : "приватному повідомленні WhatsApp";
    if (!nearbyText.includes("фактичне місце") || !nearbyText.includes(privateContactContext) ||
      !nearbyText.includes("не означає посадку у вашому населеному пункті")) {
      errors.push(`${pagePath} is missing useful nearby guidance and the pickup boundary`);
    }
    const searchSection = visibleHtml.match(/<section\b(?=[^>]*aria-labelledby="search-heading")[^>]*>[\s\S]*?<\/section>/i)?.[0] ?? "";
    const confirmationNotice = "Можливість поїздки на вашу дату, наявність місць, місця посадки й висадки та ціну підтверджує перевізник Коваль у відповідь на звернення.";
    if (!searchSection.includes(confirmationNotice)) {
      errors.push(`${pagePath} must place the trip confirmation notice in the search section`);
    }
    const searchHeading = visibleHtml.match(/<h2\b[^>]*\bid="search-heading"[^>]*>/i);
    const nearbyHeading = visibleHtml.match(/<h2\b[^>]*\bid="nearby-places-heading"[^>]*>/i);
    const preparation = visibleHtml.indexOf("Підготуйте виїзд");
    if (!searchHeading || !/\btabindex="-1"/i.test(searchHeading[0]) || !nearbyHeading ||
      searchHeading.index >= nearbyHeading.index || nearbyHeading.index >= preparation) {
      errors.push(`${pagePath} must focus the search heading and order search, nearby guidance, then preparation`);
    }
    const returningGuidance = visibleHtml.indexOf(expectedResource.returning);
    if (resourceAnchor && (resourceAnchor.index < preparation || returningGuidance < 0 || resourceAnchor.index < returningGuidance)) {
      errors.push(`${pagePath} planning resource must follow the outbound and return preparation guidance`);
    }
    if (!nearbySection || !anchorHrefs(nearbySection).includes("#search-heading")) {
      errors.push(`${pagePath} nearby guidance must link back to the search heading`);
    }
    let previousDestinationIndex = -1;
    for (const [destination, localName] of destinations) {
      if (!text.includes(destination) || !text.includes(localName)) {
        errors.push(`${pagePath} is missing German pilot city ${destination} (${localName}) in server-rendered content`);
      }
      if (slug === "celle") {
        const position = text.indexOf(destination, previousDestinationIndex + 1);
        if (position < 0 || position < previousDestinationIndex) errors.push(`${pagePath} does not preserve the ordered Ukrainian choice list`);
        previousDestinationIndex = position;
      }
    }
    for (const href of anchorHrefs(html).filter((value) => /^\/routes\/[^/]+\/$/.test(value))) {
      if (!pilotRoutes.some(({ slug: routeSlug }) => href === `/routes/${routeSlug}/`)) {
        errors.push(`${pagePath} links to a route outside the explicit commercial route set: ${href}`);
      }
    }
    const routeLinks = anchorHrefs(html).filter((value) => /^\/routes\/[^/]+\/$/.test(value));
    if (routeLinks.length === 0) errors.push(`${pagePath} must link to at least one existing commercial route`);
    const routeCardHeading = visibleHtml.indexOf("Поради для вашого напрямку");
    const routeCardListStart = routeCardHeading < 0 ? -1 : visibleHtml.indexOf("<ul", routeCardHeading);
    const routeCardListEnd = routeCardListStart < 0 ? -1 : visibleHtml.indexOf("</ul>", routeCardListStart);
    const visibleCardSlugs = routeCardListStart < 0 || routeCardListEnd < 0 ? [] :
      anchorHrefs(visibleHtml.slice(routeCardListStart, routeCardListEnd)).filter((href) => /^\/routes\/[^/]+\/$/.test(href)).map((href) => href.split("/")[2]);
    if (JSON.stringify(visibleCardSlugs) !== JSON.stringify(cardSlugs)) errors.push(`${pagePath} visible commercial route cards differ from the reviewed order`);
    if (!anchorHrefs(routeIndexHtml).includes(pagePath)) {
      errors.push(`${pagePath} is missing from route index discovery links`);
    }
    for (const crossHub of crossHubs ?? []) {
      if (!anchorHrefs(html).includes(crossHub)) errors.push(`${pagePath} is missing its related selected city hub link: ${crossHub}`);
    }
    checkCityHubStructuredData(pagePath, html, cardSlugs ?? [], name, errors);
  }

  const sitemapPath = join(root, "sitemap.xml");
  if (existsSync(sitemapPath)) {
    const sitemapXml = readFileSync(sitemapPath, "utf8");
    const entries = [...sitemapXml.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)].map(([, entry]) => ({
      url: decodeHtml(entry.match(/<loc>([\s\S]*?)<\/loc>/i)?.[1]?.trim() ?? ""),
      lastmod: entry.match(/<lastmod>([\s\S]*?)<\/lastmod>/i)?.[1]?.trim(),
    }));
    const locations = entries.map(({ url }) => url);
    const expected = [...sitePages, ...cityHubPaths, ...pilotRoutes.map(({ slug }) => `/routes/${slug}/`)]
      .map(canonicalUrl)
      .sort();
    const actual = [...locations].sort();
    if (actual.length !== expected.length || actual.some((location, index) => location !== expected[index])) {
      errors.push("sitemap.xml must contain exactly the five public pages, three selected city hubs, and eleven commercial routes");
    }
    const expectedLastmod = new Map(Object.entries(cityHubResources).map(([slug, content]) => [canonicalUrl(`/cities/${slug}/`), content.contentUpdatedAt]));
    for (const entry of entries) {
      const expectedDate = expectedLastmod.get(entry.url);
      if (expectedDate) {
        if (entry.lastmod !== expectedDate) errors.push(`sitemap.xml ${entry.url} must have lastmod ${expectedDate}`);
      } else if (entry.lastmod) {
        errors.push(`sitemap.xml ${entry.url} must not have an unverified lastmod`);
      }
    }
    for (const pagePath of editorialPaths) {
      if (locations.includes(canonicalUrl(pagePath))) errors.push(`${pagePath} is editorial and must not appear in sitemap.xml`);
    }
  }

  const notFoundPath = join(root, "404.html");
  if (existsSync(notFoundPath)) {
    const metadata = pageMetadata(readFileSync(notFoundPath, "utf8"));
    if (metadata.canonicals.some(({ href }) => href === canonicalUrl("/"))) {
      errors.push("404.html must not declare the homepage as canonical");
    }
  }

  for (const relativePath of [
    "arrival-560.webp", "arrival-1120.webp", "crewbravo-logo.svg", "icon.svg",
  ]) {
    const path = join(root, relativePath);
    if (!existsSync(path) || readFileSync(path).byteLength === 0) errors.push(`Missing or empty static asset ${relativePath}`);
  }
  const fontFiles = filesUnder(join(root, "_next/static/media")).filter((path) => path.endsWith(".woff2"));
  if (fontFiles.length === 0 || fontFiles.some((path) => readFileSync(path).byteLength === 0)) {
    errors.push("Static export must contain readable WOFF2 font assets");
  }

  for (const [slug, destination] of legacyRedirects) {
    const path = join(root, slug, "index.html");
    if (!existsSync(path)) continue;
    const html = readFileSync(path, "utf8");
    if (!html.includes(destination) || !/location\.replace|http-equiv="refresh"/i.test(html)) {
      errors.push(`${slug}/index.html no longer redirects to ${destination}`);
    }
  }

  inspectLinks(root, errors);

  const fontSource = /fonts\.googleapis\.com|fonts\.gstatic\.com|@import\s+url\([^)]*google/i;
  for (const htmlPath of htmlFilesUnder(root)) {
    if (fontSource.test(readFileSync(htmlPath, "utf8"))) errors.push(`${relative(root, htmlPath)} requests Google Fonts`);
  }
  function inspectCss(directory) {
    if (!existsSync(directory)) return;
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) inspectCss(path);
      else if (entry.isFile() && path.endsWith(".css") && fontSource.test(readFileSync(path, "utf8"))) {
        errors.push(`${relative(root, path).split(sep).join("/")} requests Google Fonts`);
      }
    }
  }
  inspectCss(root);

  for (const htmlPath of htmlFilesUnder(root)) {
    const text = plainText(readFileSync(htmlPath, "utf8"));
    if (text.toLocaleLowerCase().includes("прямі рейси без пересадок".toLocaleLowerCase())) {
      errors.push(`${relative(root, htmlPath).split(sep).join("/")} includes the removed no-transfer claim`);
    }
  }

  return errors;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  const errors = inspectExport(join(process.cwd(), "out"));
  if (errors.length > 0) {
    console.error(errors.map((error) => `inspect-out: ${error}`).join("\n"));
    process.exitCode = 1;
  } else {
    console.log("inspect-out: ./out passed the static export and POC content gates");
  }
}
