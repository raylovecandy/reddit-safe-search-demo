export type SafeSearchSetting = 'on' | 'off'

export type DemoPreferences = {
  safeSearch: SafeSearchSetting
  ageEligible: boolean
  heavyPornUser: boolean
}

const KEY = 'rss_demo_preferences_v1'

export const DEFAULT_PREFS: DemoPreferences = {
  safeSearch: 'on',
  ageEligible: true,
  heavyPornUser: false,
}

export function loadPrefs(): DemoPreferences {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_PREFS
    const parsed = JSON.parse(raw) as Partial<DemoPreferences>
    return {
      safeSearch: parsed.safeSearch === 'off' ? 'off' : 'on',
      ageEligible: typeof parsed.ageEligible === 'boolean' ? parsed.ageEligible : true,
      heavyPornUser:
        typeof parsed.heavyPornUser === 'boolean' ? parsed.heavyPornUser : false,
    }
  } catch {
    return DEFAULT_PREFS
  }
}

export function savePrefs(prefs: DemoPreferences) {
  localStorage.setItem(KEY, JSON.stringify(prefs))
}

