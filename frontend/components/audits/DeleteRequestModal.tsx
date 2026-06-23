'use client'

import { useState, useEffect } from 'react'
import { getAccessToken } from '@/lib/authTokens'
import { getDirectors } from '@/lib/api/auth'
import { submitDeletionRequest } from '@/lib/api/audits'

interface Director {
  _id: string
  name: string
  email: string
}

export default function DeleteRequestModal({
  open,
  auditId,
  onClose,
  onSuccess,
}: {
  open: boolean
  auditId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [directors, setDirectors] = useState<Director[]>([])
  const [directorId, setDirectorId] = useState('')
  const [deletionNotes, setDeletionNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setDirectorId('')
    setDeletionNotes('')
    setError(null)
    setFetchError(null)
    const token = getAccessToken()
    if (!token) return
    getDirectors(token)
      .then(({ directors }) => {
        setDirectors(directors)
      })
      .catch(() => setFetchError('Failed to load directors.'))
  }, [open])

  if (!open) return null

  async function handleSubmit() {
    if (!directorId || deletionNotes.length < 10) return
    setSubmitting(true)
    setError(null)
    try {
      await submitDeletionRequest(auditId, { deletionNotes, directorId })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm mx-4 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-slate-600 text-sm text-center">
          Select a director to send a delete request to
        </p>

        {fetchError ? (
          <p className="text-xs text-red-500 text-center">{fetchError}</p>
        ) : (
          <select
            value={directorId}
            onChange={(e) => setDirectorId(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="" disabled>Select Director</option>
            {directors.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        )}

        <textarea
          value={deletionNotes}
          onChange={(e) => setDeletionNotes(e.target.value)}
          placeholder="Reason for deletion (min 10 characters)"
          rows={3}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {error && <p className="text-xs text-red-500 text-center">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!directorId || deletionNotes.length < 10 || submitting}
          className="w-fit mx-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-6 py-2 rounded-full transition-colors"
        >
          {submitting ? 'Sending…' : 'Send Request'}
        </button>
      </div>
    </div>
  )
}
