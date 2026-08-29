import { bsMonthKey, formatBsMonth } from './nepaliDate'

/**
 * Buckets transactions into income/expense totals per BS month, oldest
 * first (chart reads left-to-right as a timeline). Always built from the
 * full transaction list, not the month-filtered view - a trend of one month
 * has nothing to trend against.
 *
 * A date with no BS form (bsMonthKey returns null) is left out, same as
 * availableMonths does for the filter dropdown.
 */
export function monthlyTrend(transactions) {
  const totals = new Map()

  for (const transaction of transactions) {
    const key = bsMonthKey(transaction.date)
    if (!key) continue

    if (!totals.has(key)) totals.set(key, { income: 0, expense: 0 })
    const bucket = totals.get(key)
    bucket[transaction.type === 'income' ? 'income' : 'expense'] +=
      transaction.amount
  }

  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { income, expense }]) => {
      const [monthName] = formatBsMonth(key).split(' ')
      return { month: monthName, label: formatBsMonth(key), income, expense }
    })
}