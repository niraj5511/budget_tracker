import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { colorFor } from '../utils/chartColors'
import { formatCurrency } from '../utils/format'
import './CategoryPieChart.css'

/** 0 -> '0%', 0.4 -> '<1%', 24.6 -> '25%'. A real slice never reads as 0%. */
function formatShare(amount, total) {
  if (total <= 0) return '0%'
  const percent = (amount / total) * 100
  if (percent > 0 && percent < 1) return '<1%'
  return `${Math.round(percent)}%`
}

function ChartTooltip({ active, payload, total }) {
  if (!active || !payload?.length) return null
  const { category, amount } = payload[0].payload

  return (
    <div className="pie-tooltip">
      <strong>{category}</strong>
      <span className="num">
        {formatCurrency(amount)} &middot; {formatShare(amount, total)}
      </span>
    </div>
  )
}

function CategoryPieChart({ title, rows = [], emptyLabel, valueLabel }) {
  const total = rows.reduce((sum, row) => sum + row.amount, 0)

  return (
    <section className="pie-card">
      <h3 className="pie-title">{title}</h3>

      {rows.length === 0 ? (
        <p className="pie-empty">{emptyLabel}</p>
      ) : (
        <div className="pie-body">
          {/* The legend list is the readable version of this chart, so the
              drawing itself is hidden from screen readers. */}
          <div className="pie-chart-wrap" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rows}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius="62%"
                  outerRadius="94%"
                  paddingAngle={2}
                  cornerRadius={4}
                  stroke="none"
                >
                  {rows.map((row, index) => (
                    <Cell key={row.category} fill={colorFor(index)} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip total={total} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pie-details">
            <p className="pie-total">
              <span className="eyebrow">{valueLabel}</span>
              <strong className="pie-total-value num">{formatCurrency(total)}</strong>
            </p>

            <ul className="pie-legend">
              {rows.map((row, index) => (
                <li className="pie-legend-row" key={row.category}>
                  <div className="pie-legend-top">
                    <span
                      className="pie-legend-swatch"
                      style={{ background: colorFor(index) }}
                      aria-hidden="true"
                    />
                    <span className="pie-legend-label">{row.category}</span>
                    <span className="pie-legend-amount num">
                      {formatCurrency(row.amount)}
                    </span>
                    <span className="pie-legend-share num">
                      {formatShare(row.amount, total)}
                    </span>
                  </div>
                  <div className="pie-legend-bar" aria-hidden="true">
                    <div
                      className="pie-legend-bar-fill"
                      style={{
                        width: `${Math.max((row.amount / total) * 100, 2)}%`,
                        background: colorFor(index),
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}

export default CategoryPieChart