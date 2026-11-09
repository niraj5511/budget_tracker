import { useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import { categoriesFor } from "../data/categories";
import "./Categories.css";

const MAX_NAME = 30;
const MAX_PER_TYPE = 30;

function errorMessage(error) {
  if (error.status === 409) return "That name is already used.";
  if (error.status === 400) return `Use a name of 1 to ${MAX_NAME} characters.`;
  return "Something went wrong. Please try again.";
}

/** One custom category: its name, with Rename and Delete. */
function CategoryRow({ category, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function startEditing() {
    setName(category.name);
    setError("");
    setEditing(true);
  }

  async function handleSave(event) {
    event.preventDefault();
    const next = name.trim();
    if (!next) {
      setError("Enter a name.");
      return;
    }
    if (next === category.name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onRename(category.id, next);
      setEditing(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="category-row">
      {editing ? (
        <form className="category-edit" onSubmit={handleSave}>
          <input
            type="text"
            aria-label={`New name for ${category.name}`}
            value={name}
            maxLength={MAX_NAME}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
          <button type="submit" className="btn btn-primary" disabled={saving}>
            Save
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="category-row-main">
          <span className="category-name">{category.name}</span>
          <span className="category-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={startEditing}
            >
              Rename
            </button>
            <button
              type="button"
              className="btn btn-secondary category-delete"
              onClick={() => onDelete(category)}
            >
              Delete
            </button>
          </span>
        </div>
      )}
      {error && (
        <p className="category-error" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}

/** The expense or the income half of the page. */
function CategorySection({
  type,
  title,
  custom,
  transactions,
  budgets,
  onAdd,
  onRename,
  onDelete,
}) {
  const builtIn = categoriesFor(type);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  // The category waiting for the user to confirm its deletion.
  const [pending, setPending] = useState(null);

  const atLimit = custom.length >= MAX_PER_TYPE;
  const affected = pending
    ? transactions.filter(
        (t) => t.type === type && t.category === pending.name,
      ).length
    : 0;
  const hasBudget = Boolean(pending) && type === "expense" && pending.name in budgets;

  async function handleAdd(event) {
    event.preventDefault();
    const next = name.trim();
    if (!next) {
      setError("Enter a name.");
      return;
    }
    setAdding(true);
    setError("");
    try {
      await onAdd(type, next);
      setName("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setAdding(false);
    }
  }

  async function handleConfirmDelete() {
    const target = pending;
    setPending(null);
    setError("");
    try {
      await onDelete(target.id);
    } catch {
      setError("Could not delete the category. Please try again.");
    }
  }

  return (
    <section className="category-card" aria-labelledby={`${type}-categories`}>
      <h2 id={`${type}-categories`} className="category-title">
        {title}
      </h2>

      <form className="category-add" onSubmit={handleAdd}>
        <input
          type="text"
          aria-label={`New ${type} category`}
          placeholder="New category name"
          value={name}
          maxLength={MAX_NAME}
          disabled={atLimit}
          onChange={(event) => setName(event.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={adding || atLimit}
        >
          Add
        </button>
      </form>
      {atLimit && (
        <p className="category-note">
          You have reached the limit of {MAX_PER_TYPE} custom categories.
        </p>
      )}
      {error && (
        <p className="category-error" role="alert">
          {error}
        </p>
      )}

      {custom.length > 0 ? (
        <ul className="category-list">
          {custom.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              onRename={onRename}
              onDelete={setPending}
            />
          ))}
        </ul>
      ) : (
        <p className="category-note">No custom categories yet.</p>
      )}

      <h3 className="category-subtitle">Built in</h3>
      <ul className="category-chips">
        {builtIn.map((builtInName) => (
          <li key={builtInName}>{builtInName}</li>
        ))}
      </ul>

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending ? `Delete "${pending.name}"?` : "Delete category?"}
        confirmLabel="Delete category"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPending(null)}
      >
        {pending && (
          <>
            <p>
              {affected > 0
                ? `${affected} transaction${affected === 1 ? "" : "s"} will move to Other.`
                : "No transactions use this category."}
              {hasBudget ? " Its budget limit will be removed." : ""}
            </p>
            <p>This can&rsquo;t be undone.</p>
          </>
        )}
      </ConfirmDialog>
    </section>
  );
}

function Categories({
  categories,
  transactions,
  budgets,
  onAdd,
  onRename,
  onDelete,
}) {
  const customFor = (type) =>
    categories
      .filter((category) => category.type === type)
      .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">
            Add your own categories. The built-in ones can&rsquo;t be changed.
          </p>
        </div>
      </header>

      <div className="category-grid">
        <CategorySection
          type="expense"
          title="Expense categories"
          custom={customFor("expense")}
          transactions={transactions}
          budgets={budgets}
          onAdd={onAdd}
          onRename={onRename}
          onDelete={onDelete}
        />
        <CategorySection
          type="income"
          title="Income categories"
          custom={customFor("income")}
          transactions={transactions}
          budgets={budgets}
          onAdd={onAdd}
          onRename={onRename}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}

export default Categories;