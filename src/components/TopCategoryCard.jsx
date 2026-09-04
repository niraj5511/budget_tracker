import { formatCurrency } from '../utils/format'
import { topCategories } from '../utils/topCategory'
import './TopCategoryCard.css'

function TopCategoryRow({ label, top, tone }) {
  if (!top) {
    return (
      <div className="top-category-row">
        <span className="top-category-label">{label}</span>
        <span className="top-category-empty">Nothing yet</span>
      </div>
    )
  }

  return (
    <div className="top-category-row">
      <span className="top-category-label">{label}</span>
      <div className="top-category-detail">
        <span className={`top-category-name is-${tone}`}>{top.category}</span>
        <span className="top-category-figures">
          {formatCurrency(top.amount)} &middot; {Math.round(top.percent)}%
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
    <section className="top-category-card">
      <h3 className="top-category-title">Biggest categories</h3>
      <div className="top-category-rows">
        <TopCategoryRow label="Expense" top={expense} tone="expense" />
        <TopCategoryRow label="Income" top={income} tone="income" />
      </div>
    </section>
  )
}

export default TopCategoryCard