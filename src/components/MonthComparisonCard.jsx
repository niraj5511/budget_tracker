import { formatCurrency } from '../utils/format'
import { monthComparison } from '../utils/monthComparison'
import { ALL_MONTHS } from '../utils/months'
import { formatBsMonth } from '../utils/nepaliDate'
import './MonthComparisonCard.css'

function ComparisonRow({ label, change, goodDirection, previousName }) {
  const { percent, isNew, current, previous } = change

  // A change that rounds to 0% reads as "no change" rather than "up 0%".
  const rounded = percent === null ? null : Math.round(Math.abs(percent))

  let direction = 'flat'
  if (isNew) direction = 'up'
  else if (rounded) direction = percent > 0 ? 'up' : 'down'

  // Whether a change is favourable depends on which row it's in - more
  // income is good, more expense isn't, so the same "up" arrow can carry
  // either colour depending on context.
  const tone =
    direction === 'flat' ? 'is-flat' : direction === goodDirection ? 'is-good' : 'is-bad'

  let pillText = 'No change'
  let spoken = `${label} unchanged`
  if (isNew) {
    pillText = 'New'
    spoken = `${label} is new this month`
  } else if (direction !== 'flat') {
    pillText = `${rounded}%`
    spoken = `${label} ${direction} ${rounded}%`
  }

  return (
    <div className="comparison-row">
      <div className="comparison-main">
        <span className="eyebrow">{label}</span>
        <span className="comparison-amount num">{formatCurrency(current)}</span>
        <span className="comparison-previous num">
          {previous === 0
            ? `Nothing recorded in ${previousName}`
            : `${formatCurrency(previous)} in ${previousName}`}
        </span>
      </div>

      <span className={`comparison-pill ${tone}`} aria-label={spoken}>
        <span aria-hidden="true">
          {direction === 'up' && '\u2191'}
          {direction === 'down' && '\u2193'}
          {direction === 'flat' && '\u2192'}
        </span>
        <span aria-hidden="true">{pillText}</span>
      </span>
    </div>
  )
}

function MonthComparisonCard({ transactions, activeMonth }) {
  if (activeMonth === ALL_MONTHS) return null

  const comparison = monthComparison(transactions, activeMonth)
  if (!comparison) return null

  const previousLabel = formatBsMonth(comparison.previousMonth)
  const [previousName] = previousLabel.split(' ')

  return (
    <section className="comparison-card" aria-labelledby="comparison-title">
      <h2 id="comparison-title" className="comparison-title">
        Compared with {previousLabel}
      </h2>

      <div className="comparison-rows">
        <ComparisonRow
          label="Income"
          change={comparison.income}
          goodDirection="up"
          previousName={previousName}
        />
        <ComparisonRow
          label="Expense"
          change={comparison.expense}
          goodDirection="down"
          previousName={previousName}
        />
      </div>
    </section>
  )
}

export default MonthComparisonCard