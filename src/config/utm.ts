/** Bounded acquisition policy. Partner referral labels are a separate touch. */
export const acquisitionChannels = {
  google: ["organic", "cpc"],
  bing: ["organic"],
  facebook: ["social"],
  telegram: ["social"],
  chatgpt: ["referral"],
  gemini: ["referral"],
  koval: ["referral"],
  direct: ["direct"],
  unknown: ["referral"],
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

export const googleClickIdKeys = ["gclid", "gbraid", "wbraid"] as const;
export type GoogleClickIdKey = (typeof googleClickIdKeys)[number];

const CLICK_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export type GoogleClickId = {
  key: GoogleClickIdKey;
  value: string;
};

export function parseGoogleClickId(params: URLSearchParams): GoogleClickId | undefined {
  const presentKeys = googleClickIdKeys.filter((key) => params.has(key));
  if (presentKeys.length !== 1) return undefined;
  const key = presentKeys[0];
  if (params.getAll(key).length > 1) return undefined;
  const value = params.get(key);
  if (!value || value.length < 5 || value.length > 256 || !CLICK_ID_PATTERN.test(value)) {
    return undefined;
  }
  return { key, value };
}

/** Invalid/partial/duplicate channel tags fall back together, never as a hybrid. */
export function parseAcquisitionTags(params: URLSearchParams):
  | {
      source: keyof typeof acquisitionChannels;
      medium: (typeof acquisitionChannels)[keyof typeof acquisitionChannels][number];
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
  const allowedMediums = acquisitionChannels[channel] as readonly string[];
  if (!medium || !allowedMediums.includes(medium)) return undefined;
  const campaign = params.get("utm_campaign");
  return {
    source: channel,
    medium: medium as (typeof acquisitionChannels)[keyof typeof acquisitionChannels][number],
    ...(campaign &&
    (acquisitionCampaigns as readonly string[]).includes(campaign)
      ? { campaign: campaign as (typeof acquisitionCampaigns)[number] }
      : {}),
  };
}
