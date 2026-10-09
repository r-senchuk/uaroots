/** Public build-time IDs; malformed or incomplete configuration stays disabled. */
export function analyticsConfiguration() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
  const containerId = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID ?? "";
  const validMeasurement = /^G-[A-Z0-9]{6,}$/.test(measurementId);
  const validContainer = /^GTM-[A-Z0-9]{4,}$/.test(containerId);
  return {
    measurementId,
    containerId,
    provider: containerId ? "gtm" as const : "ga4" as const,
    enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true" && validMeasurement && (!containerId || validContainer),
  };
}
