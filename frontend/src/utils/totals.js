/**
 * Sums a transaction list into its income and expense totals.
 * Amounts are always positive, so `type` decides which bucket they land in.
 *
 * Only 'income' and 'expense' are recognized; anything else is skipped
 * rather than silently folded into expense, so a bad/unexpected type
 * value doesn't quietly skew the totals.
 *
 * @returns {{ income: number, expense: number }}
 */
export function calculateTotals(transactions) {
  return transactions.reduce(
    (totals, transaction) => {
      if (transaction.type === 'income') {
        totals.income += transaction.amount
      } else if (transaction.type === 'expense') {
        totals.expense += transaction.amount
      }
      return totals
    },
    { income: 0, expense: 0 },
  )
}