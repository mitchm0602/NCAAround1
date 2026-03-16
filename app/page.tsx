'use client';

import { useEffect, useMemo, useState } from 'react';
import type { OddsGame, TeamProfile } from '@/lib/types';

const FALLBACK_TEAMS: TeamProfile[] = [
  { team: 'Duke', conference: 'ACC', wins: 32, losses: 2, netRank: 1, sor: 1, sos: 4, ncSos: 5, sorSeed: 1, sorCurve: 98, qualityWins: 'Elite', roadRecord: '10-1', neutralRecord: '7-1', homeRecord: '15-0', nonDivIRecord: '0-0', prevNetRank: 1, quad1Wins: 17, quad1Losses: 2, quad2Wins: 6, quad2Losses: 0, quad3Wins: 2, quad3Losses: 0, quad4Wins: 7, quad4Losses: 0 },
  { team: 'Houston', conference: 'Big 12', wins: 29, losses: 4, netRank: 3, sor: 3, sos: 6, ncSos: 8, sorSeed: 1, sorCurve: 96, qualityWins: 'Elite', roadRecord: '9-3', neutralRecord: '5-1', homeRecord: '15-0', nonDivIRecord: '0-0', prevNetRank: 3, quad1Wins: 11, quad1Losses: 4, quad2Wins: 7, quad2Losses: 0, quad3Wins: 5, quad3Losses: 0, quad4Wins: 6, quad4Losses: 0 },
  { team: 'Wisconsin', conference: 'Big Ten', wins: 24, losses: 10, netRank: 18, sor: 9, sos: 21, ncSos: 24, sorSeed: 3, sorCurve: 84, qualityWins: 'Strong', roadRecord: '7-6', neutralRecord: '4-1', homeRecord: '13-3', nonDivIRecord: '0-0', prevNetRank: 19, quad1Wins: 8, quad1Losses: 8, quad2Wins: 6, quad2Losses: 1, quad3Wins: 6, quad3Losses: 1, quad4Wins: 4, quad4Losses: 0 },
  { team: 'Texas A&M', conference: 'SEC', wins: 22, losses: 10, netRank: 23, sor: 17, sos: 11, ncSos: 13, sorSeed: 5, sorCurve: 75, qualityWins: 'Good', roadRecord: '5-7', neutralRecord: '4-1', homeRecord: '13-2', nonDivIRecord: '0-0', prevNetRank: 24, quad1Wins: 6, quad1Losses: 9, quad2Wins: 7, quad2Losses: 1, quad3Wins: 5, quad3Losses: 0, quad4Wins: 4, quad4Losses: 0 },
  { team: 'Arizona', conference: 'Big 12', wins: 32, losses: 2, netRank: 2, sor: 2, sos: 4, ncSos: 7, sorSeed: 1, sorCurve: 97, qualityWins: 'Elite', roadRecord: '10-1', neutralRecord: '6-1', homeRecord: '16-0', nonDivIRecord: '0-0', prevNetRank: 2, quad1Wins: 13, quad1Losses: 2, quad2Wins: 8, quad2Losses: 0, quad3Wins: 5, quad3Losses: 0, quad4Wins: 6, quad4Losses: 0 },
  { team: 'Michigan State', conference: 'Big Ten', wins: 25, losses: 7, netRank: 16, sor: 10, sos: 17, ncSos: 18, sorSeed: 3, sorCurve: 82, qualityWins: 'Strong', roadRecord: '7-5', neutralRecord: '4-1', homeRecord: '14-1', nonDivIRecord: '0-0', prevNetRank: 17, quad1Wins: 7, quad1Losses: 7, quad2Wins: 8, quad2Losses: 0, quad3Wins: 5, quad3Losses: 0, quad4Wins: 5, quad4Losses: 0 }
];

const FALLBACK_ODDS: OddsGame[] = [
  { teamA: 'Duke', teamB: 'Houston', recordA: '32-2', recordB: '29-4', spreadFavorite: 'Duke', spread: -2.5, total: 132.5, moneylineFavorite: 'Duke', moneylineFavoritePrice: -145, teamAMoneyline: -145, teamBMoneyline: 122, startTime: null },
  { teamA: 'Texas A&M', teamB: 'Wisconsin', recordA: '22-10', recordB: '24-10', spreadFavorite: 'Wisconsin', spread: -5.5, total: 141.5, moneylineFavorite: 'Wisconsin', moneylineFavoritePrice: -220, teamAMoneyline: 180, teamBMoneyline: -220, startTime: null },
  { teamA: 'Michigan State', teamB: 'Arizona', recordA: '25-7', recordB: '32-2', spreadFavorite: 'Arizona', spread: -4.5, total: 145.5, moneylineFavorite: 'Arizona', moneylineFavoritePrice: -185, teamAMoneyline: 155, teamBMoneyline: -185, startTime: null }
];

function scoreTeam(team: TeamProfile) {
  const winPct = team.wins / Math.max(team.wins + team.losses, 1);
  const netScore = 100 - ((team.netRank - 1) / 364) * 100;
  const sorScore = team.sor ? 100 - ((team.sor - 1) / 364) * 100 : 50;
  const sosScore = team.sos ? 100 - ((team.sos - 1) / 364) * 100 : 50;
  const q1WinScore = Math.min(team.quad1Wins / 15, 1) * 100;
  const q1LossPenalty = Math.min(team.quad1Losses / 12, 1) * 20;
  const roadRec = parseRecord(team.roadRecord);
  const neutralRec = parseRecord(team.neutralRecord);
  const roadNeutralWinPct = (roadRec.wins + neutralRec.wins) / Math.max(roadRec.games + neutralRec.games, 1);
  const roadNeutralScore = roadNeutralWinPct * 100;

  const weighted =
    winPct * 100 * 0.24 +
    netScore * 0.24 +
    sorScore * 0.2 +
    sosScore * 0.12 +
    q1WinScore * 0.12 +
    roadNeutralScore * 0.08 -
    q1LossPenalty;

  return {
    winPct,
    netScore,
    sorScore,
    sosScore,
    q1WinScore,
    roadNeutralScore,
    weighted: round(clamp(weighted, 0, 100), 1)
  };
}

function parseRecord(record: string | null) {
  const match = record?.match(/(\d+)-(\d+)/);
  const wins = match ? Number(match[1]) : 0;
  const losses = match ? Number(match[2]) : 0;
  return { wins, losses, games: wins + losses };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function round(n: number, d = 1) {
  return Number(n.toFixed(d));
}

function findOdds(oddsRows: OddsGame[], teamA: string, teamB: string) {
  return oddsRows.find((game) => {
    const a = [game.teamA, game.teamB].map((x) => x.toLowerCase()).sort().join('__');
    const b = [teamA, teamB].map((x) => x.toLowerCase()).sort().join('__');
    return a === b;
  }) || null;
}

function buildPrediction(teamA: TeamProfile, teamB: TeamProfile, odds: OddsGame | null) {
  const a = scoreTeam(teamA);
  const b = scoreTeam(teamB);
  const spreadRaw = (a.weighted - b.weighted) / 3.25;
  const favorite = spreadRaw >= 0 ? teamA.team : teamB.team;
  const modeledSpread = round(Math.abs(spreadRaw), 1);

  const paceProxyA = 68 + (40 - teamA.netRank) / 18;
  const paceProxyB = 68 + (40 - teamB.netRank) / 18;
  const totalProjection = round(clamp(138 + (paceProxyA + paceProxyB - 136) * 1.4 + ((a.weighted + b.weighted) - 120) * 0.08, 124, 166), 1);

  let confidence = 52 + Math.min(Math.abs(a.weighted - b.weighted) * 1.2, 18);
  if (odds) confidence -= Math.min(Math.abs(Math.abs(odds.spread) - modeledSpread) * 2, 10);
  confidence = round(clamp(confidence, 40, 90), 0);

  let upsetRisk = 'Low';
  const sorGap = Math.abs((teamA.sor ?? 180) - (teamB.sor ?? 180));
  const netGap = Math.abs(teamA.netRank - teamB.netRank);
  if ((sorGap > 20 && netGap < 8) || (odds && Math.abs(odds.spread) >= 8 && modeledSpread <= Math.abs(odds.spread) - 3.5)) upsetRisk = 'High';
  else if (sorGap > 10 || netGap < 12) upsetRisk = 'Medium';

  let spreadPick = `${favorite} -${modeledSpread}`;
  let spreadEdge: number | null = null;
  if (odds) {
    const marketFavorite = odds.spreadFavorite;
    const marketSpread = Math.abs(odds.spread);
    if (marketFavorite === favorite && modeledSpread > marketSpread + 1.5) {
      spreadPick = `Bet ${marketFavorite} ${odds.spread}`;
      spreadEdge = round(modeledSpread - marketSpread, 1);
    } else if (marketFavorite === favorite && modeledSpread < marketSpread - 1.5) {
      const dog = marketFavorite === teamA.team ? teamB.team : teamA.team;
      spreadPick = `Bet ${dog} +${marketSpread}`;
      spreadEdge = round(marketSpread - modeledSpread, 1);
    } else if (marketFavorite !== favorite) {
      spreadPick = `Model upset lean: ${favorite} moneyline`;
      spreadEdge = round(modeledSpread + marketSpread, 1);
    } else {
      spreadPick = `Pass or lean ${marketFavorite} ${odds.spread}`;
      spreadEdge = round(Math.abs(modeledSpread - marketSpread), 1);
    }
  }

  let totalPick = `Projected total ${totalProjection}`;
  let totalEdge: number | null = null;
  if (odds?.total != null) {
    totalEdge = round(totalProjection - odds.total, 1);
    if (totalProjection > odds.total + 2.5) totalPick = `Play over ${odds.total}`;
    else if (totalProjection < odds.total - 2.5) totalPick = `Play under ${odds.total}`;
    else totalPick = `Pass or slight lean on total ${odds.total}`;
  }

  const reasons = [
    `${favorite} has the stronger blended profile from NET rank, win-loss record, SOR, SOS, and Quad 1 wins.`,
    teamA.sos && teamB.sos && teamA.sos < teamB.sos ? `${teamA.team} has played the tougher schedule.` : `${teamB.team} has played the tougher schedule.`,
    teamA.sor && teamB.sor && teamA.sor < teamB.sor ? `${teamA.team} owns the stronger strength of record.` : `${teamB.team} owns the stronger strength of record.`,
    (teamA.quad1Wins > teamB.quad1Wins ? teamA.team : teamB.team) + ' has more Quad 1 wins.'
  ];

  const explanation = `${favorite} grades out as the stronger side because the model sees a ${modeledSpread}-point edge from record quality, NET rank, strength of record, strength of schedule, and quality wins. ${odds ? `Against the current market spread of ${odds.spreadFavorite} ${odds.spread}, the model ${spreadPick.toLowerCase().startsWith('pass') ? 'does not show a major edge' : 'shows a playable angle'}.` : 'A live market line is not currently available for this matchup.'} The model total is ${totalProjection}${odds?.total != null ? ` versus a market total of ${odds.total}` : ''}, which leads to ${totalPick.toLowerCase()}. Confidence is ${confidence}% and upset risk is ${upsetRisk.toLowerCase()}.`;

  return { a, b, favorite, modeledSpread, totalProjection, confidence, upsetRisk, spreadPick, spreadEdge, totalPick, totalEdge, explanation, reasons };
}

function MetricRow({ label, left, right, leftBetter, rightBetter }: { label: string; left: string; right: string; leftBetter?: boolean; rightBetter?: boolean; }) {
  return (
    <div className="metric-row">
      <div className={`metric-left ${leftBetter ? 'metric-strong' : 'metric-weak'}`}>{left}</div>
      <div className="metric-label">{label}</div>
      <div className={`${rightBetter ? 'metric-strong' : 'metric-weak'}`}>{right}</div>
    </div>
  );
}

export default function Page() {
  const [teams, setTeams] = useState<TeamProfile[]>(FALLBACK_TEAMS);
  const [oddsRows, setOddsRows] = useState<OddsGame[]>(FALLBACK_ODDS);
  const [teamAName, setTeamAName] = useState('Duke');
  const [teamBName, setTeamBName] = useState('Houston');
  const [teamsLive, setTeamsLive] = useState(false);
  const [oddsLive, setOddsLive] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingOdds, setLoadingOdds] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [error, setError] = useState('');

  async function loadTeams() {
    setLoadingTeams(true);
    try {
      const res = await fetch('/api/teams', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load live team data.');
      const data = await res.json();
      if (!Array.isArray(data.teams) || !data.teams.length) throw new Error('Live team payload was empty.');
      setTeams(data.teams);
      setTeamsLive(true);
      setLastRefresh(new Date(data.fetchedAt || Date.now()).toLocaleString());
    } catch (e) {
      setTeamsLive(false);
      setError(e instanceof Error ? e.message : 'Could not load live teams.');
    } finally {
      setLoadingTeams(false);
    }
  }

  async function loadOdds() {
    setLoadingOdds(true);
    try {
      const res = await fetch('/api/odds', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load live odds.');
      const data = await res.json();
      if (!Array.isArray(data.games) || !data.games.length) throw new Error('Live odds payload was empty.');
      setOddsRows(data.games);
      setOddsLive(true);
      setLastRefresh(new Date(data.fetchedAt || Date.now()).toLocaleString());
    } catch (e) {
      setOddsLive(false);
      setError(e instanceof Error ? e.message : 'Could not load live odds.');
    } finally {
      setLoadingOdds(false);
    }
  }

  async function refreshAll() {
    setError('');
    await Promise.all([loadTeams(), loadOdds()]);
  }

  useEffect(() => {
    refreshAll();
  }, []);

  const teamNames = useMemo(() => teams.map((t) => t.team).sort(), [teams]);
  const teamA = useMemo(() => teams.find((t) => t.team.toLowerCase() === teamAName.trim().toLowerCase()) || null, [teams, teamAName]);
  const teamB = useMemo(() => teams.find((t) => t.team.toLowerCase() === teamBName.trim().toLowerCase()) || null, [teams, teamBName]);
  const matchedOdds = useMemo(() => teamA && teamB ? findOdds(oddsRows, teamA.team, teamB.team) : null, [oddsRows, teamA, teamB]);
  const prediction = useMemo(() => teamA && teamB && teamA.team !== teamB.team ? buildPrediction(teamA, teamB, matchedOdds) : null, [teamA, teamB, matchedOdds]);

  return (
    <main className="page">
      <div className="container">
        <datalist id="team-options">
          {teamNames.map((team) => <option key={team} value={team} />)}
        </datalist>

        <div className="grid hero">
          <section className="card">
            <div className="card-body">
              <span className="badge">Live NCAA matchup app</span>
              <h1>Live team data. Live odds. Real pick engine.</h1>
              <p className="lead">Compare any two teams using current team profiles, strength of schedule, strength of record, NET rank, and live market numbers from your connected backend.</p>

              <div className="controls">
                <div>
                  <label className="label">Team 1</label>
                  <input className="input" list="team-options" value={teamAName} onChange={(e) => setTeamAName(e.target.value)} placeholder="Type Team 1" />
                </div>
                <div>
                  <label className="label">Team 2</label>
                  <input className="input" list="team-options" value={teamBName} onChange={(e) => setTeamBName(e.target.value)} placeholder="Type Team 2" />
                </div>
              </div>

              <div className="quick-picks">
                {['Duke', 'Houston', 'Texas A&M', 'Wisconsin', 'Michigan State', 'Arizona'].map((team) => (
                  <button key={team} onClick={() => (!teamA || teamA.team === team ? setTeamBName(team) : setTeamAName(team))}>{team}</button>
                ))}
              </div>
            </div>
          </section>

          <section className="card dark">
            <div className="card-body">
              <span className="badge">Pick engine</span>
              <h2 className="card-title" style={{ fontSize: 34, marginTop: 14 }}>{prediction ? prediction.spreadPick : 'Choose two valid teams'}</h2>
              <p className="subtitle" style={{ marginTop: 12 }}>{prediction ? `Total: ${prediction.totalPick}` : 'The app will use live backend data automatically when the routes are connected.'}</p>

              <div className="stat-grid" style={{ marginTop: 22 }}>
                <div className="mini-card">
                  <div className="mini-label">Confidence</div>
                  <div className="mini-value">{prediction ? `${prediction.confidence}%` : '--'}</div>
                </div>
                <div className="mini-card">
                  <div className="mini-label">Upset risk</div>
                  <div className="mini-value">{prediction ? prediction.upsetRisk : '--'}</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="grid triple" style={{ marginTop: 20 }}>
          <section className="card">
            <div className="card-header"><h3 className="card-title">Team data</h3></div>
            <div className="card-body">
              <div className="status-row"><span>Status</span><span className={teamsLive ? 'status-live' : 'status-fallback'}>{teamsLive ? 'Live' : 'Fallback'}</span></div>
              <div className="status-row" style={{ marginTop: 10 }}><span>Loaded teams</span><strong>{teams.length}</strong></div>
              <button className="button secondary" style={{ marginTop: 14 }} onClick={loadTeams} disabled={loadingTeams}>{loadingTeams ? 'Refreshing…' : 'Refresh teams'}</button>
            </div>
          </section>

          <section className="card">
            <div className="card-header"><h3 className="card-title">Odds feed</h3></div>
            <div className="card-body">
              <div className="status-row"><span>Status</span><span className={oddsLive ? 'status-live' : 'status-fallback'}>{oddsLive ? 'Live' : 'Fallback'}</span></div>
              <div className="status-row" style={{ marginTop: 10 }}><span>Loaded games</span><strong>{oddsRows.length}</strong></div>
              <button className="button secondary" style={{ marginTop: 14 }} onClick={loadOdds} disabled={loadingOdds}>{loadingOdds ? 'Refreshing…' : 'Refresh odds'}</button>
            </div>
          </section>

          <section className="card">
            <div className="card-header"><h3 className="card-title">App health</h3></div>
            <div className="card-body">
              <div className="status-row"><span>Last refresh</span><strong>{lastRefresh || 'Not yet'}</strong></div>
              <button className="button" style={{ marginTop: 14 }} onClick={refreshAll} disabled={loadingTeams || loadingOdds}>{loadingTeams || loadingOdds ? 'Refreshing…' : 'Refresh all live data'}</button>
              {error ? <div className="note error" style={{ marginTop: 14 }}>{error}</div> : null}
            </div>
          </section>
        </div>

        {prediction && teamA && teamB ? (
          <>
            <div className="grid compare" style={{ marginTop: 20 }}>
              <section className="card">
                <div className="card-header"><h3 className="card-title">{teamA.team}</h3><div className="subtitle">{teamA.conference}</div></div>
                <div className="card-body">
                  <div className="progress-wrap">
                    <div className="progress-row"><span>Model score</span><strong>{prediction.a.weighted}</strong></div>
                    <div className="progress"><span style={{ width: `${prediction.a.weighted}%` }} /></div>
                  </div>
                  <div className="stat-grid" style={{ marginTop: 18 }}>
                    <div className="mini-card"><div className="mini-label">Record</div><div className="mini-value">{teamA.wins}-{teamA.losses}</div></div>
                    <div className="mini-card"><div className="mini-label">NET</div><div className="mini-value">#{teamA.netRank}</div></div>
                    <div className="mini-card"><div className="mini-label">SOS</div><div className="mini-value">{teamA.sos ? `#${teamA.sos}` : '—'}</div></div>
                    <div className="mini-card"><div className="mini-label">SOR</div><div className="mini-value">{teamA.sor ? `#${teamA.sor}` : '—'}</div></div>
                  </div>
                </div>
              </section>

              <section className="card">
                <div className="card-header"><h3 className="card-title">Matchup breakdown</h3></div>
                <div className="card-body">
                  <MetricRow label="record" left={`${teamA.wins}-${teamA.losses}`} right={`${teamB.wins}-${teamB.losses}`} leftBetter={teamA.wins > teamB.wins} rightBetter={teamB.wins > teamA.wins} />
                  <MetricRow label="NET" left={`#${teamA.netRank}`} right={`#${teamB.netRank}`} leftBetter={teamA.netRank < teamB.netRank} rightBetter={teamB.netRank < teamA.netRank} />
                  <MetricRow label="SOR" left={teamA.sor ? `#${teamA.sor}` : '—'} right={teamB.sor ? `#${teamB.sor}` : '—'} leftBetter={(teamA.sor ?? 999) < (teamB.sor ?? 999)} rightBetter={(teamB.sor ?? 999) < (teamA.sor ?? 999)} />
                  <MetricRow label="SOS" left={teamA.sos ? `#${teamA.sos}` : '—'} right={teamB.sos ? `#${teamB.sos}` : '—'} leftBetter={(teamA.sos ?? 999) < (teamB.sos ?? 999)} rightBetter={(teamB.sos ?? 999) < (teamA.sos ?? 999)} />
                  <MetricRow label="Q1 wins" left={String(teamA.quad1Wins)} right={String(teamB.quad1Wins)} leftBetter={teamA.quad1Wins > teamB.quad1Wins} rightBetter={teamB.quad1Wins > teamA.quad1Wins} />
                  <MetricRow label="road" left={teamA.roadRecord || '—'} right={teamB.roadRecord || '—'} />
                  <MetricRow label="neutral" left={teamA.neutralRecord || '—'} right={teamB.neutralRecord || '—'} />
                </div>
              </section>

              <section className="card">
                <div className="card-header"><h3 className="card-title">{teamB.team}</h3><div className="subtitle">{teamB.conference}</div></div>
                <div className="card-body">
                  <div className="progress-wrap">
                    <div className="progress-row"><span>Model score</span><strong>{prediction.b.weighted}</strong></div>
                    <div className="progress"><span style={{ width: `${prediction.b.weighted}%` }} /></div>
                  </div>
                  <div className="stat-grid" style={{ marginTop: 18 }}>
                    <div className="mini-card"><div className="mini-label">Record</div><div className="mini-value">{teamB.wins}-{teamB.losses}</div></div>
                    <div className="mini-card"><div className="mini-label">NET</div><div className="mini-value">#{teamB.netRank}</div></div>
                    <div className="mini-card"><div className="mini-label">SOS</div><div className="mini-value">{teamB.sos ? `#${teamB.sos}` : '—'}</div></div>
                    <div className="mini-card"><div className="mini-label">SOR</div><div className="mini-value">{teamB.sor ? `#${teamB.sor}` : '—'}</div></div>
                  </div>
                </div>
              </section>
            </div>

            <div className="grid two" style={{ marginTop: 20 }}>
              <section className="card">
                <div className="card-header"><h3 className="card-title">Prediction output</h3></div>
                <div className="card-body">
                  <div className="stat-grid">
                    <div className="mini-card"><div className="mini-label">Model line</div><div className="mini-value" style={{ fontSize: 28 }}>{prediction.favorite} -{prediction.modeledSpread}</div></div>
                    <div className="mini-card"><div className="mini-label">Model total</div><div className="mini-value" style={{ fontSize: 28 }}>{prediction.totalProjection}</div></div>
                    <div className="mini-card"><div className="mini-label">Market spread</div><div className="mini-value" style={{ fontSize: 22 }}>{matchedOdds ? `${matchedOdds.spreadFavorite} ${matchedOdds.spread}` : 'No live number'}</div></div>
                    <div className="mini-card"><div className="mini-label">Market total</div><div className="mini-value" style={{ fontSize: 22 }}>{matchedOdds?.total ?? 'No live number'}</div></div>
                  </div>
                  <div className="callout" style={{ marginTop: 16 }}>
                    <div className="tiny">Official lean</div>
                    <div className="big">{prediction.spreadPick}</div>
                    <div className="med">{prediction.totalPick}</div>
                  </div>
                </div>
              </section>

              <section className="card">
                <div className="card-header"><h3 className="card-title">Confidence + upset profile</h3></div>
                <div className="card-body">
                  <div className="progress-wrap">
                    <div className="progress-row"><span>Confidence</span><strong>{prediction.confidence}%</strong></div>
                    <div className="progress"><span style={{ width: `${prediction.confidence}%` }} /></div>
                  </div>
                  <div className="status-row" style={{ marginTop: 16 }}><span>Upset risk flag</span><strong>{prediction.upsetRisk}</strong></div>
                  <div className="status-row" style={{ marginTop: 10 }}><span>Spread edge vs market</span><strong>{prediction.spreadEdge ?? '—'}{prediction.spreadEdge != null ? ' pts' : ''}</strong></div>
                  <div className="status-row" style={{ marginTop: 10 }}><span>Total edge vs market</span><strong>{prediction.totalEdge == null ? '—' : `${Math.abs(prediction.totalEdge)} pts ${prediction.totalEdge > 0 ? 'to over' : 'to under'}`}</strong></div>
                </div>
              </section>
            </div>

            <div className="grid two" style={{ marginTop: 20 }}>
              <section className="card">
                <div className="card-header"><h3 className="card-title">Detailed explanation / justification</h3></div>
                <div className="card-body">
                  <div className="note">{prediction.explanation}</div>
                  {prediction.reasons.map((reason) => <div className="reason" style={{ marginTop: 12 }} key={reason}>{reason}</div>)}
                </div>
              </section>

              <section className="card">
                <div className="card-header"><h3 className="card-title">How this frontend connects</h3></div>
                <div className="card-body">
                  <div className="reason"><strong>/api/teams</strong><br /><span className="small muted">Used for the full live team dataset returned by your backend.</span></div>
                  <div className="reason" style={{ marginTop: 12 }}><strong>/api/odds</strong><br /><span className="small muted">Used for live current market lines and totals.</span></div>
                  <div className="reason" style={{ marginTop: 12 }}><strong>Fallback mode</strong><br /><span className="small muted">If either route fails, the UI still renders with sample data so the app does not break.</span></div>
                  <div className="reason" style={{ marginTop: 12 }}><strong>Next upgrade</strong><br /><span className="small muted">Add injuries, venue, rest, and public betting splits to sharpen confidence and upset-risk logic.</span></div>
                </div>
              </section>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
