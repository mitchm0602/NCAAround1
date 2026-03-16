import aliases from '../data/aliases.json'

export function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, init)
}

export function normalizeTeamName(name: string) {
  if (!name) return name

  const trimmed = name.trim()
  const map = aliases as Record<string, string>

  return map[trimmed] || trimmed
}
