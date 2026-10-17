import { formatCurrency } from '../utils/format'
import { formatBsDate } from '../utils/nepaliDate'
import './TransactionItem.css'

/**
 * One row. `onDelete` receives the whole transaction (not just its id) so the
 * list can show what is about to be deleted in its confirmation dialog.
 */
function TransactionItem({ transaction, isEditing, onEdit, onDelete }) {
  const { id, description, amount, type, category, date } = transaction
  const isIncome = type === 'income'
  const bsDate = formatBsDate(date)

  return (
    <li
      className={`transaction-item ${isIncome ? 'is-income' : 'is-expense'}${
        isEditing ? ' is-being-edited' : ''
      }`}
    >
      <span className="transaction-type-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={isIncome ? 'M12 19V5m0 0l-6 6m6-6l6 6' : 'M12 5v14m0 0l-6-6m6 6l6-6'}
          />
        </svg>
      </span>

      <div className="transaction-info">
        <span className="transaction-description">{description}</span>
        <span className="transaction-meta">
          <span className="transaction-category">{category}</span>
          {/* A date outside the BS table has no Nepali form, and there is no
              Gregorian fallback to drop back to, so such a row carries no
              date rather than an empty one. */}
          {bsDate && <span className="transaction-date">{bsDate}</span>}
        </span>
      </div>

      <span className="transaction-amount num">
        {isIncome ? '+' : '-'} {formatCurrency(amount)}
      </span>

      <div className="transaction-actions">
        <button
          className="transaction-edit"
          type="button"
          onClick={() => onEdit(id)}
          // Names the row, so the button isn't just "edit" out of context.
          aria-label={`Edit ${description}`}
          // Tells a screen reader this row is the one loaded in the form.
          aria-pressed={isEditing}
          title="Edit"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>

        <button
          className="transaction-delete"
          type="button"
          // The list asks for confirmation; there is no undo, so a misclick
          // would otherwise lose the row for good.
          onClick={() => onDelete(transaction)}
          aria-label={`Delete ${description}`}
          title="Delete"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>
      </div>
    </li>
  )
}

export default TransactionItem