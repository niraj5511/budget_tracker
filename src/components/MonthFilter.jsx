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

      {/* A native <select> on purpose: phones open their own picker, which
          is far easier to use than a custom dropdown. */}
      <div className="month-filter-control">
        <svg
          className="month-filter-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <rect x="3" y="4" width="18" height="18" rx="2.5" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>

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
    </div>
  )
}

export default MonthFilter