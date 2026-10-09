import React from 'react';
import { formatCurrency } from '../utils/format';
import './BudgetProgressCard.css';

export default function BudgetProgressCard({ categoryName, spent = 0, limit = 0 }) {
  const percentage = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
  
  let statusClass = 'normal';
  if (percentage >= 90) {
    statusClass = 'danger';
  } else if (percentage >= 75) {
    statusClass = 'warning';
  }

  return (
    <div className={`budget-progress-card ${statusClass}`}>
      <div className="budget-card-header">
        <span className="category-title">{categoryName}</span>
        <span className={`percentage-pill ${statusClass}`}>{percentage}%</span>
      </div>

      <div className="budget-metrics">
        <div className="metric-item">
          <span className="metric-label">Spent</span>
          <span className="metric-value">{formatCurrency(spent)}</span>
        </div>
        <div className="metric-divider">/</div>
        <div className="metric-item">
          <span className="metric-label">Limit</span>
          <span className="metric-value limit-val">{formatCurrency(limit)}</span>
        </div>
      </div>

      <div className="progress-track">
        <div 
          className={`progress-fill ${statusClass}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}