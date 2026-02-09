import { unstable_cache } from "next/cache";
import * as cheerio from "cheerio";
import { Song, ArtistData } from "./types";

// --- Spotify token caching ---

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getSpotifyAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Spotify credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local",
    );
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to get Spotify access token");
  }

  const data = await response.json();

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

// --- Spotify artist search ---

async function searchSpotifyArtist(
  artistName: string,
  accessToken: string,
): Promise<{ id: string; name: string; imageUrl?: string } | null> {
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Spotify search failed");
  }

  const data = await response.json();

  if (data.artists.items.length === 0) {
    return null;
  }

  const artist = data.artists.items[0];

  return {
    id: artist.id,
    name: artist.name,
    imageUrl: artist.images[0]?.url,
  };
}

// --- Stream count parsing ---

function parseStreamCount(text: string): number {
  if (!text || text.trim() === "") return 0;

  const cleaned = text.replace(/[,\s]/g, "");

  if (!/^\d+(\.\d+)?$/.test(cleaned)) {
    return 0;
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.floor(num);
}

// --- Core data fetching (uncached) ---

async function fetchArtistData(artistName: string): Promise<ArtistData> {
  // Step 1: Get Spotify access token
  const accessToken = await getSpotifyAccessToken();

  // Step 2: Search for artist on Spotify
  const spotifyArtist = await searchSpotifyArtist(artistName, accessToken);

  if (!spotifyArtist) {
    throw new Error(`Artist not found on Spotify: ${artistName}`);
  }

  console.log(`Found artist: ${spotifyArtist.name} (${spotifyArtist.id})`);

  // Step 3: Scrape Kworb
  const kworkUrl = `https://kworb.net/spotify/artist/${spotifyArtist.id}_songs.html`;
  console.log(`Fetching: ${kworkUrl}`);

  const response = await fetch(kworkUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; TopSongsGame/1.0)",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Artist not found on Kworb: ${artistName}`);
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const songs: Song[] = [];
  const table = $("table.addpos.sortable");

  if (!table.length) {
    throw new Error("Could not find song data table on Kworb page");
  }

  const rows = table.find("tbody tr");
  console.log(`Found ${rows.length} rows in table`);

  rows.each((index, row) => {
    const $row = $(row);
    const cells = $row.find("td");

    if (cells.length < 2) return;

    let title = "";
    const streamCounts: number[] = [];

    cells.each((i, cell) => {
      const $cell = $(cell);
      const cellText = $cell.text().trim();

      const link = $cell.find("a");
      if (link.length > 0 && !title) {
        title = link.text().trim();
      }

      const parsed = parseStreamCount(cellText);
      if (parsed > 0) {
        streamCounts.push(parsed);
      }
    });

    if (title && streamCounts.length > 0) {
      const sortedStreams = [...streamCounts].sort((a, b) => b - a);

      songs.push({
        rank: index + 1,
        title,
        totalStreams: sortedStreams[0] || 0,
        dailyStreams: sortedStreams[1] || 0,
      });
    }
  });

  if (songs.length === 0) {
    throw new Error(
      "No songs found for this artist. The page structure might have changed.",
    );
  }

  console.log(`Successfully parsed ${songs.length} songs`);

  // Sort by total streams (descending)
  songs.sort((a, b) => b.totalStreams - a.totalStreams);

  // Reassign ranks after sorting
  songs.forEach((song, index) => {
    song.rank = index + 1;
  });

  const topTen = songs.slice(0, 10);

  return {
    artistName: spotifyArtist.name,
    artistId: spotifyArtist.id,
    imageUrl: spotifyArtist.imageUrl,
    songs,
    topTen,
  };
}

// --- Cached version (revalidates every 24 hours) ---

export const getArtistData = unstable_cache(
  fetchArtistData,
  ["artist-data"],
  { revalidate: 86400 },
);
