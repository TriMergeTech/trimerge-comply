// Audits table component
// Displays all audits with client name, type, status, start date, end date and actions

// Temporary mock data — will be replaced with real API data later
const audits = [
    {
        client: 'City of Springfield',
        type: 'Full Audit',
        status: 'In Progress',
        startDate: 'May 20, 2024',
        endDate: 'Jun 20, 2024',
    },
    {
        client: 'State Transit Authority',
        type: 'Adverse Impact',
        status: 'In Progress',
        startDate: 'May 18, 2024',
        endDate: 'Jun 18, 2024',
    },
    {
        client: 'Public Health Dept',
        type: 'Pay Equity',
        status: 'Draft',
        startDate: 'May 15, 2024',
        endDate: 'Jun 15, 2024',
    },
    {
        client: 'County of Madison',
        type: 'Position Description',
        status: 'Completed',
        startDate: 'Apr 10, 2024',
        endDate: 'Apr 30, 2024',
    },
]

// Status color mapping
function getStatusColor(status: string) {
    switch (status) {
        case 'In Progress': return 'bg-green-100 text-green-600'
        case 'Draft': return 'bg-slate-100 text-slate-500'
        case 'Completed': return 'bg-blue-100 text-blue-600'
        default: return 'bg-slate-100 text-slate-500'
    }
}

export default function AuditsTable() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">

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
                            <th className="pb-3 font-medium">End Date</th>
                            <th className="pb-3 font-medium">Actions</th>
                        </tr>
                    </thead>

                    {/* Table rows */}
                    <tbody>
                        {audits.map((audit, index) => (
                            <tr
                                key={index}
                                className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                            >
                                <td className="py-3 text-slate-700 font-medium">{audit.client}</td>
                                <td className="py-3 text-slate-500">{audit.type}</td>
                                <td className="py-3">
                                    {/* Status badge */}
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(audit.status)}`}>
                                        {audit.status}
                                    </span>
                                </td>
                                <td className="py-3 text-slate-500">{audit.startDate}</td>
                                <td className="py-3 text-slate-500">{audit.endDate}</td>
                                <td className="py-3">
                                    {/* Actions button — functionality pending lead confirmation */}
                                    <button className="text-slate-400 hover:text-slate-600 font-bold tracking-widest">
                                        ...
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
        </div>
    )
}