import TransactionItem from './TransactionItem'
import './TransactionList.css'

function TransactionList({
  transactions,
  editingId,
  onEditTransaction,
  onDeleteTransaction,
  emptyMessage = 'No transactions yet.',
}) {
  return (
    <section
      className="transaction-list-section"
      aria-labelledby="transaction-list-title"
    >
      <div className="transaction-list-header">
        <h2 id="transaction-list-title" className="transaction-list-title">
          Transactions
        </h2>
        {transactions.length > 0 && (
          <span className="transaction-count">{transactions.length}</span>
        )}
      </div>

      {transactions.length === 0 ? (
        <p className="transaction-list-empty">{emptyMessage}</p>
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