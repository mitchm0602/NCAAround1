import { NextResponse } from "next/server";
import { fetchEspnOddsGames } from "@/lib/sources/espnOdds";

export const runtime = "nodejs";

export async function GET() {
  try {
    const games = await fetchEspnOddsGames();
    return NextResponse.json({
      fetchedAt: new Date().toISOString(),
      source: "ESPN",
      count: games.length,
      games
    }, {
      headers: {
        "cache-control": "s-maxage=600, stale-while-revalidate=3600"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
