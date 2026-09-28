import { useId } from 'react'
import { ALL_MONTHS } from '../utils/months'
import { formatBsMonth } from '../utils/nepaliDate'
import './MonthFilter.css'

function MonthFilter({ months, value, onChange }) {
  // useId gives each MonthFilter its own unique id, so the label always
  // points at its own select even if the component is rendered twice.
  const selectId = useId()

  return (
    <div className="month-filter">
      <label className="month-filter-label" htmlFor={selectId}>
        Period
      </label>
      <select
        id={selectId}
        className="month-filter-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value={ALL_MONTHS}>All time</option>
        {months.map((month) => (
          <option key={month} value={month}>
            {formatBsMonth(month)}
          </option>
        ))}
      </select>
    </div>
  )
}

export default MonthFilter