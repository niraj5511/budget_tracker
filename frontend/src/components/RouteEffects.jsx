import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const TITLES = {
  "/": "Dashboard",
  "/login": "Log in",
  "/register": "Create account",
  "/welcome": "Welcome",
  "/transactions": "Transactions",
  "/profile/budgets": "Budget",
  "/profile/backup": "Backup",
  "/loans": "Lend / Borrow",
  "/report": "Monthly report",
  "/profile/categories": "Categories",
  "/profile": "Profile",
};

/**
 * Two things a single-page app has to do by hand on every navigation, because
 * the browser only does them for real page loads:
 *
 * - scroll back to the top (BrowserRouter keeps the old scroll position, so
 *   leaving the bottom of a long list lands you halfway down the next page);
 * - update the tab title, which is also what screen readers and the browser's
 *   history menu show for the page.
 *
 * Renders nothing. Must sit inside the router.
 */
function RouteEffects() {
  const { pathname } = useLocation();

  useEffect(() => {
    // '/profile/' and '/profile' are the same page to the router, so they
    // have to be the same title here too.
    const path = pathname.replace(/\/+$/, "") || "/";
    document.title = `${TITLES[path] ?? "Page not found"} | Artha`;
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default RouteEffects;
