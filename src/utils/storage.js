import { DEFAULT_CATEGORY } from '../data/categories'

const STORAGE_KEY = 'budget-tracker:transactions'

/**
 * Guards every stored entry. Without this a hand-edited or half-written
 * record can break things quietly - a string `amount`, for instance, turns
 * the totals' `+` into string concatenation instead of addition.
 *
 * `category` is deliberately not required: records saved before categories
 * existed are still perfectly good data, and `withCategory` fills them in.
 */
export function isValidTransaction(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.description === 'string' &&
    typeof value.amount === 'number' &&
    Number.isFinite(value.amount) &&
    (value.type === 'income' || value.type === 'expense') &&
    typeof value.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.date)
  )
}

/**
 * Labels a record that predates categories. Done here, at the boundary where
 * outside data enters, so nothing downstream has to handle the absence. Any
 * non-empty category is kept as-is, even one no longer on the list - dropping
 * a user's label would be worse than showing an unfamiliar one.
 */
export function withCategory(transaction) {
  return typeof transaction.category === 'string' && transaction.category.trim()
    ? transaction
    : { ...transaction, category: DEFAULT_CATEGORY }
}

/**
 * Reads saved transactions, returning `fallback` when there is nothing
 * usable to read. Never throws: bad storage should not white-screen the app.
 */
export function loadTransactions(fallback) {
  let raw
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    // Reading can throw outright when storage is disabled or blocked.
    return fallback
  }

  // A missing key means a first visit, so seed the fallback. A stored empty
  // array is a deliberate state - the user deleted everything - and must be
  // preserved, or their deletions would undo themselves on every reload.
  if (raw === null) return fallback

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return fallback
  }

  if (!Array.isArray(parsed)) return fallback

  // Keep the good records rather than discarding the whole list for one
  // bad entry.
  return parsed.filter(isValidTransaction).map(withCategory)
}

export function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  } catch (error) {
    // Out of quota, or storage disabled. The app still works for this
    // session; only persistence is lost, so there is nothing to recover.
    console.error('Failed to save transactions:', error)
  }
}

const BUDGETS_STORAGE_KEY = 'budget-tracker:budgets'

/**
 * Budgets are a plain { category: limit } map, not a list - a category only
 * ever has one active limit, so there is nothing an id would identify that
 * the key itself doesn't already.
 */
export function isValidBudgetMap(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.entries(value).every(
      ([category, limit]) =>
        category.trim() && typeof limit === 'number' && Number.isFinite(limit) && limit > 0,
    )
  )
}

/** Reads saved budget limits, returning {} when there is nothing usable. */
export function loadBudgets() {
  let raw
  try {
    raw = localStorage.getItem(BUDGETS_STORAGE_KEY)
  } catch {
    return {}
  }

  if (raw === null) return {}

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return {}
  }

  return isValidBudgetMap(parsed) ? parsed : {}
}

export function saveBudgets(budgets) {
  try {
    localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets))
  } catch (error) {
    // Same as saveTransactions: nothing to recover from a storage failure.
    console.error('Failed to save budgets:', error)
  }
}