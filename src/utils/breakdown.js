import { DEFAULT_CATEGORY } from '../data/categories'

/**
 * Totals expenses per category, largest first.
 *
 * Income is deliberately excluded: "where does my money go" is an expense
 * question, and one bar chart cannot answer both directions without the bars
 * meaning two different things.
 */
export function expensesByCategory(transactions) {
  const totals = new Map()

  for (const transaction of transactions) {
    if (transaction.type !== 'expense') continue
    // Guard the key, not just the display: an absent category would merge
    // into a single nameless bar rather than simply render blank.
    const category = transaction.category || DEFAULT_CATEGORY
    totals.set(category, (totals.get(category) ?? 0) + transaction.amount)
  }

  return [...totals]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
}
