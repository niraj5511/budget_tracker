/**
 * Sums a transaction list into its income and expense totals.
 * Amounts are always positive, so `type` decides which bucket they land in.
 *
 * @returns {{ income: number, expense: number }}
 */
export function calculateTotals(transactions) {
  return transactions.reduce(
    (totals, transaction) => {
      if (transaction.type === 'income') {
        totals.income += transaction.amount
      } else {
        totals.expense += transaction.amount
      }
      return totals
    },
    { income: 0, expense: 0 },
  )
}
