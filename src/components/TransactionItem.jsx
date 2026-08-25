import { formatCurrency, formatDate } from '../utils/format'
import './TransactionItem.css'

function TransactionItem({ transaction, isEditing, onEdit, onDelete }) {
  const { id, description, amount, type, category, date } = transaction
  const isIncome = type === 'income'

  return (
    <li
      className={`transaction-item ${isIncome ? 'is-income' : 'is-expense'}${
        isEditing ? ' is-being-edited' : ''
      }`}
    >
      <div className="transaction-info">
        <span className="transaction-description">{description}</span>
        <span className="transaction-meta">
          <span className="transaction-category">{category}</span>
          <span className="transaction-date">{formatDate(date)}</span>
        </span>
      </div>

      <div className="transaction-actions">
        <span className="transaction-amount">
          {isIncome ? '+' : '-'} {formatCurrency(amount)}
        </span>
        <button
          className="transaction-edit"
          type="button"
          onClick={() => onEdit(id)}
          // Names the row, so the button isn't just "edit" out of context.
          aria-label={`Edit ${description}`}
          // Tells a screen reader this row is the one loaded in the form.
          aria-pressed={isEditing}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path
              d="M10.5 2.5l3 3L6 13H3v-3l7.5-7.5z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </button>
        <button
          className="transaction-delete"
          type="button"
          onClick={() => onDelete(id)}
          aria-label={`Delete ${description}`}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>
      </div>
    </li>
  )
}

export default TransactionItem
