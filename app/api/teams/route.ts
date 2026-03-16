import { NextResponse } from "next/server";
import { fetchNcaaNetTeams } from "@/lib/sources/ncaaNet";
import { fetchEspnResumeRows } from "@/lib/sources/espnBpi";
import { canonicalTeamName } from "@/lib/utils";

export const runtime = "nodejs";

type TeamMapValue = Awaited<ReturnType<typeof fetchNcaaNetTeams>>[number];

export async function GET() {
  try {
    const [netTeams, resumeRows] = await Promise.all([
      fetchNcaaNetTeams(),
      fetchEspnResumeRows().catch(() => [])
    ]);

    const resumeMap = new Map(
      resumeRows.map((row) => [canonicalTeamName(row.team), row])
    );

    const merged = netTeams.map((team) => {
      const resume = resumeMap.get(canonicalTeamName(team.team));
      return {
        ...team,
        sor: resume?.sor ?? team.sor,
        sos: resume?.sos ?? team.sos,
        ncSos: resume?.ncSos ?? team.ncSos,
        sorSeed: resume?.sorSeed ?? team.sorSeed,
        sorCurve: resume?.sorCurve ?? team.sorCurve,
        qualityWins: resume?.qualityWins ?? team.qualityWins
      } satisfies TeamMapValue;
    });

    return NextResponse.json({
      fetchedAt: new Date().toISOString(),
      source: {
        net: "NCAA",
        resume: "ESPN BPI"
      },
      count: merged.length,
      teams: merged
    }, {
      headers: {
        "cache-control": "s-maxage=21600, stale-while-revalidate=86400"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
