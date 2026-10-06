import { carriers, getCarrier, getDesk } from "@/data/carriers";
import { cities } from "@/data/cities";
import { selectedCandidatePairs } from "@/data/discovery";
import { routes } from "@/data/routes";

function duplicateValues(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

export function validateCatalog(): string[] {
  const errors: string[] = [];
  const cityIds = new Set(cities.map((city) => city.id));

  for (const id of duplicateValues(cities.map((city) => city.id))) {
    errors.push(`Duplicate city id: ${id}`);
  }
  for (const slug of duplicateValues(cities.map((city) => city.slug))) {
    errors.push(`Duplicate city slug: ${slug}`);
  }
  for (const id of duplicateValues(carriers.map((carrier) => carrier.id))) {
    errors.push(`Duplicate carrier id: ${id}`);
  }
  for (const id of duplicateValues(routes.map((route) => route.id))) {
    errors.push(`Duplicate route id: ${id}`);
  }

  const routeSlugs = new Set<string>();
  const expectedCandidatePairs = new Map<string, readonly string[]>(
    selectedCandidatePairs.map(({ slug, originCityId, destinationCityId }) => [
      slug,
      [originCityId, destinationCityId] as const,
    ]),
  );
  for (const route of routes) {
    if (routeSlugs.has(route.slug)) errors.push(`Duplicate route slug: ${route.slug}`);
    routeSlugs.add(route.slug);
    if (!cityIds.has(route.originCityId)) {
      errors.push(`Route ${route.slug} has unknown origin ${route.originCityId}`);
    }
    if (!cityIds.has(route.destinationCityId)) {
      errors.push(`Route ${route.slug} has unknown destination ${route.destinationCityId}`);
    }
    if (route.carrierIds.length === 0) {
      errors.push(`Route ${route.slug} has no carriers`);
    }
    for (const carrierId of route.carrierIds) {
      if (!getCarrier(carrierId)) errors.push(`Route ${route.slug} unknown carrier ${carrierId}`);
    }
    if (route.deskId) {
      const carrierId = route.carrierIds[0];
      if (carrierId && !getDesk(carrierId, route.deskId)) {
        errors.push(`Route ${route.slug} unknown desk ${route.deskId}`);
      }
    }
    for (const relatedId of route.relatedRouteIds) {
      if (!routes.some((candidate) => candidate.id === relatedId)) {
        errors.push(`Route ${route.slug} related unknown id ${relatedId}`);
      }
    }
    if (route.status === "commercial") {
      const carrierId = route.carrierIds[0];
      if (!route.deskId || !carrierId || !getDesk(carrierId, route.deskId)) {
        errors.push(`Commercial route ${route.slug} has no resolvable desk`);
      }
    }
    if (route.serviceMode === "candidate_inquiry") {
      const expectedPair = expectedCandidatePairs.get(route.slug);
      if (!expectedPair || route.originCityId !== expectedPair[0] || route.destinationCityId !== expectedPair[1]) {
        errors.push(`Candidate inquiry ${route.slug} is outside the owner-selected pilot pairs`);
      }
      const origin = cities.find((city) => city.id === route.originCityId);
      const destination = cities.find((city) => city.id === route.destinationCityId);
      if (route.status !== "commercial") errors.push(`Candidate inquiry ${route.slug} is not commercial`);
      if (origin?.countryCode === destination?.countryCode || !origin || !destination) {
        errors.push(`Candidate inquiry ${route.slug} must connect two countries`);
      }
      if (route.corridor.length !== 2 || route.corridor[0] !== origin?.country || route.corridor[1] !== destination?.country) {
        errors.push(`Candidate inquiry ${route.slug} corridor must contain only its endpoints`);
      }
      if (route.faq.length < 4) errors.push(`Candidate inquiry ${route.slug} needs at least four FAQs`);
      if (!route.practicalContent?.length) errors.push(`Candidate inquiry ${route.slug} has no city-specific practical content`);
      for (const item of route.practicalContent ?? []) {
        if (Boolean(item.sourceUrl) !== Boolean(item.lastVerifiedAt)) {
          errors.push(`Candidate inquiry ${route.slug} has incomplete practical content provenance`);
        }
      }
      if (route.carrierIds.length !== 1 || route.carrierIds[0] !== "koval" || route.deskId !== "koval-de") {
        errors.push(`Candidate inquiry ${route.slug} must use the existing Koval Germany desk`);
      }
    } else if (route.serviceMode) {
      errors.push(`Route ${route.slug} has an unsupported service mode`);
    }
  }

  const expectedCandidateRouteIds = new Set(selectedCandidatePairs.map(({ slug }) => slug));
  const actualCandidateSlugs = new Set(routes.filter((route) => route.serviceMode === "candidate_inquiry").map(({ slug }) => slug));
  if (actualCandidateSlugs.size !== expectedCandidateRouteIds.size || [...expectedCandidateRouteIds].some((slug) => !actualCandidateSlugs.has(slug))) {
    errors.push("Candidate inquiry catalog must contain only the ten explicitly selected pilot pages");
  }
  const mykolaiv = cities.find((city) => city.id === "mykolaiv-lviv");
  if (mykolaiv && /^(миколаїв|миколаев|nikolaev)$/iu.test(mykolaiv.name)) {
    errors.push("Mykolaiv in Lviv Oblast must be disambiguated in its display name");
  }
  if (mykolaiv && mykolaiv.aliases.some((alias) => /^(миколаїв|миколаев|nikolaev)$/iu.test(alias.trim()))) {
    errors.push("Mykolaiv in Lviv Oblast must not have an ambiguous naked alias");
  }

  for (const carrier of carriers) {
    for (const claim of carrier.claims) {
      if (!claim.text || !claim.sourceUrl || !claim.lastVerifiedAt) {
        errors.push(`Carrier ${carrier.id} has an incomplete claim`);
      }
    }
    for (const desk of carrier.desks) {
      if (!/^\d{8,15}$/.test(desk.whatsapp)) {
        errors.push(`Desk ${desk.id} has an invalid WhatsApp destination`);
      }
    }
  }

  return errors;
}
