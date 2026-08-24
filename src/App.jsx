import { useEffect, useState } from 'react'
import BalanceSummary from './components/BalanceSummary'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import sampleTransactions from './data/sampleTransactions'
import { loadTransactions, saveTransactions } from './utils/storage'
import './App.css'

function App() {
  // Passed as a function so storage is read once on mount rather than on
  // every render. The samples are only a first-run seed.
  const [transactions, setTransactions] = useState(() =>
    loadTransactions(sampleTransactions),
  )

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

  // ISO date strings compare lexicographically, so this is a plain string
  // sort. Copy first: sort() mutates, and state must not be touched.
  const sortedTransactions = [...transactions].sort((a, b) =>
    b.date.localeCompare(a.date),
  )

  return (
    <div className="app">
      <header className="app-header">
        <h1>Budget Tracker</h1>
        <p className="app-tagline">Keep an eye on where your money goes.</p>
      </header>

      <main>
        <BalanceSummary transactions={transactions} />
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
