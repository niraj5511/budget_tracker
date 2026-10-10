import { formatCurrency } from '../utils/format'
import './BudgetProgressCard.css'

/**
 * One category's spend against its monthly limit. Takes a row as returned by
 * budgetProgress() - `<BudgetProgressCard {...row} />` - so the maths lives in
 * one place (utils/budgetProgress.js) and this component only presents it.
 */
export default function BudgetProgressCard({
  category,
  spent = 0,
  limit = 0,
  percent = 0,
  isOver = false,
}) {
  const shownPercent = Math.round(percent)
  // The bar stops at full; the pill still says 112% so overspend isn't hidden.
  const barWidth = Math.min(Math.max(percent, 0), 100)

  let status = 'normal'
  if (isOver || percent >= 90) status = 'danger'
  else if (percent >= 75) status = 'warning'

  return (
    <article className={`budget-progress-card ${status}`}>
      <header className="bpc-header">
        <h3 className="bpc-category">{category}</h3>
        <span className={`bpc-pill ${status}`}>{shownPercent}%</span>
      </header>

      <p className="bpc-amount num">
        <span className="bpc-spent">{formatCurrency(spent)}</span>
        <span className="bpc-limit"> of {formatCurrency(limit)}</span>
      </p>

      <div
        className="bpc-track"
        role="progressbar"
        aria-label={`${category} budget used`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(shownPercent, 100)}
      >
        <div className={`bpc-fill ${status}`} style={{ width: `${barWidth}%` }} />
      </div>

      <p className={`bpc-footer num${isOver ? ' is-over' : ''}`}>
        {isOver
          ? `${formatCurrency(spent - limit)} over budget`
          : `${formatCurrency(limit - spent)} left`}
      </p>
    </article>
  )
}