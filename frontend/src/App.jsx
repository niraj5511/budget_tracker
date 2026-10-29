import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import RouteEffects from "./components/RouteEffects";
import Backup from "./pages/Backup";
import Budget from "./pages/Budget";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Transactions from "./pages/Transactions";
import Login from "./pages/Login";
import Register from "./pages/Register";

import { ALL_MONTHS, availableMonths, filterByMonth } from "./utils/months";
import { formatBsMonth } from "./utils/nepaliDate";
import {
  createTransaction,
  deleteBudgetLimit,
  deleteTransaction,
  fetchBudgets,
  fetchTransactions,
  saveBudgetLimit,
  updateTransaction,
} from "./utils/api";
import "./App.css";

function App() {
  // Passed as a function so storage is read once on mount rather than on
  // every render. The samples are only a first-run seed.
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(ALL_MONTHS);
  const [editingId, setEditingId] = useState(null);

  // Runs once after the first render, because of the empty [] at the end.
  useEffect(() => {
    fetchTransactions()
      .then(setTransactions)
      .catch((error) => console.error("Failed to load transactions:", error));
  }, []);

  useEffect(() => {
    fetchBudgets()
      .then(setBudgets)
      .catch((error) => console.error("Failed to load budgets:", error));
  }, []);

  // Derived rather than trusted: the row being edited can be deleted from
  // under the form, and looking it up each render means a missing row simply
  // drops the form back to adding instead of leaving a stale id in charge.
  const editingTransaction =
    transactions.find((transaction) => transaction.id === editingId) ?? null;

  // The form only reports field values; identity belongs here.
  async function handleSubmitTransaction(values) {
    try {
      if (editingTransaction) {
        const saved = await updateTransaction(editingTransaction.id, values);
        setTransactions((prev) =>
          prev.map((transaction) =>
            transaction.id === saved.id ? saved : transaction,
          ),
        );
        setEditingId(null);
        return;
      }
      const saved = await createTransaction(values);
      setTransactions((prev) => [saved, ...prev]);
    } catch (error) {
      console.error("Failed to save transaction:", error);
    }
  }

  async function handleDeleteTransaction(id) {
    try {
      await deleteTransaction(id);
      setTransactions((prev) =>
        prev.filter((transaction) => transaction.id !== id),
      );
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  }

  // null clears a limit rather than storing it - a category with no limit
  // shouldn't linger in the map at 0, which would read as "budget: Rs. 0"
  // instead of "no budget set".
  async function handleSaveLimit(category, limit) {
    try {
      if (limit === null) {
        // Only call the backend if a limit exists, otherwise it returns 404.
        if (category in budgets) await deleteBudgetLimit(category);
        setBudgets((prev) => {
          const { [category]: _removed, ...rest } = prev;
          return rest;
        });
        return;
      }
      await saveBudgetLimit(category, limit);
      setBudgets((prev) => ({ ...prev, [category]: limit }));
    } catch (error) {
      console.error("Failed to save budget:", error);
    }
  }

  // Replaces everything with a backup's contents. Resets the view state too:
  // an old editing id or selected month may not exist in the restored data.
  function handleRestore({
    transactions: nextTransactions,
    budgets: nextBudgets,
  }) {
    setTransactions(nextTransactions);
    setBudgets(nextBudgets);
    setEditingId(null);
    setSelectedMonth(ALL_MONTHS);
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
      <RouteEffects />

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
          <Route
            path="/backup"
            element={
              <Backup
                transactions={transactions}
                budgets={budgets}
                onRestore={handleRestore}
              />
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
