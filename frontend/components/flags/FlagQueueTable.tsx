// Flag queue table component
// Displays all pending compliance flags across all engines

// Temporary mock data — will be replaced with real API data later
const flagQueue = [
    {
        flag: 'Police Officer – Interview – Female',
        engine: 'Adverse Impact',
        audit: 'City of Springfield',
        severity: 'Critical',
        status: 'Pending',
        assignedTo: 'You',
        date: 'May 21, 2024',
    },
    {
        flag: 'Police Officer – Hire – Hispanic',
        engine: 'Adverse Impact',
        audit: 'City of Springfield',
        severity: 'High',
        status: 'Pending',
        assignedTo: 'John Smith',
        date: 'May 21, 2024',
    },
    {
        flag: 'Vague Language: "Excellent..."',
        engine: 'Position Description',
        audit: 'State Transit Authority',
        severity: 'Medium',
        status: 'Pending',
        assignedTo: 'You',
        date: 'May 20, 2024',
    },
    {
        flag: 'Gender Pay Gap – Engineering',
        engine: 'Pay Equity',
        audit: 'Public Health Dept',
        severity: 'High',
        status: 'Pending',
        assignedTo: 'Sarah Analyst',
        date: 'May 20, 2024',
    },
    {
        flag: 'Unnecessary Requirement: 5+ yrs',
        engine: 'Position Description',
        audit: 'County of Madison',
        severity: 'Medium',
        status: 'Pending',
        assignedTo: 'Unassigned',
        date: 'May 18, 2024',
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

export default function FlagQueueTable() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">

            {/* Scrollable wrapper for mobile */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">

                    {/* Table headers */}
                    <thead>
                        <tr className="text-slate-400 text-left border-b border-slate-100">
                            <th className="pb-3 font-medium">Flag</th>
                            <th className="pb-3 font-medium">Engine</th>
                            <th className="pb-3 font-medium">Audit</th>
                            <th className="pb-3 font-medium">Severity</th>
                            <th className="pb-3 font-medium">Status</th>
                            <th className="pb-3 font-medium">Assigned To</th>
                            <th className="pb-3 font-medium">Date</th>
                        </tr>
                    </thead>

                    {/* Table rows */}
                    <tbody>
                        {flagQueue.map((flag, index) => (
                            <tr
                                key={index}
                                className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                            >
                                <td className="py-3 text-slate-700 font-medium">
                                    {index === 0 ? (
                                        <a
                                            href="/flags/1"
                                            className="text-indigo-500 hover:underline cursor-pointer"
                                        >
                                            {flag.flag}
                                        </a>
                                    ) : (
                                        flag.flag
                                    )}
                                </td>
                                <td className="py-3 text-slate-500">{flag.engine}</td>
                                <td className="py-3 text-indigo-500 hover:underline cursor-pointer">
                                    {flag.audit}
                                </td>
                                <td className="py-3">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getSeverityColor(flag.severity)}`}>
                                        {flag.severity}
                                    </span>
                                </td>
                                <td className="py-3">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                                        {flag.status}
                                    </span>
                                </td>
                                <td className="py-3 text-slate-500">{flag.assignedTo}</td>
                                <td className="py-3 text-slate-500">{flag.date}</td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
        </div>
    )
}