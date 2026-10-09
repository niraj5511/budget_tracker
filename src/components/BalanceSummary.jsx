import React from 'react';
import { formatCurrency } from '../utils/format';
import './BalanceSummary.css';

export default function BalanceSummary({ totalBalance, totalIncome, totalExpense }) {
  return (
    <div className="balance-summary-grid">
      {/* Hero Total Balance Card */}
      <div className="balance-hero-card">
        <div className="card-header-row">
          <span className="card-label">Total Balance</span>
          <span className="live-badge">
            <span className="pulse-dot"></span> Live
          </span>
        </div>
        <div className="balance-amount-wrapper">
          <h2 className="hero-amount">{formatCurrency(totalBalance)}</h2>
        </div>
        <div className="card-footer-note">
          <span className="note-text">Updated in real-time from active records</span>
        </div>
      </div>

      {/* Side Stats Container */}
      <div className="balance-side-stats">
        {/* Income Card */}
        <div className="stat-card income-card">
          <div className="stat-icon-wrapper income-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Income</span>
            <span className="stat-value">{formatCurrency(totalIncome)}</span>
          </div>
        </div>

        {/* Expense Card */}
        <div className="stat-card expense-card">
          <div className="stat-icon-wrapper expense-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Expenses</span>
            <span className="stat-value">{formatCurrency(totalExpense)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}