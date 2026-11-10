import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MonthFilter from "../components/MonthFilter";
import { formatCurrency } from "../utils/format";
import { buildMonthlyReport } from "../utils/monthlyReport";
import { formatBsDate, formatBsMonth } from "../utils/nepaliDate";
import "./Report.css";

const percentText = (percent) => `${Math.round(percent)}%`;

function Stat({ label, value, tone }) {
  return (
    <div className="report-stat">
      <span className="report-stat-label">{label}</span>
      <span className={`report-stat-value num ${tone ?? ""}`}>{value}</span>
    </div>
  );
}

/** One line of the comparison, or nothing when both months are empty. */
function ChangeLine({ label, change, previousMonth }) {
  const since = formatBsMonth(previousMonth);
  let text;
  if (change.isNew) {
    text = `none in ${since}`;
  } else if (change.percent === null) {
    return null;
  } else {
    const rounded = Math.round(Math.abs(change.percent));
    text =
      rounded === 0
        ? `same as ${since}`
        : `${change.percent > 0 ? "up" : "down"} ${rounded}% from ${since}`;
  }
  return (
    <li>
      {label}: <span className="num">{formatCurrency(change.current)}</span> (
      {text})
    </li>
  );
}

/**
 * A summary of one Nepali month: totals, how it compares with the month
 * before, where the money went and the biggest expenses. The numbers come
 * from buildMonthlyReport, the same helpers the dashboard uses.
 */
function Report({ months, transactions, budgets }) {
  const location = useLocation();
  // The dashboard sends the month it was showing; anything else falls back to
  // the newest month below.
  const [selected, setSelected] = useState(location.state?.month ?? "");

  if (months.length === 0) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <h1 className="page-title">Monthly report</h1>
            <p className="page-subtitle">A summary of one month</p>
          </div>
        </header>
        <p className="report-empty">
          There is nothing to report yet. Add some transactions on the{" "}
          <Link to="/transactions">Transactions page</Link> first.
        </p>
      </div>
    );
  }

  const month = months.includes(selected) ? selected : months[0];
  const report = buildMonthlyReport(transactions, budgets, month);
  const { comparison } = report;
  const hasComparison =
    comparison &&
    [comparison.income, comparison.expense].some(
      (change) => change.isNew || change.percent !== null,
    );

  return (
    <div className="page report">
      <header className="page-header">
        <div>
          <h1 className="page-title">Monthly report</h1>
          <p className="page-subtitle">{formatBsMonth(month)}</p>
        </div>
        <div className="report-month">
          <MonthFilter
            months={months}
            value={month}
            onChange={setSelected}
            includeAll={false}
            label="Month"
          />
        </div>
      </header>

      <section className="report-summary" aria-label="Summary">
        <Stat
          label="Income"
          value={formatCurrency(report.income)}
          tone="report-income"
        />
        <Stat
          label="Expenses"
          value={formatCurrency(report.expense)}
          tone="report-expense"
        />
        <Stat
          label="Balance"
          value={formatCurrency(report.balance)}
          tone={report.balance < 0 ? "report-expense" : "report-income"}
        />
        <Stat label="Transactions" value={report.transactionCount} />
      </section>

      {report.transactionCount === 0 && (
        <p className="report-empty">No transactions in this month.</p>
      )}

      {hasComparison && (
        <section className="report-card" aria-labelledby="report-compare">
          <h2 id="report-compare" className="report-heading">
            Compared with {formatBsMonth(comparison.previousMonth)}
          </h2>
          <ul className="report-changes">
            <ChangeLine
              label="Income"
              change={comparison.income}
              previousMonth={comparison.previousMonth}
            />
            <ChangeLine
              label="Expenses"
              change={comparison.expense}
              previousMonth={comparison.previousMonth}
            />
          </ul>
        </section>
      )}

      {report.expenseCategories.length > 0 && (
        <section className="report-card" aria-labelledby="report-expenses">
          <h2 id="report-expenses" className="report-heading">
            Expenses by category
          </h2>
          <div className="report-table-wrap">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="report-num">Amount</th>
                  <th className="report-num">Share</th>
                  <th>Budget</th>
                </tr>
              </thead>
              <tbody>
                {report.expenseCategories.map((row) => (
                  <tr key={row.category}>
                    <td>{row.category}</td>
                    <td className="report-num num">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="report-num num">
                      {percentText(row.percent)}
                    </td>
                    <td>
                      {row.budget ? (
                        <span className={row.budget.isOver ? "report-over" : ""}>
                          {formatCurrency(row.budget.limit)} limit,{" "}
                          {percentText(row.budget.percent)} used
                        </span>
                      ) : (
                        "\u2014"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th>Total</th>
                  <td className="report-num num">
                    {formatCurrency(report.expense)}
                  </td>
                  <td className="report-num num">100%</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}

      {report.incomeCategories.length > 0 && (
        <section className="report-card" aria-labelledby="report-income">
          <h2 id="report-income" className="report-heading">
            Income by category
          </h2>
          <div className="report-table-wrap">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="report-num">Amount</th>
                  <th className="report-num">Share</th>
                </tr>
              </thead>
              <tbody>
                {report.incomeCategories.map((row) => (
                  <tr key={row.category}>
                    <td>{row.category}</td>
                    <td className="report-num num">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="report-num num">
                      {percentText(row.percent)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th>Total</th>
                  <td className="report-num num">
                    {formatCurrency(report.income)}
                  </td>
                  <td className="report-num num">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}

      {report.largestExpenses.length > 0 && (
        <section className="report-card" aria-labelledby="report-largest">
          <h2 id="report-largest" className="report-heading">
            Largest expenses
          </h2>
          <div className="report-table-wrap">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th className="report-num">Amount</th>
                </tr>
              </thead>
              <tbody>
                {report.largestExpenses.map((item) => (
                  <tr key={item.id}>
                    <td>{formatBsDate(item.date) ?? item.date}</td>
                    <td>{item.description}</td>
                    <td>{item.category}</td>
                    <td className="report-num num">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default Report;