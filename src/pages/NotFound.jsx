import { Link } from 'react-router-dom'
import './NotFound.css'

/** Shown for any URL that matches no route, instead of an empty page. */
function NotFound() {
  return (
    <div className="page not-found">
      <p className="eyebrow">Error 404</p>
      <h1 className="page-title">Page not found</h1>
      <p className="page-subtitle">
        This page doesn&rsquo;t exist, or the link is out of date.
      </p>

      <div className="not-found-actions">
        <Link to="/" className="btn btn-primary">
          Go to dashboard
        </Link>
        <Link to="/transactions" className="btn btn-secondary">
          View transactions
        </Link>
      </div>
    </div>
  )
}

export default NotFound