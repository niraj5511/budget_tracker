import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSlow } from "../utils/useSlow";
import PasswordField from "../components/PasswordField";
import "./Auth.css";

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const slow = useSlow(submitting);
  const location = useLocation();

  // Signed in: go back to the page the user was sent from, or the dashboard.
  const from = location.state?.from?.pathname || "/";
  if (user) return <Navigate to={from} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      if (err.status === 401) setError("Invalid email or password.");
      else if (err.status === 429)
        setError("Too many attempts. Try again in 15 minutes.");
      else setError("Could not sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">Log in</h1>

        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <PasswordField
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </button>

        {slow && (
          <p className="auth-hint" role="status">
            The server was asleep and is starting. This can take up to a minute.
          </p>
        )}

        <p className="auth-switch">
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </section>
  );
}
