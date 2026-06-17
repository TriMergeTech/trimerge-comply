'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { decideFlag, DecisionValue } from '@/lib/api/flags'

const decisionMap: Record<string, DecisionValue> = {
  Confirm: 'approved',
  Dismiss: 'dismissed',
}

type Props = {
  flagId: string
  onDecided?: (decision: string, rationale: string) => void
}

export default function DecisionPanel({ flagId, onDecided }: Props) {
  const [decision, setDecision] = useState<string>('')
  const [rationale, setRationale] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [decided, setDecided] = useState(false)

  async function handleSubmit() {
    if (!decision || !rationale || submitting) return
    setSubmitting(true)
    try {
      await decideFlag(flagId, decisionMap[decision], rationale)
      toast.success('Decision submitted successfully.')
      setDecided(true)
      onDecided?.(decision, rationale)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit decision.'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (decided) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center justify-center h-40">
        <p className="text-sm text-green-600 font-medium">Decision recorded.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-5">

      <h3 className="text-slate-800 font-semibold text-base">Make a Decision</h3>

      {/* Decision options */}
      <div className="flex flex-col gap-3">
        {(['Confirm', 'Dismiss'] as const).map((option) => (
          <label key={option} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="decision"
              value={option}
              checked={decision === option}
              onChange={(e) => setDecision(e.target.value)}
              className="accent-indigo-600"
            />
            <span className="text-sm text-slate-700">{option}</span>
          </label>
        ))}
      </div>

      {/* Rationale */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-600 font-medium">
          Rationale <span className="text-slate-400 font-normal">(required)</span>
        </label>
        <textarea
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          placeholder="Explain your reasoning for the decision..."
          rows={4}
          maxLength={1000}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <p className="text-xs text-slate-400 text-right">{rationale.length}/1000</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleSubmit}
          disabled={!decision || !rationale || submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting…' : 'Submit Decision'}
        </button>
      </div>

    </div>
  )
}
