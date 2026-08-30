import { useEffect, useState } from "react";
import BalanceSummary from "./components/BalanceSummary";
import CategoryBreakdown from "./components/CategoryBreakdown";
import MonthFilter from "./components/MonthFilter";
import MonthlyTrendChart from "./components/MonthlyTrendChart";
import Navbar from "./components/Navbar";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import sampleTransactions from "./data/sampleTransactions";
import { ALL_MONTHS, availableMonths, filterByMonth } from "./utils/months";
import { formatBsMonth } from "./utils/nepaliDate";
import { loadTransactions, saveTransactions } from "./utils/storage";
import "./App.css";

function App() {
  // Passed as a function so storage is read once on mount rather than on
  // every render. The samples are only a first-run seed.
  const [transactions, setTransactions] = useState(() =>
    loadTransactions(sampleTransactions),
  );
  const [selectedMonth, setSelectedMonth] = useState(ALL_MONTHS);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  // Derived rather than trusted: the row being edited can be deleted from
  // under the form, and looking it up each render means a missing row simply
  // drops the form back to adding instead of leaving a stale id in charge.
  const editingTransaction =
    transactions.find((transaction) => transaction.id === editingId) ?? null;

  // The form only reports field values; identity belongs here.
  function handleSubmitTransaction(values) {
    if (editingTransaction) {
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === editingTransaction.id
            ? { ...transaction, ...values }
            : transaction,
        ),
      );
      setEditingId(null);
      return;
    }

    // Prepend, so that among transactions sharing a date the newest addition
    // sorts first - Array.prototype.sort is stable, so it keeps this order.
    setTransactions((prev) => [
      { id: crypto.randomUUID(), ...values },
      ...prev,
    ]);
  }

  function handleDeleteTransaction(id) {
    setTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== id),
    );
  }

  const months = availableMonths(transactions);

  const activeMonth =
    selectedMonth !== ALL_MONTHS && !months.includes(selectedMonth)
      ? ALL_MONTHS
      : selectedMonth;

  const visibleTransactions = filterByMonth(transactions, activeMonth);

  // ISO date strings compare lexicographically, so this is a plain string
  // sort. Copy first: sort() mutates, and state must not be touched.
  const sortedTransactions = [...visibleTransactions].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  const periodLabel =
    activeMonth === ALL_MONTHS ? "All time" : formatBsMonth(activeMonth);

  return (
    <div className="app">
      <Navbar />

      <main className="app-main">
        {/* With nothing saved there is nothing to filter, and the select
            would offer "All time" as its only option. */}
        {months.length > 0 && (
          <MonthFilter
            months={months}
            value={activeMonth}
            onChange={setSelectedMonth}
          />
        )}
        <MonthlyTrendChart
          transactions={transactions}
          activeMonth={activeMonth}
        />
        <BalanceSummary transactions={visibleTransactions} />
        <CategoryBreakdown
          transactions={visibleTransactions}
          periodLabel={periodLabel}
        />
        {/* The key is the mechanism, not decoration: changing it remounts the
            form so its fields reload from the new row, instead of the form
            having to copy props into state and keep them in sync. */}
        <TransactionForm
          key={editingTransaction?.id ?? "new"}
          transaction={editingTransaction}
          onSubmit={handleSubmitTransaction}
          onCancel={() => setEditingId(null)}
        />
        <TransactionList
          transactions={sortedTransactions}
          editingId={editingTransaction?.id ?? null}
          // A real toggle, so clicking Edit on the row already being edited
          // backs out - which is what the button's aria-pressed state claims.
          onEditTransaction={(id) =>
            setEditingId((prev) => (prev === id ? null : id))
          }
          onDeleteTransaction={handleDeleteTransaction}
        />
      </main>
    </div>
  );
}

export default App;
