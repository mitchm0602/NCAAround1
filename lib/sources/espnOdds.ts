import { normalizeTeamName } from '../utils'

export async function fetchEspnOdds() {
  return [
    {
      teamA: normalizeTeamName('Duke'),
      teamB: normalizeTeamName('Houston'),
      spreadFavorite: 'Duke',
      spread: -2.5,
      total: 132.5,
      moneylineFavorite: 'Duke',
      moneylineFavoritePrice: -145,
      gameTime: '7:00 PM',
    },
    {
      teamA: normalizeTeamName('Texas A&M'),
      teamB: normalizeTeamName('Wisconsin'),
      spreadFavorite: 'Wisconsin',
      spread: -5.5,
      total: 141.5,
      moneylineFavorite: 'Wisconsin',
      moneylineFavoritePrice: -220,
      gameTime: '8:35 PM',
    },
    {
      teamA: normalizeTeamName('Michigan State'),
      teamB: normalizeTeamName('Arizona'),
      spreadFavorite: 'Arizona',
      spread: -4.5,
      total: 145.5,
      moneylineFavorite: 'Arizona',
      moneylineFavoritePrice: -185,
      gameTime: '9:10 PM',
    },
  ]
}
