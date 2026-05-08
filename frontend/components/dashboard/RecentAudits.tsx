import { Button } from '@/components/ui/Button'

// Recent audits table — displays latest audits with status
// + New Audit button sits in the top right of this card

// Temporary audit data — will be replaced with real API data later
const recentAudits = [
  { client: 'City of Springfield', type: 'Full Audit', status: 'In Progress', date: 'May 20, 2024' },
  { client: 'State Transit Authority', type: 'Adverse Impact', status: 'In Progress', date: 'May 18, 2024' },
  { client: 'Public Health Dept', type: 'Pay Equity', status: 'Draft', date: 'May 15, 2024' },
]

// Status color mapping
function getStatusColor(status: string) {
  switch (status) {
    case 'In Progress': return 'bg-green-100 text-green-600'
    case 'Draft': return 'bg-slate-100 text-slate-500'
    case 'Completed': return 'bg-green-100 text-green-600'
    default: return 'bg-slate-100 text-slate-500'
  }
}

export default function RecentAudits() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">

      {/* Card header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-800 font-semibold text-base">Recent Audits</h3>

        {/* New Audit button */}
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg">
          + New Audit
        </Button>
      </div>

      {/* Audits table */}
      {/* Scrollable wrapper for mobile */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          {/* Table headers */}
          <thead>
            <tr className="text-slate-400 text-left border-b border-slate-100">
              <th className="pb-3 font-medium">Client Name</th>
              <th className="pb-3 font-medium">Audit Type</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Start Date</th>
            </tr>
          </thead>

          {/* Table rows */}
          <tbody>
            {recentAudits.map((audit, index) => (
              <tr key={index} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="py-3 text-slate-700">{audit.client}</td>
                <td className="py-3 text-slate-500">{audit.type}</td>
                <td className="py-3">
                  {/* Status badge */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(audit.status)}`}>
                    {audit.status}
                  </span>
                </td>
                <td className="py-3 text-slate-500">{audit.date}</td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  )
}