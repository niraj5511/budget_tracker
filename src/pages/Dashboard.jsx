import BalanceSummary from '../components/BalanceSummary'
import CategoryBreakdown from '../components/CategoryBreakdown'
import MonthComparisonCard from '../components/MonthComparisonCard'
import MonthFilter from '../components/MonthFilter'
import MonthlyTrendChart from '../components/MonthlyTrendChart'
import TopCategoryCard from '../components/TopCategoryCard'

function Dashboard({
  months,
  activeMonth,
  onMonthChange,
  transactions,
  visibleTransactions,
  periodLabel,
}) {
  return (
    <div className="page">
      {/* With nothing saved there is nothing to filter, and the select
          would offer "All time" as its only option. */}
      {months.length > 0 && (
        <MonthFilter
          months={months}
          value={activeMonth}
          onChange={onMonthChange}
        />
      )}
      <MonthComparisonCard transactions={transactions} activeMonth={activeMonth} />
      <MonthlyTrendChart transactions={transactions} activeMonth={activeMonth} />
      <BalanceSummary transactions={visibleTransactions} />
      <TopCategoryCard transactions={visibleTransactions} />
      <CategoryBreakdown
        transactions={visibleTransactions}
        periodLabel={periodLabel}
      />
    </div>
  )
}

export default Dashboard