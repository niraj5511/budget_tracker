import { NavLink, Outlet } from "react-router-dom";
import "./ProfileLayout.css";

const TABS = [
  { to: "/profile", label: "Account", end: true },
  { to: "/profile/budgets", label: "Budgets" },
];

/** The frame around every page under /profile: a row of tabs, then the page. */
function ProfileLayout() {
  return (
    <div className="profile-layout">
      <nav className="profile-tabs" aria-label="Profile sections">
        {TABS.map(({ to, label, end }) => (
          <NavLink key={to} to={to} end={end} className="profile-tab">
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}

export default ProfileLayout;