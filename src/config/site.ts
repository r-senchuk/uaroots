export const siteConfig = {
  name: "UARoute",
  domain: "https://uaroute.com",
  description:
    "Маршрути з України до Європи — як доїхати, що потрібно знати та де забронювати поїздку.",
  campaign: "m1",
} as const;

/** Absolute URL for canonical / og:url / WhatsApp message links. */
export function absoluteUrl(path: string): string {
  return `${siteConfig.domain}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Programmatic UTM tagging for outbound partner links. Never used in WhatsApp text. */
export function withUtm(url: string, content: string): string {
  const parsed = new URL(url);
  parsed.searchParams.set("utm_source", "uaroute");
  parsed.searchParams.set("utm_medium", "referral");
  parsed.searchParams.set("utm_campaign", siteConfig.campaign);
  parsed.searchParams.set("utm_content", content);
  return parsed.toString();
}
