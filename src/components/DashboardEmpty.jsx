import { Link } from 'react-router-dom'
import './DashboardEmpty.css'

/**
 * Shown instead of the dashboard cards when there are no transactions at all.
 * Every card would otherwise render its own empty message - a balance of zero,
 * an empty chart, an empty breakdown - which reads as a broken page rather
 * than a new one.
 */
function DashboardEmpty() {
  return (
    <section className="dashboard-empty" aria-labelledby="dashboard-empty-title">
      <span className="dashboard-empty-icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          focusable="false"
        >
          <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
      </span>

      <h2 id="dashboard-empty-title" className="dashboard-empty-title">
        Nothing to show yet
      </h2>
      <p className="dashboard-empty-text">
        Add your first income or expense and your balance, charts and budget
        progress will appear here.
      </p>

      <div className="dashboard-empty-actions">
        <Link to="/transactions" className="btn btn-primary">
          Add a transaction
        </Link>
        <Link to="/budget" className="btn btn-secondary">
          Set budgets
        </Link>
      </div>
    </section>
  )
}

export default DashboardEmpty