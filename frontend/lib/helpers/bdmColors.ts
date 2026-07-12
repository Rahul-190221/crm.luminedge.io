// Per-BDM color for name badges/pills across Lead Center.
// The current team is pinned to exact colors by name; any BDM not in that list falls
// back to a deterministic hash over the same palette so new hires still get a stable,
// distinct-ish color without needing a code change.

type BdmColor = { bg: string; text: string; dot: string }

// `dot` is used where the color needs to stand on its own against a white row
// (dropdown option lists) — for entries whose `text` is white/near-white or too pale
// to read on white, `dot` reuses `bg` instead. Inside the colored badge itself, `text`
// is used for the dot since it's already chosen to contrast against `bg`.
const NAME_COLOR_MAP: Record<string, BdmColor> = {
  'ann milli': { bg: '#3d3d3d', text: '#FFFFFF', dot: '#3d3d3d' }, // Charcoal Gray
  'aroni':     { bg: '#FF1493', text: '#FFFFFF', dot: '#FF1493' }, // Deep Pink
  'bristi':    { bg: '#0854a0', text: '#FFFFFF', dot: '#0854a0' }, // Royal Blue
  'najia':     { bg: '#d0efb6', text: '#4CAF50', dot: '#4CAF50' }, // Tea Green
  'rokan':     { bg: '#713600', text: '#FFE0B2', dot: '#713600' }, // Saddle Brown
  'raka':      { bg: '#0f714a', text: '#FFFFFF', dot: '#0f714a' }, // Sea Green
  'tanha':     { bg: '#bde2f2', text: '#3A6EA5', dot: '#3A6EA5' }, // Baby Blue
}

const PALETTE: BdmColor[] = Object.values(NAME_COLOR_MAP)

function hashName(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 48 + name.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function getBdmColor(name?: string | null): BdmColor {
  const trimmed = (name || '').trim()
  if (!trimmed) return { bg: '#f3f4f6', text: '#6b7280', dot: '#d1d5db' }
  const pinned = NAME_COLOR_MAP[trimmed.toLowerCase()]
  if (pinned) return pinned
  return PALETTE[hashName(trimmed) % PALETTE.length]
}
