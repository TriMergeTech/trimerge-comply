'use client'

import type { DashboardRecentAudit } from '@/lib/api/dashboard'

// Recent audits table — displays latest audits with status
// + New Audit button sits in the top right of this card
// Accepts audits as a prop from the dashboard page (data flows down from the summary API call)

interface RecentAuditsProps {
  audits: DashboardRecentAudit[]
}

// Status color mapping — matches real API statuses
function getStatusColor(status: string) {
  switch (status) {
    case 'completed':  return 'bg-green-100 text-green-600'
    case 'processing': return 'bg-blue-100 text-blue-600'
    case 'flagged':    return 'bg-red-100 text-red-600'
    case 'draft':
    default:           return 'bg-slate-100 text-slate-500'
  }
}

// Format ISO date string to "May 20, 2026"
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function RecentAudits({ audits }: RecentAuditsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">

      {/* Card header */}
      <div className="mb-4">
        <h3 className="text-slate-800 font-semibold text-base">Recent Audits</h3>
      </div>

      {/* Audits table */}
      {/* Scrollable wrapper for mobile */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          {/* Table headers */}
          <thead>
            <tr className="text-slate-400 text-left border-b border-slate-100">
              <th className="pb-3 font-medium">Audit Name</th>
              <th className="pb-3 font-medium">Organization</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Created</th>
            </tr>
          </thead>

          {/* Table rows */}
          <tbody>
            {audits.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400 text-sm">
                  No recent audits
                </td>
              </tr>
            ) : (
              audits.map((audit) => (
                <tr key={audit._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 text-slate-700">{audit.name}</td>
                  <td className="py-3 text-slate-500">{audit.organization ?? '—'}</td>
                  <td className="py-3">
                    {/* Status badge */}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(audit.status)}`}>
                      {audit.status.charAt(0).toUpperCase() + audit.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">{formatDate(audit.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  )
}
