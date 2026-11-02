import { useId, useState } from 'react'
import { formatCurrency, todayIso } from '../utils/format'
import { formatBsDate, toBs } from '../utils/nepaliDate'
import NepaliDateField from './NepaliDateField'
import './TransactionForm.css'

// Amounts are floats; allow for a rounding leftover when comparing.
const EPSILON = 0.005

function createEmptyForm() {
  return { amount: '', date: todayIso(), note: '' }
}

function validate(form, outstanding) {
  const errors = {}
  const amount = Number(form.amount)

  if (!form.amount.trim()) {
    errors.amount = 'Enter an amount.'
  } else if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = 'Amount must be greater than 0.'
  } else if (amount > outstanding + EPSILON) {
    errors.amount = `Amount cannot be more than the ${formatCurrency(outstanding)} still outstanding.`
  }

  if (!toBs(form.date)) {
    errors.date = 'Pick a date.'
  }

  if (form.note.length > 500) {
    errors.note = 'Note must be 500 characters or fewer.'
  }

  return errors
}

/**
 * The repayments of one loan: the list, plus a form to add another while
 * something is still outstanding. Both callbacks return promises and throw on
 * failure, so this component can show the error and keep what was typed.
 */
function RepaymentPanel({ loan, onAdd, onDelete }) {
  const uid = useId()
  const [form, setForm] = useState(createEmptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const outstanding = Math.max(loan.amount - loan.repaid, 0)
  const canAdd = outstanding >= EPSILON
  const repayments = [...loan.repayments].sort(
    (a, b) => b.date.localeCompare(a.date) || b.id - a.id,
  )

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function fillRemaining() {
    setForm((prev) => ({ ...prev, amount: String(Math.round(outstanding * 100) / 100) }))
    setErrors((prev) => ({ ...prev, amount: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (saving) return

    const nextErrors = validate(form, outstanding)
    setErrors(nextErrors)
    setError('')
    if (Object.keys(nextErrors).length > 0) return

    setSaving(true)
    try {
      await onAdd(loan.id, {
        amount: Math.round(Number(form.amount) * 100) / 100,
        date: form.date,
        note: form.note.trim() || null,
      })
      setForm(createEmptyForm())
    } catch {
      setError('Could not save. Check that the backend is running and try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(repayment) {
    setError('')
    try {
      await onDelete(loan.id, repayment.id)
    } catch {
      setError('Could not delete. Check that the backend is running and try again.')
    }
  }

  return (
    <div className="repayment-panel">
      {repayments.length > 0 && (
        <ul className="repayment-list">
          {repayments.map((repayment) => {
            const date = formatBsDate(repayment.date) ?? repayment.date
            return (
              <li key={repayment.id} className="repayment-item">
                <div className="repayment-info">
                  <span className="repayment-amount num">
                    {formatCurrency(repayment.amount)}
                  </span>
                  <span className="repayment-meta">
                    {date}
                    {repayment.note ? ` \u00b7 ${repayment.note}` : ''}
                  </span>
                </div>
                <button
                  className="transaction-delete"
                  type="button"
                  onClick={() => handleDelete(repayment)}
                  aria-label={`Delete repayment of ${formatCurrency(repayment.amount)} on ${date}`}
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
              </li>
            )
          })}
        </ul>
      )}

      {canAdd ? (
        <form
          className="repayment-form transaction-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <h3 className="repayment-form-title">
            {loan.direction === 'lent' ? 'Record money received' : 'Record money paid back'}
          </h3>

          <div className="form-grid">
            <div className="form-field form-field--wide">
              <label className="form-label" htmlFor={`${uid}-amount`}>
                Amount
              </label>
              <div className="amount-input-wrap">
                <span className="amount-prefix" aria-hidden="true">
                  Rs.
                </span>
                <input
                  id={`${uid}-amount`}
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.amount)}
                  aria-describedby={errors.amount ? `${uid}-amount-error` : undefined}
                />
              </div>
              <div>
                <button type="button" className="date-chip" onClick={fillRemaining}>
                  Fill remaining ({formatCurrency(outstanding)})
                </button>
              </div>
              {errors.amount && (
                <p className="form-error" id={`${uid}-amount-error`} role="alert">
                  {errors.amount}
                </p>
              )}
            </div>

            <fieldset className="form-field form-field--wide">
              <legend className="form-label">Date (Bikram Sambat)</legend>
              <NepaliDateField
                value={form.date}
                invalid={Boolean(errors.date)}
                describedBy={errors.date ? `${uid}-date-error` : undefined}
                onChange={(date) => {
                  setForm((prev) => ({ ...prev, date }))
                  setErrors((prev) => ({ ...prev, date: undefined }))
                }}
              />
              {errors.date && (
                <p className="form-error" id={`${uid}-date-error`} role="alert">
                  {errors.date}
                </p>
              )}
            </fieldset>

            <div className="form-field form-field--wide">
              <label className="form-label" htmlFor={`${uid}-note`}>
                Note (optional)
              </label>
              <input
                id={`${uid}-note`}
                name="note"
                type="text"
                value={form.note}
                onChange={handleChange}
                aria-invalid={Boolean(errors.note)}
                aria-describedby={errors.note ? `${uid}-note-error` : undefined}
              />
              {errors.note && (
                <p className="form-error" id={`${uid}-note-error`} role="alert">
                  {errors.note}
                </p>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary form-submit" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Add repayment'}
            </button>
          </div>
        </form>
      ) : (
        <p className="repayment-done">Fully repaid. Nothing outstanding.</p>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default RepaymentPanel