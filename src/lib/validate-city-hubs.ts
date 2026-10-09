import { cityHubContents, type CityHubContent } from "@/data/city-hubs";
import { cities } from "@/data/cities";
import { cityHubPaths } from "@/data/discovery";
import { routes } from "@/data/routes";
import type { City, Route } from "@/data/types";

const contentKeys = [
  "cityId", "cityName", "fromName", "toName", "title", "heading", "description", "intro",
  "outbound", "returning", "faq", "routeSlugs", "nearbyHeading", "nearbyIntro", "nearbyActionText", "nearbyPlaces",
  "planningResources", "contentReview",
];
const planningResourceKeys = ["label", "url", "checkedAt", "purpose"];
const contentReviewKeys = ["reviewedAt", "contentUpdatedAt", "reviewScope"];
const nearbyPlaceKeys = ["contentKey", "name", "localName", "guidance", "geographySource"];
const geographySourceKeys = ["url", "checkedAt"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasSupportedCountryIdentity(city: City): boolean {
  return (city.countryCode === "UA" && city.country === "Україна") ||
    (city.countryCode === "DE" && city.country === "Німеччина");
}

function unexpectedKeys(value: Record<string, unknown>, allowed: readonly string[]): string[] {
  const allowlist = new Set(allowed);
  return Object.keys(value).filter((key) => !allowlist.has(key));
}

function isIsoCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day!));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month! - 1 && date.getUTCDate() === day;
}

function isPublicHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const isIpv4 = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);
    const isIpv6 = hostname.startsWith("[") && hostname.endsWith("]");
    return url.protocol === "https:" && !url.username && !url.password && !isIpv4 && !isIpv6 &&
      hostname.includes(".") && !/(?:^|\.)(?:localhost|local|internal|test|invalid)$/.test(hostname);
  } catch {
    return false;
  }
}

function isCleanPlanningResourceUrl(value: unknown): value is string {
  if (!isPublicHttpsUrl(value)) return false;
  const url = new URL(value);
  const hostname = url.hostname.toLowerCase();
  const reservedHosts = ["uaroute.com", "4k-koval.com"];
  const isContactHost = reservedHosts.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  const isContactPath = /(?:^|\/)(?:contact|contacts|referral)(?:\/|$)/i.test(url.pathname);
  return !url.search && !url.hash && !isContactHost && !isContactPath;
}

/** Validate the explicitly selected city hub content, independent of runtime route generation. */
export function validateCityHubContent(
  contents: readonly CityHubContent[] = cityHubContents,
  today = new Date().toISOString().slice(0, 10),
  options: { hubPaths?: readonly string[]; cityCatalog?: readonly City[]; routeCatalog?: readonly Route[] } = {},
): string[] {
  const errors: string[] = [];
  const selectedPaths = options.hubPaths ?? cityHubPaths;
  const cityRecords = options.cityCatalog ?? cities;
  const routeRecords = options.routeCatalog ?? routes;
  const selectedPathSet = new Set<string>();
  for (const path of selectedPaths) {
    if (typeof path !== "string" || !/^\/cities\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/.test(path)) errors.push(`Malformed selected city hub path: ${String(path)}`);
    else if (selectedPathSet.has(path)) errors.push(`Duplicate selected city hub path: ${path}`);
    else selectedPathSet.add(path);
  }
  const selectedSlugs = selectedPaths.flatMap((path) => typeof path === "string" && /^\/cities\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/.test(path) ? [path.split("/")[2]!] : []);
  const selectedCities = selectedSlugs.map((slug) => cityRecords.find((city) => city.slug === slug));
  for (const [index, city] of selectedCities.entries()) {
    if (!city) errors.push(`Selected city hub path has unknown city slug: ${selectedSlugs[index]}`);
    else if (!hasSupportedCountryIdentity(city)) errors.push(`Selected city hub has unsupported country: ${city.id}`);
  }
  const expectedCityIds = new Set(selectedCities.flatMap((city) => city ? [city.id] : []));
  const cityById = new Map(cityRecords.map((city) => [city.id, city]));
  const routeBySlug = new Map(routeRecords.map((route) => [route.slug, route]));
  if (!isIsoCalendarDate(today)) errors.push(`City hub validator has an invalid reference date: ${today}`);
  if (!Array.isArray(contents)) return [...errors, "City hub content must be an array"];

  const cityIds = contents.flatMap((content) => isRecord(content) && typeof content.cityId === "string" ? [content.cityId] : []);
  const seenCityIds = new Set<string>();
  for (const cityId of cityIds) {
    if (seenCityIds.has(cityId)) errors.push(`Duplicate city hub content city id: ${cityId}`);
    seenCityIds.add(cityId);
  }
  for (const cityId of cityIds) {
    if (!cityById.has(cityId)) errors.push(`City hub content has unknown city id: ${cityId}`);
    else if (!expectedCityIds.has(cityId)) errors.push(`City hub content is not selected: ${cityId}`);
  }
  for (const cityId of expectedCityIds) {
    if (!seenCityIds.has(cityId)) errors.push(`Selected city hub has no content: ${cityId}`);
  }

  for (const [index, rawContent] of (contents as readonly unknown[]).entries()) {
    if (!isRecord(rawContent)) {
      errors.push(`City hub content at index ${index} must be an object`);
      continue;
    }
    const cityId = isNonEmptyString(rawContent.cityId) ? rawContent.cityId : `index ${index}`;
    for (const key of unexpectedKeys(rawContent, contentKeys)) {
      errors.push(`City hub content ${cityId} has unsupported field: ${key}`);
    }
    for (const key of ["cityId", "cityName", "fromName", "toName", "title", "heading", "description", "intro", "outbound", "returning", "nearbyHeading", "nearbyIntro", "nearbyActionText"]) {
      if (!isNonEmptyString(rawContent[key])) errors.push(`City hub content ${cityId} has empty or invalid ${key}`);
    }

    if (!Array.isArray(rawContent.faq) || rawContent.faq.length === 0) {
      errors.push(`City hub content ${cityId} must have FAQ items`);
    } else {
      for (const [faqIndex, faq] of rawContent.faq.entries()) {
        if (!isRecord(faq) || !isNonEmptyString(faq.question) || !isNonEmptyString(faq.answer)) {
          errors.push(`City hub content ${cityId} has an incomplete FAQ item at index ${faqIndex}`);
        }
      }
    }

    if (!Array.isArray(rawContent.routeSlugs) || rawContent.routeSlugs.length === 0) {
      errors.push(`City hub content ${cityId} must link to commercial routes`);
    } else {
      const routeSlugs = new Set<string>();
      for (const routeSlug of rawContent.routeSlugs) {
        const route = typeof routeSlug === "string" ? routeBySlug.get(routeSlug) : undefined;
        if (!route) errors.push(`City hub content ${cityId} has unknown route slug: ${String(routeSlug)}`);
        else if (route.status !== "commercial") errors.push(`City hub content ${cityId} links to a non-commercial route: ${routeSlug}`);
        else if (routeSlugs.has(routeSlug)) errors.push(`City hub content ${cityId} has duplicate route card slug: ${routeSlug}`);
        else if (route.originCityId !== cityId && route.destinationCityId !== cityId) errors.push(`City hub content ${cityId} links to an unrelated route: ${routeSlug}`);
        else {
          routeSlugs.add(routeSlug);
          const hubCity = cityById.get(cityId);
          const origin = cityById.get(route.originCityId);
          const destination = cityById.get(route.destinationCityId);
          const otherCity = route.originCityId === cityId ? destination : origin;
          if (!origin || !destination) errors.push(`City hub content ${cityId} route ${routeSlug} has an unknown endpoint city`);
          else if (hubCity && otherCity && (!hasSupportedCountryIdentity(origin) || !hasSupportedCountryIdentity(destination) ||
            !((hubCity.countryCode === "UA" && otherCity.countryCode === "DE") || (hubCity.countryCode === "DE" && otherCity.countryCode === "UA")))) {
            errors.push(`City hub content ${cityId} links to a route with an unsupported country pair: ${routeSlug}`);
          }
        }
      }
    }

    if (!Array.isArray(rawContent.nearbyPlaces)) {
      errors.push(`City hub content ${cityId} nearbyPlaces must be an array`);
      continue;
    }

    const rawReview = rawContent.contentReview;
    if (!isRecord(rawReview)) {
      errors.push(`City hub content ${cityId} has no content review dates`);
    } else {
      for (const key of unexpectedKeys(rawReview, contentReviewKeys)) errors.push(`City hub content ${cityId} contentReview has unsupported field: ${key}`);
      const reviewedAt = rawReview.reviewedAt;
      const contentUpdatedAt = rawReview.contentUpdatedAt;
      if (rawReview.reviewScope !== "editorial_guidance") errors.push(`City hub content ${cityId} has an invalid content review scope`);
      if (!isIsoCalendarDate(reviewedAt)) errors.push(`City hub content ${cityId} has an invalid reviewedAt date`);
      else if (isIsoCalendarDate(today) && reviewedAt > today) errors.push(`City hub content ${cityId} reviewedAt date is in the future`);
      if (!isIsoCalendarDate(contentUpdatedAt)) errors.push(`City hub content ${cityId} has an invalid contentUpdatedAt date`);
      else if (isIsoCalendarDate(today) && contentUpdatedAt > today) errors.push(`City hub content ${cityId} contentUpdatedAt date is in the future`);
      if (isIsoCalendarDate(reviewedAt) && isIsoCalendarDate(contentUpdatedAt) && contentUpdatedAt > reviewedAt) errors.push(`City hub content ${cityId} contentUpdatedAt date follows reviewedAt`);
    }

    if (!Array.isArray(rawContent.planningResources)) {
      errors.push(`City hub content ${cityId} planningResources must be an array`);
    } else {
      if (rawContent.planningResources.length > 1) errors.push(`City hub content ${cityId} may have at most one planning resource in this package`);
      const resourceUrls = new Set<string>();
      for (const [resourceIndex, rawResource] of rawContent.planningResources.entries()) {
        if (!isRecord(rawResource)) {
          errors.push(`City hub content ${cityId} has an invalid planning resource at index ${resourceIndex}`);
          continue;
        }
        const label = isNonEmptyString(rawResource.label) ? rawResource.label : `index ${resourceIndex}`;
        for (const key of unexpectedKeys(rawResource, planningResourceKeys)) errors.push(`Planning resource ${label} in ${cityId} has unsupported field: ${key}`);
        if (!isNonEmptyString(rawResource.label)) errors.push(`Planning resource at index ${resourceIndex} in ${cityId} has an empty label`);
        if (!isNonEmptyString(rawResource.purpose)) errors.push(`Planning resource ${label} in ${cityId} has an empty purpose`);
        if (!isCleanPlanningResourceUrl(rawResource.url)) errors.push(`Planning resource ${label} in ${cityId} needs a clean public HTTPS URL without credentials, query, or hash`);
        else if (resourceUrls.has(rawResource.url)) errors.push(`City hub content ${cityId} has duplicate planning resource URL: ${rawResource.url}`);
        else resourceUrls.add(rawResource.url);
        if (!isIsoCalendarDate(rawResource.checkedAt)) errors.push(`Planning resource ${label} in ${cityId} has an invalid checkedAt date`);
        else if (isIsoCalendarDate(today) && rawResource.checkedAt > today) errors.push(`Planning resource ${label} in ${cityId} checkedAt date is in the future`);
      }
    }

    const nearbyKeys = new Set<string>();
    for (const [placeIndex, rawPlace] of rawContent.nearbyPlaces.entries()) {
      if (!isRecord(rawPlace)) {
        errors.push(`City hub content ${cityId} has an invalid nearby place at index ${placeIndex}`);
        continue;
      }
      const placeName = isNonEmptyString(rawPlace.name) ? rawPlace.name : `index ${placeIndex}`;
      for (const key of unexpectedKeys(rawPlace, nearbyPlaceKeys)) {
        errors.push(`Nearby place ${placeName} in ${cityId} has unsupported field: ${key}`);
      }
      if (!isNonEmptyString(rawPlace.contentKey)) errors.push(`Nearby place ${placeName} in ${cityId} has an empty contentKey`);
      else if (nearbyKeys.has(rawPlace.contentKey)) errors.push(`City hub content ${cityId} has duplicate nearby contentKey: ${rawPlace.contentKey}`);
      else nearbyKeys.add(rawPlace.contentKey);
      if (!isNonEmptyString(rawPlace.name)) errors.push(`Nearby place at index ${placeIndex} in ${cityId} has an empty name`);
      if (rawPlace.localName !== undefined && !isNonEmptyString(rawPlace.localName)) {
        errors.push(`Nearby place ${placeName} in ${cityId} has an empty localName`);
      }
      if (!isNonEmptyString(rawPlace.guidance)) errors.push(`Nearby place ${placeName} in ${cityId} has empty guidance`);
      if (!isRecord(rawPlace.geographySource)) {
        errors.push(`Nearby place ${placeName} in ${cityId} has no geography source`);
        continue;
      }
      for (const key of unexpectedKeys(rawPlace.geographySource, geographySourceKeys)) {
        errors.push(`Nearby place ${placeName} in ${cityId} geography source has unsupported field: ${key}`);
      }
      if (!isPublicHttpsUrl(rawPlace.geographySource.url)) errors.push(`Nearby place ${placeName} in ${cityId} needs a public HTTPS geography source without credentials`);
      const checkedAt = rawPlace.geographySource.checkedAt;
      if (!isIsoCalendarDate(checkedAt)) errors.push(`Nearby place ${placeName} in ${cityId} has an invalid geography checkedAt date`);
      else if (isIsoCalendarDate(today) && checkedAt > today) errors.push(`Nearby place ${placeName} in ${cityId} geography checkedAt date is in the future`);
    }
  }

  return errors;
}
