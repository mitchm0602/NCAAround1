# NCAA live app backend

This package provides the backend files for a live NCAA men's basketball matchup app.

## What it does

- `GET /api/teams`
  - Scrapes the current NCAA NET rankings page
  - Attempts to enrich teams with ESPN resume/BPI `SOR` and `SOS`
  - Returns normalized team objects for the frontend

- `GET /api/odds`
  - Scrapes ESPN's current men's college basketball odds board
  - Returns normalized games with spread, total, moneyline, and team records when available

## Sources currently wired

- NCAA NET rankings page
- ESPN men's college basketball odds page
- ESPN men's college basketball BPI resume page

## Notes

- The NCAA NET page currently lists **365** teams, not 362.
- ESPN odds and BPI pages are subject to markup changes.
- Because ESPN pages are not a public supported API for this use case, the parser includes fallback logic and a small alias map.
- Add a cache layer in production. On Vercel, wrap these routes with `revalidate` or edge cache headers.

## Suggested production hardening

- Cache `/api/teams` for 6-12 hours
- Cache `/api/odds` for 5-15 minutes
- Persist latest successful snapshot in KV / Redis
- Add your own injury / venue / rest enrichment route

## Example response shapes

### `/api/teams`

```json
{
  "fetchedAt": "2026-03-16T15:00:00.000Z",
  "source": {
    "net": "NCAA",
    "resume": "ESPN BPI"
  },
  "count": 365,
  "teams": [
    {
      "team": "Duke",
      "conference": "ACC",
      "wins": 32,
      "losses": 2,
      "netRank": 1,
      "sor": 1,
      "sos": 4,
      "quad1Wins": 17,
      "quad1Losses": 2,
      "quad2Wins": 6,
      "quad2Losses": 0,
      "quad3Wins": 2,
      "quad3Losses": 0,
      "quad4Wins": 7,
      "quad4Losses": 0,
      "roadRecord": "10-1",
      "neutralRecord": "7-1",
      "homeRecord": "15-0"
    }
  ]
}
```

### `/api/odds`

```json
{
  "fetchedAt": "2026-03-16T15:00:00.000Z",
  "source": "ESPN",
  "count": 18,
  "games": [
    {
      "teamA": "Siena",
      "teamB": "Duke",
      "recordA": "23-11",
      "recordB": "32-2",
      "spreadFavorite": "Duke",
      "spread": -29.5,
      "total": 136.5,
      "moneylineFavorite": "Duke",
      "moneylineFavoritePrice": -100000,
      "teamAMoneyline": 5000,
      "teamBMoneyline": -100000,
      "startTime": "2026-03-19T18:50:00Z"
    }
  ]
}
```

## Frontend included

This project now also includes a matching Next.js frontend:

- `app/page.tsx` — live matchup UI
- `app/layout.tsx` — app shell
- `app/globals.css` — styling

### Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

The homepage will call:

- `GET /api/teams`
- `GET /api/odds`

and automatically fall back to sample data if either live route fails.
