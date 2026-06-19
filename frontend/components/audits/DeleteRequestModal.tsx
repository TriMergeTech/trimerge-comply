'use client'

import { useState } from 'react'

const PLACEHOLDER_DIRECTORS = ['Sarah Johnson', 'Michael Chen', 'Emily Rodriguez']

export default function DeleteRequestModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [director, setDirector] = useState('')

  if (!open) return null

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

        <select
          value={director}
          onChange={(e) => setDirector(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="" disabled>Select Director</option>
          {PLACEHOLDER_DIRECTORS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <button
          onClick={onClose}
          className="w-fit mx-auto bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2 rounded-full transition-colors"
        >
          Send Request
        </button>
      </div>
    </div>
  )
}
