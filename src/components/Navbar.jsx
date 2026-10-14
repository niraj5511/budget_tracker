import { NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import './Navbar.css'

// Icons are 24x24 stroke paths; NavLink adds the `active` class and
// aria-current="page" on its own, so no className function is needed.
const NAV_ITEMS = [
  {
    to: '/',
    label: 'Dashboard',
    end: true,
    icon: (
      <>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </>
    ),
  },
  {
    to: '/budget',
    label: 'Budget',
    icon: (
      <>
        <path d="M21 12a9 9 0 1 1-9-9" />
        <path d="M12 3v9h9" />
      </>
    ),
  },
  {
    to: '/transactions',
    label: 'Transactions',
    icon: (
      <>
        <path d="M8 6h13M8 12h13M8 18h13" />
        <path d="M3 6h.01M3 12h.01M3 18h.01" />
      </>
    ),
  },
]

export default function Navbar() {
  return (
    <header className="app-header">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <div className="header-inner">
        <NavLink to="/" end className="brand-lockup" aria-label="Artha, go to dashboard">
          <span className="brand-icon-wrapper" aria-hidden="true">
            <svg className="brand-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
          <span className="brand-name">Artha</span>
        </NavLink>

        <div className="header-right">
          <nav className="app-nav" aria-label="Primary">
            {NAV_ITEMS.map(({ to, label, end, icon }) => (
              <NavLink key={to} to={to} end={end} className="nav-item">
                <svg
                  className="nav-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  {icon}
                </svg>
                <span className="nav-label">{label}</span>
              </NavLink>
            ))}
          </nav>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}