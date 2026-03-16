export type TeamRecordSplit = `${number}-${number}`;

export interface TeamProfile {
  team: string;
  conference: string;
  wins: number;
  losses: number;
  netRank: number;
  sor: number | null;
  sos: number | null;
  ncSos: number | null;
  sorSeed: number | null;
  sorCurve: number | null;
  qualityWins: string | null;
  roadRecord: TeamRecordSplit | null;
  neutralRecord: TeamRecordSplit | null;
  homeRecord: TeamRecordSplit | null;
  nonDivIRecord: TeamRecordSplit | null;
  prevNetRank: number | null;
  quad1Wins: number;
  quad1Losses: number;
  quad2Wins: number;
  quad2Losses: number;
  quad3Wins: number;
  quad3Losses: number;
  quad4Wins: number;
  quad4Losses: number;
}

export interface OddsGame {
  teamA: string;
  teamB: string;
  recordA: string | null;
  recordB: string | null;
  spreadFavorite: string;
  spread: number;
  total: number | null;
  moneylineFavorite: string | null;
  moneylineFavoritePrice: number | null;
  teamAMoneyline: number | null;
  teamBMoneyline: number | null;
  startTime: string | null;
}

export interface ResumeRow {
  team: string;
  wins: number;
  losses: number;
  sor: number | null;
  sorSeed: number | null;
  sorCurve: number | null;
  qualityWins: string | null;
  sos: number | null;
  ncSos: number | null;
}
