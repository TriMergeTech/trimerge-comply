'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, FileText, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { getHandbooks, Handbook } from '@/lib/api/handbooks'
import { useUser } from '@/lib/context/UserContext'
import UploadHandbookModal from '@/components/handbooks/UploadHandbookModal'
import DeleteHandbookModal from '@/components/handbooks/DeleteHandbookModal'

const STATUS_COLORS: Record<Handbook['status'], string> = {
  ready: 'bg-green-100 text-green-700',
  processing: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<Handbook['status'], string> = {
  ready: 'Ready',
  processing: 'Processing',
  failed: 'Failed',
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function HandbooksPage() {
  const user = useUser()
  const canDelete = user?.role === 'admin' || user?.role === 'director'

  const [handbooks, setHandbooks] = useState<Handbook[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Handbook | null>(null)

  const loadHandbooks = useCallback(() => {
    setLoading(true)
    getHandbooks()
      .then((res) => {
        setHandbooks(res.handbooks)
        setTotal(res.total)
      })
      .catch(() => toast.error('Failed to load handbooks.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadHandbooks()
  }, [loadHandbooks])

  const readyCount = handbooks.filter((h) => h.status === 'ready').length
  const processingCount = handbooks.filter((h) => h.status === 'processing').length

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-slate-800 font-semibold text-xl">Handbooks</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Upload employee handbooks to power AI-assisted findings drafting.
          </p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors w-fit"
        >
          <Plus size={15} />
          Upload Handbook
        </button>
      </div>

      {/* KPI bar */}
      {!loading && handbooks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
            <p className="text-xs text-slate-400">Total</p>
            <p className="text-lg font-semibold text-slate-800 mt-0.5">{total}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
            <p className="text-xs text-slate-400">Ready</p>
            <p className="text-lg font-semibold text-green-600 mt-0.5">{readyCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
            <p className="text-xs text-slate-400">Processing</p>
            <p className="text-lg font-semibold text-yellow-600 mt-0.5">{processingCount}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
            Loading handbooks…
          </div>
        ) : handbooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <BookOpen size={32} className="text-slate-300" />
            <p className="text-slate-500 text-sm font-medium">No handbooks yet</p>
            <p className="text-slate-400 text-xs max-w-xs">
              Upload a PDF or DOCX employee handbook to let the AI reference policy sections when drafting findings.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide hidden sm:table-cell">Chunks</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide hidden md:table-cell">Size</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide hidden lg:table-cell">Uploaded by</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide hidden md:table-cell">Date</th>
                  {canDelete && (
                    <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide w-10" />
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {handbooks.map((h) => (
                  <tr key={h._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-slate-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate max-w-[200px]">{h.name}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[200px]">{h.fileName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[h.status]}`}>
                        {STATUS_LABELS[h.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{h.chunkCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{formatSize(h.sizeBytes)}</td>
                    <td className="px-4 py-3 text-slate-600 hidden lg:table-cell truncate max-w-[160px]">{h.uploadedBy.email}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell whitespace-nowrap">{formatDate(h.createdAt)}</td>
                    {canDelete && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDeleteTarget(h)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded"
                          title="Delete handbook"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UploadHandbookModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={loadHandbooks}
      />

      {deleteTarget && (
        <DeleteHandbookModal
          open={!!deleteTarget}
          handbookId={deleteTarget._id}
          handbookName={deleteTarget.name}
          onClose={() => setDeleteTarget(null)}
          onSuccess={loadHandbooks}
        />
      )}
    </div>
  )
}
