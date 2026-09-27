import { useMemo, useState } from "react";
import TransactionFilters from "../components/TransactionFilters";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";

function Transactions({
  editingTransaction,
  onSubmit,
  onCancelEdit,
  sortedTransactions,
  editingId,
  onEditTransaction,
  onDeleteTransaction,
}) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");

  // Derived from whatever transactions exist, not the full category list -
  // an option for a category with nothing logged would filter to an empty
  // list every time it's picked.
  const categoryOptions = useMemo(() => {
    const seen = new Set(sortedTransactions.map((t) => t.category));
    return [...seen].sort((a, b) => a.localeCompare(b));
  }, [sortedTransactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sortedTransactions.filter((transaction) => {
      if (type !== "all" && transaction.type !== type) return false;
      if (category !== "all" && transaction.category !== category) return false;
      if (!query) return true;

      // Description is optional on some rows, so fall back to an empty
      // string rather than calling toLowerCase() on undefined.
      const description = transaction.description ?? "";

      return (
        description.toLowerCase().includes(query) ||
        transaction.category.toLowerCase().includes(query)
      );
    });
  }, [sortedTransactions, search, type, category]);

  const isFiltered =
    search.trim() !== "" || type !== "all" || category !== "all";

  function handleClear() {
    setSearch("");
    setType("all");
    setCategory("all");
  }

  return (
    <div className="page">
      {/* The key is the mechanism, not decoration: changing it remounts the
          form so its fields reload from the new row, instead of the form
          having to copy props into state and keep them in sync. */}
      <TransactionForm
        key={editingTransaction?.id ?? "new"}
        transaction={editingTransaction}
        onSubmit={onSubmit}
        onCancel={onCancelEdit}
      />

      {sortedTransactions.length > 0 && (
        <>
          <TransactionFilters
            search={search}
            onSearchChange={setSearch}
            type={type}
            onTypeChange={setType}
            category={category}
            onCategoryChange={setCategory}
            categoryOptions={categoryOptions}
            onClear={handleClear}
            isFiltered={isFiltered}
          />
          {isFiltered && (
            <p className="filter-result-count">
              Showing {filteredTransactions.length} of{" "}
              {sortedTransactions.length} transactions
            </p>
          )}
        </>
      )}

      <TransactionList
        transactions={filteredTransactions}
        editingId={editingId}
        onEditTransaction={onEditTransaction}
        onDeleteTransaction={onDeleteTransaction}
        emptyMessage={
          isFiltered
            ? "No transactions match your filters."
            : "No transactions yet."
        }
      />
    </div>
  );
}

export default Transactions;