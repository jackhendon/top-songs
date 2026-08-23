export interface Song {
  rank: number;
  title: string;
  totalStreams: number;
  dailyStreams: number;
}

export interface ArtistData {
  artistName: string;
  artistId: string;
  imageUrl?: string;
  songs: Song[];
  topTen: Song[];
}

/** One track in an artist's committed top 10. */
export interface SnapshotTrack {
  rank: number;
  title: string;
  totalStreams: number;
}

/**
 * A single artist as held in data/artist-snapshot.json. Built offline by
 * scripts/build-artist-snapshot.mjs so artist pages can render their content
 * without a Spotify call or a Kworb scrape per request.
 *
 * `error` is set when the artist could not be resolved — no Spotify match, or
 * no Kworb page. Those pages have no stats to show and are noindexed rather
 * than served as near-empty.
 */
export interface ArtistSnapshot {
  slug: string;
  name: string;
  spotifyId?: string;
  spotifyName?: string;
  exactMatch?: boolean;
  imageUrl?: string | null;
  genres?: string[];
  followers?: number | null;
  topTen?: SnapshotTrack[];
  catalogueSize?: number;
  totalStreamsTopTen?: number;
  fetchedAt?: string;
  error?: string;
}
