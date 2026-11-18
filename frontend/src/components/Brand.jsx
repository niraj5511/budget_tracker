import { Link } from "react-router-dom";

/**
 * The Artha logo and name. With `to` it is a link, without it plain text.
 * The look comes from the .brand-* rules in Navbar.css, so it matches the
 * header exactly.
 */
export default function Brand({ to }) {
  const content = (
    <>
      <span className="brand-icon-wrapper" aria-hidden="true">
        <svg
          className="brand-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </span>
      <span className="brand-name">Artha</span>
    </>
  );

  return to ? (
    <Link to={to} className="brand-lockup" aria-label="Artha">
      {content}
    </Link>
  ) : (
    <span className="brand-lockup">{content}</span>
  );
}