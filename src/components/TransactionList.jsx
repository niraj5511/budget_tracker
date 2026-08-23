import TransactionItem from './TransactionItem'
import './TransactionList.css'

function TransactionList({ transactions }) {
  return (
    <section className="transaction-list-section">
      <h2 className="transaction-list-title">Transactions</h2>

      {transactions.length === 0 ? (
        <p className="transaction-list-empty">No transactions yet.</p>
      ) : (
        <ul className="transaction-list">
          {transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default TransactionList
