/**
 * Month filtering. Months are handled as 'YYYY-MM' strings so they sort
 * lexicographically, the same trick the transaction list uses for dates -
 * no Date objects, so no timezone surprises.
 */

/** The sentinel for "don't filter". Not a real month key, so it can't clash. */
export const ALL_MONTHS = 'all'

/** '2026-08-05' -> '2026-08' */
export function monthKey(isoDate) {
  return isoDate.slice(0, 7)
}

/** Every month that has at least one transaction, most recent first. */
export function availableMonths(transactions) {
  const keys = new Set(transactions.map((transaction) => monthKey(transaction.date)))
  return [...keys].sort((a, b) => b.localeCompare(a))
}

export function filterByMonth(transactions, month) {
  if (month === ALL_MONTHS) return transactions
  return transactions.filter((transaction) => monthKey(transaction.date) === month)
}
