import { budgetProgress } from './budgetProgress'
import { filterByMonth } from './months'
import { bsMonthKey } from './nepaliDate'

/**
 * What saving this expense would do to its category's monthly budget.
 *
 * Counts every other expense in the same Bikram Sambat month as the draft's
 * date, adds the draft, and reuses budgetProgress() for the maths. The levels
 * match the dashboard cards: 75% warning, 90% danger, over the limit is over.
 *
 * @param {object} draft the form values: { type, category, amount, date }
 * @param {object[]} transactions every saved transaction
 * @param {object} budgets category -> monthly limit
 * @param {number|string|undefined} editingId the row being edited, so its old
 *   amount is not counted twice
 * @returns {null|{level: 'warning'|'danger'|'over', category: string,
 *   spent: number, limit: number, percent: number}}
 */
export function budgetWarning(draft, transactions, budgets, editingId) {
  if (draft.type !== 'expense') return null

  const limit = budgets[draft.category]
  if (limit == null) return null

  const amount = Number(draft.amount)
  if (!(amount > 0)) return null

  const month = bsMonthKey(draft.date)
  if (!month) return null

  const others = transactions.filter((t) => t.id !== editingId)
  const thisMonth = filterByMonth(others, month)
  const withDraft = [
    ...thisMonth,
    { type: 'expense', category: draft.category, amount, date: draft.date },
  ]

  const [row] = budgetProgress(withDraft, { [draft.category]: limit })

  let level = null
  if (row.isOver) level = 'over'
  else if (row.percent >= 90) level = 'danger'
  else if (row.percent >= 75) level = 'warning'
  if (!level) return null

  return { level, ...row }
}