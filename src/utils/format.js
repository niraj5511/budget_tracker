// en-IN gives the lakh/crore grouping Nepal uses: 1,25,000.00
const numberFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * 4250.5 -> 'Rs. 4,250.50'; -2400.75 -> '-Rs. 2,400.75'
 * Non-finite input (NaN, Infinity, undefined, ...) falls back to 'Rs. 0.00'
 * rather than leaking a broken string into the UI.
 */
export function formatCurrency(amount) {
  const safeAmount = Number.isFinite(amount) ? amount : 0
  const sign = safeAmount < 0 ? '-' : ''
  return `${sign}Rs. ${numberFormatter.format(Math.abs(safeAmount))}`
}

/**
 * Today as 'YYYY-MM-DD'.
 *
 * Still Gregorian, because that is the storage format - utils/nepaliDate.js
 * converts at the display and entry edges instead. Nothing shows this string
 * to the user.
 */
export function todayIso() {
  // Built from local parts, not `toISOString()`, which returns the UTC date
  // and so rolls over to tomorrow late in the evening in Nepal (UTC+5:45).
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}