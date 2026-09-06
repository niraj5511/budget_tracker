import { NavLink } from 'react-router-dom'
import './Navbar.css'

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/transactions', label: 'Transactions' },
  { to: '/budget', label: 'Budget' },
]

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span className="navbar-mark" aria-hidden="true">
            Rs
          </span>
          <div className="navbar-brand-text">
            <span className="navbar-title">Budget Tracker</span>
            <span className="navbar-tagline">
              Keep an eye on where your money goes.
            </span>
          </div>
        </div>

        <nav className="navbar-links" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                'navbar-link' + (isActive ? ' is-active' : '')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Navbar