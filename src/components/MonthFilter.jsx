import { formatMonth } from '../utils/format'
import { ALL_MONTHS } from '../utils/months'
import './MonthFilter.css'

function MonthFilter({ months, value, onChange }) {
  return (
    <div className="month-filter">
      <label className="month-filter-label" htmlFor="month">
        Period
      </label>
      <select
        id="month"
        className="month-filter-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value={ALL_MONTHS}>All time</option>
        {months.map((month) => (
          <option key={month} value={month}>
            {formatMonth(month)}
          </option>
        ))}
      </select>
    </div>
  )
}

export default MonthFilter
