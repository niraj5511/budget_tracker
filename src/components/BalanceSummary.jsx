import { formatCurrency } from '../utils/format'
import { calculateTotals } from '../utils/totals'
import './BalanceSummary.css'

function BalanceSummary({ transactions }) {
  const { income, expense } = calculateTotals(transactions)

  return (
    <dl className="balance-summary">
      <div className="stat-tile">
        <dt className="stat-label">Income</dt>
        <dd className="stat-value is-income">+ {formatCurrency(income)}</dd>
      </div>

      <div className="stat-tile">
        <dt className="stat-label">Expense</dt>
        <dd className="stat-value is-expense">- {formatCurrency(expense)}</dd>
      </div>
    </dl>
  )
}

export default BalanceSummary
