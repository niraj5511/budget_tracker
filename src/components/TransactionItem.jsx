import { formatCurrency, formatDate } from '../utils/format'
import './TransactionItem.css'

function TransactionItem({ transaction, onDelete }) {
  const { id, description, amount, type, date } = transaction
  const isIncome = type === 'income'

  return (
    <li className={`transaction-item ${isIncome ? 'is-income' : 'is-expense'}`}>
      <div className="transaction-info">
        <span className="transaction-description">{description}</span>
        <span className="transaction-date">{formatDate(date)}</span>
      </div>

      <div className="transaction-actions">
        <span className="transaction-amount">
          {isIncome ? '+' : '-'} {formatCurrency(amount)}
        </span>
        <button
          className="transaction-delete"
          type="button"
          onClick={() => onDelete(id)}
          // Names the row, so the button isn't just "delete" out of context.
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
