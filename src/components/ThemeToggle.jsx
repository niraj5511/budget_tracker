import { useEffect, useState } from 'react'
import './ThemeToggle.css'

const STORAGE_KEY = 'artha-theme'
// Matches --bg in each theme; colours the browser's own chrome on phones.
const BROWSER_BAR_COLOR = { light: '#f6f7fb', dark: '#0b1020' }

function readSavedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'light' || saved === 'dark' ? saved : null
  } catch {
    // Storage can be blocked (private mode, strict settings).
    return null
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', BROWSER_BAR_COLOR[theme])
}

/**
 * Light / dark switch. The first paint is handled by the inline script in
 * index.html (so a saved dark theme never flashes white); this component
 * reads that result back so React agrees with what is on screen, then owns
 * changes from there.
 *
 * Until the person makes a choice, the theme keeps following the operating
 * system's setting. Once they click, their choice is saved and wins.
 */
function ThemeToggle() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  )

  useEffect(() => {
    if (readSavedTheme()) return

    const query = window.matchMedia('(prefers-color-scheme: dark)')
    function handleSystemChange(event) {
      // A choice made after this listener was attached must still win.
      if (readSavedTheme()) return
      const next = event.matches ? 'dark' : 'light'
      applyTheme(next)
      setTheme(next)
    }

    query.addEventListener('change', handleSystemChange)
    return () => query.removeEventListener('change', handleSystemChange)
  }, [])

  function handleToggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    setTheme(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Not saved, but the switch still works for this visit.
    }
  }

  const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={handleToggle}
      aria-label={label}
      title={label}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        {/* Shows where a click takes you: the sun while dark, the moon while light. */}
        {theme === 'dark' ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </>
        ) : (
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        )}
      </svg>
    </button>
  )
}

export default ThemeToggle