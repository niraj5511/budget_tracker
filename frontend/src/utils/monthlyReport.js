import { budgetProgress } from './budgetProgress'
import { expensesByCategory, incomeByCategory } from './breakdown'
import { monthComparison } from './monthComparison'
import { filterByMonth } from './months'
import { calculateTotals } from './totals'

const LARGEST_EXPENSE_COUNT = 5

// A share of the month's total, as a percentage. 0 when there is no total.
const shareOf = (amount, total) => (total > 0 ? (amount / total) * 100 : 0)

/**
 * Everything the monthly report shows for one Bikram Sambat month, built from
 * the same helpers the dashboard uses so the two always agree.
 *
 * @param {object[]} transactions every saved transaction
 * @param {object} budgets category -> monthly limit
 * @param {string} month a 'YYYY-MM' BS key
 * @returns {{
 *   month: string,
 *   transactionCount: number,
 *   income: number,
 *   expense: number,
 *   balance: number,
 *   comparison: object|null,
 *   expenseCategories: {category: string, amount: number, percent: number,
 *     budget: null|{limit: number, spent: number, percent: number, isOver: boolean}}[],
 *   incomeCategories: {category: string, amount: number, percent: number}[],
 *   largestExpenses: {id: string, description: string, amount: number,
 *     category: string, date: string}[],
 * }}
 */
export function buildMonthlyReport(transactions, budgets, month) {
  const inMonth = filterByMonth(transactions, month)
  const { income, expense } = calculateTotals(inMonth)

  // Only categories that have a limit get a budget row.
  const budgetByCategory = new Map(
    budgetProgress(inMonth, budgets).map((row) => [row.category, row]),
  )

  const expenseCategories = expensesByCategory(inMonth).map(
    ({ category, amount }) => ({
      category,
      amount,
      percent: shareOf(amount, expense),
      budget: budgetByCategory.get(category) ?? null,
    }),
  )

  const incomeCategories = incomeByCategory(inMonth).map(
    ({ category, amount }) => ({
      category,
      amount,
      percent: shareOf(amount, income),
    }),
  )

  const largestExpenses = inMonth
    .filter((transaction) => transaction.type === 'expense')
    // Equal amounts: the later date first, so the order is stable.
    .sort((a, b) => b.amount - a.amount || b.date.localeCompare(a.date))
    .slice(0, LARGEST_EXPENSE_COUNT)
    .map(({ id, description, amount, category, date }) => ({
      id,
      description,
      amount,
      category,
      date,
    }))

  return {
    month,
    transactionCount: inMonth.length,
    income,
    expense,
    balance: income - expense,
    comparison: monthComparison(transactions, month),
    expenseCategories,
    incomeCategories,
    largestExpenses,
  }
}