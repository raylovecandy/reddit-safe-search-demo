type Props = {
  value: 'on' | 'off'
  availableModes: Array<'on' | 'off'>
  defaultValue: 'on' | 'off'
  onChange: (next: 'on' | 'off') => void
}

export function SafeSearchToggle({
  value,
  availableModes,
  defaultValue,
  onChange,
}: Props) {
  const onDisabled = !availableModes.includes('on')
  const offDisabled = !availableModes.includes('off')

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-slate-600">
        <span className="font-semibold text-slate-900">Safe Search</span>
        <span className="text-slate-500"> (this search only)</span>
      </div>

      <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          disabled={onDisabled}
          onClick={() => onChange('on')}
          className={[
            'px-3 py-1 text-sm font-semibold rounded-full transition',
            value === 'on'
              ? 'bg-slate-900 text-white'
              : 'text-slate-700 hover:bg-slate-50',
            onDisabled ? 'opacity-40 cursor-not-allowed' : '',
          ].join(' ')}
        >
          On
        </button>
        <button
          type="button"
          disabled={offDisabled}
          onClick={() => onChange('off')}
          className={[
            'px-3 py-1 text-sm font-semibold rounded-full transition',
            value === 'off'
              ? 'bg-slate-900 text-white'
              : 'text-slate-700 hover:bg-slate-50',
            offDisabled ? 'opacity-40 cursor-not-allowed' : '',
          ].join(' ')}
        >
          Off
        </button>
      </div>

      {value !== defaultValue ? (
        <button
          type="button"
          onClick={() => onChange(defaultValue)}
          className="text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          Reset
        </button>
      ) : null}
    </div>
  )
}

