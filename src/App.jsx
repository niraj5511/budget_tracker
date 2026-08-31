import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import sampleTransactions from './data/sampleTransactions'
import { ALL_MONTHS, availableMonths, filterByMonth } from './utils/months'
import { formatBsMonth } from './utils/nepaliDate'
import { loadTransactions, saveTransactions } from './utils/storage'
import './App.css'

function App() {
  // Passed as a function so storage is read once on mount rather than on
  // every render. The samples are only a first-run seed.
  const [transactions, setTransactions] = useState(() =>
    loadTransactions(sampleTransactions),
  )
  const [selectedMonth, setSelectedMonth] = useState(ALL_MONTHS)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    saveTransactions(transactions)
  }, [transactions])

  // Derived rather than trusted: the row being edited can be deleted from
  // under the form, and looking it up each render means a missing row simply
  // drops the form back to adding instead of leaving a stale id in charge.
  const editingTransaction =
    transactions.find((transaction) => transaction.id === editingId) ?? null

  // The form only reports field values; identity belongs here.
  function handleSubmitTransaction(values) {
    if (editingTransaction) {
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === editingTransaction.id
            ? { ...transaction, ...values }
            : transaction,
        ),
      )
      setEditingId(null)
      return
    }

    // Prepend, so that among transactions sharing a date the newest addition
    // sorts first - Array.prototype.sort is stable, so it keeps this order.
    setTransactions((prev) => [{ id: crypto.randomUUID(), ...values }, ...prev])
  }

  function handleDeleteTransaction(id) {
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== id))
  }

  const months = availableMonths(transactions)

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

  const periodLabel =
    activeMonth === ALL_MONTHS ? 'All time' : formatBsMonth(activeMonth)

  return (
    <div className="app">
      <Navbar />

      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                months={months}
                activeMonth={activeMonth}
                onMonthChange={setSelectedMonth}
                transactions={transactions}
                visibleTransactions={visibleTransactions}
                periodLabel={periodLabel}
              />
            }
          />
          <Route
            path="/transactions"
            element={
              <Transactions
                editingTransaction={editingTransaction}
                onSubmit={handleSubmitTransaction}
                onCancelEdit={() => setEditingId(null)}
                sortedTransactions={sortedTransactions}
                editingId={editingTransaction?.id ?? null}
                // A real toggle, so clicking Edit on the row already being
                // edited backs out - which is what the button's
                // aria-pressed state claims.
                onEditTransaction={(id) =>
                  setEditingId((prev) => (prev === id ? null : id))
                }
                onDeleteTransaction={handleDeleteTransaction}
              />
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App