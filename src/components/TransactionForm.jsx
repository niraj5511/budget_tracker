import { useEffect, useRef, useState } from 'react'
import { categoriesFor, DEFAULT_CATEGORY } from '../data/categories'
import { todayIso } from '../utils/format'
import { toBs } from '../utils/nepaliDate'
import NepaliDateField from './NepaliDateField'
import './TransactionForm.css'

// A function, not a constant: the default date must be today at the moment
// the form resets, not whenever the module happened to load.
function createEmptyForm() {
  return {
    description: '',
    amount: '',
    type: 'expense',
    category: DEFAULT_CATEGORY,
    date: todayIso(),
  }
}

// Inputs hold strings, so a stored amount has to be widened back out.
function createFormState(transaction) {
  if (!transaction) return createEmptyForm()

  return {
    description: transaction.description,
    amount: String(transaction.amount),
    type: transaction.type,
    category: transaction.category,
    // The date field can only express dates the BS table covers. A stored date
    // outside it has no Nepali form to show, so the field starts from today
    // rather than sitting blank and unusable.
    date: toBs(transaction.date) ? transaction.date : todayIso(),
  }
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

  // Not just "is it set": a date the calendar cannot express would save as a
  // row whose date never renders.
  if (!toBs(date)) {
    errors.date = 'Pick a date.'
  }

  return errors
}

/**
 * Adds a transaction, or edits one when `transaction` is supplied. App gives
 * this component a `key` that changes per edited row, so React remounts it
 * with fresh state instead of the component having to sync props into state.
 */
function TransactionForm({ transaction, onSubmit, onCancel }) {
  const isEditing = Boolean(transaction)
  const [form, setForm] = useState(() => createFormState(transaction))
  const [errors, setErrors] = useState({})
  const formRef = useRef(null)
  const descriptionRef = useRef(null)

  
  useEffect(() => {
    if (!isEditing) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    formRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'center',
    })
    // preventScroll, or focus would fight the smooth scroll above.
    descriptionRef.current?.focus({ preventScroll: true })
  }, [isEditing])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      // Switching type swaps the category list underneath, so a selection
      // carried over from the other type may no longer be on offer.
      if (name === 'type' && !categoriesFor(value).includes(next.category)) {
        next.category = DEFAULT_CATEGORY
      }
      return next
    })
    // Clear this field's error as soon as it's edited, so the message
    // doesn't linger while the user is fixing it.
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function handleKeyDown(event) {
    if (isEditing && event.key === 'Escape') onCancel()
  }

  // The date field reports a whole ISO date rather than one field's value, so
  // it gets its own handler instead of going through handleChange.
  function handleDateChange(date) {
    setForm((prev) => ({ ...prev, date }))
    setErrors((prev) => ({ ...prev, date: undefined }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    // Values only - App owns ids and decides whether this replaces a row or
    // becomes a new one.
    onSubmit({
      description: form.description.trim(),
      // Round to paisa so a stray '10.999' can't drift the totals.
      amount: Math.round(Number(form.amount) * 100) / 100,
      type: form.type,
      category: form.category,
      date: form.date,
    })

    // Saving an edit hands control back to App, which remounts this form
    // empty. Only the add case has to clear up after itself.
    if (!isEditing) {
      setForm(createEmptyForm())
      setErrors({})
    }
  }

  return (
    <form
      className={`transaction-form${isEditing ? ' is-editing' : ''}`}
      ref={formRef}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      noValidate
    >
      <h2 className="transaction-form-title">
        {isEditing ? 'Edit transaction' : 'Add transaction'}
      </h2>

      <fieldset className="form-field">
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

      <div className="form-field">
        <label className="form-label" htmlFor="category">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          {categoriesFor(form.type).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field form-field--wide">
        <label className="form-label" htmlFor="description">
          Description
        </label>
        <input
          id="description"
          name="description"
          type="text"
          ref={descriptionRef}
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

      {/* A fieldset, like the type toggle: one label has to cover three
          controls, and a <label for> can only point at one of them. */}
      <fieldset className="form-field">
        <legend className="form-label">Date</legend>
        <NepaliDateField
          value={form.date}
          invalid={Boolean(errors.date)}
          describedBy={errors.date ? 'date-error' : undefined}
          onChange={handleDateChange}
        />
        {errors.date && (
          <p className="form-error" id="date-error">
            {errors.date}
          </p>
        )}
      </fieldset>

      <div className="form-actions">
        <button className="form-submit" type="submit">
          {isEditing ? 'Save changes' : 'Add transaction'}
        </button>
        {isEditing && (
          <button className="form-cancel" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default TransactionForm
