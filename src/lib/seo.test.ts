import { join } from "node:path";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { cities } from "@/data/cities";
import { cityHubContents } from "@/data/city-hubs";
import { getResolvedRoute } from "@/data/queries";
import sitemap from "@/app/sitemap";
import { buildMetadata, cityHubCollectionLd, travelPreviewImage, websiteLd } from "@/lib/seo";

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
      description: "Підготуйте запит перевізнику Коваль.",
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
    expect(route!.seo.description).toContain("Коваль");
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
      expect(route.description).toMatch(new RegExp(entityContext));
      expect(route.seo.description).toMatch(new RegExp(entityContext));
    }
  });

  it("keeps the 19 approved sitemap URLs and omits ineffective hints", () => {
    const entries = sitemap();
    const expectedUrls = [
      "https://uaroute.com/",
      "https://uaroute.com/routes/",
      "https://uaroute.com/about/",
      "https://uaroute.com/imprint/",
      "https://uaroute.com/privacy/",
      "https://uaroute.com/cities/lviv/",
      "https://uaroute.com/cities/ivano-frankivsk/",
      "https://uaroute.com/cities/celle/",
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
      ].map((slug) => `https://uaroute.com/routes/${slug}/`),
    ].sort();

    expect(entries).toHaveLength(19);
    expect(entries.map(({ url }) => url).sort()).toEqual(expectedUrls);
    const hubDates = new Map(entries.filter(({ url }) => url.includes("/cities/")).map(({ url, lastModified }) => [url, lastModified]));
    expect(hubDates).toEqual(new Map([
      ["https://uaroute.com/cities/lviv/", "2026-10-09"],
      ["https://uaroute.com/cities/ivano-frankivsk/", "2026-10-09"],
      ["https://uaroute.com/cities/celle/", "2026-10-09"],
    ]));
    expect(entries.filter(({ url }) => !url.includes("/cities/")).every((entry) => !("lastModified" in entry))).toBe(true);
    expect(entries.every((entry) => !("changeFrequency" in entry) && !("priority" in entry))).toBe(true);
  });
});
