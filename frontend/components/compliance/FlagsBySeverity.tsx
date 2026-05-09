'use client'

// Flags by severity component
// Displays a donut chart breakdown of flags by severity level

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Temporary mock data — will be replaced with real API data later
const severityData = [
  { name: 'Critical', value: 7, color: '#ef4444' },
  { name: 'High', value: 18, color: '#fb923c' },
  { name: 'Medium', value: 14, color: '#facc15' },
  { name: 'Low', value: 9, color: '#4ade80' },
]

export default function FlagsBySeverity() {
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
        <p className="text-sm font-bold text-slate-800">
          {severityData.reduce((acc, item) => acc + item.value, 0)}
        </p>
      </div>

    </div>
  )
}