import CategoryPieChart from './CategoryPieChart'
import { expensesByCategory, incomeByCategory } from '../utils/breakdown'
import './CategoryBreakdown.css'

/**
 * Two donut charts side by side, mirroring how the old spreadsheet kept
 * expense and income in separate blocks - one chart mixing both directions
 * would need its slices to mean two different things.
 */
function CategoryBreakdown({ transactions, periodLabel }) {
  const expenseRows = expensesByCategory(transactions)
  const incomeRows = incomeByCategory(transactions)

  return (
    <section className="breakdown">
      <div className="breakdown-header">
        <h2 className="breakdown-title">Breakdown by category</h2>
        <p className="breakdown-period">{periodLabel}</p>
      </div>

      <div className="breakdown-grid">
        <CategoryPieChart
          title="Expenses"
          rows={expenseRows}
          emptyLabel="No spending to break down yet."
          valueLabel="Total spent"
        />
        <CategoryPieChart
          title="Income"
          rows={incomeRows}
          emptyLabel="No income to break down yet."
          valueLabel="Total earned"
        />
      </div>
    </section>
  )
}

export default CategoryBreakdown