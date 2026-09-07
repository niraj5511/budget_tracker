import './TransactionFilters.css'

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
]

/**
 * Search + type + category, all controlled from the parent so filtering
 * logic stays in one place (Transactions.jsx) rather than split across this
 * component and its caller.
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
}) {
  return (
    <div className="transaction-filters">
      <input
        type="search"
        className="filter-search"
        placeholder="Search description or category..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        aria-label="Search transactions"
      />

      <select
        className="filter-select"
        value={type}
        onChange={(event) => onTypeChange(event.target.value)}
        aria-label="Filter by type"
      >
        {TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

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
        <button type="button" className="filter-clear" onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  )
}

export default TransactionFilters