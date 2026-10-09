import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Budget from "./pages/Budget";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import sampleTransactions from "./data/sampleTransactions";
import { ALL_MONTHS, availableMonths, filterByMonth } from "./utils/months";
import { formatBsMonth } from "./utils/nepaliDate";
import {
  loadBudgets,
  loadTransactions,
  saveBudgets,
  saveTransactions,
} from "./utils/storage";
import "./App.css";

function App() {
  // Passed as a function so storage is read once on mount rather than on
  // every render. The samples are only a first-run seed.
  const [transactions, setTransactions] = useState(() =>
    loadTransactions(sampleTransactions),
  );
  const [budgets, setBudgets] = useState(() => loadBudgets());
  const [selectedMonth, setSelectedMonth] = useState(ALL_MONTHS);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveBudgets(budgets);
  }, [budgets]);

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

  // null clears a limit rather than storing it - a category with no limit
  // shouldn't linger in the map at 0, which would read as "budget: Rs. 0"
  // instead of "no budget set".
  function handleSaveLimit(category, limit) {
    setBudgets((prev) => {
      if (limit === null) {
        const { [category]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [category]: limit };
    });
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

      <main id="main" className="app-main" tabIndex={-1}>
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                months={months}
                activeMonth={activeMonth}
                onMonthChange={setSelectedMonth}
                transactions={transactions}
                visibleTransactions={visibleTransactions}
                periodLabel={periodLabel}
                budgets={budgets}
              />
            }
          />
          <Route
            path="/transactions"
            element={
              <Transactions
                editingTransaction={editingTransaction}
                onSubmit={handleSubmitTransaction}
                onCancelEdit={() => setEditingId(null)}
                sortedTransactions={sortedTransactions}
                editingId={editingTransaction?.id ?? null}
                // A real toggle, so clicking Edit on the row already being
                // edited backs out - which is what the button's
                // aria-pressed state claims.
                onEditTransaction={(id) =>
                  setEditingId((prev) => (prev === id ? null : id))
                }
                onDeleteTransaction={handleDeleteTransaction}
              />
            }
          />
          <Route
            path="/budget"
            element={<Budget budgets={budgets} onSaveLimit={handleSaveLimit} />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
