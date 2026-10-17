import { expensesByCategory, incomeByCategory } from './breakdown'

/**
 * The single largest category for one side of the ledger, plus its share of
 * that side's total. Both breakdown functions already sort largest-first,
 * so the top row is just rows[0] - this only adds the percentage and the
 * empty-period guard.
 *
 * @param {{ category: string, amount: number }[]} rows
 * @returns {{ category: string, amount: number, percent: number } | null}
 */
function topOf(rows) {
  if (rows.length === 0) return null

  const total = rows.reduce((sum, row) => sum + row.amount, 0)
  const [{ category, amount }] = rows

  return {
    category,
    amount,
    // total is never 0 here: rows.length > 0 guarantees at least one
    // positive amount contributed to it.
    percent: (amount / total) * 100,
  }
}

/**
 * Top expense and top income category for whatever transaction list is
 * passed in - callers filter to the active period first, so this follows
 * the same month filter as the rest of the dashboard rather than having an
 * opinion of its own.
 *
 * @param {object[]} transactions
 * @returns {{
 *   expense: { category: string, amount: number, percent: number } | null,
 *   income: { category: string, amount: number, percent: number } | null
 * }}
 */
export function topCategories(transactions) {
  return {
    expense: topOf(expensesByCategory(transactions)),
    income: topOf(incomeByCategory(transactions)),
  }
}