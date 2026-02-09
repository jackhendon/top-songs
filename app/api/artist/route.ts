import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

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

/**
 * Get Spotify access token using Client Credentials flow
 */
async function getSpotifyAccessToken(): Promise<string> {
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
  return data.access_token;
}

/**
 * Search for an artist on Spotify and get their ID
 */
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

/**
 * API Route: /api/artist?name={artistName}
 * 1. Searches Spotify for the artist to get their ID
 * 2. Scrapes Kworb.net using the Spotify artist ID
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const artistName = searchParams.get("name");

  if (!artistName) {
    return NextResponse.json(
      { error: "Artist name is required" },
      { status: 400 },
    );
  }

  try {
    // Step 1: Get Spotify access token
    const accessToken = await getSpotifyAccessToken();

    // Step 2: Search for artist on Spotify
    const spotifyArtist = await searchSpotifyArtist(artistName, accessToken);

    if (!spotifyArtist) {
      return NextResponse.json(
        { error: `Artist not found on Spotify: ${artistName}` },
        { status: 404 },
      );
    }

    console.log(`Found artist: ${spotifyArtist.name} (${spotifyArtist.id})`);

    // Step 3: Build Kworb URL with Spotify artist ID
    const kworkUrl = `https://kworb.net/spotify/artist/${spotifyArtist.id}_songs.html`;

    console.log(`Fetching: ${kworkUrl}`);

    // Fetch the HTML page
    const response = await fetch(kworkUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TopSongsGame/1.0)",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: `Artist not found: ${artistName}` },
          { status: 404 },
        );
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Parse the table - Kworb uses a specific table structure
    // We're looking for the main songs table with streaming data
    const songs: Song[] = [];

    // Find the table - typically the main table on the page
    // Kworb tables have headers like: Song, Total Streams, Daily Streams, etc.
    const table = $("table").first();

    if (!table.length) {
      return NextResponse.json(
        { error: "Could not find song data table" },
        { status: 500 },
      );
    }

    // Parse table rows
    table.find("tbody tr").each((index, row) => {
      const $row = $(row);
      const cells = $row.find("td");

      if (cells.length < 3) return; // Skip malformed rows

      // Extract song title - usually in the first or second column
      let title = cells.eq(0).text().trim();

      // If first cell is just a number (rank), title is in second cell
      if (!isNaN(Number(title))) {
        title = cells.eq(1).text().trim();
      }

      // Extract stream counts - need to handle formatting like "1,234,567,890"
      const totalStreamsText = cells
        .eq(cells.length - 2)
        .text()
        .trim();
      const dailyStreamsText = cells
        .eq(cells.length - 1)
        .text()
        .trim();

      const totalStreams = parseStreamCount(totalStreamsText);
      const dailyStreams = parseStreamCount(dailyStreamsText);

      if (title && totalStreams > 0) {
        songs.push({
          rank: index + 1,
          title,
          totalStreams,
          dailyStreams,
        });
      }
    });

    if (songs.length === 0) {
      return NextResponse.json(
        { error: "No songs found for this artist" },
        { status: 404 },
      );
    }

    // Sort by total streams (descending)
    songs.sort((a, b) => b.totalStreams - a.totalStreams);

    // Reassign ranks after sorting
    songs.forEach((song, index) => {
      song.rank = index + 1;
    });

    // Get top 10
    const topTen = songs.slice(0, 10);

    const data: ArtistData = {
      artistName: spotifyArtist.name, // Use official Spotify name
      artistId: spotifyArtist.id,
      imageUrl: spotifyArtist.imageUrl,
      songs,
      topTen,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      { error: "Failed to fetch artist data", details: String(error) },
      { status: 500 },
    );
  }
}

/**
 * Parse stream count strings like "1,234,567,890" to numbers
 */
function parseStreamCount(text: string): number {
  if (!text) return 0;

  // Remove commas and any non-digit characters except decimal points
  const cleaned = text.replace(/[,\s]/g, "");
  const num = parseFloat(cleaned);

  return isNaN(num) ? 0 : Math.floor(num);
}
