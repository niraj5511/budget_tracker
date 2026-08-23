import { formatCurrency, formatDate } from '../utils/format'
import './TransactionItem.css'

function TransactionItem({ transaction }) {
  const { description, amount, type, date } = transaction
  const isIncome = type === 'income'

  return (
    <li className={`transaction-item ${isIncome ? 'is-income' : 'is-expense'}`}>
      <div className="transaction-info">
        <span className="transaction-description">{description}</span>
        <span className="transaction-date">{formatDate(date)}</span>
      </div>
      <span className="transaction-amount">
        {isIncome ? '+' : '-'} {formatCurrency(amount)}
      </span>
    </li>
  )
}

export default TransactionItem
