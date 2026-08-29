import { NextRequest, NextResponse } from "next/server";
import { buildChain } from "@/lib/higherLower";

/**
 * Fresh chains for unlimited mode.
 *
 * The page itself stays static and CDN-cached; only the chain is dynamic, so a
 * player costs one small function call per run rather than a full render per
 * page load. The pool lives on the server: shipping it to the browser would give away
 * every answer.
 */
export async function GET(request: NextRequest) {
  const requested = Number(request.nextUrl.searchParams.get("length") ?? 25);
  const length = Math.min(Math.max(Number.isFinite(requested) ? requested : 25, 5), 50);

  // Not seeded by date: unlimited should differ every run.
  const seed = `${Date.now()}-${Math.random()}`;
  const chain = buildChain(seed, length);

  if (chain.length === 0) {
    return NextResponse.json(
      { error: "No tracks available" },
      { status: 503 },
    );
  }

  return NextResponse.json(
    { chain },
    { headers: { "Cache-Control": "no-store" } },
  );
}
