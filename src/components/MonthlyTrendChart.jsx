import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '../utils/format'
import { ALL_MONTHS } from '../utils/months'
import { monthlyTrend } from '../utils/monthlyTrend'
import './MonthlyTrendChart.css'

/** How many trailing months to show when no single month is selected. */
const RECENT_MONTHS_COUNT = 6

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { label, income, expense } = payload[0].payload

  return (
    <div className="trend-tooltip">
      <strong>{label}</strong>
      <span className="trend-tooltip-income">
        Income: {formatCurrency(income)}
      </span>
      <span className="trend-tooltip-expense">
        Expense: {formatCurrency(expense)}
      </span>
    </div>
  )
}

function MonthlyTrendChart({ transactions, activeMonth }) {
  const allData = monthlyTrend(transactions)

  const data =
    activeMonth === ALL_MONTHS
      ? allData.slice(-RECENT_MONTHS_COUNT)
      : allData.filter((row) => row.key === activeMonth)

  return (
    <section className="trend-card">
      <h3 className="trend-title">Income vs. expense by month</h3>

      {data.length === 0 ? (
        <p className="trend-empty">Nothing to trend yet.</p>
      ) : (
        <div className="trend-chart-wrap">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--bg)' }} />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Bar
                dataKey="income"
                name="Income"
                fill="var(--income)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="var(--expense)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}

export default MonthlyTrendChart