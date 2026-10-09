/** Bounded acquisition policy. Partner referral labels are a separate touch. */
export const acquisitionChannels = {
  google: "organic",
  bing: "organic",
  facebook: "social",
  telegram: "social",
  chatgpt: "referral",
  gemini: "referral",
  koval: "referral",
  direct: "direct",
  unknown: "referral",
} as const;

export const acquisitionCampaigns = [
  "route_launch",
  "m1",
  "koval_poc",
] as const;
export const manualCampaigns = ["route_launch", "m1"] as const;
export const manualSources = [
  "facebook",
  "telegram",
  "koval",
  "chatgpt",
] as const;

export const partnerUtm = {
  source: "uaroute",
  medium: "referral",
  campaign: "koval_poc",
} as const;

export const ctaLocations = [
  "hero",
  "booking_widget",
  "partner_card",
  "related_route",
  "sticky_mobile",
  "footer",
  "route_index",
] as const;

/** Invalid/partial/duplicate channel tags fall back together, never as a hybrid. */
export function parseAcquisitionTags(params: URLSearchParams):
  | {
      source: keyof typeof acquisitionChannels;
      medium: (typeof acquisitionChannels)[keyof typeof acquisitionChannels];
      campaign?: (typeof acquisitionCampaigns)[number];
    }
  | undefined {
  if (
    ["utm_source", "utm_medium", "utm_campaign"].some(
      (key) => params.getAll(key).length > 1,
    )
  ) {
    return undefined;
  }
  const source = params.get("utm_source");
  const medium = params.get("utm_medium");
  if (!source || !Object.hasOwn(acquisitionChannels, source)) return undefined;
  const channel = source as keyof typeof acquisitionChannels;
  if (acquisitionChannels[channel] !== medium) return undefined;
  const campaign = params.get("utm_campaign");
  return {
    source: channel,
    medium: acquisitionChannels[channel],
    ...(campaign &&
    (acquisitionCampaigns as readonly string[]).includes(campaign)
      ? { campaign: campaign as (typeof acquisitionCampaigns)[number] }
      : {}),
  };
}
