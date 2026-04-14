export type QueryIntent = 'sfw' | 'explicit_nsfw' | 'ambiguous'

const EXPLICIT_NSFw = new Set([
  'porn',
  'porno',
  'blowjob',
  'bj',
  'hentai',
  'milf',
  'xxx',
  'sex',
  'nude',
  'nudes',
  'gonewild',
  'onlyfans',
])

const AMBIGUOUS = new Set([
  'stepmom',
  'stepsis',
  'step sister',
  'step mom',
  'maid',
  'latex',
  'daddy',
  'escort',
  'goth girl',
])

function normalize(q: string) {
  return q.trim().toLowerCase()
}

export function classifyQueryIntent(q: string): { intent: QueryIntent; confidence: number } {
  const n = normalize(q)
  if (!n) return { intent: 'sfw', confidence: 1 }

  // High-precision explicit checks
  for (const token of EXPLICIT_NSFw) {
    if (n.includes(token)) return { intent: 'explicit_nsfw', confidence: 0.95 }
  }

  for (const token of AMBIGUOUS) {
    if (n.includes(token)) return { intent: 'ambiguous', confidence: 0.7 }
  }

  return { intent: 'sfw', confidence: 0.8 }
}

