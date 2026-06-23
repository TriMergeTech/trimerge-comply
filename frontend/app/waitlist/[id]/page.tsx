'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { getDemoRequestById, updateDemoRequestStatus, DemoRequest, DemoRequestStatus } from '@/lib/api/demoRequests'

const STATUS_COLORS: Record<string, string> = {
  new:       'bg-blue-100 text-blue-600',
  contacted: 'bg-yellow-100 text-yellow-600',
  scheduled: 'bg-indigo-100 text-indigo-600',
  closed:    'bg-green-100 text-green-600',
}

const STATUS_LABEL: Record<string, string> = {
  new:       'New',
  contacted: 'Contacted',
  scheduled: 'Scheduled',
  closed:    'Closed',
}

const NEXT_STATUS: Record<string, DemoRequestStatus | null> = {
  new:       'contacted',
  contacted: 'scheduled',
  scheduled: 'closed',
  closed:    null,
}

const INTEREST_LABEL: Record<string, string> = {
  adverse_impact_analysis:     'Adverse Impact Analysis',
  pay_equity_analysis:         'Pay Equity Analysis',
  position_description_review: 'Position Description Review',
  all_of_the_above:            'All of the Above',
}

function MetaRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-slate-400 text-xs">{label}</p>
      <p className="text-slate-700 font-medium text-sm mt-0.5">{value || '—'}</p>
    </div>
  )
}

export default function WaitlistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [request, setRequest] = useState<DemoRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!id) return
    getDemoRequestById(id)
      .then(setRequest)
      .catch(() => toast.error('Failed to load request.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAdvance = async () => {
    if (!request) return
    const next = NEXT_STATUS[request.status]
    if (!next) return
    setUpdating(true)
    try {
      await updateDemoRequestStatus(request._id, next)
      setRequest({ ...request, status: next })
      toast.success(`Status updated to ${STATUS_LABEL[next]}.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading…</div>
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-500 text-sm">Request not found.</p>
        <Link href="/waitlist" className="text-indigo-500 text-sm hover:underline">← Back to Waitlist</Link>
      </div>
    )
  }

  const next = NEXT_STATUS[request.status]

  return (
    <div className="flex flex-col gap-6">

      {/* Back */}
      <Link href="/waitlist" className="text-sm text-indigo-500 hover:underline w-fit">
        ← Back to Waitlist
      </Link>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Main detail card */}
        <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col gap-6">

          {/* Name + status */}
          <div className="flex items-center justify-between">
            <h3 className="text-slate-800 font-semibold text-lg">
              {request.firstName} {request.lastName}
            </h3>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[request.status]}`}>
              {STATUS_LABEL[request.status]}
            </span>
          </div>

          {/* Contact + org info */}
          <div className="grid grid-cols-2 gap-4">
            <MetaRow label="Work Email" value={request.workEmail} />
            <MetaRow label="Phone Number" value={request.phoneNumber} />
            <MetaRow label="Organization" value={request.organization} />
            <MetaRow label="Job Title" value={request.jobTitle} />
            <MetaRow label="Role" value={request.role} />
            <MetaRow label="Company Size" value={request.companySize} />
          </div>

          {/* Interests */}
          <div>
            <p className="text-slate-400 text-xs mb-2">Interests</p>
            <div className="flex flex-wrap gap-2">
              {request.interests.length > 0 ? request.interests.map((i) => (
                <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full font-medium">
                  {INTEREST_LABEL[i] ?? i}
                </span>
              )) : <span className="text-slate-400 text-sm">—</span>}
            </div>
          </div>

          {/* Additional details */}
          {request.additionalDetails && (
            <div>
              <p className="text-slate-400 text-xs mb-1">Additional Details</p>
              <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 rounded-lg p-3">
                {request.additionalDetails}
              </p>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <MetaRow
              label="Submitted"
              value={new Date(request.createdAt).toLocaleString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
                hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short',
              })}
            />
            <MetaRow
              label="Last Updated"
              value={new Date(request.updatedAt).toLocaleString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
                hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short',
              })}
            />
          </div>

        </div>

        {/* Status action panel */}
        <div className="lg:w-72 bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4 h-fit">
          <p className="text-sm font-medium text-slate-700">Workflow Status</p>

          {/* Status steps */}
          <div className="flex flex-col gap-2">
            {(['new', 'contacted', 'scheduled', 'closed'] as const).map((s, i) => {
              const statuses = ['new', 'contacted', 'scheduled', 'closed']
              const currentIndex = statuses.indexOf(request.status)
              const stepIndex = i
              const isDone = stepIndex < currentIndex
              const isCurrent = stepIndex === currentIndex

              return (
                <div key={s} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    isCurrent ? 'bg-[#4f46e5]' : isDone ? 'bg-green-500' : 'bg-slate-200'
                  }`} />
                  <span className={`text-sm ${isCurrent ? 'text-slate-800 font-medium' : isDone ? 'text-slate-500' : 'text-slate-300'}`}>
                    {STATUS_LABEL[s]}
                  </span>
                </div>
              )
            })}
          </div>

          <hr className="border-slate-100" />

          {next ? (
            <button
              onClick={handleAdvance}
              disabled={updating}
              className="w-full py-2.5 text-sm font-semibold bg-[#4f46e5] hover:bg-[#4338ca] disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {updating ? 'Updating…' : `Mark as ${STATUS_LABEL[next]}`}
            </button>
          ) : (
            <p className="text-sm text-slate-400 text-center">This request is closed.</p>
          )}
        </div>

      </div>
    </div>
  )
}
