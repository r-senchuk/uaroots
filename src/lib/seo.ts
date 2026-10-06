import type { Metadata } from "next";

import { absoluteUrl, siteConfig } from "@/config/site";
import { business } from "@/config/business";

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

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.domain,
    description: siteConfig.description,
    inLanguage: "uk",
    publisher: { "@id": `${business.website}#operator` },
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
