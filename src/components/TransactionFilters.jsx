import { useRef } from 'react'
import './TransactionFilters.css'

const TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
]

/**
 * Search + type + category, all controlled from the parent so filtering
 * logic stays in one place (Transactions.jsx) rather than split across this
 * component and its caller.
 *
 * `resultCount` / `totalCount` only feed the "Showing X of Y" line; the
 * parent still owns the filtering itself.
 */
function TransactionFilters({
  search,
  onSearchChange,
  type,
  onTypeChange,
  category,
  onCategoryChange,
  categoryOptions,
  onClear,
  isFiltered,
  resultCount,
  totalCount,
}) {
  const searchRef = useRef(null)

  function clearSearch() {
    onSearchChange('')
    // Keep the keyboard where it was instead of dropping focus on the page.
    searchRef.current?.focus()
  }

  const summary =
    isFiltered && totalCount !== undefined
      ? `Showing ${resultCount} of ${totalCount} transaction${totalCount === 1 ? '' : 's'}`
      : ''

  return (
    <div className="transaction-filters">
      <div className="filter-controls">
        <div className="filter-search-wrap">
          <svg
            className="filter-search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>

          <input
            ref={searchRef}
            type="search"
            className="filter-search"
            placeholder="Search description or category"
            autoComplete="off"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            // Escape clears the text only - the type/category controls are
            // separate, with their own state, not part of what this field owns.
            onKeyDown={(event) => {
              if (event.key === 'Escape' && search) onSearchChange('')
            }}
            aria-label="Search transactions"
          />

          {search && (
            <button
              type="button"
              className="filter-search-clear"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </div>

        {/* Three fixed choices read faster as a segmented control than as a
            dropdown. Real radios underneath, so keyboard and screen readers
            behave like any radio group. */}
        <fieldset className="filter-type">
          <legend className="sr-only">Filter by type</legend>
          {TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`filter-type-option filter-type-option--${option.value}`}
            >
              <input
                type="radio"
                name="filter-type"
                value={option.value}
                checked={type === option.value}
                onChange={() => onTypeChange(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </fieldset>

        <select
          className="filter-select"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        {isFiltered && (
          <button type="button" className="btn btn-ghost filter-clear" onClick={onClear}>
            Clear filters
          </button>
        )}
      </div>

      {/* Always in the DOM so screen readers announce the count as it changes. */}
      <p className="filter-result-count" role="status">
        {summary}
      </p>
    </div>
  )
}

export default TransactionFilters