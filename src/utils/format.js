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

/** 4250.5 -> 'Rs. 4,250.50' */
export function formatCurrency(amount) {
  return `Rs. ${numberFormatter.format(amount)}`
}

/** '2026-08-05' -> '5 Aug 2026' */
export function formatDate(isoDate) {
  // Split the parts by hand: `new Date('2026-08-05')` is parsed as UTC
  // midnight, which shows the previous day in negative-offset timezones.
  const [year, month, day] = isoDate.split('-').map(Number)
  return dateFormatter.format(new Date(year, month - 1, day))
}
