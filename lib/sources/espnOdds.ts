import * as cheerio from "cheerio";
import { OddsGame } from "@/lib/types";
import { canonicalTeamName, normalizeWhitespace, parseSignedNumber } from "@/lib/utils";

const ESPN_ODDS_URL = "https://www.espn.com/mens-college-basketball/odds";

function parseOddsTextBlock(text: string): OddsGame[] {
  const normalized = text.replace(/\u00a0/g, " ");
  const lines = normalized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const games: OddsGame[] = [];
  for (let i = 0; i < lines.length - 10; i += 1) {
    const maybeTime = lines[i];
    if (!/^20\d\d-\d\d-\d\dT/.test(maybeTime)) continue;
    if (lines[i + 1] !== "Open Spread Total ML") continue;

    const teamA = canonicalTeamName(lines[i + 2]);
    const recordA = lines[i + 3]?.match(/\(\d+-\d+\)/) ? lines[i + 3].replace(/[()]/g, "") : null;
    const currentSpreadA = lines[i + 7] ?? "";
    const currentTotalA = lines[i + 8] ?? "";
    const currentMlA = lines[i + 9] ?? "";

    const teamB = canonicalTeamName(lines[i + 10]);
    const recordB = lines[i + 11]?.match(/\(\d+-\d+\)/) ? lines[i + 11].replace(/[()]/g, "") : null;
    const currentSpreadB = lines[i + 15] ?? "";
    const currentTotalB = lines[i + 16] ?? "";
    const currentMlB = lines[i + 17] ?? "";

    const spreadA = parseSignedNumber(currentSpreadA);
    const spreadB = parseSignedNumber(currentSpreadB);
    if (spreadA === null || spreadB === null) continue;

    const spreadFavorite = spreadA < spreadB ? teamA : teamB;
    const spread = Math.min(spreadA, spreadB);
    const totalMatch = `${currentTotalA} ${currentTotalB}`.match(/[ou](\d+(?:\.\d+)?)/i);
    const total = totalMatch ? Number(totalMatch[1]) : null;
    const mlA = parseSignedNumber(currentMlA);
    const mlB = parseSignedNumber(currentMlB);
    const moneylineFavorite = mlA !== null && mlB !== null ? (mlA < mlB ? teamA : teamB) : null;
    const moneylineFavoritePrice = mlA !== null && mlB !== null ? Math.min(mlA, mlB) : null;

    games.push({
      teamA,
      teamB,
      recordA,
      recordB,
      spreadFavorite,
      spread,
      total,
      moneylineFavorite,
      moneylineFavoritePrice,
      teamAMoneyline: mlA,
      teamBMoneyline: mlB,
      startTime: maybeTime
    });
  }

  const deduped = new Map<string, OddsGame>();
  for (const game of games) {
    const key = [game.teamA, game.teamB].sort().join("__");
    if (!deduped.has(key)) deduped.set(key, game);
  }

  return [...deduped.values()];
}

export async function fetchEspnOddsGames(): Promise<OddsGame[]> {
  const response = await fetch(ESPN_ODDS_URL, {
    headers: {
      "user-agent": "Mozilla/5.0"
    },
    next: { revalidate: 60 * 10 }
  });

  if (!response.ok) {
    throw new Error(`ESPN odds request failed with status ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const text = $("body").text();
  return parseOddsTextBlock(text);
}
