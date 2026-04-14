import type { DemoPreferences, SafeSearchSetting } from './storage'
import type { QueryIntent } from './intent'

export type EffectiveMode = 'on' | 'off'

export type Decision = {
  intent: QueryIntent
  intentConfidence: number
  showInlineControl: boolean
  availableModes: EffectiveMode[]
  defaultMode: EffectiveMode
  effectiveMode: EffectiveMode
  reason: string
}

export function decide({
  prefs,
  intent,
  intentConfidence,
  queryOverride,
}: {
  prefs: DemoPreferences
  intent: QueryIntent
  intentConfidence: number
  queryOverride?: SafeSearchSetting
}): Decision {
  const availableModes: EffectiveMode[] = prefs.ageEligible ? ['on', 'off'] : ['on']

  // SFW intent: always safe, no control
  if (intent === 'sfw') {
    return {
      intent,
      intentConfidence,
      showInlineControl: false,
      availableModes,
      defaultMode: 'on',
      effectiveMode: 'on',
      reason: 'SFW intent forces Safe Search On (mainstream safe-by-default).',
    }
  }

  const showInlineControl = true

  // Clamp override by eligibility
  const clampedOverride: EffectiveMode | undefined =
    queryOverride && availableModes.includes(queryOverride) ? queryOverride : undefined

  // Explicit NSFW: default to profile setting, allow query override
  if (intent === 'explicit_nsfw') {
    const profileMode: EffectiveMode =
      prefs.safeSearch === 'off' && availableModes.includes('off') ? 'off' : 'on'
    const effectiveMode: EffectiveMode = clampedOverride ?? profileMode
    return {
      intent,
      intentConfidence,
      showInlineControl,
      availableModes,
      defaultMode: profileMode,
      effectiveMode,
      reason:
        clampedOverride != null
          ? 'Explicit NSFW intent; query override applied (query-scoped).'
          : 'Explicit NSFW intent; profile default applied.',
    }
  }

  // Ambiguous: safer default unless profile=off AND user has high mature intent signal
  const defaultMode: EffectiveMode = (() => {
    if (!prefs.ageEligible) return 'on'
    if (prefs.safeSearch === 'on') return 'on'
    // prefs.safeSearch === 'off'
    return prefs.heavyPornUser ? 'off' : 'on'
  })()

  const effectiveMode = clampedOverride ?? defaultMode

  return {
    intent,
    intentConfidence,
    showInlineControl,
    availableModes,
    defaultMode,
    effectiveMode,
    reason:
      clampedOverride != null
        ? 'Ambiguous intent; query override applied (query-scoped).'
        : defaultMode === 'off'
          ? 'Ambiguous intent; profile is Off and user is heavy porn user → default Off.'
          : 'Ambiguous intent; defaulting safer unless strong mature-intent signal.',
  }
}

