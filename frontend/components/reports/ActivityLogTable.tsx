// Activity log table component
// Displays all activity for the selected audit

// Temporary mock data — will be replaced with real API data later
const activityLog = [
  {
    user: 'Sarah Analyst',
    action: 'Confirm Flag',
    target: 'Flag #023',
    details: 'Confirmed adverse impact flag',
    date: 'May 21, 2024 10:45 AM',
  },
  {
    user: 'John Smith',
    action: 'Upload Data',
    target: 'Applicant JD',
    details: 'Uploaded applicant_flow_may.csv',
    date: 'May 20, 2024 09:28 AM',
  },
  {
    user: 'Sarah Analyst',
    action: 'Dismiss Flag',
    target: 'Flag #019',
    details: 'Dismissed Police Officer flag',
    date: 'May 20, 2024 03:15 PM',
  },
  {
    user: 'System',
    action: 'AI Analysis Completed',
    target: 'Applicant JD',
    details: 'AI analysis completed position JD',
    date: 'May 20, 2024 10:16 AM',
  },
]

// Action color mapping
function getActionColor(action: string) {
  switch (action) {
    case 'Confirm Flag': return 'bg-green-100 text-green-600'
    case 'Dismiss Flag': return 'bg-red-100 text-red-600'
    case 'Upload Data': return 'bg-blue-100 text-blue-600'
    case 'AI Analysis Completed': return 'bg-indigo-100 text-indigo-600'
    default: return 'bg-slate-100 text-slate-500'
  }
}

export default function ActivityLogTable() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">

      {/* Card header */}
      <h3 className="text-slate-800 font-semibold text-base mb-4">
        Activity Log
      </h3>
      <p className="text-slate-400 text-sm mb-4">
        View all activity for this audit.
      </p>

      {/* Scrollable wrapper for mobile */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          {/* Table headers */}
          <thead>
            <tr className="text-slate-400 text-left border-b border-slate-100">
              <th className="pb-3 font-medium">User</th>
              <th className="pb-3 font-medium">Action</th>
              <th className="pb-3 font-medium">Target</th>
              <th className="pb-3 font-medium">Details</th>
              <th className="pb-3 font-medium">Date</th>
            </tr>
          </thead>

          {/* Table rows */}
          <tbody>
            {activityLog.map((item, index) => (
              <tr
                key={index}
                className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
              >
                <td className="py-3 text-slate-700 font-medium">{item.user}</td>
                <td className="py-3">
                  {/* Action badge */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getActionColor(item.action)}`}>
                    {item.action}
                  </span>
                </td>
                <td className="py-3 text-slate-500">{item.target}</td>
                <td className="py-3 text-slate-500">{item.details}</td>
                <td className="py-3 text-slate-500">{item.date}</td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  )
}