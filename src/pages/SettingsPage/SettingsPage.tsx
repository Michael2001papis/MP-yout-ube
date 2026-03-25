import { useTheme, type ThemeMode } from '../../context/ThemeContext'

function themeDescription(mode: ThemeMode) {
  switch (mode) {
    case 'light':
      return 'Clean and clear for daytime use.'
    case 'dark':
      return 'Optimized for low-light environments.'
    case 'warm':
      return 'Softer, warmer palette to reduce eye strain.'
  }
}

export default function SettingsPage() {
  const { mode, setMode } = useTheme()

  const options: ThemeMode[] = ['light', 'dark', 'warm']

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        Switch visual comfort modes (saved for future visits).
      </p>

      <div className="mt-6 space-y-4">
        <div className="rounded-xl border border-black/10 bg-white p-4 text-sm dark:border-white/10 dark:bg-gray-900/30">
          <div className="font-semibold">Display Modes</div>
          <div className="mt-1 text-gray-600 dark:text-gray-300">
            Light / Dark / Warm. The UI remembers your choice.
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {options.map((m) => {
              const active = mode === m
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={[
                    'rounded-lg border px-3 py-2 text-left transition',
                    active
                      ? 'border-purple-600 bg-purple-50 text-gray-900 dark:border-purple-400 dark:bg-purple-950/40 dark:text-gray-100'
                      : 'border-black/10 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-gray-900/30 dark:text-gray-200 dark:hover:bg-gray-900/50',
                  ].join(' ')}
                >
                  <div className="text-sm font-semibold">
                    {m === 'light' ? 'Light' : m === 'dark' ? 'Dark' : 'Warm'}
                  </div>
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">{themeDescription(m)}</div>
                </button>
              )
            })}
          </div>
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-4 text-sm dark:border-white/10 dark:bg-gray-900/30">
          <div className="font-semibold">Profile settings</div>
          <div className="mt-1 text-gray-600 dark:text-gray-300">Coming in Phase 2.</div>
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-4 text-sm dark:border-white/10 dark:bg-gray-900/30">
          <div className="font-semibold">Change password</div>
          <div className="mt-1 text-gray-600 dark:text-gray-300">Coming in Phase 2.</div>
        </div>
      </div>
    </div>
  )
}

