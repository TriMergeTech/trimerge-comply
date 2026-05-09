// Pay gaps by department chart component
// Displays horizontal bar chart showing pay gaps per department

// Temporary mock data — will be replaced with real API data later
const departmentGaps = [
  { department: 'Engineering', gap: -6.7 },
  { department: 'Finance', gap: -5.2 },
  { department: 'Operations', gap: -4.8 },
  { department: 'HR', gap: -3.2 },
  { department: 'IT', gap: -2.1 },
]

export default function PayGapsChart() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">

      {/* Card header */}
      <h3 className="text-slate-800 font-semibold text-base mb-5">
        Pay Gaps by Department
      </h3>

      {/* Horizontal bars */}
      <div className="flex flex-col gap-4">
        {departmentGaps.map((item, index) => (
          <div key={index} className="flex items-center gap-4">

            {/* Department name */}
            <p className="text-sm text-slate-600 w-24 shrink-0">{item.department}</p>

            {/* Bar container */}
            <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-indigo-500"
                style={{ width: `${Math.abs(item.gap) * 10}%` }}
              />
            </div>

            {/* Gap percentage */}
            <p className="text-sm font-medium text-red-500 w-12 text-right shrink-0">
              {item.gap}%
            </p>

          </div>
        ))}
      </div>

    </div>
  )
}