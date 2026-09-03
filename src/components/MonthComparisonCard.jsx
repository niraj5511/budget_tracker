import { formatBsMonth } from '../utils/nepaliDate'
import { monthComparison } from '../utils/monthComparison'
import { ALL_MONTHS } from '../utils/months'
import './MonthComparisonCard.css'

function ComparisonRow({ label, change, goodDirection }) {
  const { percent, isNew } = change

  let direction = 'flat'
  if (percent !== null) {
    if (percent > 0) direction = 'up'
    else if (percent < 0) direction = 'down'
  } else if (isNew) {
    direction = 'up'
  }

  // Whether a change is favourable depends on which row it's in - more
  // income is good, more expense isn't, so the same "up" arrow can carry
  // either colour depending on context.
  const isGood = direction === 'flat' ? null : direction === goodDirection

  const changeClass =
    isGood === null ? 'is-flat' : isGood ? 'is-good' : 'is-bad'

  return (
    <div className="comparison-row">
      <span className="comparison-label">{label}</span>
      <span className={`comparison-change ${changeClass}`}>
        <span aria-hidden="true">
          {direction === 'up' && '\u2191'}
          {direction === 'down' && '\u2193'}
          {direction === 'flat' && '\u2192'}
        </span>
        {isNew
          ? 'New this month'
          : percent === null
            ? 'No change'
            : `${Math.abs(Math.round(percent))}%`}
      </span>
    </div>
  )
}

function MonthComparisonCard({ transactions, activeMonth }) {
  if (activeMonth === ALL_MONTHS) return null

  const comparison = monthComparison(transactions, activeMonth)
  if (!comparison) return null

  return (
    <section className="comparison-card">
      <h3 className="comparison-title">
        Vs. {formatBsMonth(comparison.previousMonth)}
      </h3>
      <div className="comparison-rows">
        <ComparisonRow label="Income" change={comparison.income} goodDirection="up" />
        <ComparisonRow label="Expense" change={comparison.expense} goodDirection="down" />
      </div>
    </section>
  )
}

export default MonthComparisonCard