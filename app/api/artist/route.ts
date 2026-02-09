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

    // Parse the table - Kworb uses class "addpos sortable"
    const songs: Song[] = [];

    // Find the songs table - it has class "addpos sortable"
    const table = $("table.addpos.sortable");

    if (!table.length) {
      return NextResponse.json(
        { error: "Could not find song data table on Kworb page" },
        { status: 500 },
      );
    }

    // Parse table rows from tbody
    const rows = table.find("tbody tr");

    console.log(`Found ${rows.length} rows in table`);

    rows.each((index, row) => {
      const $row = $(row);
      const cells = $row.find("td");

      if (cells.length < 2) return; // Skip malformed rows

      // Strategy: Find the song title and stream counts
      // Based on Kworb structure:
      // - Song title is usually in a <td> with a link (<a> tag)
      // - Stream counts are in <td class="text"> or plain <td> with numbers

      let title = "";
      const streamCounts: number[] = [];

      cells.each((i, cell) => {
        const $cell = $(cell);
        const cellText = $cell.text().trim();

        // Check if this cell contains a song title (has a link)
        const link = $cell.find("a");
        if (link.length > 0 && !title) {
          title = link.text().trim();
        }

        // Check if this cell contains a number (stream count)
        const parsed = parseStreamCount(cellText);
        if (parsed > 0) {
          streamCounts.push(parsed);
        }
      });

      // Heuristic: The largest number is likely total streams
      // The second-largest (or second number) is likely daily streams
      if (title && streamCounts.length > 0) {
        // Sort to find the largest values
        const sortedStreams = [...streamCounts].sort((a, b) => b - a);

        const totalStreams = sortedStreams[0] || 0;
        const dailyStreams = sortedStreams[1] || 0;

        songs.push({
          rank: index + 1,
          title,
          totalStreams,
          dailyStreams,
        });
      }
    });

    if (songs.length === 0) {
      console.error(
        "No songs parsed from table. HTML structure might have changed.",
      );
      return NextResponse.json(
        {
          error:
            "No songs found for this artist. The page structure might have changed.",
        },
        { status: 404 },
      );
    }

    console.log(`Successfully parsed ${songs.length} songs`);

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
 * Parse stream count strings like "1,234,567,890" or "3,238,421,886" to numbers
 */
function parseStreamCount(text: string): number {
  if (!text || text.trim() === "") return 0;

  // Remove all commas and whitespace
  const cleaned = text.replace(/[,\s]/g, "");

  // Check if it's a valid number string
  if (!/^\d+(\.\d+)?$/.test(cleaned)) {
    return 0;
  }

  const num = parseFloat(cleaned);

  return isNaN(num) ? 0 : Math.floor(num);
}
