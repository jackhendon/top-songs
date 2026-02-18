import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // Redirect old /:slug artist URLs to /artist/:slug
        // Excludes known static routes: directory, faq, privacy, profile, api, artist, _next, favicon, robots, sitemap
        source:
          "/:slug((?!directory|faq|privacy|profile|api|artist|_next|favicon|robots|sitemap).+)",
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
