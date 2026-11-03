import { todayIso } from './format'

// Amounts are floats, so "fully repaid" allows for tiny rounding leftovers.
export const EPSILON = 0.005

/** Adds the derived fields every screen needs to a loan from the API. */
export function describeLoan(loan) {
  const outstanding = Math.max(loan.amount - loan.repaid, 0)
  const settled = outstanding < EPSILON
  const overdue = !settled && Boolean(loan.dueDate) && loan.dueDate < todayIso()
  const percent = Math.min(Math.round((loan.repaid / loan.amount) * 100), 100)
  return { ...loan, outstanding, settled, overdue, percent }
}

/** Totals for the dashboard card. Settled loans count for nothing. */
export function summarizeLoans(loans) {
  const open = loans.map(describeLoan).filter((loan) => !loan.settled)
  const ofDirection = (direction) =>
    open.filter((loan) => loan.direction === direction)
  const total = (rows) => rows.reduce((sum, loan) => sum + loan.outstanding, 0)

  const lent = ofDirection('lent')
  const borrowed = ofDirection('borrowed')

  // Earliest due date first, so overdue records come before upcoming ones.
  const withDueDate = open
    .filter((loan) => loan.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  return {
    toGetBack: total(lent),
    toPayBack: total(borrowed),
    openToGetBack: lent.length,
    openToPayBack: borrowed.length,
    overdueCount: open.filter((loan) => loan.overdue).length,
    withDueDate,
  }
}