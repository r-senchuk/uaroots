import type { NextConfig } from "next";

/**
 * Static HTML for S3 + CloudFront. `redirects()` are not supported with
 * `output: "export"` — legacy paths are HTML pages under src/app/{contact,contacts,carriers,packages,gallery}.
 * Add CloudFront 301s at deploy (see CUTOVER.md). Restore next.config redirects if you move to a Node host.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
