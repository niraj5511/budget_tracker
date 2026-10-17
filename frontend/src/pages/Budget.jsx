import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { EXPENSE_CATEGORIES } from "../data/categories";
import { formatCurrency } from "../utils/format";
import "./Budget.css";

/**
 * One editable row per expense category. Income has no notion of a spending
 * limit, so this deliberately only ever lists EXPENSE_CATEGORIES.
 */
function BudgetRow({ category, limit, onSave }) {
  // Local text, not the committed number - lets the field hold '' or '12.'
  // mid-edit without that half-typed value overwriting the real budget.
  const [value, setValue] = useState(limit ? String(limit) : "");
  // '' | 'saved' | 'cleared' - drives the check mark and the spoken message.
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  // blur() fires synchronously, before the setValue() from an Escape revert
  // has committed - so handleBlur would otherwise still see the old typed
  // text. This flag tells it to skip the save-on-blur logic entirely.
  const revertingRef = useRef(false);
  const timerRef = useRef(null);

  // Category names can contain spaces and '&', which are not safe inside an
  // aria-describedby id list, so ids come from useId instead.
  const inputId = useId();
  const errorId = `${inputId}-error`;

  // Don't leave a timer running after the page is left.
  useEffect(() => () => clearTimeout(timerRef.current), []);

  function flash(nextStatus) {
    setStatus(nextStatus);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus(""), 1500);
  }

  function handleBlur() {
    if (revertingRef.current) {
      revertingRef.current = false;
      return;
    }

    const trimmed = value.trim();

    if (!trimmed) {
      if (limit !== undefined) {
        onSave(category, null);
        flash("cleared");
      }
      return;
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      // Invalid entry reverts to the last saved value instead of silently
      // keeping bad text in the field - and says why, so the field snapping
      // back isn't a mystery.
      setValue(limit ? String(limit) : "");
      setError("Enter an amount greater than 0.");
      return;
    }

    onSave(category, Math.round(parsed * 100) / 100);
    flash("saved");
  }

  // Enter commits the same way tabbing away does - routes through the
  // existing onBlur handler instead of duplicating the save logic here.
  // Escape discards the in-progress edit instead, reverting the field
  // without calling onSave.
  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    } else if (event.key === "Escape") {
      revertingRef.current = true;
      setValue(limit ? String(limit) : "");
      setError("");
      event.currentTarget.blur();
    }
  }

  return (
    <div className="budget-row">
      <div className="budget-row-main">
        <label className="budget-row-label" htmlFor={inputId}>
          {category}
        </label>

        <div className="budget-row-input">
          <span className="budget-row-prefix" aria-hidden="true">
            Rs.
          </span>
          <input
            id={inputId}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="No limit"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setError("");
            }}
            onFocus={() => setError("")}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
          />
          {/* Sits inside the input's right edge, so the row never changes
              size when it appears. */}
          <svg
            className={`budget-row-check${status === "saved" ? " is-visible" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
      </div>

      {error && (
        <p className="budget-row-error" id={errorId} role="alert">
          {error}
        </p>
      )}

      {/* Always in the DOM, so the text is announced when it changes. */}
      <span className="sr-only" role="status">
        {status === "saved" && `${category} limit saved`}
        {status === "cleared" && `${category} limit cleared`}
      </span>
    </div>
  );
}

/**
 * Sets a recurring monthly limit per expense category. A limit applies to
 * every month until changed here - there is no per-month override, which
 * keeps this a one-time setup rather than something to revisit monthly.
 */
function Budget({ budgets, onSaveLimit }) {
  const limitCount = Object.keys(budgets).length;
  const totalLimit = Object.values(budgets).reduce(
    (sum, limit) => sum + limit,
    0,
  );

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Budget</h1>
          <p className="page-subtitle">
            Set a monthly spending limit for the categories you want to track.
          </p>
        </div>
      </header>

      <section className="budget-card" aria-labelledby="budget-title">
        <div className="budget-header">
          <h2 id="budget-title" className="budget-title">
            Monthly limits
          </h2>
          <span className="budget-summary">
            {limitCount > 0
              ? `${limitCount} limit${limitCount === 1 ? "" : "s"} \u00b7 ${formatCurrency(totalLimit)} total`
              : "No limits set yet"}
          </span>
        </div>

        <p className="budget-hint">
          Leave a field blank for no limit. Limits repeat every month until you
          change them, and save as soon as you leave the field. Press Enter to
          save or Esc to undo.
        </p>

        <div className="budget-rows">
          {EXPENSE_CATEGORIES.map((category) => (
            <BudgetRow
              key={category}
              category={category}
              limit={budgets[category]}
              onSave={onSaveLimit}
            />
          ))}
        </div>

        {limitCount > 0 && (
          <Link to="/" className="budget-dashboard-link">
            See your progress on the dashboard
          </Link>
        )}
      </section>
    </div>
  );
}

export default Budget;