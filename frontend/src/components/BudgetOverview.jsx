import { Link } from 'react-router-dom'
import { budgetProgress } from '../utils/budgetProgress'
import BudgetProgressCard from './BudgetProgressCard'
import './BudgetOverview.css'

/**
 * Dashboard section showing every budgeted category's progress.
 *
 * Limits are monthly, so comparing them with all-time spending would be
 * misleading; in the "All time" view this shows a short note instead of
 * cards. `transactions` should already be filtered to the chosen month.
 */
export default function BudgetOverview({ transactions, budgets, isAllTime }) {
  const rows = budgetProgress(transactions, budgets)
  const overCount = rows.filter((row) => row.isOver).length

  let body
  if (rows.length === 0) {
    body = (
      <div className="budget-overview-empty">
        <p>You haven&rsquo;t set any spending limits yet.</p>
        <Link to="/budget" className="btn btn-secondary">
          Set budgets
        </Link>
      </div>
    )
  } else if (isAllTime) {
    body = (
      <div className="budget-overview-empty">
        <p>
          Limits are monthly, so progress is shown one month at a time. Choose a
          month above to see it.
        </p>
      </div>
    )
  } else {
    body = (
      <div className="budget-overview-grid">
        {rows.map((row) => (
          <BudgetProgressCard key={row.category} {...row} />
        ))}
      </div>
    )
  }

  return (
    <section className="budget-overview" aria-labelledby="budget-overview-title">
      <div className="budget-overview-header">
        <div>
          <h2 id="budget-overview-title" className="budget-overview-title">
            Budget progress
          </h2>
          {!isAllTime && overCount > 0 && (
            <p className="budget-overview-alert">
              {overCount} categor{overCount === 1 ? 'y is' : 'ies are'} over budget
            </p>
          )}
        </div>

        {rows.length > 0 && (
          <Link to="/budget" className="budget-overview-link">
            Manage budgets
          </Link>
        )}
      </div>

      {body}
    </section>
  )
}