import { Link, Navigate } from "react-router-dom";
import Brand from "../components/Brand";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/format";
import "./Welcome.css";

const FEATURES = [
  {
    title: "Income and expenses",
    text: "Record every transaction with a category and a date, and filter the list to find it again.",
  },
  {
    title: "Monthly budgets",
    text: "Set a limit for each category. You get a notice while adding an expense that nears or passes it.",
  },
  {
    title: "Lend and borrow",
    text: "Keep track of money you lent or borrowed, with due dates and repayments, apart from your balance.",
  },
  {
    title: "Monthly report",
    text: "See one month at a glance, compare it with the month before, and save it as a PDF.",
  },
  {
    title: "Your own categories",
    text: "Add categories on top of the built-in ones, and choose a default for new transactions.",
  },
  {
    title: "Backup and restore",
    text: "Download your data as a file and restore it whenever you need to.",
  },
];

// Made-up numbers for the preview card. They add up: 12,000 + 9,400 + 4,100
// + 5,700 = 31,200 spent, and 45,000 - 31,200 = 13,800 left.
const SAMPLE_CATEGORIES = [
  { name: "Rent", amount: 12000, percent: 38 },
  { name: "Food", amount: 9400, percent: 30 },
  { name: "Transport", amount: 4100, percent: 13 },
  { name: "Other", amount: 5700, percent: 18 },
];

/** The two ways in, used in the hero and again at the bottom. */
function Actions() {
  return (
    <div className="welcome-actions">
      <Link to="/register" className="btn btn-primary">
        Create account
      </Link>
      <Link to="/login" className="btn btn-secondary">
        Log in
      </Link>
    </div>
  );
}

/** What a new visitor sees: what Artha is, what it does, and how to start. */
export default function Welcome() {
  const { user } = useAuth();

  // Already signed in: there is nothing to introduce.
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="welcome">
      <header className="welcome-top">
        <Brand />
        <Link to="/login" className="welcome-login">
          Log in
        </Link>
      </header>

      <section className="welcome-hero">
        <div className="welcome-intro">
          <h1 className="welcome-title">Know where your money goes</h1>
          <p className="welcome-lead">
            Artha is a simple budget tracker for your income, expenses, budgets
            and the money you lend or borrow. Dates use the Nepali calendar.
          </p>
          <Actions />
        </div>

        <div className="welcome-preview" aria-hidden="true">
          <span className="welcome-sample">Sample data</span>
          <div className="welcome-stats">
            <div>
              <span className="welcome-stat-label">Income</span>
              <span className="welcome-stat-value welcome-income num">
                {formatCurrency(45000)}
              </span>
            </div>
            <div>
              <span className="welcome-stat-label">Expenses</span>
              <span className="welcome-stat-value welcome-expense num">
                {formatCurrency(31200)}
              </span>
            </div>
            <div>
              <span className="welcome-stat-label">Balance</span>
              <span className="welcome-stat-value num">
                {formatCurrency(13800)}
              </span>
            </div>
          </div>

          <ul className="welcome-categories">
            {SAMPLE_CATEGORIES.map(({ name, amount, percent }) => (
              <li key={name}>
                <span className="welcome-category-row">
                  <span>{name}</span>
                  <span className="num">{formatCurrency(amount)}</span>
                </span>
                <span className="welcome-track">
                  <span
                    className="welcome-fill"
                    style={{ width: `${percent}%` }}
                  />
                </span>
              </li>
            ))}
          </ul>

          <div className="welcome-budget">
            <span className="welcome-category-row">
              <span>Food budget</span>
              <span className="num">85% used</span>
            </span>
            <span className="welcome-track">
              <span
                className="welcome-fill welcome-fill--warning"
                style={{ width: "85%" }}
              />
            </span>
          </div>
        </div>
      </section>

      <section aria-labelledby="welcome-features">
        <h2 id="welcome-features" className="welcome-heading">
          What you can do
        </h2>
        <ul className="welcome-features">
          {FEATURES.map(({ title, text }) => (
            <li key={title} className="welcome-feature">
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="welcome-final">
        <h2 className="welcome-heading">Ready to start?</h2>
        <p>
          Create an account and start tracking. Each account sees only its own
          data.
        </p>
        <Actions />
      </section>
    </div>
  );
}