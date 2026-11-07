import { useState } from "react";

// A password box with a Show / Hide button. `onChange` gets the new text.
export default function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  minLength,
  maxLength,
  hint,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="auth-field">
      <span>{label}</span>
      <span className="password-wrap">
        <input
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={minLength}
          maxLength={maxLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
        />
        <button
          type="button"
          className="password-toggle"
          aria-pressed={visible}
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </span>
      {hint && <small className="auth-hint">{hint}</small>}
    </label>
  );
}