// Recent uploads component
// Displays a list of recently uploaded files with status and row count

import { FileSpreadsheet } from 'lucide-react'

// Temporary mock data — will be replaced with real API data later
const recentUploads = [
    {
        fileName: 'applicant_flow_may2024.csv',
        date: 'May 21, 2024 10:30 AM',
        status: 'Success',
        rows: 1245,
    },
    {
        fileName: 'applicants_april.xlsx',
        date: 'May 18, 2024 02:15 PM',
        status: 'Success',
        rows: 1100,
    },
    {
        fileName: 'applicant_flow_march2024.csv',
        date: 'May 10, 2024 09:00 AM',
        status: 'Failed',
        rows: 0,
    },
]

// Status color mapping
function getStatusColor(status: string) {
    switch (status) {
        case 'Success': return 'bg-green-100 text-green-600'
        case 'Failed': return 'bg-red-100 text-red-600'
        case 'Processing': return 'bg-yellow-100 text-yellow-600'
        default: return 'bg-slate-100 text-slate-500'
    }
}

export default function RecentUploads() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">

            {/* Section header */}
            <h3 className="text-slate-800 font-semibold text-base mb-4">
                Recent Uploads
            </h3>

            {/* Scrollable wrapper for mobile */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">

                    {/* Table headers */}
                    <thead>
                        <tr className="text-slate-400 text-left border-b border-slate-100">
                            <th className="pb-3 font-medium">File Name</th>
                            <th className="pb-3 font-medium">Date</th>
                            <th className="pb-3 font-medium">Status</th>
                            <th className="pb-3 font-medium">Rows</th>
                        </tr>
                    </thead>

                    {/* Table rows */}
                    <tbody>
                        {recentUploads.map((upload, index) => (
                            <tr
                                key={index}
                                className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                            >
                                {/* File name with icon */}
                                <td className="py-3">
                                    <div className="flex items-center gap-2">
                                        <FileSpreadsheet size={16} className="text-slate-400" />
                                        <span className="text-slate-700">{upload.fileName}</span>
                                    </div>
                                </td>
                                <td className="py-3 text-slate-500">{upload.date}</td>
                                <td className="py-3">
                                    {/* Status badge */}
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(upload.status)}`}>
                                        {upload.status}
                                    </span>
                                </td>
                                <td className="py-3 text-slate-500">
                                    {upload.rows > 0 ? `${upload.rows.toLocaleString()} rows` : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
        </div>
    )
}