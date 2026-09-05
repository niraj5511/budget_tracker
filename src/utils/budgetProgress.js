import { expensesByCategory } from './breakdown'

/**
 * Pairs each budgeted category with its actual spend for the given
 * (already period-filtered) transactions. Only categories with a limit set
 * are included - an unbudgeted category has nothing to show progress
 * against. Sorted by percent used, highest first, so the category closest
 * to (or over) its limit surfaces at the top.
 */
export function budgetProgress(transactions, budgets) {
  const spentByCategory = new Map(
    expensesByCategory(transactions).map((row) => [row.category, row.amount]),
  )

  return Object.entries(budgets)
    .map(([category, limit]) => {
      const spent = spentByCategory.get(category) ?? 0
      return {
        category,
        limit,
        spent,
        percent: (spent / limit) * 100,
        isOver: spent > limit,
      }
    })
    .sort((a, b) => b.percent - a.percent)
}