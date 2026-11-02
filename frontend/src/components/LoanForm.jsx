import { useEffect, useRef, useState } from 'react'
import { formatCurrency, todayIso } from '../utils/format'
import { toBs } from '../utils/nepaliDate'
import NepaliDateField from './NepaliDateField'
import './TransactionForm.css'

function createEmptyForm() {
  return {
    direction: 'lent',
    person: '',
    amount: '',
    date: todayIso(),
    hasDue: false,
    dueDate: todayIso(),
    note: '',
  }
}

function createFormState(loan) {
  if (!loan) return createEmptyForm()

  return {
    direction: loan.direction,
    person: loan.person,
    amount: String(loan.amount),
    date: toBs(loan.date) ? loan.date : todayIso(),
    hasDue: Boolean(loan.dueDate),
    dueDate: loan.dueDate && toBs(loan.dueDate) ? loan.dueDate : todayIso(),
    note: loan.note ?? '',
  }
}

function validate(form, repaid) {
  const errors = {}

  if (!form.person.trim()) {
    errors.person = 'Enter a name.'
  } else if (form.person.trim().length > 100) {
    errors.person = 'Name must be 100 characters or fewer.'
  }

  if (!form.amount.trim()) {
    errors.amount = 'Enter an amount.'
  } else if (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) {
    errors.amount = 'Amount must be greater than 0.'
  } else if (Number(form.amount) < repaid) {
    errors.amount = `Amount cannot be less than the ${formatCurrency(repaid)} already repaid.`
  }

  if (!toBs(form.date)) {
    errors.date = 'Pick a date.'
  }

  if (form.hasDue) {
    if (!toBs(form.dueDate)) {
      errors.dueDate = 'Pick a due date.'
    } else if (toBs(form.date) && form.dueDate < form.date) {
      errors.dueDate = 'The due date cannot be before the date.'
    }
  }

  if (form.note.length > 500) {
    errors.note = 'Note must be 500 characters or fewer.'
  }

  return errors
}

// Same top-to-bottom order as the fields on screen.
const ERROR_ORDER = ['person', 'amount', 'date', 'dueDate', 'note']

function focusFirstError(formElement, errors) {
  const key = ERROR_ORDER.find((name) => errors[name])
  if (!key) return

  const target =
    key === 'date'
      ? formElement.querySelector('#loan-date-group .nepali-date-part')
      : key === 'dueDate'
        ? formElement.querySelector('#loan-due-group .nepali-date-part')
        : formElement.querySelector(`#loan-${key}`)
  target?.focus()
}

/**
 * Adds a loan, or edits one when `loan` is supplied. `onSubmit` returns a
 * promise; the form keeps what was typed and shows an error if it rejects.
 * Like TransactionForm, the page gives this a `key` per edited row so it
 * remounts with fresh state.
 */
function LoanForm({ loan, onSubmit, onCancel }) {
  const isEditing = Boolean(loan)
  const repaid = loan?.repaid ?? 0
  const [form, setForm] = useState(() => createFormState(loan))
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [saving, setSaving] = useState(false)
  const formRef = useRef(null)
  const personRef = useRef(null)

  useEffect(() => {
    if (!isEditing) return

    const rect = formRef.current?.getBoundingClientRect()
    const fullyVisible = rect && rect.top >= 0 && rect.bottom <= window.innerHeight
    if (!fullyVisible) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      formRef.current?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'center',
      })
    }
    personRef.current?.focus({ preventScroll: true })
  }, [isEditing])

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), 2500)
    return () => clearTimeout(timer)
  }, [notice])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function handleToggleDue(event) {
    const { checked } = event.target
    setForm((prev) => ({ ...prev, hasDue: checked }))
    setErrors((prev) => ({ ...prev, dueDate: undefined }))
  }

  function handleDateChange(date) {
    setForm((prev) => ({ ...prev, date }))
    setErrors((prev) => ({ ...prev, date: undefined, dueDate: undefined }))
  }

  function handleDueDateChange(dueDate) {
    setForm((prev) => ({ ...prev, dueDate }))
    setErrors((prev) => ({ ...prev, dueDate: undefined }))
  }

  function handleKeyDown(event) {
    if (isEditing && event.key === 'Escape') onCancel()
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (saving) return

    const nextErrors = validate(form, repaid)
    setErrors(nextErrors)
    setSubmitError('')
    if (Object.keys(nextErrors).length > 0) {
      focusFirstError(formRef.current, nextErrors)
      return
    }

    setSaving(true)
    try {
      await onSubmit({
        direction: form.direction,
        person: form.person.trim(),
        amount: Math.round(Number(form.amount) * 100) / 100,
        date: form.date,
        dueDate: form.hasDue ? form.dueDate : null,
        note: form.note.trim() || null,
      })
    } catch {
      setSubmitError(
        'Could not save. Check that the backend is running and try again.',
      )
      setSaving(false)
      return
    }
    setSaving(false)

    // Saving an edit hands control back to the page, which remounts this
    // form empty. Only the add case has to clear up after itself.
    if (!isEditing) {
      setForm(createEmptyForm())
      setErrors({})
      setNotice('Record added.')
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
      <div className="transaction-form-header">
        <div>
          <h2 className="transaction-form-title">
            {isEditing ? 'Edit record' : 'Add record'}
          </h2>
          <p className="transaction-form-hint">
            {isEditing
              ? 'Update the details, then save. Press Esc to cancel.'
              : 'Record money you lent or borrowed.'}
          </p>
        </div>
        {isEditing && <span className="editing-badge">Editing</span>}
      </div>

      <div className="form-grid">
        <fieldset className="form-field form-field--wide">
          <legend className="form-label">Type</legend>
          <div className="type-toggle">
            <label className="type-option type-option--income">
              <input
                type="radio"
                name="direction"
                value="lent"
                checked={form.direction === 'lent'}
                onChange={handleChange}
              />
              <span>I lent</span>
            </label>
            <label className="type-option type-option--expense">
              <input
                type="radio"
                name="direction"
                value="borrowed"
                checked={form.direction === 'borrowed'}
                onChange={handleChange}
              />
              <span>I borrowed</span>
            </label>
          </div>
        </fieldset>

        <div className="form-field form-field--wide">
          <label className="form-label" htmlFor="loan-person">
            {form.direction === 'lent' ? 'Lent to' : 'Borrowed from'}
          </label>
          <input
            id="loan-person"
            name="person"
            type="text"
            ref={personRef}
            placeholder="e.g. Ram"
            value={form.person}
            onChange={handleChange}
            aria-invalid={Boolean(errors.person)}
            aria-describedby={errors.person ? 'loan-person-error' : undefined}
          />
          {errors.person && (
            <p className="form-error" id="loan-person-error" role="alert">
              {errors.person}
            </p>
          )}
        </div>

        <div className="form-field form-field--wide">
          <label className="form-label" htmlFor="loan-amount">
            Amount
          </label>
          <div className="amount-input-wrap">
            <span className="amount-prefix" aria-hidden="true">
              Rs.
            </span>
            <input
              id="loan-amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={form.amount}
              onChange={handleChange}
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={errors.amount ? 'loan-amount-error' : undefined}
            />
          </div>
          {isEditing && repaid > 0 && (
            <p className="transaction-form-hint">
              Already repaid: {formatCurrency(repaid)}
            </p>
          )}
          {errors.amount && (
            <p className="form-error" id="loan-amount-error" role="alert">
              {errors.amount}
            </p>
          )}
        </div>

        <fieldset className="form-field form-field--wide" id="loan-date-group">
          <legend className="form-label">
            {form.direction === 'lent' ? 'Date lent' : 'Date borrowed'} (Bikram Sambat)
          </legend>
          <NepaliDateField
            value={form.date}
            invalid={Boolean(errors.date)}
            describedBy={errors.date ? 'loan-date-error' : undefined}
            onChange={handleDateChange}
          />
          {errors.date && (
            <p className="form-error" id="loan-date-error" role="alert">
              {errors.date}
            </p>
          )}
        </fieldset>

        <fieldset className="form-field form-field--wide" id="loan-due-group">
          <legend className="form-label">Due date (optional)</legend>
          <label className="loan-check">
            <input
              type="checkbox"
              checked={form.hasDue}
              onChange={handleToggleDue}
            />
            <span>Set a due date</span>
          </label>
          {form.hasDue && (
            <NepaliDateField
              value={form.dueDate}
              invalid={Boolean(errors.dueDate)}
              describedBy={errors.dueDate ? 'loan-due-error' : undefined}
              onChange={handleDueDateChange}
            />
          )}
          {errors.dueDate && (
            <p className="form-error" id="loan-due-error" role="alert">
              {errors.dueDate}
            </p>
          )}
        </fieldset>

        <div className="form-field form-field--wide">
          <label className="form-label" htmlFor="loan-note">
            Note (optional)
          </label>
          <input
            id="loan-note"
            name="note"
            type="text"
            placeholder="e.g. For rent"
            value={form.note}
            onChange={handleChange}
            aria-invalid={Boolean(errors.note)}
            aria-describedby={errors.note ? 'loan-note-error' : undefined}
          />
          {errors.note && (
            <p className="form-error" id="loan-note-error" role="alert">
              {errors.note}
            </p>
          )}
        </div>
      </div>

      {submitError && (
        <p className="form-error" role="alert">
          {submitError}
        </p>
      )}

      <div className="form-actions">
        <button className="btn btn-primary form-submit" type="submit" disabled={saving}>
          {saving ? 'Saving...' : isEditing ? 'Save changes' : 'Add record'}
        </button>
        {isEditing && (
          <button className="btn btn-secondary" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>

      <p className="form-notice" role="status">
        {notice}
      </p>
    </form>
  )
}

export default LoanForm