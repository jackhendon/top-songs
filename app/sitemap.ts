import { MetadataRoute } from "next";
import { AUTOCOMPLETE_ARTISTS } from "@/lib/artistAutocomplete";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.topsongs.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const artistEntries = AUTOCOMPLETE_ARTISTS.map(({ slug }) => ({
    url: `${baseUrl}/artist/${slug}`,
    lastModified: new Date(),
    priority: 0.8 as const,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      priority: 1.0,
    },
    {
      url: `${baseUrl}/directory`,
      lastModified: new Date(),
      priority: 0.9,
    },
    ...artistEntries,
    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
      priority: 0.3,
    },
  ];
}
