'use client'

import { useEffect, useState } from 'react'
import { FileSpreadsheet } from 'lucide-react'
import { getUploads, UploadRecord } from '@/lib/api/upload'

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'processed':
    case 'completed': return 'bg-green-100 text-green-600'
    case 'failed': return 'bg-red-100 text-red-600'
    default: return 'bg-yellow-100 text-yellow-600'
  }
}

function getStatusLabel(status: string) {
  if (status === 'processed' || status === 'completed') return 'Success'
  if (status === 'failed') return 'Failed'
  return 'Processing'
}

export default function RecentUploads({ refreshKey }: { refreshKey?: number }) {
  const [uploads, setUploads] = useState<UploadRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getUploads()
      .then(setUploads)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load uploads.'))
      .finally(() => setLoading(false))
  }, [refreshKey])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">

      <h3 className="text-slate-800 font-semibold text-base mb-4">Recent Uploads</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 text-left border-b border-slate-100">
              <th className="pb-3 font-medium">File Name</th>
              <th className="pb-3 font-medium">Uploaded By</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-slate-400 text-sm">Loading uploads...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-red-400 text-sm">{error}</td>
              </tr>
            ) : uploads.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-slate-400 text-sm">No uploads yet.</td>
              </tr>
            ) : (
              uploads.map((upload) => (
                <tr key={upload.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet size={16} className="text-slate-400" />
                      <span className="text-slate-700">{upload.fileName}</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-500">{upload.uploadedBy}</td>
                  <td className="py-3 text-slate-500">
                    {new Date(upload.date).toLocaleString()}
                  </td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(upload.status)}`}>
                      {getStatusLabel(upload.status)}
                    </span>
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
