import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSlow } from "../utils/useSlow";
import PasswordField from "../components/PasswordField";
import "./Auth.css";

export default function Register() {
  const { user, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const slow = useSlow(submitting);

  if (user) return <Navigate to="/" replace />;

  // Shows how many characters are still missing while the user types.
  const missing = 8 - password.length;
  const passwordHint =
    password.length === 0 || missing <= 0
      ? "8 to 72 characters"
      : `${missing} more character${missing === 1 ? "" : "s"} needed`;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(email, password);
    } catch (err) {
      if (err.status === 409) setError("That email is already registered.");
      else if (err.status === 400)
        setError("Enter a valid email and a password of 8 to 72 characters.");
      else setError("Could not register. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">Create account</h1>

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
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          value={password}
          onChange={setPassword}
          hint={passwordHint}
        />

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Register"}
        </button>

        {slow && (
          <p className="auth-hint" role="status">
            The server was asleep and is starting. This can take up to a minute.
          </p>
        )}
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </section>
  );
}
