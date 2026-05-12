'use client'

// Audits table component
// Fetches and displays real audit data from the backend API

import { useEffect, useState } from 'react'
import { getAudits, Audit } from '@/lib/api/audits'

// Status color mapping
function getStatusColor(status: string) {
  switch (status) {
    case 'processing': return 'bg-green-100 text-green-600'
    case 'draft': return 'bg-slate-100 text-slate-500'
    case 'completed': return 'bg-blue-100 text-blue-600'
    case 'flagged': return 'bg-red-100 text-red-600'
    default: return 'bg-slate-100 text-slate-500'
  }
}

// Format date from ISO string to readable format
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function AuditsTable() {
  // Track audits data, loading and error states
  const [audits, setAudits] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch audits when component mounts
  useEffect(() => {
    async function fetchAudits() {
      try {
        const data = await getAudits()
        setAudits(data)
      } catch (err) {
        setError('Failed to load audits. Please try again.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAudits()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-10 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading audits...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-10 flex items-center justify-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    )
  }

  // Empty state
  if (audits.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-10 flex items-center justify-center">
        <p className="text-slate-400 text-sm">No audits found.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">

      {/* Scrollable wrapper for mobile */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          {/* Table headers */}
          <thead>
            <tr className="text-slate-400 text-left border-b border-slate-100">
              <th className="pb-3 font-medium">Client Name</th>
              <th className="pb-3 font-medium">Audit Name</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Created</th>
              <th className="pb-3 font-medium">Updated</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>

          {/* Table rows */}
          <tbody>
            {audits.map((audit) => (
              <tr
                key={audit._id}
                className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
              >
                <td className="py-3 text-slate-700 font-medium">
                  {audit.organization ?? '—'}
                </td>
                <td className="py-3 text-slate-500">{audit.name}</td>
                <td className="py-3">
                  {/* Status badge */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(audit.status)}`}>
                    {audit.status}
                  </span>
                </td>
                <td className="py-3 text-slate-500">{formatDate(audit.createdAt)}</td>
                <td className="py-3 text-slate-500">{formatDate(audit.updatedAt)}</td>
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