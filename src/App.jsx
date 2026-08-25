import { useEffect, useState } from 'react'
import BalanceSummary from './components/BalanceSummary'
import CategoryBreakdown from './components/CategoryBreakdown'
import MonthFilter from './components/MonthFilter'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import sampleTransactions from './data/sampleTransactions'
import { formatMonth } from './utils/format'
import { ALL_MONTHS, availableMonths, filterByMonth } from './utils/months'
import { loadTransactions, saveTransactions } from './utils/storage'
import './App.css'

function App() {
  // Passed as a function so storage is read once on mount rather than on
  // every render. The samples are only a first-run seed.
  const [transactions, setTransactions] = useState(() =>
    loadTransactions(sampleTransactions),
  )
  const [selectedMonth, setSelectedMonth] = useState(ALL_MONTHS)

  useEffect(() => {
    saveTransactions(transactions)
  }, [transactions])

  function handleAddTransaction(transaction) {
    // Prepend, so that among transactions sharing a date the newest addition
    // sorts first - Array.prototype.sort is stable, so it keeps this order.
    setTransactions((prev) => [transaction, ...prev])
  }

  function handleDeleteTransaction(id) {
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== id))
  }

  const months = availableMonths(transactions)

  // A month stops being an option once its last transaction is deleted, and
  // adding a transaction in a new month is only visible under "All time".
  // Fall back rather than filter by a month that no longer exists, which
  // would strand the user on an empty list with a blank select.
  const activeMonth =
    selectedMonth !== ALL_MONTHS && !months.includes(selectedMonth)
      ? ALL_MONTHS
      : selectedMonth

  const visibleTransactions = filterByMonth(transactions, activeMonth)

  // ISO date strings compare lexicographically, so this is a plain string
  // sort. Copy first: sort() mutates, and state must not be touched.
  const sortedTransactions = [...visibleTransactions].sort((a, b) =>
    b.date.localeCompare(a.date),
  )

  // "Current balance" is only true of everything; for one month the figure is
  // that month's income minus its expenses, which is a different claim.
  const periodLabel =
    activeMonth === ALL_MONTHS ? 'All time' : formatMonth(activeMonth)
  const balanceLabel =
    activeMonth === ALL_MONTHS ? 'Current balance' : `Net for ${periodLabel}`

  return (
    <div className="app">
      <header className="app-header">
        <h1>Budget Tracker</h1>
        <p className="app-tagline">Keep an eye on where your money goes.</p>
      </header>

      <main>
        {/* With nothing saved there is nothing to filter, and the select
            would offer "All time" as its only option. */}
        {months.length > 0 && (
          <MonthFilter
            months={months}
            value={activeMonth}
            onChange={setSelectedMonth}
          />
        )}
        <BalanceSummary
          transactions={visibleTransactions}
          balanceLabel={balanceLabel}
        />
        <CategoryBreakdown
          transactions={visibleTransactions}
          periodLabel={periodLabel}
        />
        <TransactionForm onAddTransaction={handleAddTransaction} />
        <TransactionList
          transactions={sortedTransactions}
          onDeleteTransaction={handleDeleteTransaction}
        />
      </main>
    </div>
  )
}

export default App
