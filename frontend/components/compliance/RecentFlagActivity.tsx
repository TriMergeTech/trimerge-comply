// Recent flag activity component
// Displays latest flag actions taken by analysts

// Temporary mock data — will be replaced with real API data later
const recentActivity = [
  {
    flag: 'Police Officer – Interview – Female',
    severity: 'Critical',
    status: 'Confirmed',
    uploadedBy: 'Sarah Analyst',
    date: 'May 21, 2024',
  },
  {
    flag: 'Police Officer – Hire – Hispanic',
    severity: 'High',
    status: 'Pending',
    uploadedBy: 'John Smith',
    date: 'May 21, 2024',
  },
  {
    flag: 'Gender Pay Gap – Engineering',
    severity: 'High',
    status: 'Pending',
    uploadedBy: 'Sarah Analyst',
    date: 'May 20, 2024',
  },
  {
    flag: 'Vague Language: "Excellent..."',
    severity: 'Medium',
    status: 'Dismissed',
    uploadedBy: 'John Smith',
    date: 'May 20, 2024',
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

// Status color mapping
function getStatusColor(status: string) {
  switch (status) {
    case 'Confirmed': return 'bg-green-100 text-green-600'
    case 'Pending': return 'bg-slate-100 text-slate-500'
    case 'Dismissed': return 'bg-red-100 text-red-600'
    default: return 'bg-slate-100 text-slate-500'
  }
}

export default function RecentFlagActivity() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">

      {/* Card header */}
      <h3 className="text-slate-800 font-semibold text-base mb-4">
        Recent Flag Activity
      </h3>

      {/* Scrollable wrapper for mobile */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          {/* Table headers */}
          <thead>
            <tr className="text-slate-400 text-left border-b border-slate-100">
              <th className="pb-3 font-medium">Flag</th>
              <th className="pb-3 font-medium">Severity</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Uploaded By</th>
              <th className="pb-3 font-medium">Date</th>
            </tr>
          </thead>

          {/* Table rows */}
          <tbody>
            {recentActivity.map((item, index) => (
              <tr
                key={index}
                className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
              >
                <td className="py-3 text-slate-700 font-medium">{item.flag}</td>
                <td className="py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getSeverityColor(item.severity)}`}>
                    {item.severity}
                  </span>
                </td>
                <td className="py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-3 text-slate-500">{item.uploadedBy}</td>
                <td className="py-3 text-slate-500">{item.date}</td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  )
}