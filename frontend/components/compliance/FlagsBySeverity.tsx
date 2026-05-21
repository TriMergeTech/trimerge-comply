'use client'

// Flags by severity component
// Displays a donut chart breakdown of flags by severity level
// Accepts real API data via props

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type Props = {
  flagsBySeverity?: {
    low?: number
    medium?: number
    high?: number
  }
}

const COLORS = {
  low: '#4ade80',
  medium: '#facc15',
  high: '#fb923c',
}

export default function FlagsBySeverity({ flagsBySeverity }: Props) {
  // Build chart data from API response or fall back to zeros
  const severityData = [
    { name: 'Low', value: flagsBySeverity?.low ?? 0, color: COLORS.low },
    { name: 'Medium', value: flagsBySeverity?.medium ?? 0, color: COLORS.medium },
    { name: 'High', value: flagsBySeverity?.high ?? 0, color: COLORS.high },
  ]

  const total = severityData.reduce((acc, item) => acc + item.value, 0)

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">

      {/* Card header */}
      <h3 className="text-slate-800 font-semibold text-base mb-5">
        Flags by Severity
      </h3>

      {/* Donut chart */}
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={severityData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {severityData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `${value} flags`}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs text-slate-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Total */}
      <div className="mt-2 pt-4 border-t border-slate-100 flex items-center justify-between">
        <p className="text-sm text-slate-400">Total Flags</p>
        <p className="text-sm font-bold text-slate-800">{total}</p>
      </div>

    </div>
  )
}