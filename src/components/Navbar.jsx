import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand Lockup */}
        <div className="brand-lockup">
          <div className="brand-icon-wrapper">
            <svg className="brand-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="brand-name">Artha</span>
        </div>

        {/* Navigation Links */}
        <nav className="app-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/budget" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Budget
          </NavLink>
          <NavLink to="/transactions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Transactions
          </NavLink>
        </nav>
      </div>
    </header>
  );
}