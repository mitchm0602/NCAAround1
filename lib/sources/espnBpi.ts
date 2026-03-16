import * as cheerio from "cheerio";
import { ResumeRow } from "@/lib/types";
import { canonicalTeamName, normalizeWhitespace, parseRecord } from "@/lib/utils";

const ESPN_BPI_RESUME_URL = "https://www.espn.com/mens-college-basketball/bpi/_/view/resume";

function asNumber(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : null;
}

function parseFromText(html: string): ResumeRow[] {
  const $ = cheerio.load(html);
  const text = normalizeWhitespace($.root().text());
  const updatedSplit = text.split("Last Updated:")[0] ?? text;

  const rows: ResumeRow[] = [];
  const rowPattern = /([A-Za-z0-9'().&\-\s]+?)\s+(\d+-\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+((?:\d+-\d+)|(?:\d+\.\d+)|(?:\d+))\s+(\d+)\s+(\d+)/g;

  let match: RegExpExecArray | null;
  while ((match = rowPattern.exec(updatedSplit)) !== null) {
    const team = canonicalTeamName(match[1]);
    const [wins, losses] = parseRecord(match[2]);
    rows.push({
      team,
      wins,
      losses,
      sor: asNumber(match[3]),
      sorSeed: asNumber(match[4]),
      sorCurve: asNumber(match[5]),
      qualityWins: match[6] ?? null,
      sos: asNumber(match[7]),
      ncSos: asNumber(match[8])
    });
  }

  const deduped = new Map<string, ResumeRow>();
  for (const row of rows) {
    if (!deduped.has(row.team)) deduped.set(row.team, row);
  }
  return [...deduped.values()];
}

export async function fetchEspnResumeRows(): Promise<ResumeRow[]> {
  const response = await fetch(ESPN_BPI_RESUME_URL, {
    headers: {
      "user-agent": "Mozilla/5.0"
    },
    next: { revalidate: 60 * 60 * 6 }
  });

  if (!response.ok) {
    throw new Error(`ESPN BPI resume request failed with status ${response.status}`);
  }

  const html = await response.text();
  return parseFromText(html);
}
