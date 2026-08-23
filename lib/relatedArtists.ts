import relatedJson from "@/data/related-artists.json";
import { getArtistSnapshot, hasStats } from "./artistSnapshot";

// Precomputed by scripts/build-related-artists.mjs. Cast through unknown to
// stop TypeScript inferring a literal type per slug.
const RELATED = relatedJson as unknown as Record<string, string[]>;

export interface RelatedArtist {
  slug: string;
  name: string;
}

/**
 * Related artists for a slug, resolved to display names.
 *
 * Gates on hasStats, the same predicate the sitemap and generateStaticParams
 * use. A weaker check here meant 91 rendered links pointed at pages we had
 * deliberately noindexed.
 *
 * Also dedupes on Spotify id: two directory entries can resolve to one artist
 * (/artist/v and /artist/vybz-kartel share an id), which rendered the same name
 * twice in the same list on 10 pages.
 */
export function getRelatedArtists(slug: string, limit = 12): RelatedArtist[] {
  const slugs = RELATED[slug] ?? [];
  const seen = new Set<string>();
  const out: RelatedArtist[] = [];

  for (const s of slugs) {
    if (out.length >= limit) break;

    const record = getArtistSnapshot(s);
    if (!hasStats(record)) continue;

    const identity = record.spotifyId ?? s;
    if (seen.has(identity)) continue;
    seen.add(identity);

    out.push({ slug: s, name: record.spotifyName || record.name });
  }

  return out;
}
