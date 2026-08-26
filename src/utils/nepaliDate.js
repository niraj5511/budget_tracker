import {
  BS_EPOCH_AD,
  BS_EPOCH_YEAR,
  BS_MONTH_LENGTHS,
  BS_MONTHS,
} from '../data/bsCalendar'

const MS_PER_DAY = 86400000
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

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

/**
 * Whole days between the epoch and an AD date.
 *
 * `Date.UTC` is safe here even though the rest of the app avoids Date
 * arithmetic: both endpoints are UTC midnights, so their difference is an
 * exact multiple of a day whatever the local zone. The bug that motivated the
 * string-only convention comes from reading a UTC instant back out in local
 * time, and nothing here does that.
 */
function daysFromEpoch(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  const [epochYear, epochMonth, epochDay] = BS_EPOCH_AD.split('-').map(Number)

  return (
    (Date.UTC(year, month - 1, day) -
      Date.UTC(epochYear, epochMonth - 1, epochDay)) /
    MS_PER_DAY
  )
}

/** Last day of an AD month, as a number. '2026-08' -> 31 */
function lastDayOfAdMonth(monthKey) {
  const [year, month] = monthKey.split('-').map(Number)
  // Day 0 of the next month is the last day of this one.
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

/**
 * Converts an ISO AD date to Bikram Sambat.
 *
 * @param {string} isoDate 'YYYY-MM-DD'
 * @returns {{ year: number, month: number, day: number } | null} `month` is
 *   1-12, Baisakh first. Null when the date is malformed or falls outside the
 *   table - callers show the AD date alone rather than a guess.
 */
export function toBs(isoDate) {
  // The form hands over partial and empty values while the user is typing, so
  // the shape is checked rather than assumed.
  if (typeof isoDate !== 'string' || !ISO_DATE.test(isoDate)) return null

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

/** '2026-08-26' -> '10 Bhadra 2083', or null if unconvertible. */
export function formatBsDate(isoDate) {
  const bs = toBs(isoDate)
  if (!bs) return null

  return `${bs.day} ${BS_MONTHS[bs.month - 1]} ${bs.year}`
}

/**
 * The BS months an AD month covers. '2026-08' -> 'Shrawan-Bhadra 2083'
 *
 * A range, not a single name, because a BS month never lines up with an AD
 * one - August 2026 starts in Shrawan and ends in Bhadra. Naming only one of
 * them would quietly mislabel half the rows in the filter.
 */
export function formatBsMonthSpan(monthKey) {
  const lastDay = String(lastDayOfAdMonth(monthKey)).padStart(2, '0')
  const first = toBs(`${monthKey}-01`)
  const last = toBs(`${monthKey}-${lastDay}`)
  if (!first || !last) return null

  const firstMonth = BS_MONTHS[first.month - 1]
  const lastMonth = BS_MONTHS[last.month - 1]

  // Crossing Chaitra into Baisakh changes the year too, so each end needs its
  // own year printed.
  if (first.year !== last.year) {
    return `${firstMonth} ${first.year} - ${lastMonth} ${last.year}`
  }

  return firstMonth === lastMonth
    ? `${firstMonth} ${first.year}`
    : `${firstMonth}-${lastMonth} ${first.year}`
}
