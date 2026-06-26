'use client'

import { useState, useEffect } from 'react'
import { getDeletionRequests, reviewDeletionRequest, type DeletionRequest } from '@/lib/api/audits'
import { useUser } from '@/lib/context/UserContext'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function statusBadge(status: string) {
  switch (status) {
    case 'pending':  return 'bg-amber-100 text-amber-700'
    case 'approved': return 'bg-green-100 text-green-700'
    case 'rejected': return 'bg-red-100 text-red-700'
    default:         return 'bg-slate-100 text-slate-500'
  }
}

export default function DeletionRequestsTable() {
  const user = useUser()
  const isDirector = user?.role === 'director'
  const [requests, setRequests] = useState<DeletionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [reviewTarget, setReviewTarget] = useState<{ requestId: string; decision: 'approved' | 'rejected' } | null>(null)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function fetchRequests() {
    setLoading(true)
    try {
      const res = await getDeletionRequests()
      setRequests(res.data.requests)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deletion requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRequests() }, [])

  async function handleReview() {
    if (!reviewTarget || !approvalNotes.trim()) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await reviewDeletionRequest(reviewTarget.requestId, {
        decision: reviewTarget.decision,
        approvalNotes: approvalNotes.trim(),
      })
      setReviewTarget(null)
      setApprovalNotes('')
      fetchRequests()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-10 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading deletion requests…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-10 flex items-center justify-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-10 flex items-center justify-center">
        <p className="text-slate-400 text-sm">No deletion requests found.</p>
      </div>
    )
  }

  return (
    <>
      {/* Review decision modal */}
      {reviewTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => { setReviewTarget(null); setApprovalNotes('') }}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm mx-4 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-slate-700 font-semibold text-center capitalize">
              {reviewTarget.decision === 'approved' ? 'Approve' : 'Reject'} Deletion Request
            </p>
            <textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Enter your decision notes…"
              rows={4}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {submitError && <p className="text-xs text-red-500 text-center">{submitError}</p>}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => { setReviewTarget(null); setApprovalNotes('') }}
                className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                disabled={!approvalNotes.trim() || submitting}
                className={`text-sm text-white font-medium px-6 py-2 rounded-full transition-colors disabled:opacity-50 ${
                  reviewTarget.decision === 'approved'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {submitting ? 'Submitting…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-left border-b border-slate-100">
                <th className="pb-3 font-medium">Audit</th>
                <th className="pb-3 font-medium">Requested By</th>
                <th className="pb-3 font-medium">Director</th>
                <th className="pb-3 font-medium">Notes</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 text-slate-700 font-medium">
                    {req.auditId?.name ?? '—'}
                  </td>
                  <td className="py-3 text-slate-500">
                    <div>{req.requestedBy?.name ?? '—'}</div>
                    <div className="text-xs text-slate-400">{req.requestedBy?.email}</div>
                  </td>
                  <td className="py-3 text-slate-500">
                    <div>{req.directorId?.name ?? '—'}</div>
                    <div className="text-xs text-slate-400">{req.directorId?.email}</div>
                  </td>
                  <td className="py-3 text-slate-500 max-w-48">
                    <p className="text-xs leading-relaxed line-clamp-2">{req.deletionNotes}</p>
                  </td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500 whitespace-nowrap">{formatDate(req.createdAt)}</td>
                  <td className="py-3">
                    {isDirector && req.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setReviewTarget({ requestId: req._id, decision: 'approved' }); setApprovalNotes('') }}
                          className="text-xs bg-green-100 hover:bg-green-200 text-green-700 font-medium px-3 py-1 rounded-full transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => { setReviewTarget({ requestId: req._id, decision: 'rejected' }); setApprovalNotes('') }}
                          className="text-xs bg-red-100 hover:bg-red-200 text-red-600 font-medium px-3 py-1 rounded-full transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
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
