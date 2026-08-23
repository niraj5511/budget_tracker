import TransactionList from './components/TransactionList'
import sampleTransactions from './data/sampleTransactions'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Budget Tracker</h1>
        <p className="app-tagline">Keep an eye on where your money goes.</p>
      </header>

      <main className="app-main">
        <TransactionList transactions={sampleTransactions} />
      </main>
    </div>
  )
}

export default App
