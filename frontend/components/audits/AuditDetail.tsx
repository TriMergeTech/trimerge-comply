'use client'

import { Audit } from '@/lib/api/audits'

function getStatusColor(status: string) {
  switch (status) {
    case 'processing': return 'bg-green-100 text-green-600'
    case 'draft':      return 'bg-slate-100 text-slate-500'
    case 'completed':  return 'bg-blue-100 text-blue-600'
    case 'flagged':    return 'bg-red-100 text-red-600'
    default:           return 'bg-slate-100 text-slate-500'
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

type Props = {
  audit: Audit
}

export default function AuditDetail({ audit }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-5">

      {/* Audit name and status badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-slate-800 font-semibold text-base">{audit.name}</h3>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(audit.status)}`}>
          {audit.status}
        </span>
      </div>

      {/* Audit metadata */}
      <div className="grid grid-cols-2 gap-4 text-sm">

        <div>
          <p className="text-slate-400">Client Name</p>
          <p className="text-slate-700 font-medium mt-0.5">{audit.clientName ?? '—'}</p>
        </div>

        <div>
          <p className="text-slate-400">Audit Type</p>
          <p className="text-slate-700 font-medium mt-0.5">{audit.auditType ?? '—'}</p>
        </div>

        <div>
          <p className="text-slate-400">Organization</p>
          <p className="text-slate-700 font-medium mt-0.5">{audit.organization ?? '—'}</p>
        </div>

        <div>
          <p className="text-slate-400">Company</p>
          <p className="text-slate-700 font-medium mt-0.5">{audit.companyName ?? '—'}</p>
        </div>

        <div>
          <p className="text-slate-400">Created</p>
          <p className="text-slate-700 font-medium mt-0.5">{formatDate(audit.createdAt)}</p>
        </div>

        <div>
          <p className="text-slate-400">Last Updated</p>
          <p className="text-slate-700 font-medium mt-0.5">{formatDate(audit.updatedAt)}</p>
        </div>

      </div>

      {/* Description */}
      {audit.description && (
        <div className="text-sm">
          <p className="text-slate-400 mb-1">Description</p>
          <p className="text-slate-700">{audit.description}</p>
        </div>
      )}

      {/* Created by */}
      <div className="bg-slate-50 rounded-lg p-4 text-sm flex flex-col gap-1">
        <p className="text-slate-400 text-xs mb-1">Created By</p>
        <p className="text-slate-700 font-medium">{audit.createdBy?.name ?? '—'}</p>
        <p className="text-slate-500">{audit.createdBy?.email}</p>
        <p className="text-slate-400 capitalize">{audit.createdBy?.role}</p>
      </div>


</div>
  )
}
