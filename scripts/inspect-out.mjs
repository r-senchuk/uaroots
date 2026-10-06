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
  { slug: "lviv", name: "Львів", headingCity: "зі Львова", cityForms: ["Львів", "Львова"], crossHub: "/cities/ivano-frankivsk/", destinations: [["Шверін", "Schwerin"], ["Люнебург", "Lüneburg"], ["Любек", "Lübeck"], ["Целле", "Celle"], ["Вольфсбург", "Wolfsburg"], ["Брауншвейг", "Braunschweig"]] },
  { slug: "ivano-frankivsk", name: "Івано-Франківськ", headingCity: "з Івано-Франківська", cityForms: ["Івано-Франківськ", "Івано-Франківська"], crossHub: "/cities/lviv/", destinations: [["Шверін", "Schwerin"], ["Люнебург", "Lüneburg"], ["Любек", "Lübeck"], ["Целле", "Celle"], ["Вольфсбург", "Wolfsburg"], ["Брауншвейг", "Braunschweig"]] },
];
const cityHubPaths = ["/cities/lviv/", "/cities/ivano-frankivsk/"];
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

  for (const { slug, name, headingCity, cityForms, crossHub, destinations } of cityHubs) {
    const pagePath = `/cities/${slug}/`;
    const html = pages.get(pagePath);
    if (!html) continue;
    const text = plainText(html);
    const headingTexts = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(([, heading]) => plainText(heading ?? ""));
    if (headingTexts.length !== 1 || !headingTexts[0]?.includes(headingCity) || !headingTexts[0]?.includes("Німеччини")) {
      errors.push(`${pagePath} must have one Ukrainian H1 naming ${name} and Germany`);
    }
    if (!cityForms.some((form) => text.includes(form))) {
      errors.push(`${pagePath} is missing the Ukrainian city name in server-rendered content`);
    }
    if (!text.includes("Підготуйте виїзд") || !text.includes("Підготуйте повернення") ||
      !text.includes("Можливість поїздки на вашу дату") || !text.includes("підтверджує перевізник Коваль")) {
      errors.push(`${pagePath} is missing direction guidance or manual-confirmation context`);
    }
    for (const [destination, localName] of destinations) {
      if (!text.includes(destination) || !text.includes(localName)) {
        errors.push(`${pagePath} is missing German pilot city ${destination} (${localName}) in server-rendered content`);
      }
    }
    for (const href of anchorHrefs(html).filter((value) => /^\/routes\/[^/]+\/$/.test(value))) {
      if (!pilotRoutes.some(({ slug: routeSlug }) => href === `/routes/${routeSlug}/`)) {
        errors.push(`${pagePath} links to a route outside the explicit commercial route set: ${href}`);
      }
    }
    const routeLinks = anchorHrefs(html).filter((value) => /^\/routes\/[^/]+\/$/.test(value));
    if (routeLinks.length === 0) errors.push(`${pagePath} must link to at least one existing commercial route`);
    if (!anchorHrefs(routeIndexHtml).includes(pagePath)) {
      errors.push(`${pagePath} is missing from route index discovery links`);
    }
    if (!anchorHrefs(html).includes(crossHub)) {
      errors.push(`${pagePath} is missing its link to the other selected city hub`);
    }
  }

  const sitemapPath = join(root, "sitemap.xml");
  if (existsSync(sitemapPath)) {
    const locations = [...readFileSync(sitemapPath, "utf8").matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
      .map(([, loc]) => decodeHtml(loc.trim()));
    const expected = [...sitePages, ...cityHubPaths, ...pilotRoutes.map(({ slug }) => `/routes/${slug}/`)]
      .map(canonicalUrl)
      .sort();
    const actual = [...locations].sort();
    if (actual.length !== expected.length || actual.some((location, index) => location !== expected[index])) {
      errors.push("sitemap.xml must contain exactly the five public pages, two selected city hubs, and eleven commercial routes");
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
