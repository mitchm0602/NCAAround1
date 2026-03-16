import { NextResponse } from 'next/server'
import { fetchEspnOdds } from '../../../lib/sources/espnOdds'
import { json } from '../../../lib/utils'

export async function GET() {
  try {
    const odds = await fetchEspnOdds()

    return json({
      success: true,
      odds
    })
  } catch (error) {
    console.error('Error fetching odds:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch odds'
      },
      { status: 500 }
    )
  }
}
