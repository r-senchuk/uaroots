import { join } from "node:path";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { cities } from "@/data/cities";
import { cityHubContents } from "@/data/city-hubs";
import { getResolvedRoute } from "@/data/queries";
import sitemap from "@/app/sitemap";
import { buildMetadata, cityHubCollectionLd, routePageLd, travelPreviewImage, websiteLd } from "@/lib/seo";

const priorityPairs = [
  ["lviv", "celle", "lviv-celle"],
  ["celle", "lviv", "celle-lviv"],
  ["ivano-frankivsk", "wolfsburg", "ivano-frankivsk-wolfsburg"],
  ["wolfsburg", "ivano-frankivsk", "wolfsburg-ivano-frankivsk"],
] as const;

describe("SEO metadata", () => {
  it("builds absolute canonical and social image metadata with the image dimensions and alt text", async () => {
    const metadata = buildMetadata({
      title: "Львів → Целле: як уточнити поїздку | UARoute",
      description: "Підготуйте запит перевізнику.",
      path: "/routes/lviv-celle/",
      type: "article",
      socialImage: travelPreviewImage,
    });
    const imagePath = join(process.cwd(), "public", travelPreviewImage.path.slice(1));
    const imageInfo = await sharp(imagePath).metadata();
    const images = metadata.openGraph?.images;
    const openGraphImage = Array.isArray(images) ? images[0] : images;

    expect(metadata.alternates?.canonical).toBe("https://uaroute.com/routes/lviv-celle/");
    expect(openGraphImage).toMatchObject({
      url: "https://uaroute.com/arrival-social.webp",
      width: 1200,
      height: 630,
      alt: expect.stringContaining("Ілюстрація"),
    });
    expect(metadata.twitter && "card" in metadata.twitter ? metadata.twitter.card : undefined).toBe("summary_large_image");
    expect(imageInfo).toMatchObject({ format: "webp", width: 1200, height: 630 });
  });

  it("keeps indexable travel metadata image-free when no representative image is selected", () => {
    const metadata = buildMetadata({ title: "Про UARoute", description: "Інформація", path: "/about/" });

    expect(metadata.openGraph?.images).toBeUndefined();
    expect(metadata.twitter && "card" in metadata.twitter ? metadata.twitter.card : undefined).toBe("summary");
  });
});

describe("city hub structured data", () => {
  it("uses the shared WebSite identity and resolves the ordered visible route graph", () => {
    const city = cities.find(({ id }) => id === "celle")!;
    const content = cityHubContents.find(({ cityId }) => cityId === city.id)!;
    const visibleRoutes = content.routeSlugs.flatMap((slug) => {
      const route = getResolvedRoute(slug);
      return route?.status === "commercial" ? [route] : [];
    });
    const graph = cityHubCollectionLd(city, content, visibleRoutes);
    const nodes = graph["@graph"] as Array<Record<string, unknown>>;
    const byId = new Map(nodes.flatMap((node) => "@id" in node ? [[node["@id"], node] as const] : []));
    const website = nodes.find((node) => node["@type"] === "WebSite")!;
    const page = nodes.find((node) => node["@type"] === "CollectionPage")!;
    const place = nodes.find((node) => node["@type"] === "Place")!;
    const list = nodes.find((node) => node["@type"] === "ItemList")!;
    const operatorId = "https://crewbravo.com/#operator";
    const { ["@context"]: websiteContext, ...expectedWebsite } = websiteLd();

    expect(websiteContext).toBe("https://schema.org");
    expect(website).toEqual(expectedWebsite);
    expect(website).toMatchObject({ "@id": "https://uaroute.com/#website", url: "https://uaroute.com" });
    expect(page).toMatchObject({
      "@id": "https://uaroute.com/cities/celle/#webpage",
      url: "https://uaroute.com/cities/celle/",
      "@type": "CollectionPage",
      about: { "@id": place["@id"] },
      mainEntity: { "@id": list["@id"] },
      isPartOf: { "@id": website["@id"] },
      publisher: { "@id": operatorId },
    });
    expect(place).toMatchObject({ "@type": "Place", name: "Целле" });
    expect(list["itemListElement"]).toEqual(visibleRoutes.map((route, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: { "@id": `https://uaroute.com/routes/${route!.slug}/#webpage` },
    })));
    expect(visibleRoutes.map((route) => route!.slug)).toEqual(["celle-lviv", "lviv-celle", "celle-dolyna", "dolyna-celle"]);
    expect([...byId.keys()]).toContain(operatorId);
    for (const entry of list["itemListElement"] as Array<{ item: { "@id": string } }>) {
      expect(byId.has(entry.item["@id"])).toBe(true);
    }
    for (const node of nodes) {
      const references = [node["isPartOf"], node["about"], node["mainEntity"], node["publisher"]]
        .flatMap((value) => value && typeof value === "object" && "@id" in value ? [value["@id"]] : []);
      for (const reference of references) expect(byId.has(String(reference))).toBe(true);
    }
    expect(JSON.stringify(graph)).not.toMatch(/Offer|BusTrip|ReserveAction|availability|areaServed|4k-koval\.com\/(?:contact|contacts)/i);
  });

  it("builds route structured data without inventory or bus trip claims", () => {
    const route = getResolvedRoute("lviv-hannover")!;
    const ld = routePageLd(route);
    const graph = ld["@graph"] as Array<Record<string, unknown>>;
    const byId = new Map(graph.map((node) => [node["@id"], node]));

    const canonical = "https://uaroute.com/routes/lviv-hannover/";
    const page = byId.get(`${canonical}#webpage`) as Record<string, unknown>;
    const originPlace = byId.get(`${canonical}#origin`) as Record<string, unknown>;
    const destPlace = byId.get(`${canonical}#destination`) as Record<string, unknown>;

    expect(page).toMatchObject({
      "@type": "WebPage",
      name: route.title,
      description: route.description,
      inLanguage: "uk",
    });
    expect(originPlace).toMatchObject({ "@type": "Place", name: "Львів" });
    expect(destPlace).toMatchObject({ "@type": "Place", name: "Ганновер" });
    expect(JSON.stringify(ld)).not.toMatch(/Offer|BusTrip|ReserveAction|Trip|Product|availability/i);
  });
});

describe("priority route entities and sitemap", () => {
  it.each(priorityPairs)("keeps the selected %s → %s candidate directional and sourceable", (originId, destinationId, slug) => {
    const route = getResolvedRoute(slug);
    expect(route).toBeDefined();
    expect(route).toMatchObject({
      origin: { id: originId },
      destination: { id: destinationId },
      status: "commercial",
      serviceMode: "candidate_inquiry",
    });
    expect(route!.title).toBe(`${route!.origin.name} → ${route!.destination.name}`);
    expect(route!.seo.title).toContain(route!.title);
    expect(route!.seo.description).toContain("перевізнику");
    expect(route!.whatToConfirm).toContain("Можливість поїздки на бажану дату");
  });

  it.each([
    ["celle", "Celle"],
    ["wolfsburg", "Wolfsburg"],
  ] as const)("uses the German entity %s (%s) in both selected route directions", (cityId, latinName) => {
    const city = cities.find(({ id }) => id === cityId)!;
    const mentions = priorityPairs
      .map(([, , slug]) => getResolvedRoute(slug)!)
      .filter((route) => route.origin.id === cityId || route.destination.id === cityId);

    expect(city.country).toBe("Німеччина");
    expect(city.aliases).not.toContain("Celje");
    expect(city.aliases).not.toContain("Würzburg");
    expect(mentions).toHaveLength(2);
    for (const route of mentions) {
      const entityContext = `\\(${latinName}, Німеччина\\)`;
      if (route.slug === "celle-lviv") {
        expect(route.description).toBe("Целле — Львів: запропонуйте місце зустрічі в Целле й запитайте про можливість поїздки на вашу дату. Подальшу дорогу зі Львова плануйте окремо після погодження місця та очікуваного часу прибуття.");
      } else expect(route.description).toMatch(new RegExp(entityContext));
      expect(route.seo.description).toMatch(new RegExp(entityContext));
    }
  });

  it("keeps the 22 approved sitemap URLs and omits ineffective hints", () => {
    const entries = sitemap();
    const expectedUrls = [
      "https://uaroute.com/",
      "https://uaroute.com/routes/",
      "https://uaroute.com/about/",
      "https://uaroute.com/imprint/",
      "https://uaroute.com/privacy/",
      "https://uaroute.com/guides/perevezennya-velosypeda/",
      "https://uaroute.com/cities/lviv/",
      "https://uaroute.com/cities/ivano-frankivsk/",
      "https://uaroute.com/cities/celle/",
      "https://uaroute.com/cities/stryi/",
      ...[
        "dolyna-celle",
        "celle-dolyna",
        "dolyna-wolfsburg",
        "wolfsburg-dolyna",
        "dolyna-braunschweig",
        "braunschweig-dolyna",
        "lviv-hannover",
        "lviv-celle",
        "celle-lviv",
        "ivano-frankivsk-wolfsburg",
        "wolfsburg-ivano-frankivsk",
        "celle-stryi",
      ].map((slug) => `https://uaroute.com/routes/${slug}/`),
    ].sort();

    expect(entries).toHaveLength(22);
    expect(entries.map(({ url }) => url).sort()).toEqual(expectedUrls);
    const hubDates = new Map(entries.filter(({ url }) => url.includes("/cities/")).map(({ url, lastModified }) => [url, lastModified]));
    expect(hubDates).toEqual(new Map([
      ["https://uaroute.com/cities/lviv/", "2026-10-25"],
      ["https://uaroute.com/cities/ivano-frankivsk/", "2026-10-25"],
      ["https://uaroute.com/cities/celle/", "2026-10-23"],
      ["https://uaroute.com/cities/stryi/", "2026-10-23"],
    ]));
    expect(entries.filter(({ url }) => !url.includes("/cities/")).every((entry) => !("lastModified" in entry))).toBe(true);
    expect(entries.every((entry) => !("changeFrequency" in entry) && !("priority" in entry))).toBe(true);
  });
});

// Frozen editorial input is independent of the runtime catalog and URL oracle above.
describe("accepted mitigation catalog", () => {
  it("maps the five exact introductions, merged practical paragraphs, links and FAQs", async () => {
    const { readFileSync } = await import("node:fs");
    const copy = JSON.parse(readFileSync(new URL("../../ops/evidence/seo-s04-2026-10-27/copy-records.json", import.meta.url), "utf8"));
    const orders: Record<string, string[]> = {
      lh: ["arrival-locality", "independent-onward", "lviv-first-leg", "questions"],
      lc: ["arrival-locality", "arrival-orientation", "lviv-first-leg", "questions"],
      cl: ["meeting-locality", "lviv-arrival", "independent-onward", "baggage-transfer"],
      iw: ["arrival-locality", "shared-departure", "baggage-transfer"],
      wi: ["meeting-locality", "arrival-coordination", "independent-onward", "baggage-transfer"],
    };
    for (const [slug, prefix] of [["lviv-hannover", "lh"], ["lviv-celle", "lc"], ["celle-lviv", "cl"], ["ivano-frankivsk-wolfsburg", "iw"], ["wolfsburg-ivano-frankivsk", "wi"]]) {
      const route = getResolvedRoute(slug)!;
      expect(route.description).toBe(copy.records[prefix + "-intro"].text);
      expect(route.practicalContent).toHaveLength(orders[prefix].length);
      orders[prefix].forEach((suffix, index) => {
        const expected = copy.records[prefix + "-" + suffix];
        expect(route.practicalContent![index]).toMatchObject({ heading: index === orders[prefix].length - 1 ? "" : expected.heading, body: expected.text });
        expect(route.practicalContent![index].links ?? []).toEqual(expected.links);
      });
      expect(route.whatToConfirm).toEqual(copy.records[prefix + "-" + orders[prefix].at(-1)].items);
      const expectedFaq = prefix === "lh" ? ["lh-actual-locality", "lh-changed-plan"].map((key) => ({question: copy.records[key].heading, answer: copy.records[key].text})) : [{question: copy.records[prefix + "-locality-changes"].heading, answer: copy.records[prefix + "-locality-changes"].text}, ...copy.records[prefix + "-locality-changes"].items];
      expect(route.faq).toEqual(expectedFaq);
      const graph = routePageLd(route)["@graph"];
      expect(graph.find((node) => node["@type"] === "WebPage")?.description).toBe(copy.records[prefix + "-intro"].text);
    }
  });
});
