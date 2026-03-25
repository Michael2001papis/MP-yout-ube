import React, { createContext, useContext, useLayoutEffect, useMemo, useState } from 'react'

export type ThemeMode = 'light' | 'dark' | 'warm'

const STORAGE_KEY = 'mp-yout-ube:themeMode'

type ThemeContextValue = {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getDefaultMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'warm') return stored
  } catch {
    // ignore
  }

  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  return 'light'
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement
  root.classList.remove('dark', 'warm')

  if (mode === 'dark') {
    root.classList.add('dark')
  } else if (mode === 'warm') {
    root.classList.add('dark')
    root.classList.add('warm')
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getDefaultMode)

  useLayoutEffect(() => {
    applyTheme(mode)
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // ignore
    }
  }, [mode])

  const value = useMemo<ThemeContextValue>(() => {
    return {
      mode,
      setMode: (next) => setModeState(next),
    }
  }, [mode])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

