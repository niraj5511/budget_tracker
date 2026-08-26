import { BS_MONTHS } from '../data/bsCalendar'
import { bsMonthLength, bsYears, fromBs, toBs } from '../utils/nepaliDate'
import './NepaliDateField.css'

// The table's full span, newest first so the current year is near the top.
const YEARS = bsYears()

/**
 * Bikram Sambat date entry, as day / month / year selects.
 *
 * A native `<input type="date">` can only show a Gregorian calendar, so it
 * cannot be used in an app that shows no Gregorian dates. Three selects also
 * sidestep the harder problem: BS months run 29-32 days, so a day list has to
 * come from the table rather than from a rule.
 *
 * `value` in and out is an ISO AD string. That is still the storage format;
 * converting here keeps the rest of the app on one calendar.
 */
function NepaliDateField({ value, invalid, describedBy, onChange }) {
  const bs = toBs(value)
  const dayCount = bs ? bsMonthLength(bs.year, bs.month) : 0

  function change(part, raw) {
    // Unreachable while the form seeds a convertible date, but a null `bs`
    // here would mean spreading undefined into fromBs and silently blanking
    // the field.
    if (!bs) return

    const next = { year: bs.year, month: bs.month, day: bs.day, [part]: Number(raw) }
    // Moving to a shorter month can strand the day past its end - there is no
    // Mangsir 30 in a 29-day Mangsir - so pull it back rather than refuse.
    const day = Math.min(next.day, bsMonthLength(next.year, next.month))

    onChange(fromBs(next.year, next.month, day) ?? '')
  }

  return (
    <div className="nepali-date-field">
      <select
        className="nepali-date-part"
        aria-label="Day"
        aria-invalid={invalid}
        aria-describedby={describedBy}
        value={bs?.day ?? ''}
        onChange={(event) => change('day', event.target.value)}
      >
        {/* Rebuilt per month, since the last day moves between 29 and 32. */}
        {Array.from({ length: dayCount }, (_, index) => index + 1).map((day) => (
          <option key={day} value={day}>
            {day}
          </option>
        ))}
      </select>

      <select
        className="nepali-date-part"
        aria-label="Month"
        aria-invalid={invalid}
        value={bs?.month ?? ''}
        onChange={(event) => change('month', event.target.value)}
      >
        {BS_MONTHS.map((month, index) => (
          <option key={month} value={index + 1}>
            {month}
          </option>
        ))}
      </select>

      <select
        className="nepali-date-part"
        aria-label="Year"
        aria-invalid={invalid}
        value={bs?.year ?? ''}
        onChange={(event) => change('year', event.target.value)}
      >
        {YEARS.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  )
}

export default NepaliDateField
