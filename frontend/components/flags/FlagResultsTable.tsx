import { FlagItem } from '@/lib/api/flags'

type Props = {
  results: FlagItem[]
  loading?: boolean
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'Critical': return 'bg-red-100 text-red-600'
    case 'High': return 'bg-orange-100 text-orange-500'
    case 'Medium': return 'bg-yellow-100 text-yellow-600'
    case 'Low': return 'bg-green-100 text-green-600'
    default: return 'bg-slate-100 text-slate-500'
  }
}

export default function FlagResultsTable({ results, loading }: Props) {
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
            {loading ? (
              <tr>
                <td colSpan={8} className="py-4 text-center text-slate-400 text-sm">
                  Loading...
                </td>
              </tr>
            ) : results.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-4 text-center text-slate-400 text-sm">
                  No results yet. Upload a CSV to generate flags.
                </td>
              </tr>
            ) : (
              results.map((flag) => {
                const r = flag.results ?? {}
                const ratio = r.fourFifthsRule ?? 0
                const flagged = ratio < 0.8

                return (
                  <tr
                    key={flag._id}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 text-slate-700 font-medium">{r.jobTitle ?? '—'}</td>
                    <td className="py-3 text-slate-500">{r.stage ?? '—'}</td>
                    <td className="py-3 text-slate-500">{r.demographicGroup ?? '—'}</td>

                    {/* 4/5ths rule — highlight violations */}
                    <td className={`py-3 font-medium ${ratio < 0.8 ? 'text-red-500' : 'text-slate-700'}`}>
                      {ratio.toFixed(2)}
                    </td>

                    <td className="py-3 text-slate-500">{(r.chiSquare ?? 0).toFixed(4)}</td>
                    <td className="py-3 text-slate-500">{(r.fishersExact ?? 0).toFixed(4)}</td>

                    {/* Severity badge */}
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getSeverityColor(flag.severity)}`}>
                        {flag.severity}
                      </span>
                    </td>

                    {/* Flagged indicator */}
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        flagged ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {flagged ? 'Yes' : 'No'}
                      </span>
                    </td>

                  </tr>
                )
              })
            )}
          </tbody>

        </table>
      </div>
    </div>
  )
}
