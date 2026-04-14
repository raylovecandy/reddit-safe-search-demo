import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { classifyQueryIntent } from '../lib/intent'
import { decide } from '../lib/decision'
import { loadPrefs, type SafeSearchSetting } from '../lib/storage'
import { SafeSearchToggle } from '../components/SafeSearchToggle'

type ResultItem = {
  id: string
  kind: 'subreddit' | 'post'
  title: string
  subtitle: string
  nsfw: boolean
  score: number
}

function makeResults(q: string): { sfw: ResultItem[]; nsfw: ResultItem[] } {
  const query = q.trim() || 'your search'
  const sfw: ResultItem[] = [
    {
      id: 'r1',
      kind: 'subreddit',
      title: 'r/AskReddit',
      subtitle: 'Questions that spark discussion',
      nsfw: false,
      score: 982,
    },
    {
      id: 'r2',
      kind: 'subreddit',
      title: 'r/todayilearned',
      subtitle: `Interesting facts related to “${query}”`,
      nsfw: false,
      score: 771,
    },
    {
      id: 'p1',
      kind: 'post',
      title: `Best beginner tips for “${query}”`,
      subtitle: 'Posted by u/example · 2h ago · 1.2k upvotes',
      nsfw: false,
      score: 642,
    },
    {
      id: 'p2',
      kind: 'post',
      title: `A guide to understanding “${query}”`,
      subtitle: 'Posted by u/example2 · 1d ago · 420 upvotes',
      nsfw: false,
      score: 401,
    },
  ]

  const nsfw: ResultItem[] = [
    {
      id: 'n1',
      kind: 'subreddit',
      title: 'r/gonewild (NSFW)',
      subtitle: 'Adult content community',
      nsfw: true,
      score: 903,
    },
    {
      id: 'n2',
      kind: 'subreddit',
      title: 'r/hentai (NSFW)',
      subtitle: `Mature content related to “${query}”`,
      nsfw: true,
      score: 812,
    },
    {
      id: 'n3',
      kind: 'post',
      title: `NSFW results example for “${query}”`,
      subtitle: 'Posted by u/nsfwaccount · 6h ago · 3.4k upvotes',
      nsfw: true,
      score: 790,
    },
  ]

  return { sfw, nsfw }
}

function Badge({ children, tone }: { children: React.ReactNode; tone: 'safe' | 'warn' | 'nsfw' }) {
  const cls =
    tone === 'safe'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : tone === 'warn'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-rose-50 text-rose-700 border-rose-200'
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${cls}`}>{children}</span>
}

function ResultCard({ item }: { item: ResultItem }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-500">
            {item.kind === 'subreddit' ? 'Subreddit' : 'Post'}
          </div>
          <div className="mt-1 text-base font-extrabold">{item.title}</div>
          <div className="mt-1 text-sm text-slate-600">{item.subtitle}</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {item.nsfw ? <Badge tone="nsfw">NSFW</Badge> : <Badge tone="safe">SFW</Badge>}
          <div className="text-xs font-semibold text-slate-500">{item.score}</div>
        </div>
      </div>
    </div>
  )
}

export function SearchPage() {
  const [prefs] = useState(() => loadPrefs())
  const [params, setParams] = useSearchParams()

  const q = params.get('q') ?? ''
  const overrideParam = params.get('ss') as SafeSearchSetting | null
  const queryOverride: SafeSearchSetting | undefined =
    overrideParam === 'on' || overrideParam === 'off' ? overrideParam : undefined

  const [draft, setDraft] = useState(q)
  useEffect(() => setDraft(q), [q])

  const { intent, confidence } = useMemo(() => classifyQueryIntent(q), [q])
  const decision = useMemo(
    () =>
      decide({
        prefs,
        intent,
        intentConfidence: confidence,
        queryOverride,
      }),
    [prefs, intent, confidence, queryOverride],
  )

  const results = useMemo(() => makeResults(q), [q])
  const visible = decision.effectiveMode === 'on' ? results.sfw : [...results.sfw, ...results.nsfw].sort((a, b) => b.score - a.score)

  function runSearch(nextQ: string) {
    const nq = nextQ.trim()
    const next = new URLSearchParams(params)
    if (nq) next.set('q', nq)
    else next.delete('q')
    // Query override is query-scoped: reset when query changes.
    next.delete('ss')
    setParams(next, { replace: false })
  }

  function setOverride(nextMode: 'on' | 'off') {
    const next = new URLSearchParams(params)
    if (nextMode === decision.defaultMode) next.delete('ss')
    else next.set('ss', nextMode)
    setParams(next, { replace: true })
  }

  const intentLabel =
    decision.intent === 'sfw' ? (
      <Badge tone="safe">SFW intent</Badge>
    ) : decision.intent === 'explicit_nsfw' ? (
      <Badge tone="nsfw">Explicit NSFW intent</Badge>
    ) : (
      <Badge tone="warn">Ambiguous intent</Badge>
    )

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Search</h1>
            <p className="mt-1 text-slate-600">
              Demo of profile Safe Search + query intent + query-scoped override.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">Profile default:</span>{' '}
            <span className="font-semibold">{prefs.safeSearch === 'on' ? 'On' : 'Off'}</span>
            <span className="text-slate-400">·</span>
            <span className="font-semibold text-slate-900">Age:</span>{' '}
            <span className="font-semibold">{prefs.ageEligible ? 'Eligible' : 'Not eligible'}</span>
            <span className="text-slate-400">·</span>
            <span className="font-semibold text-slate-900">Mature intent:</span>{' '}
            <span className="font-semibold">{prefs.heavyPornUser ? 'High' : 'Low/unknown'}</span>
          </div>
        </div>

        <form
          className="mt-4 flex flex-col gap-3 md:flex-row md:items-center"
          onSubmit={(e) => {
            e.preventDefault()
            runSearch(draft)
          }}
        >
          <div className="flex-1">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder='Try: "camping", "porn", "stepmom"'
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none focus:border-slate-400 focus:bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="rounded-2xl bg-orange-600 px-4 py-3 text-sm font-extrabold text-white hover:bg-orange-700"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft('')
                const next = new URLSearchParams(params)
                next.delete('q')
                next.delete('ss')
                setParams(next, { replace: false })
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          {intentLabel}
          <span className="text-sm text-slate-600">
            Confidence: <span className="font-semibold">{Math.round(decision.intentConfidence * 100)}%</span>
          </span>
        </div>
        {decision.showInlineControl ? (
          <SafeSearchToggle
            value={decision.effectiveMode}
            defaultValue={decision.defaultMode}
            availableModes={decision.availableModes}
            onChange={setOverride}
          />
        ) : null}
      </div>

      {q.trim() ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <div className="font-semibold text-slate-900">Decision</div>
          <div className="mt-1">{decision.reason}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={decision.effectiveMode === 'on' ? 'safe' : 'nsfw'}>
              Effective Safe Search: {decision.effectiveMode === 'on' ? 'On' : 'Off'}
            </Badge>
            {queryOverride ? (
              <Badge tone="warn">Override set: {queryOverride}</Badge>
            ) : (
              <Badge tone="safe">No override</Badge>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          Enter a query to see intent-aware behavior.
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-500">
            Results {q.trim() ? <span className="text-slate-900">for “{q.trim()}”</span> : null}
          </div>
          <div className="text-sm text-slate-600">
            Showing <span className="font-semibold">{visible.length}</span> items
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {visible.map((item) => (
            <ResultCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

