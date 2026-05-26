// Pay gaps by department chart component
// Displays horizontal bar chart showing pay gaps per department

import { type DepartmentGap } from '@/lib/api/payequity'

type PayGapsChartProps = {
  gaps: DepartmentGap[] | null
}

export default function PayGapsChart({ gaps }: PayGapsChartProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">

      {/* Card header */}
      <h3 className="text-slate-800 font-semibold text-base mb-5">
        Pay Gaps by Department
      </h3>

      {/* Empty state */}
      {(!gaps || gaps.length === 0) ? (
        <p className="text-sm text-slate-400 py-4 text-center">
          No department data yet — upload a compensation file to see gaps.
        </p>
      ) : (
        /* Horizontal bars */
        <div className="flex flex-col gap-4">
          {gaps.map((item, index) => (
            <div key={index} className="flex items-center gap-4">

              {/* Department name */}
              <p className="text-sm text-slate-600 w-24 shrink-0">{item.department}</p>

              {/* Bar container */}
              <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-indigo-500"
                  style={{ width: `${Math.min(Math.abs(item.gap) * 10, 100)}%` }}
                />
              </div>

              {/* Gap percentage */}
              <p className={`text-sm font-medium w-14 text-right shrink-0 ${
                item.gap < 0 ? 'text-red-500' : 'text-green-500'
              }`}>
                {item.gap > 0 ? '+' : ''}{item.gap}%
              </p>

            </div>
          ))}
        </div>
      )}

    </div>
  )
}
