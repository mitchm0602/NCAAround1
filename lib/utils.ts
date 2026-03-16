import aliases from "../data/aliases.json";

export function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}

export function normalizeTeamName(name: string) {
  if (!name) return name;
  const trimmed = name.trim();
  const map = aliases as Record<string, string>;
  return map[trimmed] || trimmed;
}

export function canonicalTeamName(name: string) {
  return normalizeTeamName(name);
}

export function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function parseRecord(record: string): [number, number] {
  const match = record.match(/(\d+)-(\d+)/);
  if (!match) return [0, 0];
  return [Number(match[1]), Number(match[2])];
}

export function splitConferenceTail(tail: string): { conference: string; rest: string } | null {
  const conferences = [
    "ACC",
    "America East",
    "American",
    "ASUN",
    "Atlantic 10",
    "Big 12",
    "Big East",
    "Big Sky",
    "Big South",
    "Big Ten",
    "Big West",
    "CAA",
    "Conference USA",
    "Horizon",
    "Ivy",
    "MAAC",
    "MAC",
    "MEAC",
    "Missouri Valley",
    "Mountain West",
    "NEC",
    "Ohio Valley",
    "Patriot",
    "SEC",
    "Southern",
    "Southland",
    "Summit",
    "Sun Belt",
    "SWAC",
    "WAC",
    "WCC"
  ];

  for (const conf of conferences.sort((a, b) => b.length - a.length)) {
    if (tail.startsWith(conf + " ")) {
      return {
        conference: conf,
        rest: tail.slice(conf.length + 1)
      };
    }
  }

  return null;
}
