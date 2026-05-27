'use client'

// Activity log table component
// Displays real activity log data from the API with pagination

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getActivityLogs, ActivityLog } from '@/lib/api/activity'

// Action color mapping
function getActionColor(action: string) {
  switch (action) {
    case 'audit_created': return 'bg-green-100 text-green-600'
    case 'audit_updated': return 'bg-blue-100 text-blue-600'
    case 'audit_deleted': return 'bg-red-100 text-red-600'
    case 'flag_decided': return 'bg-indigo-100 text-indigo-600'
    case 'flag_assigned': return 'bg-yellow-100 text-yellow-600'
    default: return 'bg-slate-100 text-slate-500'
  }
}

// Format action label for display
function formatAction(action: string) {
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// Format date from ISO string
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ActivityLogTable() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 10

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true)
        const res = await getActivityLogs({ page: currentPage, limit: LIMIT })
        setLogs(res.logs)
        setTotalPages(res.pagination.totalPages)
        setTotal(res.pagination.total)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [currentPage])

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">

      {/* Card header */}
      <h3 className="text-slate-800 font-semibold text-base mb-1">
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
              <th className="pb-3 font-medium">Date</th>
            </tr>
          </thead>

          {/* Table rows */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-slate-400 text-sm">
                  Loading activity logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-slate-400 text-sm">
                  No activity found.
                </td>
              </tr>
            ) : (
              logs.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 text-slate-700 font-medium">
                    {item.user.name}
                  </td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getActionColor(item.action)}`}>
                      {formatAction(item.action)}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500 capitalize">
                    {item.target.type}
                  </td>
                  <td className="py-3 text-slate-500">
                    {formatDate(item.date)}
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">

          {/* Results count */}
          <p className="text-sm text-slate-400">
            Page {currentPage} of {totalPages} — {total} total logs
          </p>

          {/* Page navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
              Previous
            </button>
            <span className="text-sm text-slate-500 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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