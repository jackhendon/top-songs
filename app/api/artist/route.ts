import { NextRequest, NextResponse } from "next/server";
import { getArtistData } from "@/lib/getArtistData";


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
    const data = await getArtistData(artistName);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    console.error("Artist data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch artist data", details: message },
      { status: 500 },
    );
  }
}
