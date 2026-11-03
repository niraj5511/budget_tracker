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
import RequireAuth from "./components/RequireAuth";
import { useAuth } from "./context/AuthContext";
import Loans from "./pages/Loans";

import { ALL_MONTHS, availableMonths, filterByMonth } from "./utils/months";
import { formatBsMonth } from "./utils/nepaliDate";
import {
  addRepayment,
  createLoan,
  createTransaction,
  deleteBudgetLimit,
  deleteLoan,
  deleteRepayment,
  deleteTransaction,
  fetchBudgets,
  fetchLoans,
  fetchTransactions,
  importData,
  saveBudgetLimit,
  updateLoan,
  updateTransaction,
} from "./utils/api";
import "./App.css";

function App() {
  // Passed as a function so storage is read once on mount rather than on
  // every render. The samples are only a first-run seed.
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [loans, setLoans] = useState([]);
  const [editingLoanId, setEditingLoanId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(ALL_MONTHS);
  const [editingId, setEditingId] = useState(null);

  // Runs once after the first render, because of the empty [] at the end.
  // Reload when the signed-in user changes, and clear the data on logout.
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setBudgets({});
      setLoans([]);
      return;
    }
    fetchTransactions()
      .then(setTransactions)
      .catch((error) => console.error("Failed to load transactions:", error));
    fetchBudgets()
      .then(setBudgets)
      .catch((error) => console.error("Failed to load budgets:", error));
    fetchLoans()
      .then(setLoans)
      .catch((error) => console.error("Failed to load loans:", error));
  }, [user]);

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

  // Saves the backup to the account, then reloads from the server so the
  // ids on screen are the real ones. Throws if the import fails.
  async function handleRestore({
    transactions: nextTransactions,
    budgets: nextBudgets,
    loans: nextLoans,
  }) {
    await importData(nextTransactions, nextBudgets, nextLoans);
    const [savedTransactions, savedBudgets, savedLoans] = await Promise.all([
      fetchTransactions(),
      fetchBudgets(),
      fetchLoans(),
    ]);
    setTransactions(savedTransactions);
    setBudgets(savedBudgets);
    setLoans(savedLoans);
    setEditingId(null);
    setEditingLoanId(null);
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

  const editingLoan = loans.find((loan) => loan.id === editingLoanId) ?? null;

  // Throws on failure, so the form can keep what was typed and show an error.
  async function handleSubmitLoan(values) {
    if (editingLoan) {
      const saved = await updateLoan(editingLoan.id, values);
      setLoans((prev) =>
        prev.map((loan) => (loan.id === saved.id ? saved : loan)),
      );
      setEditingLoanId(null);
      return;
    }
    const saved = await createLoan(values);
    setLoans((prev) => [...prev, saved]);
  }

  // A loan's repaid total is the sum of its repayments, as on the server.
  function withRepayments(loan, repayments) {
    return {
      ...loan,
      repayments,
      repaid: repayments.reduce((sum, repayment) => sum + repayment.amount, 0),
    };
  }

  // Both throw on failure, so the panel can show the error.
  async function handleAddRepayment(loanId, values) {
    const saved = await addRepayment(loanId, values);
    setLoans((prev) =>
      prev.map((loan) =>
        loan.id === loanId
          ? withRepayments(loan, [...loan.repayments, saved])
          : loan,
      ),
    );
  }

  async function handleDeleteRepayment(loanId, id) {
    await deleteRepayment(loanId, id);
    setLoans((prev) =>
      prev.map((loan) =>
        loan.id === loanId
          ? withRepayments(
              loan,
              loan.repayments.filter((repayment) => repayment.id !== id),
            )
          : loan,
      ),
    );
  }

  async function handleDeleteLoan(id) {
    try {
      await deleteLoan(id);
      setLoans((prev) => prev.filter((loan) => loan.id !== id));
      setEditingLoanId((prev) => (prev === id ? null : prev));
    } catch (error) {
      console.error("Failed to delete loan:", error);
    }
  }
  return (
    <div className="app">
      {user && <Navbar />}
      <RouteEffects />

      <main id="main" className="app-main" tabIndex={-1}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<RequireAuth />}>
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
                  loans={loans}
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
              element={
                <Budget budgets={budgets} onSaveLimit={handleSaveLimit} />
              }
            />
            <Route
              path="/loans"
              element={
                <Loans
                  loans={loans}
                  editingLoan={editingLoan}
                  onSubmit={handleSubmitLoan}
                  onCancelEdit={() => setEditingLoanId(null)}
                  onEditLoan={(id) =>
                    setEditingLoanId((prev) => (prev === id ? null : id))
                  }
                  onDeleteLoan={handleDeleteLoan}
                  onAddRepayment={handleAddRepayment}
                  onDeleteRepayment={handleDeleteRepayment}
                />
              }
            />
            <Route
              path="/backup"
              element={
                <Backup
                  transactions={transactions}
                  budgets={budgets}
                  loans={loans}
                  onRestore={handleRestore}
                />
              }
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
