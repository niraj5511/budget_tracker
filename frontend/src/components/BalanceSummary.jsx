import { formatCurrency } from '../utils/format'
import { calculateTotals } from '../utils/totals'
import './BalanceSummary.css'

function countByType(transactions, type) {
  return transactions.filter((transaction) => transaction.type === type).length
}

function countLabel(count) {
  return `${count} transaction${count === 1 ? '' : 's'}`
}

/**
 * Headline numbers for whatever transactions it is given (the dashboard
 * passes the month-filtered list). It computes its own totals, so callers
 * only hand over transactions.
 */
export default function BalanceSummary({ transactions = [] }) {
  const { income, expense } = calculateTotals(transactions)
  const balance = income - expense
  const isNegative = balance < 0

  // How much of the income was kept. Only meaningful when there is income.
  const savedPercent = income > 0 ? Math.round((balance / income) * 100) : null

  let note = 'No transactions in this period yet.'
  if (income > 0) {
    note = isNegative
      ? `Spending is ${formatCurrency(-balance)} over income.`
      : `You kept ${savedPercent}% of your income.`
  } else if (expense > 0) {
    note = 'No income recorded in this period.'
  }

  // A negative rate would draw a negative width; the bar just shows "full"
  // in the expense colour instead.
  const barWidth = isNegative ? 100 : Math.min(Math.max(savedPercent ?? 0, 0), 100)

  return (
    <section className="balance-summary" aria-label="Balance summary">
      <div className="balance-hero">
        <span className="eyebrow">Net balance</span>

        <p className={`hero-amount num${isNegative ? ' is-negative' : ''}`}>
          {formatCurrency(balance)}
        </p>

        <div className="hero-footer">
          {income > 0 && (
            <div className="hero-bar" aria-hidden="true">
              <div
                className={`hero-bar-fill${isNegative ? ' is-negative' : ''}`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          )}
          <p className="hero-note">{note}</p>
        </div>
      </div>

      <div className="balance-side-stats">
        <div className="stat-card">
          <span className="stat-icon is-income" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-6 6m6-6l6 6" />
            </svg>
          </span>
          <div className="stat-content">
            <span className="stat-label">Income</span>
            <span className="stat-value num">{formatCurrency(income)}</span>
            <span className="stat-meta">{countLabel(countByType(transactions, 'income'))}</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon is-expense" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-6-6m6 6l6-6" />
            </svg>
          </span>
          <div className="stat-content">
            <span className="stat-label">Expenses</span>
            <span className="stat-value num">{formatCurrency(expense)}</span>
            <span className="stat-meta">{countLabel(countByType(transactions, 'expense'))}</span>
          </div>
        </div>
      </div>
    </section>
  )
}