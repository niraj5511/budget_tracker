import { useRef, useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import {
  backupFileName,
  createBackup,
  isoFromTimestamp,
  MAX_BACKUP_BYTES,
  parseBackup,
  readLastBackup,
  saveLastBackup,
} from '../utils/backup'
import { todayIso } from '../utils/format'
import { formatBsDate } from '../utils/nepaliDate'
import './Backup.css'

function count(n, singular, plural = `${singular}s`) {
  return `${n} ${n === 1 ? singular : plural}`
}

/** A timestamp as a Nepali date, or null when it has no BS form. */
function bsLabel(timestamp) {
  const iso = timestamp ? isoFromTimestamp(timestamp) : null
  return iso ? formatBsDate(iso) : null
}

/**
 * Everything lives in this browser's storage, so clearing site data or moving
 * to another device loses it. This page turns that data into a file the
 * person keeps, and loads such a file back.
 */
function Backup({ transactions, budgets, onRestore }) {
  const limitCount = Object.keys(budgets).length
  const hasData = transactions.length > 0 || limitCount > 0

  const [lastBackup, setLastBackup] = useState(() => readLastBackup())
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  // A successfully read file waiting for the person to confirm replacing data.
  const [pending, setPending] = useState(null)
  const fileInputRef = useRef(null)

  function handleDownload() {
    const backup = createBackup(transactions, budgets)
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = backupFileName(todayIso())
    document.body.appendChild(link)
    link.click()
    link.remove()
    // Not straight away: some browsers have not started the download yet.
    setTimeout(() => URL.revokeObjectURL(url), 1000)

    saveLastBackup(backup.exportedAt)
    setLastBackup(backup.exportedAt)
    setError('')
    setNotice('')
  }

  async function handleFileChosen(event) {
    const input = event.target
    const file = input.files?.[0]
    // Cleared so choosing the same file again still fires a change event.
    input.value = ''

    setError('')
    setNotice('')
    if (!file) return

    if (file.size > MAX_BACKUP_BYTES) {
      setError('That file is too large to be a backup (the limit is 5 MB).')
      return
    }

    let text
    try {
      text = await file.text()
    } catch {
      setError('The file could not be read. Try choosing it again.')
      return
    }

    const result = parseBackup(text)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setPending(result)
  }

  function handleConfirmRestore() {
    if (!pending) return

    onRestore({ transactions: pending.transactions, budgets: pending.budgets })
    setNotice(
      `Restored ${count(pending.transactions.length, 'transaction')} and ${count(
        Object.keys(pending.budgets).length,
        'budget limit',
      )}.`,
    )
    setPending(null)
  }

  const lastBackupLabel = bsLabel(lastBackup)
  const savedOnLabel = pending ? bsLabel(pending.exportedAt) : null

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Backup</h1>
          <p className="page-subtitle">
            Your data is stored only in this browser. Keep a copy, or move it to
            another device.
          </p>
        </div>
      </header>

      <div className="backup-stack">
        <section className="backup-card" aria-labelledby="backup-export-title">
          <h2 id="backup-export-title" className="backup-title">
            Download a backup
          </h2>
          <p className="backup-text">
            Saves your {count(transactions.length, 'transaction')} and{' '}
            {count(limitCount, 'budget limit')} to a file on this device.
          </p>

          <div className="backup-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleDownload}
              disabled={!hasData}
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
                className="backup-btn-icon"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="M7 10l5 5 5-5" />
                <path d="M12 15V3" />
              </svg>
              Download backup
            </button>
            <span className="backup-meta">
              {!hasData
                ? 'Nothing to back up yet.'
                : lastBackupLabel
                  ? `Last backup: ${lastBackupLabel}`
                  : 'No backup yet.'}
            </span>
          </div>
        </section>

        <section className="backup-card" aria-labelledby="backup-restore-title">
          <h2 id="backup-restore-title" className="backup-title">
            Restore from a backup
          </h2>
          <p className="backup-text">
            Choose a file you downloaded earlier. Restoring replaces everything
            currently in the app, so you will be asked to confirm first.
          </p>

          <div className="backup-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose backup file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="sr-only"
              tabIndex={-1}
              aria-label="Backup file"
              onChange={handleFileChosen}
            />
          </div>

          {error && (
            <p className="backup-error" role="alert">
              {error}
            </p>
          )}

          {/* Always in the DOM so the text is announced when it appears. */}
          <p className="backup-success" role="status">
            {notice}
          </p>
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(pending)}
        title="Restore this backup?"
        confirmLabel="Replace my data"
        onConfirm={handleConfirmRestore}
        onCancel={() => setPending(null)}
      >
        {pending && (
          <>
            <p className="restore-summary">
              <strong>
                {count(pending.transactions.length, 'transaction')} and{' '}
                {count(Object.keys(pending.budgets).length, 'budget limit')}
              </strong>
              {savedOnLabel && <span>Saved on {savedOnLabel}</span>}
            </p>
            <p>
              This replaces your current {count(transactions.length, 'transaction')}{' '}
              and {count(limitCount, 'budget limit')}, and it can&rsquo;t be undone. If
              you might need your current data, download a backup of it first.
            </p>
            {pending.skipped > 0 && (
              <p className="restore-warning">
                {count(pending.skipped, 'entry', 'entries')} in the file could not
                be read and will be left out.
              </p>
            )}
          </>
        )}
      </ConfirmDialog>
    </div>
  )
}

export default Backup