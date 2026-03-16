import { NextResponse } from 'next/server'
import { fetchNcaaNet } from '../../../lib/sources/ncaaNet'
import { fetchEspnBpi } from '../../../lib/sources/espnBpi'
import { json } from '../../../lib/utils'

export async function GET() {
  try {
    const netData = await fetchNcaaNet()
    const bpiData = await fetchEspnBpi()

    const teams = netData.map((team: any) => {
      const match = bpiData.find(
        (b: any) => String(b.team).toLowerCase() === String(team.team).toLowerCase()
      )

      return {
        ...team,
        sor: match?.sor ?? null,
        bpi: match?.bpi ?? null
      }
    })

    return json({ teams })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Failed to fetch team data' },
      { status: 500 }
    )
  }
}
