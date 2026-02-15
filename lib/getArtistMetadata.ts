import { unstable_cache } from "next/cache";
import { getSpotifyAccessToken, searchSpotifyArtist } from "./getArtistData";

export interface ArtistMetadata {
  artistName: string;
  artistId: string;
  imageUrl?: string;
  genres?: string[];
  followers?: number;
}

async function fetchArtistMetadata(
  artistName: string,
): Promise<ArtistMetadata | null> {
  try {
    const accessToken = await getSpotifyAccessToken();
    const artist = await searchSpotifyArtist(artistName, accessToken);

    if (!artist) return null;

    return {
      artistName: artist.name,
      artistId: artist.id,
      imageUrl: artist.imageUrl,
      genres: artist.genres,
      followers: artist.followers,
    };
  } catch {
    return null;
  }
}

export const getArtistMetadata = unstable_cache(
  fetchArtistMetadata,
  ["artist-metadata"],
  { revalidate: 86400 },
);
