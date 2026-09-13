import { formatCurrency } from '../utils/format'
import { calculateTotals } from '../utils/totals'
import './BalanceSummary.css'

function BalanceSummary({ transactions }) {
  const { income, expense } = calculateTotals(transactions)

  return (
    <dl className="balance-summary">
      <div className="stat-tile is-income">
        <span className="stat-icon" aria-hidden="true">
          &#8593;
        </span>
        <div>
          <dt className="stat-label">Income</dt>
          <dd className="stat-value is-income">+ {formatCurrency(income)}</dd>
        </div>
      </div>

            <div className="stat-tile is-expense">
        <span className="stat-icon" aria-hidden="true">
          &#8595;
        </span>
        <div>
          <dt className="stat-label">Expense</dt>
          <dd className="stat-value is-expense">- {formatCurrency(expense)}</dd>
        </div>
      </div>

      <div className={`stat-tile ${income - expense >= 0 ? 'is-income' : 'is-expense'}`}>
        <span className="stat-icon" aria-hidden="true">
          &#8776;
        </span>
        <div>
          <dt className="stat-label">Balance</dt>
          <dd className={`stat-value ${income - expense >= 0 ? 'is-income' : 'is-expense'}`}>
            {formatCurrency(income - expense)}
          </dd>
        </div>
      </div>
    </dl>
  )
}

export default BalanceSummary