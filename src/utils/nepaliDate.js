import {
  BS_EPOCH_AD,
  BS_EPOCH_YEAR,
  BS_MONTH_LENGTHS,
  BS_MONTHS,
} from '../data/bsCalendar'

const MS_PER_DAY = 86400000
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const BS_MONTH_KEY = /^(\d{4})-(\d{2})$/

/**
 * Days elapsed from the epoch to Baisakh 1 of each BS year, indexed the same
 * way as BS_MONTH_LENGTHS. Built once at module load so a single conversion
 * scans 91 and then 12 entries instead of summing the whole table each time.
 */
const yearStarts = []
let elapsed = 0
for (const lengths of BS_MONTH_LENGTHS) {
  yearStarts.push(elapsed)
  elapsed += lengths.reduce((sum, days) => sum + days, 0)
}

/** One past the last day the table can describe. */
const TOTAL_DAYS = elapsed

/** Midnight UTC on the epoch date, the fixed point both directions pivot on. */
const EPOCH_UTC = (() => {
  const [year, month, day] = BS_EPOCH_AD.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
})()

/**
 * True when year/month/day form a real calendar date. `Date.UTC` normalizes
 * out-of-range components instead of rejecting them (month 13 rolls into
 * next year, day 32 rolls into next month), so this checks the constructed
 * date's fields match what was asked for rather than trusting the regex
 * shape alone.
 */
function isRealAdDate(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

/**
 * `Date.UTC` and `toISOString` are safe in this module even though the rest of
 * the app avoids Date arithmetic: every instant here is a UTC midnight, so
 * differences are exact whole days and the ISO string is the intended date.
 * The bug that motivated the string-only convention comes from reading a UTC
 * instant back out in *local* time, which nothing here does.
 */
function daysFromEpoch(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return (Date.UTC(year, month - 1, day) - EPOCH_UTC) / MS_PER_DAY
}

/**
 * Converts an ISO AD date to Bikram Sambat.
 *
 * @param {string} isoDate 'YYYY-MM-DD'
 * @returns {{ year: number, month: number, day: number } | null} `month` is
 *   1-12, Baisakh first. Null when the date is malformed or falls outside the
 *   table, so callers can tell "no Nepali form" from a real date.
 */
export function toBs(isoDate) {
  // Inputs arrive half-typed and empty from form state, so the shape is
  // checked rather than assumed.
  if (typeof isoDate !== 'string' || !ISO_DATE.test(isoDate)) return null

  // The regex only checks digit shape - '2026-13-45' would still match it,
  // so a real-calendar-date check catches what the shape check can't.
  const [adYear, adMonth, adDay] = isoDate.split('-').map(Number)
  if (!isRealAdDate(adYear, adMonth, adDay)) return null

  const offset = daysFromEpoch(isoDate)
  if (!Number.isInteger(offset) || offset < 0 || offset >= TOTAL_DAYS) return null

  let yearIndex = yearStarts.length - 1
  while (yearStarts[yearIndex] > offset) yearIndex -= 1

  let remaining = offset - yearStarts[yearIndex]
  const lengths = BS_MONTH_LENGTHS[yearIndex]
  let monthIndex = 0
  while (remaining >= lengths[monthIndex]) {
    remaining -= lengths[monthIndex]
    monthIndex += 1
  }

  return {
    year: BS_EPOCH_YEAR + yearIndex,
    month: monthIndex + 1,
    day: remaining + 1,
  }
}

/**
 * The inverse of `toBs`. Returns an ISO AD date, or null if that Nepali date
 * does not exist - Mangsir 30 in a 29-day Mangsir, or a year off the table.
 */
export function fromBs(year, month, day) {
  const lengths = BS_MONTH_LENGTHS[year - BS_EPOCH_YEAR]
  if (!lengths || month < 1 || month > 12) return null
  if (day < 1 || day > lengths[month - 1]) return null

  let offset = yearStarts[year - BS_EPOCH_YEAR] + day - 1
  for (let index = 0; index < month - 1; index += 1) {
    offset += lengths[index]
  }

  return new Date(EPOCH_UTC + offset * MS_PER_DAY).toISOString().slice(0, 10)
}

/** How many days a given BS month has: 29-32, or null if off the table. */
export function bsMonthLength(year, month) {
  const lengths = BS_MONTH_LENGTHS[year - BS_EPOCH_YEAR]
  if (!lengths || month < 1 || month > 12) return null

  return lengths[month - 1]
}

/** Every BS year the table covers, most recent first. */
export function bsYears() {
  return BS_MONTH_LENGTHS.map((_, index) => BS_EPOCH_YEAR + index).reverse()
}

/**
 * The BS month a date belongs to, as 'YYYY-MM'. Zero-padded so the keys sort
 * lexicographically, the same trick the transaction list uses for dates.
 * Null for dates with no Nepali form.
 */
export function bsMonthKey(isoDate) {
  const bs = toBs(isoDate)
  if (!bs) return null

  return `${bs.year}-${String(bs.month).padStart(2, '0')}`
}

/** '2026-08-26' -> '10 Bhadra 2083', or null if unconvertible. */
export function formatBsDate(isoDate) {
  const bs = toBs(isoDate)
  if (!bs) return null

  return `${bs.day} ${BS_MONTHS[bs.month - 1]} ${bs.year}`
}

/** '2083-05' -> 'Bhadra 2083' */
export function formatBsMonth(monthKey) {
  const match = BS_MONTH_KEY.exec(monthKey)
  if (!match) return monthKey

  const month = Number(match[2])
  return `${BS_MONTHS[month - 1]} ${match[1]}`
}

/**
 * The BS month key immediately before the given one, e.g. '2083-05' ->
 * '2083-04', and '2083-01' -> '2082-12' across the year boundary. Null when
 * the previous year falls off the table, same as the rest of this module.
 */
export function previousBsMonthKey(monthKey) {
  const match = BS_MONTH_KEY.exec(monthKey)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])

  if (month > 1) return `${year}-${String(month - 1).padStart(2, '0')}`

  const previousYear = year - 1
  if (previousYear < BS_EPOCH_YEAR) return null
  return `${previousYear}-12`
}