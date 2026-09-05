import { useState } from 'react'
import { EXPENSE_CATEGORIES } from '../data/categories'
import { formatCurrency } from '../utils/format'
import './Budget.css'

/**
 * One editable row per expense category. Income has no notion of a spending
 * limit, so this deliberately only ever lists EXPENSE_CATEGORIES.
 */
function BudgetRow({ category, limit, onSave }) {
  // Local text, not the committed number - lets the field hold '' or '12.'
  // mid-edit without that half-typed value overwriting the real budget.
  const [value, setValue] = useState(limit ? String(limit) : '')
  const [saved, setSaved] = useState(false)

  function handleBlur() {
    const trimmed = value.trim()

    if (!trimmed) {
      if (limit !== undefined) onSave(category, null)
      return
    }

    const parsed = Number(trimmed)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      // Invalid entry reverts to the last saved value instead of silently
      // keeping bad text in the field.
      setValue(limit ? String(limit) : '')
      return
    }

    onSave(category, Math.round(parsed * 100) / 100)
    setSaved(true)
    setTimeout(() => setSaved(false), 1200)
  }

  return (
    <div className="budget-row">
      <label className="budget-row-label" htmlFor={`budget-${category}`}>
        {category}
      </label>
      <div className="budget-row-input">
        <span className="budget-row-prefix" aria-hidden="true">
          Rs.
        </span>
        <input
          id={`budget-${category}`}
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          placeholder="No limit"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={handleBlur}
        />
      </div>
      {saved && <span className="budget-row-saved">Saved</span>}
    </div>
  )
}

/**
 * Sets a recurring monthly limit per expense category. A limit applies to
 * every month until changed here - there is no per-month override, which
 * keeps this a one-time setup rather than something to revisit monthly.
 */
function Budget({ budgets, onSaveLimit }) {
  const limitCount = Object.keys(budgets).length
  const totalLimit = Object.values(budgets).reduce((sum, limit) => sum + limit, 0)

  return (
    <div className="page">
      <section className="budget-card">
        <div className="budget-header">
          <h2 className="budget-title">Monthly budget limits</h2>
          {limitCount > 0 && (
            <span className="budget-summary">
              {limitCount} categor{limitCount === 1 ? 'y' : 'ies'} &middot;{' '}
              {formatCurrency(totalLimit)} total
            </span>
          )}
        </div>
        <p className="budget-hint">
          Set a limit for any category you want to track. Leave it blank for
          no limit. These apply every month until you change them here.
        </p>

        <div className="budget-rows">
          {EXPENSE_CATEGORIES.map((category) => (
            <BudgetRow
              key={category}
              category={category}
              limit={budgets[category]}
              onSave={onSaveLimit}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Budget