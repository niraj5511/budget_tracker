import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "../utils/format";
import { ALL_MONTHS } from "../utils/months";
import { monthlyTrend } from "../utils/monthlyTrend";
import "./MonthlyTrendChart.css";

/** How many trailing months to show when no single month is selected. */
const RECENT_MONTHS_COUNT = 6;

/**
 * Short axis labels in the lakh/crore style used in Nepal:
 * 1500 -> 1.5k, 125000 -> 1.3L, 25000000 -> 2.5Cr.
 * Full amounts stay in the tooltip; the axis only needs a rough scale.
 */
function compactAmount(value) {
  const abs = Math.abs(value);
  const trim = (n) => String(Number(n.toFixed(1)));

  if (abs >= 1e7) return `${trim(value / 1e7)}Cr`;
  if (abs >= 1e5) return `${trim(value / 1e5)}L`;
  if (abs >= 1e3) return `${trim(value / 1e3)}k`;
  return String(value);
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { label, income, expense } = payload[0].payload;
  const net = income - expense;

  return (
    <div className="trend-tooltip">
      <strong className="trend-tooltip-title">{label}</strong>

      <div className="trend-tooltip-row">
        <span className="trend-dot is-income" aria-hidden="true" />
        <span className="trend-tooltip-name">Income</span>
        <span className="trend-tooltip-value num">
          {formatCurrency(income)}
        </span>
      </div>
      <div className="trend-tooltip-row">
        <span className="trend-dot is-expense" aria-hidden="true" />
        <span className="trend-tooltip-name">Expense</span>
        <span className="trend-tooltip-value num">
          {formatCurrency(expense)}
        </span>
      </div>

      <div className="trend-tooltip-row is-net">
        <span className="trend-tooltip-name">Net</span>
        <span
          className={`trend-tooltip-value num ${net < 0 ? "is-negative" : "is-positive"}`}
        >
          {formatCurrency(net)}
        </span>
      </div>
    </div>
  );
}

function MonthlyTrendChart({ transactions, activeMonth }) {
  const allData = monthlyTrend(transactions);
  const isAllTime = activeMonth === ALL_MONTHS;

  const data = isAllTime
    ? allData.slice(-RECENT_MONTHS_COUNT)
    : allData.filter((row) => row.key === activeMonth);

  let scope = "";
  if (data.length > 0) {
    if (!isAllTime) scope = data[0].label;
    else
      scope =
        allData.length > RECENT_MONTHS_COUNT
          ? `Last ${RECENT_MONTHS_COUNT} months`
          : "All months";
  }

  return (
    <section className="trend-card" aria-labelledby="trend-title">
      <div className="trend-header">
        <div>
          <h2 id="trend-title" className="trend-title">
            Income vs. expense
          </h2>
          {scope && <p className="trend-scope">{scope}</p>}
        </div>

        {data.length > 0 && (
          <ul className="trend-legend" aria-hidden="true">
            <li>
              <span className="trend-dot is-income" /> Income
            </li>
            <li>
              <span className="trend-dot is-expense" /> Expense
            </li>
          </ul>
        )}
      </div>

      {data.length === 0 ? (
        <p className="trend-empty">
          Add a few transactions and your monthly trend will appear here.
        </p>
      ) : (
        <>
          <div className="trend-chart-wrap" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                barGap={4}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 4"
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={compactAmount}
                  width={44}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "var(--surface-2)" }}
                />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="var(--income)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="var(--expense)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* The chart is a picture to screen readers; this table is the
              same data in a form they can actually read. */}
          <table className="sr-only">
            <caption>Income and expense by month</caption>
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col">Income</th>
                <th scope="col">Expense</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.key}>
                  <th scope="row">{row.label}</th>
                  <td>{formatCurrency(row.income)}</td>
                  <td>{formatCurrency(row.expense)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}

export default MonthlyTrendChart;
