import relatedJson from "@/data/related-artists.json";
import { getArtistSnapshot } from "./artistSnapshot";

// Precomputed by scripts/build-related-artists.mjs. Cast through unknown to
// stop TypeScript inferring a literal type per slug.
const RELATED = relatedJson as unknown as Record<string, string[]>;

export interface RelatedArtist {
  slug: string;
  name: string;
}

/**
 * Related artists for a slug, resolved to display names. Anything that has
 * since dropped out of the snapshot is filtered out rather than rendered as a
 * link to a page with no content.
 */
export function getRelatedArtists(slug: string, limit = 12): RelatedArtist[] {
  const slugs = RELATED[slug] ?? [];

  return slugs
    .map((s) => {
      const record = getArtistSnapshot(s);
      if (!record || record.error) return null;
      return { slug: s, name: record.spotifyName || record.name };
    })
    .filter((a): a is RelatedArtist => a !== null)
    .slice(0, limit);
}
