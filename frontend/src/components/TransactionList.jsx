import { useRef, useState } from 'react'
import { formatCurrency } from '../utils/format'
import { formatBsDate } from '../utils/nepaliDate'
import ConfirmDialog from './ConfirmDialog'
import TransactionItem from './TransactionItem'
import './TransactionList.css'

function TransactionList({
  transactions,
  editingId,
  onEditTransaction,
  onDeleteTransaction,
  emptyMessage = 'No transactions yet.',
}) {
  // The row waiting for a yes/no. One dialog serves the whole list, instead
  // of every row carrying its own.
  const [pendingDelete, setPendingDelete] = useState(null)
  const titleRef = useRef(null)

  function handleConfirmDelete() {
    if (!pendingDelete) return

    onDeleteTransaction(pendingDelete.id)
    setPendingDelete(null)
    // The row that opened the dialog is gone, so focus would otherwise fall
    // back to the top of the page. The list heading is the nearest stable spot.
    titleRef.current?.focus()
  }

  const pendingDate = pendingDelete ? formatBsDate(pendingDelete.date) : null

  return (
    <section
      className="transaction-list-section"
      aria-labelledby="transaction-list-title"
    >
      <div className="transaction-list-header">
        <h2
          id="transaction-list-title"
          className="transaction-list-title"
          ref={titleRef}
          tabIndex={-1}
        >
          Transaction history
        </h2>
        {transactions.length > 0 && (
          <span className="transaction-count">{transactions.length}</span>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="transaction-list-empty">
          <svg
            className="transaction-list-empty-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M8 6h13M8 12h13M8 18h13" />
            <path d="M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <ul className="transaction-list">
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              isEditing={transaction.id === editingId}
              onEdit={onEditTransaction}
              onDelete={setPendingDelete}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this transaction?"
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      >
        {pendingDelete && (
          <>
            <p className="delete-summary">
              <strong>{pendingDelete.description}</strong>
              <span className="num">
                {pendingDelete.type === 'income' ? '+' : '-'}{' '}
                {formatCurrency(pendingDelete.amount)}
              </span>
              <span>
                {pendingDelete.category}
                {pendingDate ? ` \u00b7 ${pendingDate}` : ''}
              </span>
            </p>
            <p>This can&rsquo;t be undone.</p>
          </>
        )}
      </ConfirmDialog>
    </section>
  )
}

export default TransactionList