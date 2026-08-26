/**
 * Month filtering, on Nepali months. Keys are 'YYYY-MM' in Bikram Sambat, so
 * they sort lexicographically - the same trick the transaction list uses for
 * dates, and still no Date objects.
 *
 * The grouping follows the calendar the app displays. Bucketing by Gregorian
 * month while labelling in BS would put the tail of Shrawan and the head of
 * Bhadra in one period and then have to call it one or the other.
 */
import { bsMonthKey } from './nepaliDate'

/** The sentinel for "don't filter". Not a real month key, so it can't clash. */
export const ALL_MONTHS = 'all'

/**
 * Every Nepali month with at least one transaction, most recent first.
 *
 * A date outside the BS table has no month key, so it is left out of the
 * options rather than filed under a wrong one. Such rows stay reachable under
 * "All time" - out of the filter, but never out of the list.
 */
export function availableMonths(transactions) {
  const keys = new Set()

  for (const transaction of transactions) {
    const key = bsMonthKey(transaction.date)
    if (key) keys.add(key)
  }

  return [...keys].sort((a, b) => b.localeCompare(a))
}

export function filterByMonth(transactions, month) {
  if (month === ALL_MONTHS) return transactions

  return transactions.filter(
    (transaction) => bsMonthKey(transaction.date) === month,
  )
}
