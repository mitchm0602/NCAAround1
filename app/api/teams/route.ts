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
        (bpi: any) => String(bpi.team).toLowerCase() === String(team.team).toLowerCase()
      )

      return {
        ...team,
        sor: bpiMatch?.sor ?? null,
        bpi: bpiMatch?.bpi ?? null,
      }
    })

    return json({ teams })
  } catch (error) {
    console.error('Error fetching team data:', error)

    return NextResponse.json(
      { error: 'Failed to fetch team data' },
      { status: 500 }
    )
  }
}
