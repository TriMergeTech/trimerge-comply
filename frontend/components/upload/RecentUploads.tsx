'use client'

import { useEffect, useState } from 'react'
import { FileSpreadsheet } from 'lucide-react'
import { getUploads, UploadRecord } from '@/lib/api/upload'

function getStatusLabel(status: UploadRecord['status']) {
  if (status === 'completed') return 'Success'
  if (status === 'failed') return 'Failed'
  return 'Processing'
}

function getStatusColor(label: string) {
  switch (label) {
    case 'Success': return 'bg-green-100 text-green-600'
    case 'Failed': return 'bg-red-100 text-red-600'
    case 'Processing': return 'bg-yellow-100 text-yellow-600'
    default: return 'bg-slate-100 text-slate-500'
  }
}

export default function RecentUploads() {
  const [recentUploads, setRecentUploads] = useState<UploadRecord[]>([])

  useEffect(() => {
    getUploads().then(setRecentUploads).catch(() => {})
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">

      {/* Section header */}
      <h3 className="text-slate-800 font-semibold text-base mb-4">
        Recent Uploads
      </h3>

      {/* Scrollable wrapper for mobile */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          {/* Table headers */}
          <thead>
            <tr className="text-slate-400 text-left border-b border-slate-100">
              <th className="pb-3 font-medium">File Name</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Rows</th>
            </tr>
          </thead>

          {/* Table rows */}
          <tbody>
            {recentUploads.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-slate-400 text-sm">
                  No uploads yet.
                </td>
              </tr>
            ) : (
              recentUploads.map((upload) => {
                const statusLabel = getStatusLabel(upload.status)
                return (
                  <tr
                    key={upload._id}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    {/* File name with icon */}
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet size={16} className="text-slate-400" />
                        <span className="text-slate-700">{upload.fileName}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(upload.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(statusLabel)}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      {upload.rowsProcessed > 0 ? `${upload.rowsProcessed.toLocaleString()} rows` : '—'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>

        </table>
      </div>
    </div>
  )
}
