/**
 * Sums a transaction list into the three headline numbers.
 * Amounts are always positive, so `type` decides which bucket they land in.
 *
 * @returns {{ income: number, expense: number, balance: number }}
 */
export function calculateTotals(transactions) {
  const { income, expense } = transactions.reduce(
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

  return { income, expense, balance: income - expense }
}
