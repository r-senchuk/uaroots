import {
  getSourcesForRoute,
  productionSiteUrl,
  publicRoutes,
  sharedSources,
} from './scripts/route-sources.mjs';

/**
 * Shared sitemap configuration.
 * @type {import('next-sitemap').IConfig}
 */
const config = {
  siteUrl: productionSiteUrl,
  generateRobotsTxt: false,
  publicRoutes,
  sharedSources,
  contentLastModified: (route) => {
    return getSourcesForRoute(route);
  },
};

export default config;
