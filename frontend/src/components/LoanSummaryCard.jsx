import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/format'
import { summarizeLoans } from '../utils/loans'
import { formatBsDate } from '../utils/nepaliDate'
import './LoanSummaryCard.css'

const MAX_DUE_ROWS = 3

/**
 * Dashboard card for Lend / Borrow. Loans are running balances, so this does
 * not follow the month filter. Renders nothing until there is a record.
 */
export default function LoanSummaryCard({ loans }) {
  if (loans.length === 0) return null

  const summary = summarizeLoans(loans)
  const dueRows = summary.withDueDate.slice(0, MAX_DUE_ROWS)
  const hiddenCount = summary.withDueDate.length - dueRows.length
  const openLabel = (count) => `${count} open ${count === 1 ? 'record' : 'records'}`

  return (
    <section className="loan-card" aria-labelledby="loan-card-title">
      <header className="loan-card-header">
        <div>
          <h2 id="loan-card-title" className="loan-card-title">
            Lend / Borrow
          </h2>
          <p className="loan-card-note">All records, not just this month</p>
        </div>
        <div className="loan-card-header-end">
          {summary.overdueCount > 0 && (
            <span className="loan-card-overdue">
              {summary.overdueCount} overdue
            </span>
          )}
          <Link to="/loans" className="loan-card-link">
            View all
          </Link>
        </div>
      </header>

      <div className="loan-card-totals">
        <div className="loan-card-total">
          <span className="loan-card-label">To get back</span>
          <span className="loan-card-value num is-get">
            {formatCurrency(summary.toGetBack)}
          </span>
          <span className="loan-card-meta">{openLabel(summary.openToGetBack)}</span>
        </div>
        <div className="loan-card-total">
          <span className="loan-card-label">To pay back</span>
          <span className="loan-card-value num is-pay">
            {formatCurrency(summary.toPayBack)}
          </span>
          <span className="loan-card-meta">{openLabel(summary.openToPayBack)}</span>
        </div>
      </div>

      {dueRows.length > 0 && (
        <div className="loan-card-due">
          <h3 className="loan-card-due-title">Due dates</h3>
          <ul className="loan-card-due-list">
            {dueRows.map((loan) => {
              const lent = loan.direction === 'lent'
              const due = formatBsDate(loan.dueDate) ?? loan.dueDate
              return (
                <li key={loan.id} className="loan-card-due-item">
                  <div className="loan-card-due-info">
                    <span className="loan-card-due-person">{loan.person}</span>
                    <span className="loan-card-due-meta">
                      {lent ? 'To get back' : 'To pay back'} &middot; Due {due}
                      {loan.overdue && (
                        <span className="loan-card-overdue-tag">Overdue</span>
                      )}
                    </span>
                  </div>
                  <span className="loan-card-due-amount num">
                    {formatCurrency(loan.outstanding)}
                  </span>
                </li>
              )
            })}
          </ul>
          {hiddenCount > 0 && (
            <p className="loan-card-more">
              and {hiddenCount} more with a due date
            </p>
          )}
        </div>
      )}
    </section>
  )
}