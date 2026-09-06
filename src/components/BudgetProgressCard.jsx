import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/format'
import { budgetProgress } from '../utils/budgetProgress'
import { ALL_MONTHS } from '../utils/months'
import './BudgetProgressCard.css'

function ProgressRow({ row }) {
  const width = Math.min(row.percent, 100)

  return (
    <div className="progress-row">
      <div className="progress-row-top">
        <span className="progress-category">{row.category}</span>
        <span className={`progress-figures${row.isOver ? ' is-over' : ''}`}>
          {formatCurrency(row.spent)} / {formatCurrency(row.limit)}
        </span>
      </div>
      <div className="progress-track">
        <div
          className={`progress-fill${row.isOver ? ' is-over' : ''}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Only meaningful for a single month - limits are monthly, so summing spend
 * across "All time" against one month's limit would flag every budget as
 * blown by month three. Hidden there, same as the comparison card.
 */
function BudgetProgressCard({ transactions, activeMonth, budgets }) {
  if (activeMonth === ALL_MONTHS) return null
  if (Object.keys(budgets).length === 0) {
    return (
      <section className="budget-progress-card">
        <h3 className="budget-progress-title">Budget</h3>
        <p className="budget-progress-empty">
          No limits set yet. <Link to="/budget">Set one up</Link> to track
          spending against a budget.
        </p>
      </section>
    )
  }

  const rows = budgetProgress(transactions, budgets)

  return (
    <section className="budget-progress-card">
      <h3 className="budget-progress-title">Budget</h3>
      <div className="progress-rows">
        {rows.map((row) => (
          <ProgressRow key={row.category} row={row} />
        ))}
      </div>
    </section>
  )
}

export default BudgetProgressCard