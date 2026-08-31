import TransactionForm from '../components/TransactionForm'
import TransactionList from '../components/TransactionList'

function Transactions({
  editingTransaction,
  onSubmit,
  onCancelEdit,
  sortedTransactions,
  editingId,
  onEditTransaction,
  onDeleteTransaction,
}) {
  return (
    <div className="page">
      {/* The key is the mechanism, not decoration: changing it remounts the
          form so its fields reload from the new row, instead of the form
          having to copy props into state and keep them in sync. */}
      <TransactionForm
        key={editingTransaction?.id ?? 'new'}
        transaction={editingTransaction}
        onSubmit={onSubmit}
        onCancel={onCancelEdit}
      />
      <TransactionList
        transactions={sortedTransactions}
        editingId={editingId}
        onEditTransaction={onEditTransaction}
        onDeleteTransaction={onDeleteTransaction}
      />
    </div>
  )
}

export default Transactions