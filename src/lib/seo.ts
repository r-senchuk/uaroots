import type { Metadata } from "next";

import { absoluteUrl, siteConfig } from "@/config/site";
import { business } from "@/config/business";
import type { CityHubContent } from "@/data/city-hubs";
import type { City } from "@/data/types";
import type { ResolvedRoute } from "@/data/queries";

export const travelPreviewImage = {
  path: "/arrival-social.webp",
  alt: "Ілюстрація мандрівника з валізою на вулиці європейського міста",
  width: 1200,
  height: 630,
} as const;

export function buildMetadata(options: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  noIndex?: boolean;
  socialImage?: {
    path: string;
    alt: string;
    width: number;
    height: number;
  };
}): Metadata {
  const url = absoluteUrl(options.path);
  const image = options.socialImage
    ? {
        url: absoluteUrl(options.socialImage.path),
        width: options.socialImage.width,
        height: options.socialImage.height,
        alt: options.socialImage.alt,
      }
    : undefined;

  return {
    title: options.title,
    description: options.description,
    alternates: { canonical: url },
    robots: options.noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: options.title,
      description: options.description,
      url,
      siteName: siteConfig.name,
      locale: "uk_UA",
      type: options.type ?? "website",
      images: image ? [image] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: options.title,
      description: options.description,
      images: image ? [image] : undefined,
    },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

function websiteLdNode() {
  return {
    "@type": "WebSite",
    "@id": `${siteConfig.domain}/#website`,
    name: siteConfig.name,
    url: siteConfig.domain,
    description: siteConfig.description,
    inLanguage: "uk",
    publisher: { "@id": `${business.website}#operator` },
  };
}

export function websiteLd() {
  return { "@context": "https://schema.org", ...websiteLdNode() };
}

/** Structured data for only the selected directions visibly linked from a city hub. */
export function cityHubCollectionLd(city: City, content: CityHubContent, visibleRoutes: readonly ResolvedRoute[]) {
  const canonical = absoluteUrl(`/cities/${city.slug}/`);
  const websiteId = `${siteConfig.domain}/#website`;
  const operatorId = `${business.website}#operator`;
  const placeId = `${canonical}#place`;
  const pageId = `${canonical}#webpage`;
  const listId = `${canonical}#directions`;
  const routeNodes = visibleRoutes.map((route) => {
    const url = absoluteUrl(`/routes/${route.slug}/`);
    return {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: route.title,
      description: route.description,
      inLanguage: "uk",
    };
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      websiteLdNode(),
      { "@type": "Person", "@id": operatorId, name: business.operatorName, url: business.website },
      {
        "@type": "CollectionPage",
        "@id": pageId,
        url: canonical,
        name: content.title,
        description: content.description,
        inLanguage: "uk",
        isPartOf: { "@id": websiteId },
        publisher: { "@id": operatorId },
        about: { "@id": placeId },
        mainEntity: { "@id": listId },
      },
      { "@type": "Place", "@id": placeId, name: city.name },
      {
        "@type": "ItemList",
        "@id": listId,
        name: `Напрямки ${content.cityName}`,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: visibleRoutes.length,
        itemListElement: visibleRoutes.map((route, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: { "@id": `${absoluteUrl(`/routes/${route.slug}/`)}#webpage` },
        })),
      },
      ...routeNodes,
    ],
  };
}

/** Structured data for individual route pages (WebPage + Place nodes; strictly zero Offer/BusTrip). */
export function routePageLd(route: ResolvedRoute) {
  const canonical = absoluteUrl(`/routes/${route.slug}/`);
  const websiteId = `${siteConfig.domain}/#website`;
  const operatorId = `${business.website}#operator`;
  const pageId = `${canonical}#webpage`;
  const originPlaceId = `${canonical}#origin`;
  const destPlaceId = `${canonical}#destination`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      websiteLdNode(),
      { "@type": "Person", "@id": operatorId, name: business.operatorName, url: business.website },
      {
        "@type": "WebPage",
        "@id": pageId,
        url: canonical,
        name: route.title,
        description: route.description,
        inLanguage: "uk",
        isPartOf: { "@id": websiteId },
        publisher: { "@id": operatorId },
        about: [
          { "@id": originPlaceId },
          { "@id": destPlaceId },
        ],
      },
      { "@type": "Place", "@id": originPlaceId, name: route.origin.name },
      { "@type": "Place", "@id": destPlaceId, name: route.destination.name },
    ],
  };
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${business.website}#operator`,
    name: business.operatorName,
    url: business.website,
  };
}
