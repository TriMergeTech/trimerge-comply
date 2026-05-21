// Recent flag activity component
// Displays latest flag actions from real API data

import { FlagItem } from '@/lib/api/flags'

type Props = {
  recentFlags: FlagItem[]
}

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

// Status color mapping
function getStatusColor(status: string) {
  switch (status) {
    case 'reviewed': return 'bg-green-100 text-green-600'
    case 'open': return 'bg-slate-100 text-slate-500'
    case 'dismissed': return 'bg-red-100 text-red-600'
    default: return 'bg-slate-100 text-slate-500'
  }
}

export default function RecentFlagActivity({ recentFlags }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">

      {/* Card header */}
      <h3 className="text-slate-800 font-semibold text-base mb-4">
        Recent Flag Activity
      </h3>

      {/* Empty state */}
      {recentFlags.length === 0 && (
        <p className="text-slate-400 text-sm text-center py-4">
          No recent flag activity.
        </p>
      )}

      {/* Scrollable wrapper for mobile */}
      {recentFlags.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            {/* Table headers */}
            <thead>
              <tr className="text-slate-400 text-left border-b border-slate-100">
                <th className="pb-3 font-medium">Flag</th>
                <th className="pb-3 font-medium">Severity</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>

            {/* Table rows */}
            <tbody>
              {recentFlags.map((flag) => (
                <tr
                  key={flag._id}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 text-slate-700 font-medium">
                     {(flag as any).name ?? `${flag.group} — ${flag.referenceGroup}`}
                  </td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getSeverityColor(flag.severity)}`}>
                      {flag.severity}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(flag.status)}`}>
                      {flag.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">
                    {new Date(flag.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  )
}