import { expensesByCategory } from '../utils/breakdown'
import { formatCurrency } from '../utils/format'
import './CategoryBreakdown.css'

function CategoryBreakdown({ transactions, periodLabel }) {
  const rows = expensesByCategory(transactions)
  const total = rows.reduce((sum, row) => sum + row.amount, 0)

  // Bars are scaled to the largest category rather than to the total, so a
  // small category stays visible instead of collapsing to a hairline. The
  // amount beside each one carries the part-to-whole story.
  const largest = rows.length > 0 ? rows[0].amount : 0
  const scale = largest > 0 ? 100 / largest : 0

  return (
    <section className="breakdown">
      <h2 className="breakdown-title">Spending by category</h2>
      <p className="breakdown-period">{periodLabel}</p>

      {rows.length === 0 ? (
        <p className="breakdown-empty">No spending to break down yet.</p>
      ) : (
        <>
          <ul className="breakdown-rows">
            {rows.map(({ category, amount }) => (
              <li className="breakdown-row" key={category}>
                <div className="breakdown-row-head">
                  <span className="breakdown-category">{category}</span>
                  <span className="breakdown-amount">{formatCurrency(amount)}</span>
                </div>
                {/* The bar restates the amount already printed above it, so
                    there is nothing here for a screen reader to announce. */}
                <span
                  className="breakdown-bar"
                  style={{ width: `${amount * scale}%` }}
                  aria-hidden="true"
                />
              </li>
            ))}
          </ul>

          <p className="breakdown-total">
            <span>Total spent</span>
            <strong>{formatCurrency(total)}</strong>
          </p>
        </>
      )}
    </section>
  )
}

export default CategoryBreakdown
