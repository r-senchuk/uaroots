/**
 * Shared route and dependency source mapping.
 * Used by next-sitemap.config.mjs and scripts/indexnow.mjs.
 */

export const productionSiteUrl = 'https://uaroute.com';

export const publicRoutes = [
  '/',
  '/routes',
  '/about',
  '/imprint',
  '/privacy',
  '/guides/perevezennya-velosypeda',
  '/routes/lviv-hannover',
  '/routes/lviv-celle',
  '/routes/ivano-frankivsk-wolfsburg',
  '/routes/dolyna-celle',
  '/routes/celle-dolyna',
  '/routes/dolyna-wolfsburg',
  '/routes/wolfsburg-dolyna',
  '/routes/dolyna-braunschweig',
  '/routes/braunschweig-dolyna',
  '/routes/celle-lviv',
  '/routes/wolfsburg-ivano-frankivsk',
  '/routes/celle-stryi',
  '/cities/lviv',
  '/cities/ivano-frankivsk',
  '/cities/celle',
  '/cities/stryi',
];

export const sharedSources = [
  'src/app/layout.tsx',
  'src/app/globals.css',
  'src/components/Header.tsx',
  'src/components/Footer.tsx',
  'src/components/brand',
  'src/components/RouteSearch.tsx',
  'src/components/InquiryFields.tsx',
  'src/components/CandidateInquiry.tsx',
  'src/components/JourneyActions.tsx',
  'src/components/StickyBookingBar.tsx',
  'src/config/site.ts',
  'src/config/utm.ts',
];

export const routeSources = {
  '/': ['src/app/page.tsx'],
  '/routes': ['src/app/routes/page.tsx', 'src/components/RouteList.tsx'],
  '/about': ['src/app/about/page.tsx'],
  '/imprint': ['src/app/imprint/page.tsx'],
  '/privacy': ['src/app/privacy/page.tsx'],
  '/guides/perevezennya-velosypeda': [
    'src/app/guides/perevezennya-velosypeda/page.tsx',
    'src/components/BicycleInquiryCta.tsx',
  ],
  '/routes/lviv-hannover': ['src/app/routes/[slug]/page.tsx', 'src/data/routes.ts'],
  '/routes/lviv-celle': ['src/app/routes/[slug]/page.tsx', 'src/data/routes.ts'],
  '/routes/ivano-frankivsk-wolfsburg': ['src/app/routes/[slug]/page.tsx', 'src/data/routes.ts'],
  '/routes/dolyna-celle': ['src/app/routes/[slug]/page.tsx', 'src/data/routes.ts'],
  '/routes/celle-dolyna': ['src/app/routes/[slug]/page.tsx', 'src/data/routes.ts'],
  '/routes/dolyna-wolfsburg': ['src/app/routes/[slug]/page.tsx', 'src/data/routes.ts'],
  '/routes/wolfsburg-dolyna': ['src/app/routes/[slug]/page.tsx', 'src/data/routes.ts'],
  '/routes/dolyna-braunschweig': ['src/app/routes/[slug]/page.tsx', 'src/data/routes.ts'],
  '/routes/braunschweig-dolyna': ['src/app/routes/[slug]/page.tsx', 'src/data/routes.ts'],
  '/routes/celle-lviv': ['src/app/routes/[slug]/page.tsx', 'src/data/routes.ts'],
  '/routes/wolfsburg-ivano-frankivsk': ['src/app/routes/[slug]/page.tsx', 'src/data/routes.ts'],
  '/routes/celle-stryi': ['src/app/routes/[slug]/page.tsx', 'src/data/routes.ts'],
  '/cities/lviv': ['src/app/cities/[slug]/page.tsx', 'src/data/cities.ts', 'src/data/city-hubs.ts'],
  '/cities/ivano-frankivsk': ['src/app/cities/[slug]/page.tsx', 'src/data/cities.ts', 'src/data/city-hubs.ts'],
  '/cities/celle': ['src/app/cities/[slug]/page.tsx', 'src/data/cities.ts', 'src/data/city-hubs.ts'],
  '/cities/stryi': ['src/app/cities/[slug]/page.tsx', 'src/data/cities.ts', 'src/data/city-hubs.ts'],
};

export function getSourcesForRoute(route) {
  const normalizedRoute = route.replace(/\/$/, '') || '/';
  const specific = routeSources[normalizedRoute] || [];
  return [...sharedSources, ...specific];
}

export function toCanonicalUrl(route, baseUrl = productionSiteUrl) {
  const trimmedBase = baseUrl.replace(/\/$/, '');
  const cleanRoute = route.replace(/\/$/, '');
  return `${trimmedBase}${cleanRoute}/`;
}

function fileMatchesSources(file, sources) {
  return sources.some((src) => {
    if (file === src) return true;
    if (file.startsWith(`${src.replace(/\/$/, '')}/`)) return true;
    return false;
  });
}

export function getAffectedRoutes(changedFiles) {
  const hasSharedChange = changedFiles.some((f) => fileMatchesSources(f, sharedSources));
  if (hasSharedChange) return [...publicRoutes];

  const affected = [];
  for (const route of publicRoutes) {
    const specific = routeSources[route] || [];
    if (changedFiles.some((f) => fileMatchesSources(f, specific))) {
      affected.push(route);
    }
  }
  return affected;
}
