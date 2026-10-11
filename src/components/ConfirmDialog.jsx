import { useEffect, useId, useRef } from 'react'
import './ConfirmDialog.css'

/**
 * A confirmation prompt built on the native <dialog> element, so the browser
 * supplies the hard parts: focus is trapped inside, the page behind is inert,
 * and Escape closes it. Replaces window.confirm, which cannot be styled and
 * looks like a system error.
 *
 * The parent owns `open`. Cancel, Escape and a click on the backdrop all call
 * `onCancel`; the confirm button calls `onConfirm`.
 */
function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  function handleConfirm() {
    // Close first: while the modal is open everything outside it is inert, so
    // the parent could not move focus anywhere in its own handler.
    dialogRef.current?.close()
    onConfirm()
  }

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby={titleId}
      // Fires for Escape too. When the parent has already closed us (after a
      // confirm) `open` is false by the time this runs, so it is ignored.
      onClose={() => {
        if (open) onCancel()
      }}
      // A click on the dimmed area lands on the <dialog> itself, not on the
      // panel inside it.
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div className="confirm-dialog-panel">
        <h2 id={titleId} className="confirm-dialog-title">
          {title}
        </h2>

        <div className="confirm-dialog-body">{children}</div>

        <div className="confirm-dialog-actions">
          {/* First and auto-focused: the safe choice is what Enter hits. */}
          <button type="button" className="btn btn-secondary" onClick={onCancel} autoFocus>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn-danger" onClick={handleConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default ConfirmDialog