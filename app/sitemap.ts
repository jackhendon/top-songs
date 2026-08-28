import { MetadataRoute } from "next";
import { DIRECTORY_ARTISTS, assertAllSlugsRoutable } from "@/lib/slugValidation";
import { getArtistSnapshot, hasStats } from "@/lib/artistSnapshot";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.topsongs.io";

const DIRECTORY_PAGE_SIZE = 100;

export default function sitemap(): MetadataRoute.Sitemap {
  // Runs during the build that generates the sitemap, so a bad slug fails the
  // deploy rather than shipping a dead URL to Google.
  assertAllSlugsRoutable();

  const lastModified = new Date();

  // Only artists we hold streaming data for. The rest are noindexed, so
  // listing them would be asking Google to crawl pages we have told it to
  // ignore, and those are the pages already counted as soft 404s.
  const artistEntries = DIRECTORY_ARTISTS.filter(({ slug }) =>
    hasStats(getArtistSnapshot(slug)),
  ).map(({ slug }) => ({
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
      // Both games are real pages with their own search intent ("higher or
      // lower music game", "daily music quiz"), so they belong in the sitemap
      // rather than being reachable only through the header.
      url: `${baseUrl}/daily`,
      lastModified,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/higher-lower`,
      lastModified,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified,
      priority: 0.4,
    },
  ];
}
