// Flag results table component
// Displays statistical test results for adverse impact analysis

// Temporary mock data — will be replaced with real API data later
const flagResults = [
  {
    jobTitle: 'Police Officer',
    stage: 'Interview',
    demographicGroup: 'Female',
    fourFifthsRule: 0.63,
    chiSquare: 0.0012,
    fishersExact: 0.0008,
    severity: 'Critical',
    flagged: true,
  },
  {
    jobTitle: 'Police Officer',
    stage: 'Interview',
    demographicGroup: 'Hispanic',
    fourFifthsRule: 0.71,
    chiSquare: 0.0081,
    fishersExact: 0.0091,
    severity: 'High',
    flagged: true,
  },
  {
    jobTitle: 'Firefighter',
    stage: 'Written Test',
    demographicGroup: 'Black',
    fourFifthsRule: 0.78,
    chiSquare: 0.0450,
    fishersExact: 0.0321,
    severity: 'Medium',
    flagged: true,
  },
  {
    jobTitle: 'Dispatcher',
    stage: 'Interview',
    demographicGroup: 'Female',
    fourFifthsRule: 0.85,
    chiSquare: 0.1200,
    fishersExact: 0.0580,
    severity: 'Low',
    flagged: false,
  },
]

// Severity color mapping
function getSeverityColor(severity: string) {
  switch (severity) {
    case 'Critical': return 'bg-red-100 text-red-600'
    case 'High': return 'bg-orange-100 text-orange-500'
    case 'Medium': return 'bg-yellow-100 text-yellow-600'
    case 'Low': return 'bg-green-100 text-green-600'
    default: return 'bg-slate-100 text-slate-500'
  }
}

export default function FlagResultsTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">

      {/* Scrollable wrapper for mobile */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          {/* Table headers */}
          <thead>
            <tr className="text-slate-400 text-left border-b border-slate-100">
              <th className="pb-3 font-medium">Job Title</th>
              <th className="pb-3 font-medium">Stage</th>
              <th className="pb-3 font-medium">Demographic Group</th>
              <th className="pb-3 font-medium">4/5ths Rule</th>
              <th className="pb-3 font-medium">Chi-Square</th>
              <th className="pb-3 font-medium">Fisher&apos;s Exact</th>
              <th className="pb-3 font-medium">Severity</th>
              <th className="pb-3 font-medium">Flagged</th>
            </tr>
          </thead>

          {/* Table rows */}
          <tbody>
            {flagResults.map((result, index) => (
              <tr
                key={index}
                className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
              >
                <td className="py-3 text-slate-700 font-medium">{result.jobTitle}</td>
                <td className="py-3 text-slate-500">{result.stage}</td>
                <td className="py-3 text-slate-500">{result.demographicGroup}</td>

                {/* 4/5ths rule — highlight violations */}
                <td className={`py-3 font-medium ${
                  result.fourFifthsRule < 0.8 ? 'text-red-500' : 'text-slate-700'
                }`}>
                  {result.fourFifthsRule.toFixed(2)}
                </td>

                <td className="py-3 text-slate-500">{result.chiSquare.toFixed(4)}</td>
                <td className="py-3 text-slate-500">{result.fishersExact.toFixed(4)}</td>

                {/* Severity badge */}
                <td className="py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getSeverityColor(result.severity)}`}>
                    {result.severity}
                  </span>
                </td>

                {/* Flagged indicator */}
                <td className="py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    result.flagged
                      ? 'bg-red-100 text-red-600'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {result.flagged ? 'Yes' : 'No'}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  )
}