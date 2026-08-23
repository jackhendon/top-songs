import snapshotJson from "@/data/artist-snapshot.json";
import type { ArtistSnapshot } from "./types";

// The JSON is a slug-keyed map. Casting through unknown keeps TypeScript from
// inferring a ~3,000-member literal type for every key, which makes typecheck
// crawl for no benefit.
const SNAPSHOT = snapshotJson as unknown as Record<string, ArtistSnapshot>;

export function getArtistSnapshot(slug: string): ArtistSnapshot | undefined {
  return SNAPSHOT[slug];
}

/**
 * Whether we hold enough for this artist to be worth indexing.
 *
 * Two exclusions, both about not publishing something wrong:
 *
 * - `error`: no Kworb page, so no tracks and no stream counts. Exactly the
 *   near-empty page Search Console already counts as a soft 404.
 * - `exactMatch === false`: Spotify's search returned a different artist and we
 *   cannot verify which is right. /artist/v resolves to Vybz Kartel, /artist/kevin
 *   to Kevin Gates. Rendering those stream counts as an authoritative answer to
 *   "what is V's most streamed song" would simply be false, so the page still
 *   plays but is kept out of the index until the match is corrected by hand via
 *   data/artist-overrides.json.
 */
export function hasStats(
  record: ArtistSnapshot | undefined,
): record is ArtistSnapshot & { topTen: NonNullable<ArtistSnapshot["topTen"]> } {
  return Boolean(
    record &&
      !record.error &&
      record.exactMatch !== false &&
      record.topTen?.length,
  );
}

export const SNAPSHOT_SLUGS = Object.keys(SNAPSHOT);

export const INDEXABLE_SLUGS = SNAPSHOT_SLUGS.filter((slug) =>
  hasStats(SNAPSHOT[slug]),
);

export function allSnapshots(): ArtistSnapshot[] {
  return Object.values(SNAPSHOT);
}
