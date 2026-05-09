// Demographic gaps table component
// Displays overall pay gaps by demographic group

// Temporary mock data — will be replaced with real API data later
const demographicGaps = [
  { group: 'Female', gap: -6.4, flagged: true },
  { group: 'Hispanic', gap: -4.8, flagged: true },
  { group: 'Black', gap: -3.1, flagged: false },
  { group: 'Asian', gap: -1.2, flagged: false },
]

export default function DemographicGapsTable() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">

      {/* Card header */}
      <h3 className="text-slate-800 font-semibold text-base mb-4">
        Demographic Gaps (Overall)
      </h3>

      {/* Scrollable wrapper for mobile */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          {/* Table headers */}
          <thead>
            <tr className="text-slate-400 text-left border-b border-slate-100">
              <th className="pb-3 font-medium">Demographic Group</th>
              <th className="pb-3 font-medium">Unadjusted Gap</th>
              <th className="pb-3 font-medium">Flagged</th>
            </tr>
          </thead>

          {/* Table rows */}
          <tbody>
            {demographicGaps.map((item, index) => (
              <tr
                key={index}
                className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
              >
                <td className="py-3 text-slate-700 font-medium">{item.group}</td>
                <td className={`py-3 font-medium ${
                  item.gap < 0 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {item.gap}%
                </td>
                <td className="py-3">
                  {item.flagged ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                      Yes
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-400">
                      No
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  )
}