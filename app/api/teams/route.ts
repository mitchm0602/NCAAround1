import { NextResponse } from "next/server";
import { fetchNcaaNetTeams } from "../../../lib/sources/ncaaNet";
import { fetchEspnResumeRows } from "../../../lib/sources/espnBpi";

export async function GET() {
  try {
    const netData = await fetchNcaaNetTeams();
    const resumeData = await fetchEspnResumeRows();

    const teams = netData.map((team) => {
      const resumeMatch = resumeData.find(
        (row) => row.team.toLowerCase() === team.team.toLowerCase()
      );

      return {
        ...team,
        sor: resumeMatch?.sor ?? null,
        sos: resumeMatch?.sos ?? null,
        ncSos: resumeMatch?.ncSos ?? null,
        sorSeed: resumeMatch?.sorSeed ?? null,
        sorCurve: resumeMatch?.sorCurve ?? null,
        qualityWins: resumeMatch?.qualityWins ?? null
      };
    });

    return NextResponse.json({
      ok: true,
      teamCount: teams.length,
      netCount: netData.length,
      resumeCount: resumeData.length,
      teams
    });
  } catch (error) {
    console.error("Error fetching team data:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
