import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PasswordField from "../components/PasswordField";
import { changePassword, deleteAccount } from "../utils/api";
import "./Auth.css";

export default function Profile() {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setDone(false);
    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setDone(true);
    } catch (err) {
      if (err.status === 403) setError("Current password is wrong.");
      else if (err.status === 429)
        setError("Too many attempts. Try again in 15 minutes.");
      else setError("Could not change the password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(event) {
    event.preventDefault();
    setDeleteError("");
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      logout();
    } catch (err) {
      if (err.status === 403) setDeleteError("Password is wrong.");
      else if (err.status === 429)
        setDeleteError("Too many attempts. Try again in 15 minutes.");
      else setDeleteError("Could not delete the account. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card profile-card">
        <div>
          <h1 className="auth-title">Profile</h1>
          <p className="auth-switch">{user?.email}</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={logout}>
          Log out
        </button>
      </div>

      <form className="auth-card" onSubmit={handleSubmit}>
        <h2 className="auth-title">Change password</h2>

        <PasswordField
          label="Current password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={setCurrentPassword}
        />

        <PasswordField
          label="New password"
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          value={newPassword}
          onChange={setNewPassword}
        />

        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        {done && (
          <p className="auth-success" role="status">
            Password changed.
          </p>
        )}

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Change password"}
        </button>
      </form>

      <form className="auth-card" onSubmit={handleDelete}>
        <h2 className="auth-title">Delete account</h2>
        <p className="auth-switch">
          This permanently deletes your account and all your transactions,
          budgets and loans. It cannot be undone. To keep a copy first, use
          the <Link to="/backup">Backup page</Link>.
        </p>

        <PasswordField
          label="Password"
          autoComplete="current-password"
          value={deletePassword}
          onChange={setDeletePassword}
        />

        {deleteError && (
          <p className="auth-error" role="alert">
            {deleteError}
          </p>
        )}

        <button className="btn btn-danger" type="submit" disabled={deleting}>
          {deleting ? "Deleting..." : "Delete my account"}
        </button>
      </form>
    </section>
  );
}