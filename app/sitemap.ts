import { MetadataRoute } from "next";
import { DIRECTORY_ARTISTS } from "@/lib/slugValidation";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.topsongs.io";

const DIRECTORY_PAGE_SIZE = 100;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const artistEntries = DIRECTORY_ARTISTS.map(({ slug }) => ({
    url: `${baseUrl}/artist/${slug}`,
    lastModified,
    priority: 0.8 as const,
  }));

  // The directory is the only crawl path to the ~2,800 artists no artist page
  // links to, so every page of it needs to be discoverable.
  const directoryPageCount = Math.ceil(
    DIRECTORY_ARTISTS.length / DIRECTORY_PAGE_SIZE,
  );
  const directoryEntries = Array.from(
    { length: directoryPageCount },
    (_, i) => ({
      url: i === 0 ? `${baseUrl}/directory` : `${baseUrl}/directory?page=${i + 1}`,
      lastModified,
      priority: i === 0 ? (0.9 as const) : (0.5 as const),
    }),
  );

  return [
    {
      url: baseUrl,
      lastModified,
      priority: 1.0,
    },
    ...directoryEntries,
    ...artistEntries,
    {
      url: `${baseUrl}/faq`,
      lastModified,
      priority: 0.4,
    },
  ];
}
