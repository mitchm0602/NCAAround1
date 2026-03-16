import { NextResponse } from 'next/server'
import { fetchNcaaNet } from '../../../lib/sources/ncaaNet'
import { fetchEspnBpi } from '../../../lib/sources/espnBpi'
import { json } from '../../../lib/utils'

export async function GET() {
  try {
    const netData = await fetchNcaaNet()
    const bpiData = await fetchEspnBpi()

    const teams = netData.map((team: any) => {
      const bpiMatch = bpiData.find(
        (bpi: any) => bpi.team.toLowerCase() === team.team.toLowerCase()
      )

      return {
        team: team.team,
        netRank: team.rank,
        record: team.record,
        sos: team.sos,
        sor: bpiMatch?.sor ?? null,
        bpi: bpiMatch?.bpi ?? null
      }
    })

    return json({
      success: true,
      teams
    })
  } catch (error) {
    console.error('Error fetching team data:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch team data'
      },
      { status: 500 }
    )
  }
}
