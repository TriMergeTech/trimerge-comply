'use client'

// Documents table component
// Displays uploaded job descriptions with status, flags and actions

import { Eye } from 'lucide-react'

// Temporary mock data — will be replaced with real API data later
const documents = [
  {
    name: 'Police Officer JD.pdf',
    status: 'Completed',
    flags: 5,
    uploadedBy: 'Sarah Analyst',
    date: 'May 21, 2024',
  },
  {
    name: 'Firefighter JD.docx',
    status: 'Processing',
    flags: null,
    uploadedBy: 'John Smith',
    date: 'May 21, 2024',
  },
  {
    name: 'Accountant JD.pdf',
    status: 'Processing',
    flags: null,
    uploadedBy: 'Sarah Analyst',
    date: 'May 20, 2024',
  },
  {
    name: 'HR Manager JD.docx',
    status: 'Completed',
    flags: 2,
    uploadedBy: 'John Smith',
    date: 'May 20, 2024',
  },
  {
    name: 'Maintenance Tech JD.pdf',
    status: 'Failed',
    flags: null,
    uploadedBy: 'Sarah Analyst',
    date: 'May 20, 2024',
  },
]

// Status color mapping
function getStatusColor(status: string) {
  switch (status) {
    case 'Completed': return 'bg-green-100 text-green-600'
    case 'Processing': return 'bg-yellow-100 text-yellow-600'
    case 'Failed': return 'bg-red-100 text-red-600'
    default: return 'bg-slate-100 text-slate-500'
  }
}

type DocumentsTableProps = {
  activeTab: string
}

export default function DocumentsTable({ activeTab }: DocumentsTableProps) {
  // Filter documents based on active tab
  const filteredDocuments = documents.filter((doc) => {
    if (activeTab === 'All Documents') return true
    if (activeTab === 'Flagged') return doc.flags !== null && doc.flags > 0
    return doc.status === activeTab
  })

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">

      {/* Scrollable wrapper for mobile */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          {/* Table headers */}
          <thead>
            <tr className="text-slate-400 text-left border-b border-slate-100">
              <th className="pb-3 font-medium">Document Name</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Flags</th>
              <th className="pb-3 font-medium">Uploaded By</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">View</th>
            </tr>
          </thead>

          {/* Table rows */}
          <tbody>
            {filteredDocuments.map((doc, index) => (
              <tr
                key={index}
                className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
              >
                <td className="py-3 text-slate-700 font-medium">{doc.name}</td>
                <td className="py-3">
                  {/* Status badge */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                </td>
                <td className="py-3 text-slate-500">
                  {doc.flags !== null ? (
                    <span className="text-red-500 font-medium">{doc.flags}</span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 text-slate-500">{doc.uploadedBy}</td>
                <td className="py-3 text-slate-500">{doc.date}</td>
                <td className="py-3">
                  {/* View button — only show for completed documents */}
                  {doc.status === 'Completed' ? (
                    <button className="flex items-center gap-1 text-indigo-500 hover:underline text-xs">
                      <Eye size={14} />
                      View
                    </button>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
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