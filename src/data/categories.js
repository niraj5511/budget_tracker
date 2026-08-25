/**
 * Categories are split by type on purpose: 'Rent' is never income and
 * 'Salary' is never an expense, so one shared list would only invite
 * nonsense data. Both sets end in 'Other', which keeps them closed - useful
 * later, when a breakdown chart needs a finite legend.
 */
export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Gift',
  'Other',
]

export const EXPENSE_CATEGORIES = [
  'Food',
  'Rent',
  'Transport',
  'Utilities',
  'Shopping',
  'Health',
  'Entertainment',
  'Education',
  'Other',
]

/**
 * The form's starting value, and the fallback for records saved before
 * categories existed. Deliberately the honest option: defaulting an
 * unlabelled expense to 'Food' would invent data the user never entered.
 */
export const DEFAULT_CATEGORY = 'Other'

export function categoriesFor(type) {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
}
