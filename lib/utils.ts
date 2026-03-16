import aliases from "@/data/aliases.json";

const CONFERENCES = [
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
  "Horizon League",
  "Ivy League",
  "MAAC",
  "MAC",
  "MEAC",
  "Mountain West",
  "MVC",
  "NEC",
  "OVC",
  "Patriot",
  "SEC",
  "SoCon",
  "Southland",
  "Summit League",
  "Sun Belt",
  "SWAC",
  "WAC",
  "WCC"
].sort((a, b) => b.length - a.length);

export function normalizeWhitespace(value: string): string {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

export function parseRecord(value: string | null | undefined): [number, number] {
  if (!value) return [0, 0];
  const match = value.match(/(\d+)-(\d+)/);
  if (!match) return [0, 0];
  return [Number(match[1]), Number(match[2])];
}

export function parseSignedNumber(value: string | null | undefined): number | null {
  if (!value) return null;
  if (/EVEN/i.test(value)) return 100;
  const match = value.match(/[+-]?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

export function canonicalTeamName(name: string): string {
  const cleaned = normalizeWhitespace(name)
    .replace(/\bRedHawks\b/gi, "RedHawks")
    .replace(/\bWolfpack\b/gi, "Wolfpack")
    .replace(/\bBison\b/gi, "Bison")
    .replace(/\bBlue Devils\b/gi, "Blue Devils")
    .trim();

  const direct = (aliases as Record<string, string>)[cleaned];
  if (direct) return direct;

  const noMascot = cleaned
    .replace(/\s+(Retrievers|Bison|Longhorns|Wolfpack|Panthers|Mountain Hawks|RedHawks|Horned Frogs|Buckeyes|Trojans|Bulls|Cardinals|Badgers|Saints|Blue Devils|Cowboys|Commodores|Rainbow Warriors|Razorbacks|Spartans|Mustangs|Bears|Pirates|Tigers|Cougars|Bruins|Tar Heels|Volunteers|Wildcats|Fighting Illini|Boilermakers|Huskies|Cavaliers|Hawkeyes|Bulldogs|Gaels|Aggies|Jayhawks|Cyclones|Gauchos|Bruins)$/i, "")
    .trim();

  return (aliases as Record<string, string>)[noMascot] ?? noMascot;
}

export function splitConferenceTail(tail: string): { conference: string; rest: string } | null {
  const normalized = normalizeWhitespace(tail);
  for (const conf of CONFERENCES) {
    if (normalized.startsWith(conf + " ") || normalized === conf) {
      return {
        conference: conf,
        rest: normalized.slice(conf.length).trim()
      };
    }
  }
  return null;
}
