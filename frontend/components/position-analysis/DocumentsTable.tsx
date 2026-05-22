'use client'

// Documents table component
// Displays uploaded job descriptions with real API data

import { Eye } from 'lucide-react'
import { PositionDocument } from '@/lib/api/position'

// Status color mapping
function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'completed': return 'bg-green-100 text-green-600'
    case 'processing': return 'bg-yellow-100 text-yellow-600'
    case 'failed': return 'bg-red-100 text-red-600'
    default: return 'bg-slate-100 text-slate-500'
  }
}

// Format date from ISO string
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

type DocumentsTableProps = {
  activeTab: string
  documents: PositionDocument[]
  loading: boolean
  onRefresh: () => void
}

export default function DocumentsTable({ activeTab, documents, loading }: DocumentsTableProps) {

  // Filter documents based on active tab
  const filteredDocuments = documents.filter((doc) => {
    if (activeTab === 'All Documents') return true
    if (activeTab === 'Flagged') return doc.flags > 0
    return doc.status.toLowerCase() === activeTab.toLowerCase()
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
            {loading ? (
              <tr>
                <td colSpan={6} className="py-4 text-center text-slate-400 text-sm">
                  Loading documents...
                </td>
              </tr>
            ) : filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-center text-slate-400 text-sm">
                  No documents found.
                </td>
              </tr>
            ) : (
              filteredDocuments.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 text-slate-700 font-medium">{doc.documentName}</td>
                  <td className="py-3">
                    {/* Status badge */}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">
                    {doc.flags > 0 ? (
                      <span className="text-red-500 font-medium">{doc.flags}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 text-slate-500">{doc.uploadedBy}</td>
                  <td className="py-3 text-slate-500">{formatDate(doc.date)}</td>
                  <td className="py-3">
                    {/* View button — only show for completed documents */}
                    {doc.status.toLowerCase() === 'completed' ? (
                      <button className="flex items-center gap-1 text-indigo-500 hover:underline text-xs">
                        <Eye size={14} />
                        View
                      </button>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  )
}