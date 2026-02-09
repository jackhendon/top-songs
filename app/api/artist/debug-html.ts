import { NextRequest, NextResponse } from "next/server";

/**
 * Debug endpoint to view raw HTML from Kworb
 * Usage: /api/debug-html?artistId=06HL4z0CvFAxyc27GXpf02
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const artistId = searchParams.get("artistId");

  if (!artistId) {
    return NextResponse.json(
      { error: "Artist ID is required" },
      { status: 400 },
    );
  }

  const kworkUrl = `https://kworb.net/spotify/artist/${artistId}_songs.html`;

  try {
    const response = await fetch(kworkUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TopSongsGame/1.0)",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status}` },
        { status: response.status },
      );
    }

    const html = await response.text();

    // Return as plain text so we can view in browser
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
