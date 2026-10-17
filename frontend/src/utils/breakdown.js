import { DEFAULT_CATEGORY } from '../data/categories'

/**
 * Totals one transaction type per category, largest first. Shared by
 * expensesByCategory and incomeByCategory so both charts group and sort the
 * same way.
 */
function categoryTotals(transactions, type) {
  const totals = new Map()

  for (const transaction of transactions) {
    if (transaction.type !== type) continue
    // Guard the key, not just the display: an absent category would merge
    // into a single nameless slice rather than simply render blank.
    const category = transaction.category || DEFAULT_CATEGORY
    totals.set(category, (totals.get(category) ?? 0) + transaction.amount)
  }

  return [...totals]
    .map(([category, amount]) => ({ category, amount }))
    // Ties (equal amounts) fall back to category name, so the order is
    // deterministic instead of depending on transaction insertion order.
    .sort((a, b) => b.amount - a.amount || a.category.localeCompare(b.category))
}

/** Totals expenses per category, largest first. */
export function expensesByCategory(transactions) {
  return categoryTotals(transactions, 'expense')
}

/** Totals income per category, largest first. */
export function incomeByCategory(transactions) {
  return categoryTotals(transactions, 'income')
}