import TransactionItem from './TransactionItem'
import './TransactionList.css'

function TransactionList({
  transactions,
  editingId,
  onEditTransaction,
  onDeleteTransaction,
}) {
  return (
    <section className="transaction-list-section">
      <div className="transaction-list-header">
        <h2 className="transaction-list-title">Transactions</h2>
        {transactions.length > 0 && (
          <span className="transaction-count">{transactions.length}</span>
        )}
      </div>

      {transactions.length === 0 ? (
        <p className="transaction-list-empty">No transactions yet.</p>
      ) : (
        <ul className="transaction-list">
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              isEditing={transaction.id === editingId}
              onEdit={onEditTransaction}
              onDelete={onDeleteTransaction}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

export default TransactionList