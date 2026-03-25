export function extractTags(...values: Array<string | undefined | null>): string[] {
  const raw = values
    .filter((v): v is string => typeof v === 'string')
    .join(' ')
    .toLowerCase()

  const words = raw
    .split(/[^a-z0-9]+/g)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3)

  const freq = new Map<string, number>()
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1)

  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w)
}

