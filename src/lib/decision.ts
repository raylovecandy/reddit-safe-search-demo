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
      showInlineControl: true,
      availableModes,
      defaultMode: profileMode,
      effectiveMode,
      reason:
        clampedOverride != null
          ? 'Explicit NSFW intent; query override applied (query-scoped).'
          : 'Explicit NSFW intent; profile default applied.',
    }
  }

  // Ambiguous:
  // - If profile is On, keep safe and do not show control.
  // - If profile is Off + not heavy user, keep safe and do not show control.
  // - If profile is Off + heavy user, default Off and show control.
  const shouldShowAmbiguousControl =
    prefs.ageEligible && prefs.safeSearch === 'off' && prefs.heavyPornUser

  const defaultMode: EffectiveMode = (() => {
    if (!prefs.ageEligible) return 'on'
    if (prefs.safeSearch === 'on') return 'on'
    // prefs.safeSearch === 'off'
    return prefs.heavyPornUser ? 'off' : 'on'
  })()

  const effectiveMode = shouldShowAmbiguousControl
    ? (clampedOverride ?? defaultMode)
    : defaultMode

  return {
    intent,
    intentConfidence,
    showInlineControl: shouldShowAmbiguousControl,
    availableModes,
    defaultMode,
    effectiveMode,
    reason:
      shouldShowAmbiguousControl && clampedOverride != null
        ? 'Ambiguous intent; heavy-user path with query override applied.'
        : shouldShowAmbiguousControl
          ? 'Ambiguous intent; profile is Off and user is heavy porn user → show control and default Off.'
          : 'Ambiguous intent; safer default with no inline control for this user/profile state.',
  }
}

