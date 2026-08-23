import { NextRequest, NextResponse } from "next/server";
import { getArtistData } from "@/lib/getArtistData";

const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const artistName = searchParams.get("name");
  const spotifyId = searchParams.get("id");

  if (!artistName || artistName.length > 200) {
    return NextResponse.json(
      { error: "Artist name is required" },
      { status: 400 },
    );
  }

  // Spotify ids are 22-character base62. Validate rather than pass a
  // caller-supplied value straight into an upstream URL path.
  if (spotifyId && !/^[A-Za-z0-9]{22}$/.test(spotifyId)) {
    return NextResponse.json({ error: "Invalid artist id" }, { status: 400 });
  }

  try {
    const data = await getArtistData(artistName, spotifyId ?? undefined);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("not found")) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    console.error("Artist data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch artist data" },
      { status: 500 },
    );
  }
}
