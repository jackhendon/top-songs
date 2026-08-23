import type { NextConfig } from "next";

// PostHog's ingestion host, e.g. https://eu.i.posthog.com. Assets live on a
// sibling host and the dashboard on the same region without the `.i`, so both
// are derived rather than needing their own environment variables.
const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

// /ingest proxies straight to this host, so a typo would quietly turn the site
// into a proxy for somewhere else. Fail the build instead.
if (!/^https:\/\/[a-z0-9-]+\.i\.posthog\.com$/.test(posthogHost)) {
  throw new Error(
    `NEXT_PUBLIC_POSTHOG_HOST must look like https://<region>.i.posthog.com, got ${JSON.stringify(posthogHost)}`,
  );
}
const posthogAssetHost = posthogHost.replace(
  /^(https:\/\/[a-z0-9-]+)\.i\.posthog\.com$/,
  "$1-assets.i.posthog.com",
);

const nextConfig: NextConfig = {
  // PostHog's ingestion endpoints are sensitive to a trailing-slash redirect
  // being inserted in front of them.
  skipTrailingSlashRedirect: true,

  async rewrites() {
    return [
      // Analytics served from our own origin. A request to a known analytics
      // domain is blocked by every standard blocklist; a request to
      // /ingest/... on our own domain is not.
      {
        source: "/ingest/static/:path*",
        destination: `${posthogAssetHost}/static/:path*`,
      },
      {
        source: "/ingest/:path*",
        destination: `${posthogHost}/:path*`,
      },
    ];
  },

  async redirects() {
    return [
      {
        // Both hosts served 200 with identical content and no canonical.
        // Search Console is a Domain property, so consolidating on www needs
        // no re-verification, and www is where the indexed pages already are.
        source: "/:path*",
        has: [{ type: "host", value: "topsongs.io" }],
        destination: "https://www.topsongs.io/:path*",
        permanent: true,
      },
      {
        // Redirect old /:slug artist URLs to /artist/:slug
        // Excludes known static routes: directory, faq, privacy, profile, api, artist, _next, favicon, robots, sitemap, ingest
        source:
          "/:slug((?!directory|faq|privacy|profile|api|artist|ingest|_next|favicon|robots|sitemap).+)",
        destination: "/artist/:slug",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
