'use client'

// Documents table component
// Displays uploaded job descriptions with real API data
// Includes pagination — 10 documents per page

import { useState, useEffect } from 'react'
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { PositionDocument } from '@/lib/api/position'


// Number of documents per page
const ITEMS_PER_PAGE = 10

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
  // Track current page
  const [currentPage, setCurrentPage] = useState(1)



  // Reset to page 1 when tab changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])

  // Filter documents based on active tab
  const filteredDocuments = documents.filter((doc) => {
  if (activeTab === 'All Documents') return true
  return doc.status.toLowerCase() === activeTab.toLowerCase()
  })
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE)

  // Slice documents for current page
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Go to previous page
  function handlePrevious() {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  // Go to next page
  function handleNext() {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

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
              paginatedDocuments.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 text-slate-700 font-medium">{doc.documentName}</td>
                  <td className="py-3">
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

      {/* Pagination controls — only show when there are more than 10 documents */}
      {filteredDocuments.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">

          {/* Results count */}
          <p className="text-sm text-slate-400">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredDocuments.length)} of {filteredDocuments.length} documents
          </p>

          {/* Page navigation */}
          <div className="flex items-center gap-2">

            {/* Previous button */}
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
              Previous
            </button>

            {/* Page indicator */}
            <span className="text-sm text-slate-500 px-2">
              Page {currentPage} of {totalPages}
            </span>

            {/* Next button */}
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
