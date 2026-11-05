import { DEFAULT_CATEGORY } from '../data/categories'

/**
 * Guards every entry read from a backup file. Without this a hand-edited or
 * half-written record can break things quietly - a string `amount`, for
 * instance, turns the totals' `+` into string concatenation instead of
 * addition.
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