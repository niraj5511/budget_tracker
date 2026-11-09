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

/**
 * The categories on offer for a type: the built-in ones, then the user's own
 * sorted by name, with 'Other' kept last. `custom` is the list from the
 * server: [{ id, type, name }].
 */
export function categoriesFor(type, custom = []) {
  const builtIn = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const own = custom
    .filter((category) => category.type === type)
    .map((category) => category.name)
    .sort((a, b) => a.localeCompare(b))
  return [
    ...builtIn.filter((name) => name !== DEFAULT_CATEGORY),
    ...own,
    DEFAULT_CATEGORY,
  ]
}
