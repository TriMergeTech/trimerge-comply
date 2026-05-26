'use client'

// Audits table component
// Fetches and displays real audit data from the backend API
// Supports creating, editing and deleting audits

import { useEffect, useState } from 'react'
import { getAudits, deleteAudit, Audit } from '@/lib/api/audits'
import AuditModal from '@/components/audits/AuditModal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

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
  const [audits, setAudits] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAudit, setSelectedAudit] = useState<Audit | undefined>(undefined)

  // Fetch audits when component mounts
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

  useEffect(() => {
    fetchAudits()
  }, [])

  // Open edit modal with selected audit
  function handleEdit(audit: Audit) {
    setSelectedAudit(audit)
    setModalOpen(true)
  }

  // Handle delete audit
  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this audit?')) return
    try {
      await deleteAudit(id)
      toast.success('Audit deleted successfully')
      fetchAudits()
    } catch (err) {
      toast.error('Failed to delete audit. Please try again.')
      console.error(err)
    }
  }


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
    <>
      {/* Audit modal — used for both create and edit */}
      <AuditModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchAudits}
        audit={selectedAudit}
      />

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
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(audit.status)}`}>
                      {audit.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">{formatDate(audit.createdAt)}</td>
                  <td className="py-3 text-slate-500">{formatDate(audit.updatedAt)}</td>
                  <td className="py-3">

                    {/* Actions dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="text-slate-400 hover:text-slate-600 font-bold tracking-widest">
                        ...
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">

                        {/* Edit option */}
                        <DropdownMenuItem
                          onClick={() => handleEdit(audit)}
                          className="cursor-pointer text-slate-600"
                        >
                          Edit
                        </DropdownMenuItem>

                        {/* Delete option */}
                        <DropdownMenuItem
                          onClick={() => handleDelete(audit._id)}
                          className="cursor-pointer text-red-500 focus:text-red-500"
                        >
                          Delete
                        </DropdownMenuItem>

                      </DropdownMenuContent>
                    </DropdownMenu>

                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </>
  )
}