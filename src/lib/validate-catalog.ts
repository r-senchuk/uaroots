import { carriers, getCarrier, getDesk } from "@/data/carriers";
import { cities } from "@/data/cities";
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
