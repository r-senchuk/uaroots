export type CityKind = "hub" | "satellite" | "destination";

export type City = {
  id: string;
  slug: string;
  /** Ukrainian display name. */
  name: string;
  country: string;
  countryCode: string;
  /** Search-only aliases: transliterations, local and English names. Never URLs. */
  aliases: string[];
  kind: CityKind;
};

/** A contact desk of a carrier. Routes reference a desk by id — never inferred from UI text. */
export type Desk = {
  id: string;
  label: string;
  phone: string;
  /** Digits only, E.164 without "+", as required by wa.me. */
  whatsapp: string;
  /** Countries this desk is responsible for. */
  countries: string[];
};

/**
 * A statement about a carrier's service. Only render claims that carry a real
 * source URL and verification date. Never add a claim from general knowledge.
 */
export type Claim = {
  text: string;
  sourceUrl: string;
  /** ISO date (YYYY-MM-DD) on which the claim was checked against the source. */
  lastVerifiedAt: string;
};

export type Carrier = {
  id: string;
  slug: string;
  name: string;
  website: string;
  serviceDescription: string;
  desks: Desk[];
  claims: Claim[];
  /** Optional link to the carrier's parcel information — a separate operational intent. */
  parcelsUrl?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

/**
 * commercial — UARoute may present this as a Koval inquiry route (indexed, in /routes).
 * editorial  — the corridor may be discussed, but is not a confirmed bookable route.
 */
export type RouteStatus = "commercial" | "editorial";

export type Route = {
  id: string;
  slug: string;
  status: RouteStatus;
  originCityId: string;
  destinationCityId: string;
  title: string;
  /** Unique short introduction shown on the route page and in meta description. */
  description: string;
  /** Countries the corridor passes through, origin first. Not an itinerary. */
  corridor: string[];
  carrierIds: string[];
  /** Desk that handles inquiries for this route. Undefined -> website fallback. */
  deskId?: string;
  relatedRouteIds: string[];
  seo: { title: string; description: string };
  faq: FaqItem[];
  /** Questions the traveller should ask the carrier. Never presented as known facts. */
  whatToConfirm: string[];
};
