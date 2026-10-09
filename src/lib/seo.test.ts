import { join } from "node:path";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { cities } from "@/data/cities";
import { getResolvedRoute } from "@/data/queries";
import sitemap from "@/app/sitemap";
import { buildMetadata, travelPreviewImage } from "@/lib/seo";

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

  it("keeps the 18 approved sitemap URLs and omits ineffective hints", () => {
    const entries = sitemap();
    const expectedUrls = [
      "https://uaroute.com/",
      "https://uaroute.com/routes/",
      "https://uaroute.com/about/",
      "https://uaroute.com/imprint/",
      "https://uaroute.com/privacy/",
      "https://uaroute.com/cities/lviv/",
      "https://uaroute.com/cities/ivano-frankivsk/",
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

    expect(entries).toHaveLength(18);
    expect(entries.map(({ url }) => url).sort()).toEqual(expectedUrls);
    const hubDates = new Map(entries.filter(({ url }) => url.includes("/cities/")).map(({ url, lastModified }) => [url, lastModified]));
    expect(hubDates).toEqual(new Map([
      ["https://uaroute.com/cities/lviv/", "2026-10-09"],
      ["https://uaroute.com/cities/ivano-frankivsk/", "2026-10-09"],
    ]));
    expect(entries.filter(({ url }) => !url.includes("/cities/")).every((entry) => !("lastModified" in entry))).toBe(true);
    expect(entries.every((entry) => !("changeFrequency" in entry) && !("priority" in entry))).toBe(true);
  });
});
