import { MetadataRoute } from "next";
import { POPULAR_ARTISTS } from "@/lib/slugs";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://topsongs.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const artistEntries = Object.keys(POPULAR_ARTISTS).map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    priority: 0.8 as const,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      priority: 1.0,
    },
    ...artistEntries,
    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
      priority: 0.3,
    },
  ];
}
