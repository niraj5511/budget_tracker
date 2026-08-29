import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { colorFor } from '../utils/chartColors'
import { formatCurrency } from '../utils/format'
import './CategoryPieChart.css'

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { category, amount } = payload[0].payload

  return (
    <div className="pie-tooltip">
      <strong>{category}</strong>
      <span>{formatCurrency(amount)}</span>
    </div>
  )
}

/**
 * A donut chart for one side of the ledger (expense or income), plus a
 * legend list with amounts - the chart shows proportion at a glance, the
 * list gives the exact figure the chart can't label without crowding.
 */
function CategoryPieChart({ title, rows, emptyLabel, valueLabel }) {
  const total = rows.reduce((sum, row) => sum + row.amount, 0)

  return (
    <section className="pie-card">
      <h3 className="pie-title">{title}</h3>

      {rows.length === 0 ? (
        <p className="pie-empty">{emptyLabel}</p>
      ) : (
        <>
          <div className="pie-chart-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={rows}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {rows.map((row, index) => (
                    <Cell key={row.category} fill={colorFor(index)} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="pie-legend">
            {rows.map((row, index) => (
              <li className="pie-legend-row" key={row.category}>
                <span
                  className="pie-legend-swatch"
                  style={{ background: colorFor(index) }}
                  aria-hidden="true"
                />
                <span className="pie-legend-label">{row.category}</span>
                <span className="pie-legend-amount">
                  {formatCurrency(row.amount)}
                </span>
              </li>
            ))}
          </ul>

          <p className="pie-total">
            <span>{valueLabel}</span>
            <strong>{formatCurrency(total)}</strong>
          </p>
        </>
      )}
    </section>
  )
}

export default CategoryPieChart