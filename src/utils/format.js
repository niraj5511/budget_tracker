import { formatBsMonthSpan } from './nepaliDate'

// en-IN gives the lakh/crore grouping Nepal uses: 1,25,000.00
const numberFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const monthFormatter = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
})

/** 4250.5 -> 'Rs. 4,250.50'; -2400.75 -> '-Rs. 2,400.75' */
export function formatCurrency(amount) {
  const sign = amount < 0 ? '-' : ''
  return `${sign}Rs. ${numberFormatter.format(Math.abs(amount))}`
}

/** '2026-08-05' -> '5 Aug 2026' */
export function formatDate(isoDate) {
  // Split the parts by hand: `new Date('2026-08-05')` is parsed as UTC
  // midnight, which shows the previous day in negative-offset timezones.
  const [year, month, day] = isoDate.split('-').map(Number)
  return dateFormatter.format(new Date(year, month - 1, day))
}

/** '2026-08' -> 'August 2026' */
export function formatMonth(monthKey) {
  // Day 1 of the month, built locally for the same reason as formatDate.
  const [year, month] = monthKey.split('-').map(Number)
  return monthFormatter.format(new Date(year, month - 1, 1))
}

/**
 * '2026-08' -> 'Shrawan-Bhadra 2083 · August 2026'
 *
 * Bikram Sambat leads, since that is the calendar the entries are kept in, but
 * the Gregorian month stays: it is what the filter actually groups on, so
 * hiding it would make the two-month BS span look like a mistake.
 */
export function formatMonthLabel(monthKey) {
  const span = formatBsMonthSpan(monthKey)
  const gregorian = formatMonth(monthKey)

  return span ? `${span} · ${gregorian}` : gregorian
}

/** Today as 'YYYY-MM-DD', for the date input's default value. */
export function todayIso() {
  // Built from local parts, not `toISOString()`, which returns the UTC date
  // and so rolls over to tomorrow late in the evening in Nepal (UTC+5:45).
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
