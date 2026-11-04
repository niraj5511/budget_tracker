import { useSlow } from '../utils/useSlow'
import './DataStatus.css'

/**
 * Shown instead of the pages while the signed-in user's data is loading or
 * has failed to load. Without it the pages render empty, and the dashboard
 * would greet an existing user with its "no transactions yet" welcome.
 */
export default function DataStatus({ state, onRetry }) {
  const slow = useSlow(state === 'loading')

  if (state === 'error') {
    return (
      <section className="data-status" role="alert">
        <h1 className="data-status-title">Could not load your data</h1>
        <p className="data-status-text">
          The server did not answer. Check your connection, then try again.
        </p>
        <button className="btn btn-primary" type="button" onClick={onRetry}>
          Try again
        </button>
      </section>
    )
  }

  return (
    <section className="data-status" role="status" aria-live="polite">
      <span className="data-status-spinner" aria-hidden="true" />
      <h1 className="data-status-title">Loading your data</h1>
      {slow && (
        <p className="data-status-text">
          The server was asleep and is starting. This can take up to a minute.
        </p>
      )}
    </section>
  )
}