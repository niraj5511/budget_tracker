import { filterByMonth } from './months'
import { previousBsMonthKey } from './nepaliDate'
import { calculateTotals } from './totals'

/**
 * A percentage change needs a non-zero starting point to mean anything - so
 * a previous amount of 0 is reported as `isNew` instead of an infinite or
 * undefined percentage.
 */
function changeFor(previousAmount, currentAmount) {
  if (previousAmount === 0) {
    return {
      percent: null,
      isNew: currentAmount > 0,
      current: currentAmount,
      previous: previousAmount,
    }
  }

  const percent = ((currentAmount - previousAmount) / previousAmount) * 100
  return { percent, isNew: false, current: currentAmount, previous: previousAmount }
}

/**
 * Compares one BS month's income/expense totals against the month
 * immediately before it. Returns null when there's no previous month to
 * compare against - the transaction table's first month, or `month` isn't a
 * real month key - so callers can hide the card rather than show a
 * comparison against nothing.
 */
export function monthComparison(transactions, month) {
  const previousMonth = previousBsMonthKey(month)
  if (!previousMonth) return null

  const current = calculateTotals(filterByMonth(transactions, month))
  const previous = calculateTotals(filterByMonth(transactions, previousMonth))

  return {
    previousMonth,
    income: changeFor(previous.income, current.income),
    expense: changeFor(previous.expense, current.expense),
  }
}