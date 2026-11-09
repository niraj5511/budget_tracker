import { categoriesFor } from "../data/categories";
import {
  isValidBudgetMap,
  isValidTransaction,
  withCategory,
} from "./validation";

/**
 * Backup file format. A plain JSON file the person downloads and keeps:
 *
 *   { app, version, exportedAt, transactions: [...], budgets: { category: limit },
 *     loans: [...], categories: [{ type, name }] }
 *
 * Version 1 files have no `loans`, and versions 1 and 2 have no `categories`.
 * Restoring such a file leaves those alone.
 *
 * `app` and `version` exist so a file from some other tool - or from a future
 * version of this one - is refused with a clear reason instead of being
 * half-understood and quietly wiping what is on screen.
 */
export const BACKUP_APP = "artha-budget-tracker";
export const BACKUP_VERSION = 3;
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

const LAST_BACKUP_KEY = "budget-tracker:last-backup";

export function createBackup(
  transactions,
  budgets,
  loans,
  categories,
  now = new Date(),
) {
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    transactions,
    budgets,
    // Ids and the repaid total belong to the server. They are left out and
    // rebuilt when the file is restored.
    loans: loans.map((loan) => ({
      direction: loan.direction,
      person: loan.person,
      amount: loan.amount,
      date: loan.date,
      dueDate: loan.dueDate,
      note: loan.note,
      repayments: loan.repayments.map((repayment) => ({
        amount: repayment.amount,
        date: repayment.date,
        note: repayment.note,
      })),
    })),
    // Only the user's own categories. The built-in ones are part of the app.
    categories: categories.map(({ type, name }) => ({ type, name })),
  };
}

export function backupFileName(isoDate) {
  return `artha-backup-${isoDate}.json`;
}

/**
 * The local calendar date (YYYY-MM-DD) of a timestamp, or null if it is not
 * a usable one. Local parts, not toISOString(): that is the UTC date, which
 * is the wrong day for part of every evening in Nepal (UTC+5:45).
 */
export function isoFromTimestamp(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function fail(error) {
  return { ok: false, error };
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
// Same slack the server allows when comparing float amounts.
const AMOUNT_EPSILON = 0.005;

const isDate = (value) => typeof value === "string" && DATE_PATTERN.test(value);
const isPositiveNumber = (value) =>
  typeof value === "number" && Number.isFinite(value) && value > 0;
const isOptionalText = (value) =>
  value == null || (typeof value === "string" && value.length <= 500);

function readRepayment(item) {
  if (
    !item ||
    typeof item !== "object" ||
    !isPositiveNumber(item.amount) ||
    !isDate(item.date) ||
    !isOptionalText(item.note)
  ) {
    return null;
  }
  return {
    amount: item.amount,
    date: item.date,
    note: item.note?.trim() || null,
  };
}

/**
 * One loan from a backup, or null if it cannot be used. A bad repayment is
 * dropped and counted; a loan whose repayments add up to more than the loan
 * itself is refused, because the server would reject the whole restore.
 */
function readLoan(item) {
  if (!item || typeof item !== "object") return null;

  const person = typeof item.person === "string" ? item.person.trim() : "";
  if (!person || person.length > 100) return null;
  if (item.direction !== "lent" && item.direction !== "borrowed") return null;
  if (!isPositiveNumber(item.amount) || !isDate(item.date)) return null;
  if (item.dueDate != null && !isDate(item.dueDate)) return null;
  if (!isOptionalText(item.note)) return null;
  if (item.repayments != null && !Array.isArray(item.repayments)) return null;

  const repayments = [];
  let skipped = 0;
  for (const raw of item.repayments ?? []) {
    const repayment = readRepayment(raw);
    if (repayment) repayments.push(repayment);
    else skipped += 1;
  }

  const repaid = repayments.reduce(
    (sum, repayment) => sum + repayment.amount,
    0,
  );
  if (repaid > item.amount + AMOUNT_EPSILON) return null;

  return {
    skipped,
    loan: {
      direction: item.direction,
      person,
      amount: item.amount,
      date: item.date,
      dueDate: item.dueDate ?? null,
      note: item.note?.trim() || null,
      repayments,
    },
  };
}

const MAX_CATEGORY_NAME = 30;
const MAX_CUSTOM_PER_TYPE = 30;

/**
 * The custom categories from a backup. Entries that are unusable, duplicate
 * (ignoring case) or the same as a built-in name are dropped and counted, as
 * are any beyond the limit per type.
 */
function readCategories(list) {
  const categories = [];
  let skipped = 0;
  for (const item of list) {
    const type = item && typeof item === "object" ? item.type : null;
    const name = typeof item?.name === "string" ? item.name.trim() : "";
    if (
      (type !== "income" && type !== "expense") ||
      !name ||
      name.length > MAX_CATEGORY_NAME
    ) {
      skipped += 1;
      continue;
    }

    const sameType = categories.filter((category) => category.type === type);
    const known = [
      ...categoriesFor(type),
      ...sameType.map((category) => category.name),
    ];
    if (
      sameType.length >= MAX_CUSTOM_PER_TYPE ||
      known.some((existing) => existing.toLowerCase() === name.toLowerCase())
    ) {
      skipped += 1;
      continue;
    }
    categories.push({ type, name });
  }
  return { categories, skipped };
}
/**
 * Reads backup text into data the app can load, or explains why it cannot.
 * Never throws.
 *
 * Bad individual entries are dropped and counted rather than failing the
 * whole file - one damaged row should not make the rest unrecoverable - but a
 * file where nothing at all is usable is refused, because "restoring" it
 * would just erase the current data.
 */
export function parseBackup(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return fail("This file is not valid JSON, so it cannot be a backup.");
  }

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data) ||
    data.app !== BACKUP_APP
  ) {
    return fail("This does not look like an Artha backup file.");
  }
  if (typeof data.version !== "number") {
    return fail(
      "This backup has no version number, so it cannot be read safely.",
    );
  }
  if (data.version > BACKUP_VERSION) {
    return fail(
      "This backup was made by a newer version of the app. Update the app and try again.",
    );
  }
  if (!Array.isArray(data.transactions)) {
    return fail("This backup has no list of transactions.");
  }

  let skipped = 0;

  // Keep the first record for any id. A duplicate would collide as a React
  // key and make edits and deletes act on the wrong row.
  const seenIds = new Set();
  const transactions = [];
  for (const item of data.transactions) {
    if (!isValidTransaction(item) || seenIds.has(item.id)) {
      skipped += 1;
      continue;
    }
    seenIds.add(item.id);
    transactions.push(
      withCategory({
        id: item.id,
        description: item.description,
        amount: item.amount,
        type: item.type,
        category: item.category,
        date: item.date,
      }),
    );
  }

  if (data.transactions.length > 0 && transactions.length === 0) {
    return fail("None of the transactions in this file could be read.");
  }

  const rawBudgets =
    data.budgets &&
    typeof data.budgets === "object" &&
    !Array.isArray(data.budgets)
      ? data.budgets
      : {};
  const budgets = {};
  for (const [category, limit] of Object.entries(rawBudgets)) {
    // '__proto__' is a legal JSON key but assigning to it would change the
    // object's prototype instead of adding a category.
    if (category === "__proto__" || !isValidBudgetMap({ [category]: limit })) {
      skipped += 1;
      continue;
    }
    budgets[category] = limit;
  }

  // `null` means the file has no loans section (a version 1 backup), which is
  // different from an empty list: null leaves the loans alone on restore.
  let loans = null;
  if (data.loans !== undefined && data.loans !== null) {
    if (!Array.isArray(data.loans)) {
      return fail("The Lend / Borrow list in this file could not be read.");
    }
    loans = [];
    for (const item of data.loans) {
      const read = readLoan(item);
      if (!read) {
        skipped += 1;
        continue;
      }
      skipped += read.skipped;
      loans.push(read.loan);
    }
    if (data.loans.length > 0 && loans.length === 0) {
      return fail(
        "None of the Lend / Borrow records in this file could be read.",
      );
    }
  }

  // `null` means the file has no categories section (a version 1 or 2 backup),
  // which is different from an empty list: null leaves the categories alone.
  let categories = null;
  if (data.categories !== undefined && data.categories !== null) {
    if (!Array.isArray(data.categories)) {
      return fail("The custom categories in this file could not be read.");
    }
    const read = readCategories(data.categories);
    categories = read.categories;
    skipped += read.skipped;
    if (data.categories.length > 0 && categories.length === 0) {
      return fail("None of the custom categories in this file could be read.");
    }
  }

  return {
    ok: true,
    transactions,
    budgets,
    loans,
    categories,
    skipped,
    // ...the exportedAt lines stay as they are
    exportedAt:
      typeof data.exportedAt === "string" && isoFromTimestamp(data.exportedAt)
        ? data.exportedAt
        : null,
  };
}

/** When the person last downloaded a backup (ISO timestamp), or null. */
export function readLastBackup() {
  try {
    return localStorage.getItem(LAST_BACKUP_KEY);
  } catch {
    return null;
  }
}

export function saveLastBackup(timestamp) {
  try {
    localStorage.setItem(LAST_BACKUP_KEY, timestamp);
  } catch {
    // Only the "last backed up" reminder is lost; the backup itself is fine.
  }
}
