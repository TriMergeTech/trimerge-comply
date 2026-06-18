'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { FlagItem } from '@/lib/api/flags'

const engineLabel: Record<string, string> = {
  adverse_impact: 'Adverse Impact',
  position_description: 'Position Description',
  pay_equity: 'Pay Equity',
}

type Props = {
  flags: FlagItem[]
  loading?: boolean
}

// Number of results to show per page
const ITEMS_PER_PAGE = 10

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'Critical': return 'bg-red-100 text-red-600'
    case 'High': return 'bg-orange-100 text-orange-500'
    case 'Medium': return 'bg-yellow-100 text-yellow-600'
    case 'Low': return 'bg-green-100 text-green-600'
    default: return 'bg-slate-100 text-slate-500'
  }
}

export default function FlagQueueTable({ flags, loading }: Props) {
  // Track current page
  const [currentPage, setCurrentPage] = useState(1)

  // Calculate total pages
  const totalPages = Math.ceil(flags.length / ITEMS_PER_PAGE)

  // Slice flags for current page
  const paginatedFlags = flags.slice(
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
            {loading ? (
              <tr>
                <td colSpan={7} className="py-4 text-center text-slate-400 text-sm">
                  Loading...
                </td>
              </tr>
            ) : flags.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-4 text-center text-slate-400 text-sm">
                  No flags found.
                </td>
              </tr>
            ) : (
              paginatedFlags.map((flag) => (
                <tr
                  key={flag._id}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 text-slate-700 font-medium">
                    <a
                      href={`/flags/${flag._id}`}
                      className="text-indigo-500 hover:underline cursor-pointer"
                    >
                      {flag.name}
                    </a>
                  </td>
                  <td className="py-3 text-slate-500">
                    {engineLabel[flag.testType] ?? flag.testType}
                  </td>
                  <td className="py-3 text-slate-500">
                    {typeof flag.auditId === 'object' ? flag.auditId?.name : flag.auditId ?? '—'}
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
                  <td className="py-3 text-slate-500">
                    {new Date(flag.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>

      {/* Pagination controls — only show when there are more than 10 results */}
      {flags.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">

          {/* Results count */}
          <p className="text-sm text-slate-400">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, flags.length)} of {flags.length} results
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