import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const TITLES = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/budget': 'Budget',
}

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
  const { pathname } = useLocation()

  useEffect(() => {
    // '/budget/' and '/budget' are the same page to the router, so they
    // have to be the same title here too.
    const path = pathname.replace(/\/+$/, '') || '/'
    document.title = `${TITLES[path] ?? 'Page not found'} | Artha`
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default RouteEffects