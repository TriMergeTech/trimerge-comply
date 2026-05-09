'use client'

// Flags by engine component
// Displays a donut chart breakdown of flags by compliance engine

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Temporary mock data — will be replaced with real API data later
const engineData = [
  { name: 'Adverse Impact', value: 22, color: '#6366f1' },
  { name: 'Position Description', value: 17, color: '#60a5fa' },
  { name: 'Pay Equity', value: 9, color: '#22d3ee' },
]

export default function FlagsByEngine() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">

      {/* Card header */}
      <h3 className="text-slate-800 font-semibold text-base mb-5">
        Flags by Engine
      </h3>

      {/* Donut chart */}
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={engineData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {engineData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => value !== undefined ? `${value} flags` : 'No data'}
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
          {engineData.reduce((acc, item) => acc + item.value, 0)}
        </p>
      </div>

    </div>
  )
}