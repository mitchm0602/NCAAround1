import * as cheerio from "cheerio";
import { TeamProfile } from "@/lib/types";
import { normalizeWhitespace, parseRecord, splitConferenceTail } from "@/lib/utils";

const NCAA_NET_URL = "https://www.ncaa.com/rankings/basketball-men/d1/ncaa-mens-basketball-net-rankings";

function parseQuad(record: string): { wins: number; losses: number } {
  const [wins, losses] = parseRecord(record);
  return { wins, losses };
}

function parseNetLine(line: string): TeamProfile | null {
  const normalized = normalizeWhitespace(line);
  const rankMatch = normalized.match(/^(\d+)\s+(.*?)\s+(\d+-\d+)\s+(.*)$/);
  if (!rankMatch) return null;

  const netRank = Number(rankMatch[1]);
  const team = rankMatch[2];
  const overall = rankMatch[3];
  const tail = rankMatch[4];

  const confMatch = splitConferenceTail(tail);
  if (!confMatch) return null;

  const parts = confMatch.rest.split(" ");
  if (parts.length < 9) return null;

  const [roadRecord, neutralRecord, homeRecord, nonDivIRecord, prevNetRankRaw, quad1, quad2, quad3, quad4] = parts;
  const [wins, losses] = parseRecord(overall);
  const q1 = parseQuad(quad1);
  const q2 = parseQuad(quad2);
  const q3 = parseQuad(quad3);
  const q4 = parseQuad(quad4);

  return {
    team,
    conference: confMatch.conference,
    wins,
    losses,
    netRank,
    sor: null,
    sos: null,
    ncSos: null,
    sorSeed: null,
    sorCurve: null,
    qualityWins: null,
    roadRecord: roadRecord as TeamProfile["roadRecord"],
    neutralRecord: neutralRecord as TeamProfile["neutralRecord"],
    homeRecord: homeRecord as TeamProfile["homeRecord"],
    nonDivIRecord: nonDivIRecord as TeamProfile["nonDivIRecord"],
    prevNetRank: Number(prevNetRankRaw),
    quad1Wins: q1.wins,
    quad1Losses: q1.losses,
    quad2Wins: q2.wins,
    quad2Losses: q2.losses,
    quad3Wins: q3.wins,
    quad3Losses: q3.losses,
    quad4Wins: q4.wins,
    quad4Losses: q4.losses
  };
}

export async function fetchNcaaNetTeams(): Promise<TeamProfile[]> {
  const response = await fetch(NCAA_NET_URL, {
    headers: {
      "user-agent": "Mozilla/5.0"
    },
    next: { revalidate: 60 * 60 * 6 }
  });

  if (!response.ok) {
    throw new Error(`NCAA NET request failed with status ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const pageText = normalizeWhitespace($.root().text());

  const startMarker = "Through Games";
  const endMarker = "NET RANKINGS, EXPLAINED";
  const startIndex = pageText.indexOf(startMarker);
  const endIndex = pageText.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error("Could not locate NCAA NET ranking block in source HTML.");
  }

  const rankingBlock = pageText.slice(startIndex, endIndex);
  const lines = rankingBlock.match(/\d+\s+.*?(?=\s\d+\s+[^\d]|$)/g) ?? [];
  const parsed = lines.map(parseNetLine).filter(Boolean) as TeamProfile[];

  if (parsed.length < 300) {
    const fallbackMatches = rankingBlock.match(/\b\d+\s+[^]+?(?=\b\d+\s+|$)/g) ?? [];
    const fallbackParsed = fallbackMatches.map(parseNetLine).filter(Boolean) as TeamProfile[];
    if (fallbackParsed.length > parsed.length) return fallbackParsed;
  }

  return parsed;
}
