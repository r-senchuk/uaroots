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

function operatorLdNode() {
  return {
    "@type": "Person",
    "@id": `${business.website}#operator`,
    name: business.operatorName,
    url: business.website,
  };
}

function brandOrganizationLdNode() {
  return {
    "@type": "Organization",
    "@id": `${siteConfig.domain}/#organization`,
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.description,
    email: business.email,
    founder: { "@id": `${business.website}#operator` },
    parentOrganization: { "@id": `${business.website}#operator` },
  };
}

function cityAlternateNames(city: City): string[] {
  return city.aliases
    .filter((alias) => /^[A-Za-zÀ-ÖØ-öø-ÿ-]+$/.test(alias))
    .slice(0, 4);
}

function cityPlaceLdNode(id: string, city: City) {
  const alternateName = cityAlternateNames(city);
  return {
    "@type": "Place",
    "@id": id,
    name: city.name,
    ...(alternateName.length > 0 ? { alternateName } : {}),
    address: {
      "@type": "PostalAddress",
      addressCountry: city.countryCode,
    },
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

export function brandOrganizationLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      operatorLdNode(),
      brandOrganizationLdNode(),
    ],
  };
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
      operatorLdNode(),
      brandOrganizationLdNode(),
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
      cityPlaceLdNode(placeId, city),
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

/** Structured data for the commercial route directory (/routes/). */
export function routeIndexCollectionLd(
  title: string,
  description: string,
  visibleRoutes: readonly ResolvedRoute[],
) {
  const canonical = absoluteUrl("/routes/");
  const websiteId = `${siteConfig.domain}/#website`;
  const operatorId = `${business.website}#operator`;
  const pageId = `${canonical}#webpage`;
  const listId = `${canonical}#routes`;
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
      operatorLdNode(),
      brandOrganizationLdNode(),
      {
        "@type": "CollectionPage",
        "@id": pageId,
        url: canonical,
        name: title,
        description,
        inLanguage: "uk",
        isPartOf: { "@id": websiteId },
        publisher: { "@id": operatorId },
        mainEntity: { "@id": listId },
      },
      {
        "@type": "ItemList",
        "@id": listId,
        name: "Напрямки між Україною та Німеччиною",
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
      operatorLdNode(),
      brandOrganizationLdNode(),
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
      cityPlaceLdNode(originPlaceId, route.origin),
      cityPlaceLdNode(destPlaceId, route.destination),
    ],
  };
}

export function aboutPageLd(title: string, description: string) {
  const canonical = absoluteUrl("/about/");
  const websiteId = `${siteConfig.domain}/#website`;
  const operatorId = `${business.website}#operator`;
  const orgId = `${siteConfig.domain}/#organization`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      websiteLdNode(),
      operatorLdNode(),
      brandOrganizationLdNode(),
      {
        "@type": "AboutPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: title,
        description,
        inLanguage: "uk",
        isPartOf: { "@id": websiteId },
        publisher: { "@id": operatorId },
        about: { "@id": orgId },
        mainEntity: { "@id": orgId },
      },
    ],
  };
}

export function imprintPageLd(title: string, description: string) {
  const canonical = absoluteUrl("/imprint/");
  const websiteId = `${siteConfig.domain}/#website`;
  const operatorId = `${business.website}#operator`;
  const orgId = `${siteConfig.domain}/#organization`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      websiteLdNode(),
      operatorLdNode(),
      brandOrganizationLdNode(),
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: title,
        description,
        inLanguage: "uk",
        isPartOf: { "@id": websiteId },
        publisher: { "@id": operatorId },
        about: { "@id": operatorId },
        mainEntity: { "@id": orgId },
      },
    ],
  };
}

export function guideArticleLd(options: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
}) {
  const canonical = absoluteUrl(options.path);
  const websiteId = `${siteConfig.domain}/#website`;
  const operatorId = `${business.website}#operator`;
  const orgId = `${siteConfig.domain}/#organization`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      websiteLdNode(),
      operatorLdNode(),
      brandOrganizationLdNode(),
      {
        "@type": "Article",
        "@id": `${canonical}#article`,
        headline: options.title,
        description: options.description,
        datePublished: options.datePublished,
        dateModified: options.dateModified,
        mainEntityOfPage: canonical,
        url: canonical,
        inLanguage: "uk",
        image: absoluteUrl(travelPreviewImage.path),
        isPartOf: { "@id": websiteId },
        publisher: { "@id": operatorId },
        author: {
          "@type": "Organization",
          "@id": orgId,
          name: siteConfig.name,
          url: absoluteUrl("/"),
        },
      },
    ],
  };
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    ...operatorLdNode(),
  };
}
