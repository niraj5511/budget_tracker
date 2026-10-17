import BalanceSummary from '../components/BalanceSummary'
import BudgetOverview from '../components/BudgetOverview'
import CategoryBreakdown from '../components/CategoryBreakdown'
import DashboardEmpty from '../components/DashboardEmpty'
import MonthComparisonCard from '../components/MonthComparisonCard'
import MonthFilter from '../components/MonthFilter'
import MonthlyTrendChart from '../components/MonthlyTrendChart'
import TopCategoryCard from '../components/TopCategoryCard'
import { ALL_MONTHS } from '../utils/months'
import './Dashboard.css'

function Dashboard({
  months,
  activeMonth,
  onMonthChange,
  transactions,
  visibleTransactions,
  periodLabel,
  budgets,
}) {
  // No data at all (first run, or everything deleted): one welcome card, not
  // a wall of empty ones. Checks `transactions`, not `visibleTransactions` -
  // a month with no activity is still a dashboard, just a quiet one.
  if (transactions.length === 0) {
    return (
      <div className="page dashboard">
        <header className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Your money at a glance</p>
          </div>
        </header>

        <DashboardEmpty />
      </div>
    )
  }

  return (
    <div className="page dashboard">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview &middot; {periodLabel}</p>
        </div>

        {/* With nothing saved there is nothing to filter, and the select
            would offer "All time" as its only option. */}
        {months.length > 0 && (
          <div className="dashboard-filter">
            <MonthFilter
              months={months}
              value={activeMonth}
              onChange={onMonthChange}
            />
          </div>
        )}
      </header>

      {/* The headline numbers come first; everything below explains them. */}
      <BalanceSummary transactions={visibleTransactions} />
      <BudgetOverview
        transactions={visibleTransactions}
        budgets={budgets}
        isAllTime={activeMonth === ALL_MONTHS}
      />

      {/* Two small cards share a row. Either may render nothing (no previous
          month, no transactions); the survivor then fills the whole row. */}
      <div className="dashboard-insights">
        <MonthComparisonCard transactions={transactions} activeMonth={activeMonth} />
        <TopCategoryCard transactions={visibleTransactions} />
      </div>

      <MonthlyTrendChart transactions={transactions} activeMonth={activeMonth} />
      <CategoryBreakdown
        transactions={visibleTransactions}
        periodLabel={periodLabel}
      />
    </div>
  )
}

export default Dashboard