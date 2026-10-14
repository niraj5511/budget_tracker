import { isValidBudgetMap, isValidTransaction, withCategory } from './storage'

/**
 * Backup file format. A plain JSON file the person downloads and keeps:
 *
 *   { app, version, exportedAt, transactions: [...], budgets: { category: limit } }
 *
 * `app` and `version` exist so a file from some other tool - or from a future
 * version of this one - is refused with a clear reason instead of being
 * half-understood and quietly wiping what is on screen.
 */
export const BACKUP_APP = 'artha-budget-tracker'
export const BACKUP_VERSION = 1
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024

const LAST_BACKUP_KEY = 'budget-tracker:last-backup'

export function createBackup(transactions, budgets, now = new Date()) {
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    transactions,
    budgets,
  }
}

export function backupFileName(isoDate) {
  return `artha-backup-${isoDate}.json`
}

/**
 * The local calendar date (YYYY-MM-DD) of a timestamp, or null if it is not
 * a usable one. Local parts, not toISOString(): that is the UTC date, which
 * is the wrong day for part of every evening in Nepal (UTC+5:45).
 */
export function isoFromTimestamp(timestamp) {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return null

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function fail(error) {
  return { ok: false, error }
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
  let data
  try {
    data = JSON.parse(text)
  } catch {
    return fail('This file is not valid JSON, so it cannot be a backup.')
  }

  if (!data || typeof data !== 'object' || Array.isArray(data) || data.app !== BACKUP_APP) {
    return fail('This does not look like an Artha backup file.')
  }
  if (typeof data.version !== 'number') {
    return fail('This backup has no version number, so it cannot be read safely.')
  }
  if (data.version > BACKUP_VERSION) {
    return fail('This backup was made by a newer version of the app. Update the app and try again.')
  }
  if (!Array.isArray(data.transactions)) {
    return fail('This backup has no list of transactions.')
  }

  let skipped = 0

  // Keep the first record for any id. A duplicate would collide as a React
  // key and make edits and deletes act on the wrong row.
  const seenIds = new Set()
  const transactions = []
  for (const item of data.transactions) {
    if (!isValidTransaction(item) || seenIds.has(item.id)) {
      skipped += 1
      continue
    }
    seenIds.add(item.id)
    transactions.push(
      withCategory({
        id: item.id,
        description: item.description,
        amount: item.amount,
        type: item.type,
        category: item.category,
        date: item.date,
      }),
    )
  }

  if (data.transactions.length > 0 && transactions.length === 0) {
    return fail('None of the transactions in this file could be read.')
  }

  const rawBudgets =
    data.budgets && typeof data.budgets === 'object' && !Array.isArray(data.budgets)
      ? data.budgets
      : {}
  const budgets = {}
  for (const [category, limit] of Object.entries(rawBudgets)) {
    // '__proto__' is a legal JSON key but assigning to it would change the
    // object's prototype instead of adding a category.
    if (category === '__proto__' || !isValidBudgetMap({ [category]: limit })) {
      skipped += 1
      continue
    }
    budgets[category] = limit
  }

  return {
    ok: true,
    transactions,
    budgets,
    skipped,
    exportedAt:
      typeof data.exportedAt === 'string' && isoFromTimestamp(data.exportedAt)
        ? data.exportedAt
        : null,
  }
}

/** When the person last downloaded a backup (ISO timestamp), or null. */
export function readLastBackup() {
  try {
    return localStorage.getItem(LAST_BACKUP_KEY)
  } catch {
    return null
  }
}

export function saveLastBackup(timestamp) {
  try {
    localStorage.setItem(LAST_BACKUP_KEY, timestamp)
  } catch {
    // Only the "last backed up" reminder is lost; the backup itself is fine.
  }
}