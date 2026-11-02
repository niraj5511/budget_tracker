import { useMemo } from "react";
import { formatCurrency, todayIso } from "../utils/format";
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

function Loans({ loans }) {
  const items = useMemo(() => {
    // Open loans first, newest first within each group.
    return loans
      .map(describe)
      .sort((a, b) => {
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
          <span className="loan-stat-label">You are owed</span>
          <span className="loan-stat-value num is-owed">
            {formatCurrency(owedToYou)}
          </span>
          <span className="loan-stat-meta">
            {openCount("lent")} open {openCount("lent") === 1 ? "loan" : "loans"}
          </span>
        </div>
        <div className="loan-stat">
          <span className="loan-stat-label">You owe</span>
          <span className="loan-stat-value num is-owing">
            {formatCurrency(youOwe)}
          </span>
          <span className="loan-stat-meta">
            {openCount("borrowed")} open{" "}
            {openCount("borrowed") === 1 ? "loan" : "loans"}
          </span>
        </div>
      </section>

      <section className="loan-list-section" aria-labelledby="loan-list-title">
        <h2 id="loan-list-title" className="loan-list-title">
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
                  className={`loan-item${loan.settled ? " is-settled" : ""}`}
                >
                  <div className="loan-top">
                    <div className="loan-who">
                      <strong className="loan-person">{loan.person}</strong>
                      <span className={`loan-tag ${lent ? "is-lent" : "is-borrowed"}`}>
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
                        {formatCurrency(loan.settled ? loan.amount : loan.outstanding)}
                      </span>
                      <span className="loan-of">
                        {loan.settled
                          ? "paid in full"
                          : `left of ${formatCurrency(loan.amount)}`}
                      </span>
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
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Loans;