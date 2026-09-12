import { useRef, useState } from "react";
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
  const [saved, setSaved] = useState(false);
  // blur() fires synchronously, before the setValue() from an Escape revert
  // has committed - so handleBlur would otherwise still see the old typed
  // text. This flag tells it to skip the save-on-blur logic entirely.
  const revertingRef = useRef(false);

  function handleBlur() {
    if (revertingRef.current) {
      revertingRef.current = false;
      return;
    }

    const trimmed = value.trim();

    if (!trimmed) {
      if (limit !== undefined) onSave(category, null);
      return;
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      // Invalid entry reverts to the last saved value instead of silently
      // keeping bad text in the field.
      setValue(limit ? String(limit) : "");
      return;
    }

    onSave(category, Math.round(parsed * 100) / 100);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
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
      event.currentTarget.blur();
    }
  }

  return (
    <div className="budget-row">
      <label className="budget-row-label" htmlFor={`budget-${category}`}>
        {category}
      </label>
      <div className="budget-row-input">
        <span className="budget-row-prefix" aria-hidden="true">
          Rs.
        </span>
        <input
          id={`budget-${category}`}
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          placeholder="No limit"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </div>
      {saved && (
        <span className="budget-row-saved" aria-live="polite">
          Saved
        </span>
      )}
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
      <section className="budget-card">
        <div className="budget-header">
          <h2 className="budget-title">Monthly budget limits</h2>
          {limitCount > 0 && (
            <span className="budget-summary">
              {limitCount} categor{limitCount === 1 ? "y" : "ies"} &middot;{" "}
              {formatCurrency(totalLimit)} total
            </span>
          )}
        </div>
        <p className="budget-hint">
          Set a limit for any category you want to track. Leave it blank for no
          limit. These apply every month until you change them here.
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
      </section>
    </div>
  );
}

export default Budget;
