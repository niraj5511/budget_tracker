import { useState } from 'react'
import { todayIso } from '../utils/format'
import './TransactionForm.css'

// A function, not a constant: the default date must be today at the moment
// the form resets, not whenever the module happened to load.
function createEmptyForm() {
  return { description: '', amount: '', type: 'expense', date: todayIso() }
}

function validate({ description, amount, date }) {
  const errors = {}

  if (!description.trim()) {
    errors.description = 'Enter a description.'
  }

  if (!amount.trim()) {
    errors.amount = 'Enter an amount.'
  } else if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    errors.amount = 'Amount must be greater than 0.'
  }

  if (!date) {
    errors.date = 'Pick a date.'
  }

  return errors
}

function TransactionForm({ onAddTransaction }) {
  const [form, setForm] = useState(createEmptyForm)
  const [errors, setErrors] = useState({})

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear this field's error as soon as it's edited, so the message
    // doesn't linger while the user is fixing it.
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onAddTransaction({
      id: crypto.randomUUID(),
      description: form.description.trim(),
      // Round to paisa so a stray '10.999' can't drift the totals.
      amount: Math.round(Number(form.amount) * 100) / 100,
      type: form.type,
      date: form.date,
    })

    setForm(createEmptyForm())
    setErrors({})
  }

  return (
    <form className="transaction-form" onSubmit={handleSubmit} noValidate>
      <h2 className="transaction-form-title">Add transaction</h2>

      <fieldset className="form-field form-field--wide">
        <legend className="form-label">Type</legend>
        <div className="type-toggle">
          <label className="type-option type-option--expense">
            <input
              type="radio"
              name="type"
              value="expense"
              checked={form.type === 'expense'}
              onChange={handleChange}
            />
            <span>Expense</span>
          </label>
          <label className="type-option type-option--income">
            <input
              type="radio"
              name="type"
              value="income"
              checked={form.type === 'income'}
              onChange={handleChange}
            />
            <span>Income</span>
          </label>
        </div>
      </fieldset>

      <div className="form-field form-field--wide">
        <label className="form-label" htmlFor="description">
          Description
        </label>
        <input
          id="description"
          name="description"
          type="text"
          placeholder="e.g. Groceries"
          value={form.description}
          onChange={handleChange}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && (
          <p className="form-error" id="description-error">
            {errors.description}
          </p>
        )}
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="amount">
          Amount (Rs.)
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          placeholder="0.00"
          value={form.amount}
          onChange={handleChange}
          aria-invalid={Boolean(errors.amount)}
          aria-describedby={errors.amount ? 'amount-error' : undefined}
        />
        {errors.amount && (
          <p className="form-error" id="amount-error">
            {errors.amount}
          </p>
        )}
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="date">
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          aria-invalid={Boolean(errors.date)}
          aria-describedby={errors.date ? 'date-error' : undefined}
        />
        {errors.date && (
          <p className="form-error" id="date-error">
            {errors.date}
          </p>
        )}
      </div>

      <button className="form-submit" type="submit">
        Add transaction
      </button>
    </form>
  )
}

export default TransactionForm
