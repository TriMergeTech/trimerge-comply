'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Bot } from 'lucide-react'
import { toast } from 'sonner'
import { getFindingById, getEvidence, deleteEvidence, Finding, Evidence } from '@/lib/api/findings'
import EvidenceList from '@/components/findings/EvidenceList'
import AddEvidenceModal from '@/components/findings/AddEvidenceModal'

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

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm text-slate-600 leading-relaxed">{value}</p>
    </div>
  )
}

export default function FindingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [finding, setFinding] = useState<Finding | null>(null)
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [evidenceTotal, setEvidenceTotal] = useState(0)
  const [loadingFinding, setLoadingFinding] = useState(true)
  const [loadingEvidence, setLoadingEvidence] = useState(true)
  const [addEvidenceOpen, setAddEvidenceOpen] = useState(false)

  function loadEvidence(findingId: string) {
    setLoadingEvidence(true)
    getEvidence(findingId)
      .then((res) => { setEvidence(res.evidence); setEvidenceTotal(res.total) })
      .catch(() => toast.error('Failed to load evidence.'))
      .finally(() => setLoadingEvidence(false))
  }

  useEffect(() => {
    if (!id) return
    getFindingById(id)
      .then(setFinding)
      .catch(() => toast.error('Failed to load finding.'))
      .finally(() => setLoadingFinding(false))

    loadEvidence(id)
  }, [id])

  if (loadingFinding) {
    return <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading…</div>
  }

  if (!finding) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-500 text-sm">Finding not found.</p>
        <Link href="/findings" className="text-indigo-500 text-sm hover:underline">← Back to Findings</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Back */}
      <Link href="/findings" className="text-sm text-indigo-500 hover:underline w-fit">
        ← Back to Findings
      </Link>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Left — finding detail */}
        <div className="flex-1 flex flex-col gap-5">

          {/* Header card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
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

            <Field label="Observation" value={finding.observation} />
            {finding.risk.description && <Field label="Description" value={finding.risk.description} />}
            <Field label="Recommendation" value={finding.recommendation} />
            <Field label="Criteria" value={finding.criteria} />
            <Field label="Analyst Notes" value={finding.analystNotes} />

            {finding.handbookReference?.section && (
              <div className="bg-slate-50 rounded-lg p-4 flex flex-col gap-1.5">
                <p className="text-xs text-slate-500 font-medium">{finding.handbookReference.section}</p>
                {finding.handbookReference.excerpt && (
                  <p className="text-xs text-slate-500 italic leading-relaxed">
                    &ldquo;{finding.handbookReference.excerpt}&rdquo;
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Evidence */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-700 font-semibold text-sm">Evidence</h3>
              <button
                onClick={() => setAddEvidenceOpen(true)}
                className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                + Add Evidence
              </button>
            </div>
            <EvidenceList
              evidence={evidence}
              loading={loadingEvidence}
              total={evidenceTotal}
              findingStatus={finding.status}
              onDelete={async (evidenceId) => {
                try {
                  await deleteEvidence(id, evidenceId)
                  toast.success('Evidence removed.')
                  loadEvidence(id)
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : 'Failed to remove evidence.')
                }
              }}
            />
          </div>

        </div>

        {/* Right — meta panel */}
        <div className="lg:w-64 flex flex-col gap-4 h-fit">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Details</p>

            {finding.createdBy && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Created By</p>
                <p className="text-sm text-slate-700 font-medium">{finding.createdBy.name}</p>
                <p className="text-xs text-slate-400">{finding.createdBy.email}</p>
              </div>
            )}

            {finding.reviewedBy && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Reviewed By</p>
                <p className="text-sm text-slate-700 font-medium">{finding.reviewedBy.name}</p>
                {finding.reviewedAt && (
                  <p className="text-xs text-slate-400">
                    {new Date(finding.reviewedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
            )}

            <div>
              <p className="text-xs text-slate-400 mb-0.5">Created</p>
              <p className="text-sm text-slate-600">
                {new Date(finding.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-0.5">Last Updated</p>
              <p className="text-sm text-slate-600">
                {new Date(finding.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

      </div>

      <AddEvidenceModal
        open={addEvidenceOpen}
        onClose={() => setAddEvidenceOpen(false)}
        onSuccess={() => loadEvidence(id)}
        findingId={id}
      />
    </div>
  )
}
