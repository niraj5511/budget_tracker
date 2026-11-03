import { useMemo, useRef, useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import LoanForm from "../components/LoanForm";
import RepaymentPanel from "../components/RepaymentPanel";
import { formatCurrency } from "../utils/format";
import { describeLoan } from "../utils/loans";
import { formatBsDate } from "../utils/nepaliDate";
import "./Loans.css";

// Amounts are floats, so "fully repaid" allows for tiny rounding leftovers.
const EPSILON = 0.005;

function describe(loan) {
  const outstanding = Math.max(loan.amount - loan.repaid, 0);
  const settled = outstanding < EPSILON;
  const overdue = !settled && Boolean(loan.dueDate) && loan.dueDate < todayIso();
  const percent = Math.min(Math.round((loan.repaid / loan.amount) * 100), 100);
  return { ...loan, outstanding, settled, overdue, percent };
}

function Loans({
  loans,
  editingLoan,
  onSubmit,
  onCancelEdit,
  onEditLoan,
  onDeleteLoan,
  onAddRepayment,
  onDeleteRepayment,
}) {
  // Ids of the records whose repayments are showing.
  const [expanded, setExpanded] = useState(() => new Set());
  // The record waiting for a yes/no. One dialog serves the whole list.
  const [pendingDelete, setPendingDelete] = useState(null);
  const titleRef = useRef(null);
  function toggleExpanded(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function handleConfirmDelete() {
    if (!pendingDelete) return;
    onDeleteLoan(pendingDelete.id);
    setPendingDelete(null);
    // The row that opened the dialog is gone; the list heading is the
    // nearest stable place for focus.
    titleRef.current?.focus();
  }
  const items = useMemo(() => {
    // Open loans first, newest first within each group.
    return loans.map(describeLoan).sort((a, b) => {
      if (a.settled !== b.settled) return a.settled ? 1 : -1;
      return b.date.localeCompare(a.date);
    });
  }, [loans]);

  const owedToYou = items
    .filter((l) => l.direction === "lent")
    .reduce((sum, l) => sum + l.outstanding, 0);
  const youOwe = items
    .filter((l) => l.direction === "borrowed")
    .reduce((sum, l) => sum + l.outstanding, 0);
  const openCount = (direction) =>
    items.filter((l) => l.direction === direction && !l.settled).length;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Lend / Borrow</h1>
          <p className="page-subtitle">
            Money you have lent or borrowed. These records do not change your
            balance.
          </p>
        </div>
      </header>

      <section className="loan-summary" aria-label="Lend and borrow summary">
        <div className="loan-stat">
          <span className="loan-stat-label">To get back</span>
          <span className="loan-stat-value num is-owed">
            {formatCurrency(owedToYou)}
          </span>
          <span className="loan-stat-meta">
            {openCount("lent")} open{" "}
            {openCount("lent") === 1 ? "loan" : "loans"}
          </span>
        </div>
        <div className="loan-stat">
          <span className="loan-stat-label">To pay back</span>
          <span className="loan-stat-value num is-owing">
            {formatCurrency(youOwe)}
          </span>
          <span className="loan-stat-meta">
            {openCount("borrowed")} open{" "}
            {openCount("borrowed") === 1 ? "loan" : "loans"}
          </span>
        </div>
      </section>

      <div className="loans-layout">
        <div className="loans-form-col">
          {/* The key remounts the form when a different record is loaded. */}
          <LoanForm
            key={editingLoan?.id ?? "new"}
            loan={editingLoan}
            onSubmit={onSubmit}
            onCancel={onCancelEdit}
          />
        </div>

        <section
          className="loan-list-section"
          aria-labelledby="loan-list-title"
        >
          <h2
            id="loan-list-title"
            className="loan-list-title"
            ref={titleRef}
            tabIndex={-1}
          >
            Records
          </h2>

          {items.length === 0 ? (
            <p className="loan-empty">No lend or borrow records yet.</p>
          ) : (
            <ul className="loan-list">
              {items.map((loan) => {
                const lent = loan.direction === "lent";
                const date = formatBsDate(loan.date) ?? loan.date;
                const due = loan.dueDate
                  ? (formatBsDate(loan.dueDate) ?? loan.dueDate)
                  : null;

                return (
                  <li
                    key={loan.id}
                    className={`loan-item${loan.settled ? " is-settled" : ""}${
                      loan.id === editingLoan?.id ? " is-being-edited" : ""
                    }`}
                  >
                    <div className="loan-top">
                      <div className="loan-who">
                        <strong className="loan-person">{loan.person}</strong>
                        <span
                          className={`loan-tag ${lent ? "is-lent" : "is-borrowed"}`}
                        >
                          {lent ? "You lent" : "You borrowed"}
                        </span>
                        {loan.settled && (
                          <span className="loan-tag is-settled">Settled</span>
                        )}
                        {loan.overdue && (
                          <span className="loan-tag is-overdue">Overdue</span>
                        )}
                      </div>
                      <div className="loan-amounts num">
                        <span className="loan-outstanding">
                          {formatCurrency(
                            loan.settled ? loan.amount : loan.outstanding,
                          )}
                        </span>
                        <span className="loan-of">
                          {loan.settled
                            ? "paid in full"
                            : `left of ${formatCurrency(loan.amount)}`}
                        </span>
                      </div>
                      <div className="transaction-actions">
                        <button
                          className="transaction-edit"
                          type="button"
                          onClick={() => onEditLoan(loan.id)}
                          aria-label={`Edit ${loan.person}`}
                          aria-pressed={loan.id === editingLoan?.id}
                          title="Edit"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            focusable="false"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        </button>
                        <button
                          className="transaction-delete"
                          type="button"
                          onClick={() => setPendingDelete(loan)}
                          aria-label={`Delete ${loan.person}`}
                          title="Delete"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            focusable="false"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div
                      className="loan-bar"
                      role="progressbar"
                      aria-label={`${loan.person}: repaid`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={loan.percent}
                    >
                      <div
                        className={`loan-bar-fill ${lent ? "is-lent" : "is-borrowed"}`}
                        style={{ width: `${loan.percent}%` }}
                      />
                    </div>

                    <p className="loan-meta">
                      {lent ? "Lent" : "Borrowed"} on {date}
                      {due ? ` \u00b7 Due ${due}` : ""}
                      {loan.repayments.length > 0
                        ? ` \u00b7 ${loan.repayments.length} ${loan.repayments.length === 1 ? "repayment" : "repayments"}`
                        : ""}
                      {loan.note ? ` \u00b7 ${loan.note}` : ""}
                    </p>

                    <button
                      type="button"
                      className="loan-toggle"
                      aria-expanded={expanded.has(loan.id)}
                      onClick={() => toggleExpanded(loan.id)}
                    >
                      {loan.repayments.length > 0
                        ? `Repayments (${loan.repayments.length})`
                        : loan.settled
                          ? "Repayments"
                          : "Add repayment"}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>

                    {expanded.has(loan.id) && (
                      <RepaymentPanel
                        loan={loan}
                        onAdd={onAddRepayment}
                        onDelete={onDeleteRepayment}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this record?"
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      >
        {pendingDelete && (
          <>
            <p className="delete-summary">
              <strong>{pendingDelete.person}</strong>
              <span className="num">
                {formatCurrency(pendingDelete.amount)}
              </span>
              <span>
                {pendingDelete.direction === "lent"
                  ? "You lent"
                  : "You borrowed"}
              </span>
            </p>
            <p>
              Its repayments will be deleted too. This can&rsquo;t be undone.
            </p>
          </>
        )}
      </ConfirmDialog>
    </div>
  );
}

export default Loans;
