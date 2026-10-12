import { BS_MONTHS } from "../data/bsCalendar";
import { todayIso } from "../utils/format";
import { bsMonthLength, bsYears, fromBs, toBs } from "../utils/nepaliDate";
import "./NepaliDateField.css";

// The table's full span, newest first so the current year is near the top.
const YEARS = bsYears();

// Local parts, not toISOString(), which is the UTC date and rolls over to
// the wrong day late in the evening in Nepal (UTC+5:45). Same reasoning as
// todayIso() in utils/format.
function isoDaysAgo(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Bikram Sambat date entry, as day / month / year selects plus Today and
 * Yesterday shortcuts - most entries are for one of those two, and picking
 * three selects for them every time is the slow path.
 *
 * A native `<input type="date">` can only show a Gregorian calendar, so it
 * cannot be used in an app that shows no Gregorian dates. Three selects also
 * sidestep the harder problem: BS months run 29-32 days, so a day list has to
 * come from the table rather than from a rule.
 *
 * `value` in and out is an ISO AD string. That is still the storage format;
 * converting here keeps the rest of the app on one calendar.
 *
 * The caller supplies the accessible group name (TransactionForm wraps this
 * in a <fieldset> with a legend), so no second group label is added here -
 * screen readers would otherwise announce the name twice.
 */
function NepaliDateField({ value, invalid, describedBy, onChange }) {
  const bs = toBs(value);
  const dayCount = bs ? bsMonthLength(bs.year, bs.month) : 0;

  // Computed per render, so they stay right if the page is left open past
  // midnight. A day outside the calendar table has no BS form, so it gets
  // no shortcut rather than one that would blank the field.
  const shortcuts = [
    { label: "Today", iso: todayIso() },
    { label: "Yesterday", iso: isoDaysAgo(1) },
  ].filter((shortcut) => toBs(shortcut.iso));

  function change(part, raw) {
    // Unreachable while the form seeds a convertible date, but a null `bs`
    // here would mean spreading undefined into fromBs and silently blanking
    // the field.
    if (!bs) return;

    const next = {
      year: bs.year,
      month: bs.month,
      day: bs.day,
      [part]: Number(raw),
    };
    // Moving to a shorter month can strand the day past its end - there is no
    // Mangsir 30 in a 29-day Mangsir - so pull it back rather than refuse.
    const day = Math.min(next.day, bsMonthLength(next.year, next.month));

    onChange(fromBs(next.year, next.month, day) ?? "");
  }

  return (
    <div className="nepali-date">
      <div className="nepali-date-field">
        <select
          className="nepali-date-part"
          aria-label="Day"
          aria-invalid={invalid}
          aria-describedby={describedBy}
          value={bs?.day ?? ""}
          onChange={(event) => change("day", event.target.value)}
        >
          {/* Shown only while nothing is selected, so the browser doesn't
              fall back to displaying the first real option as if chosen. */}
          {!bs && <option value="" hidden></option>}
          {/* Rebuilt per month, since the last day moves between 29 and 32. */}
          {Array.from({ length: dayCount }, (_, index) => index + 1).map(
            (day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ),
          )}
        </select>

        <select
          className="nepali-date-part"
          aria-label="Month"
          aria-invalid={invalid}
          aria-describedby={describedBy}
          value={bs?.month ?? ""}
          onChange={(event) => change("month", event.target.value)}
        >
          {!bs && <option value="" hidden></option>}
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
          aria-describedby={describedBy}
          value={bs?.year ?? ""}
          onChange={(event) => change("year", event.target.value)}
        >
          {!bs && <option value="" hidden></option>}
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {shortcuts.length > 0 && (
        <div className="nepali-date-shortcuts">
          {shortcuts.map(({ label, iso }) => (
            <button
              key={label}
              type="button"
              className="date-chip"
              // Pressed = the field already holds this day, so the chip
              // doubles as a "you are here" cue.
              aria-pressed={value === iso}
              onClick={() => onChange(iso)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default NepaliDateField;