import { formatCurrency } from '../utils/format'
import { topCategories } from '../utils/topCategory'
import './TopCategoryCard.css'

function TopCategoryRow({ label, sideName, top, tone }) {
  if (!top) {
    return (
      <div className="top-category-row">
        <span className="eyebrow">{label}</span>
        <span className="top-category-empty">Nothing yet</span>
      </div>
    )
  }

  const percent = Math.round(top.percent)

  return (
    <div className="top-category-row">
      <span className="eyebrow">{label}</span>

      <div className="top-category-main">
        <span className="top-category-name">{top.category}</span>
        <span className="top-category-amount num">{formatCurrency(top.amount)}</span>
      </div>

      <div className="top-category-meta">
        <div className="top-category-bar" aria-hidden="true">
          <div
            className={`top-category-bar-fill is-${tone}`}
            style={{ width: `${Math.min(Math.max(top.percent, 2), 100)}%` }}
          />
        </div>
        <span className="top-category-share num">
          {percent}% of {sideName}
        </span>
      </div>
    </div>
  )
}

/**
 * Highlights the single biggest expense and income category for whatever
 * transactions the dashboard is currently showing - it inherits the active
 * month filter through its props rather than reading one itself.
 */
function TopCategoryCard({ transactions }) {
  const { expense, income } = topCategories(transactions)

  if (!expense && !income) return null

  return (
    <section className="top-category-card" aria-labelledby="top-category-title">
      <h2 id="top-category-title" className="top-category-title">
        Biggest categories
      </h2>

      <div className="top-category-rows">
        <TopCategoryRow
          label="Top expense"
          sideName="spending"
          top={expense}
          tone="expense"
        />
        <TopCategoryRow
          label="Top income"
          sideName="income"
          top={income}
          tone="income"
        />
      </div>
    </section>
  )
}

export default TopCategoryCard