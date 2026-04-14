import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_PREFS, loadPrefs, savePrefs, type DemoPreferences } from '../lib/storage'

function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full px-4 py-2 text-sm font-semibold transition border',
        active
          ? 'bg-slate-900 text-white border-slate-900'
          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div>
        <div className="font-semibold">{label}</div>
        <div className="text-sm text-slate-600">{description}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={[
          'relative h-7 w-12 rounded-full transition',
          checked ? 'bg-emerald-600' : 'bg-slate-300',
        ].join(' ')}
        aria-pressed={checked}
      >
        <span
          className={[
            'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition',
            checked ? 'left-6' : 'left-0.5',
          ].join(' ')}
        />
      </button>
    </div>
  )
}

export function SettingsPage() {
  const [prefs, setPrefs] = useState<DemoPreferences>(() => loadPrefs())

  useEffect(() => {
    savePrefs(prefs)
  }, [prefs])

  const summary = useMemo(() => {
    const safeSearch = prefs.safeSearch === 'on' ? 'On' : 'Off'
    const eligible = prefs.ageEligible ? 'Eligible' : 'Not eligible'
    const heavy = prefs.heavyPornUser ? 'High mature-intent' : 'Low/unknown mature-intent'
    return `${safeSearch} · ${eligible} · ${heavy}`
  }, [prefs])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
          <p className="mt-1 text-slate-600">
            This is a demo profile-level Safe Search default plus a few switches to simulate
            signals.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPrefs(DEFAULT_PREFS)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          Reset demo
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-500">Profile Safe Search default</div>
            <div className="mt-1 text-lg font-extrabold">Safe Search: {prefs.safeSearch === 'on' ? 'On' : 'Off'}</div>
            <div className="mt-1 text-sm text-slate-600">
              This is your account preference. Search may still override to safe results for clearly mainstream queries.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Pill active={prefs.safeSearch === 'on'} onClick={() => setPrefs((p) => ({ ...p, safeSearch: 'on' }))}>
              On (Filter)
            </Pill>
            <Pill active={prefs.safeSearch === 'off'} onClick={() => setPrefs((p) => ({ ...p, safeSearch: 'off' }))}>
              Off
            </Pill>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ToggleRow
          label="Age eligible for mature content"
          description="If off, mature results can never be shown and Safe Search Off becomes unavailable."
          checked={prefs.ageEligible}
          onChange={(next) => setPrefs((p) => ({ ...p, ageEligible: next }))}
        />
        <ToggleRow
          label="Heavy porn user (high mature-intent signal)"
          description="Used only for ambiguous queries when profile Safe Search is Off."
          checked={prefs.heavyPornUser}
          onChange={(next) => setPrefs((p) => ({ ...p, heavyPornUser: next }))}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white">
        <div className="text-sm font-semibold text-white/70">Current demo profile</div>
        <div className="mt-1 text-lg font-extrabold">{summary}</div>
        <div className="mt-2 text-sm text-white/75">
          Tip: Try searching <span className="font-semibold">camping</span>, <span className="font-semibold">porn</span>, and <span className="font-semibold">stepmom</span> on the Search page.
        </div>
      </div>
    </div>
  )
}

