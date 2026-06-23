'use client'

import { useState } from 'react'
import { ChevronDown, BookOpen, Bot } from 'lucide-react'
import { Finding } from '@/lib/api/findings'

const RISK_COLORS: Record<string, string> = {
  critical: 'bg-purple-100 text-purple-700',
  high:     'bg-red-100 text-red-600',
  medium:   'bg-amber-100 text-amber-600',
  low:      'bg-green-100 text-green-600',
}

const STATUS_COLORS: Record<string, string> = {
  new:                      'bg-blue-100 text-blue-600',
  under_review:             'bg-yellow-100 text-yellow-600',
  additional_info_required: 'bg-orange-100 text-orange-600',
  approved:                 'bg-green-100 text-green-600',
  rejected:                 'bg-red-100 text-red-600',
  closed:                   'bg-slate-100 text-slate-500',
}

const STATUS_LABEL: Record<string, string> = {
  new:                      'New',
  under_review:             'Under Review',
  additional_info_required: 'Info Required',
  approved:                 'Approved',
  rejected:                 'Rejected',
  closed:                   'Closed',
}

function FindingCard({ finding }: { finding: Finding }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-5 flex flex-col gap-4">

      {/* Top row: risk + status + AI badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${RISK_COLORS[finding.risk.level]}`}>
          {finding.risk.level} Risk
        </span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[finding.status]}`}>
          {STATUS_LABEL[finding.status] ?? finding.status}
        </span>
        {finding.aiDrafted && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-500">
            <Bot size={11} /> AI Drafted
          </span>
        )}
        {finding.assignedTo && (
          <span className="ml-auto text-xs text-slate-400">
            Assigned to <span className="font-medium text-slate-600">{finding.assignedTo.name}</span>
          </span>
        )}
      </div>

      {/* Observation */}
      <div>
        <p className="text-xs text-slate-400 mb-1">Observation</p>
        <p className="text-sm text-slate-700 leading-relaxed">{finding.observation}</p>
      </div>

      {/* Risk description */}
      {finding.risk.description && (
        <div>
          <p className="text-xs text-slate-400 mb-1">Description</p>
          <p className="text-sm text-slate-600 leading-relaxed">{finding.risk.description}</p>
        </div>
      )}

      {/* Recommendation */}
      {finding.recommendation && (
        <div>
          <p className="text-xs text-slate-400 mb-1">Recommendation</p>
          <p className="text-sm text-slate-600 leading-relaxed">{finding.recommendation}</p>
        </div>
      )}

      {/* Expandable section */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors w-fit"
      >
        <ChevronDown size={14} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        {expanded ? 'Show less' : 'Show more details'}
      </button>

      {expanded && (
        <div className="flex flex-col gap-4 pt-1 border-t border-slate-100">

          {/* Criteria */}
          {finding.criteria && (
            <div>
              <p className="text-xs text-slate-400 mb-1">Criteria</p>
              <p className="text-sm text-slate-600 leading-relaxed">{finding.criteria}</p>
            </div>
          )}

          {/* Handbook reference */}
          {finding.handbookReference?.section && (
            <div className="bg-slate-50 rounded-lg p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <BookOpen size={13} />
                {finding.handbookReference.section}
              </div>
              {finding.handbookReference.excerpt && (
                <p className="text-xs text-slate-500 italic leading-relaxed">
                  &ldquo;{finding.handbookReference.excerpt}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Analyst notes */}
          {finding.analystNotes && (
            <div>
              <p className="text-xs text-slate-400 mb-1">Analyst Notes</p>
              <p className="text-sm text-slate-600 leading-relaxed">{finding.analystNotes}</p>
            </div>
          )}

          {/* Reviewed by */}
          {finding.reviewedBy && (
            <div className="text-xs text-slate-400">
              Reviewed by <span className="text-slate-600 font-medium">{finding.reviewedBy.name}</span>
              {finding.reviewedAt && (
                <> on {new Date(finding.reviewedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  )
}

type Props = {
  findings: Finding[]
  loading: boolean
  page: number
  totalPages: number
  total: number
  onPrevious: () => void
  onNext: () => void
}

export default function FindingsList({ findings, loading, page, totalPages, total, onPrevious, onNext }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
        Loading findings…
      </div>
    )
  }

  if (findings.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 text-sm bg-white rounded-xl border border-slate-100 shadow-sm">
        No findings for this audit.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {findings.map((f) => (
          <FindingCard key={f._id} finding={f} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-500 pt-1">
        <span>{total} finding{total !== 1 ? 's' : ''} total</span>
        <div className="flex items-center gap-3">
          <button
            onClick={onPrevious}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
          <button
            onClick={onNext}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
