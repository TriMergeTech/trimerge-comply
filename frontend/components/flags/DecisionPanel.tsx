'use client'

// Decision panel component
// Allows analyst to confirm, dismiss or escalate a flag
// Located on the right side of the flag detail page

import { useState } from 'react'

export default function DecisionPanel() {
  // Track selected decision
  const [decision, setDecision] = useState<string>('')
  // Track rationale text
  const [rationale, setRationale] = useState<string>('')

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-5">

      {/* Panel title */}
      <h3 className="text-slate-800 font-semibold text-base">Make a Decision</h3>

      {/* Decision options */}
      <div className="flex flex-col gap-3">

        {/* Confirm */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="decision"
            value="Confirm"
            checked={decision === 'Confirm'}
            onChange={(e) => setDecision(e.target.value)}
            className="accent-indigo-600"
          />
          <span className="text-sm text-slate-700">Confirm</span>
        </label>

        {/* Dismiss */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="decision"
            value="Dismiss"
            checked={decision === 'Dismiss'}
            onChange={(e) => setDecision(e.target.value)}
            className="accent-indigo-600"
          />
          <span className="text-sm text-slate-700">Dismiss</span>
        </label>

        {/* Escalate */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="decision"
            value="Escalate"
            checked={decision === 'Escalate'}
            onChange={(e) => setDecision(e.target.value)}
            className="accent-indigo-600"
          />
          <span className="text-sm text-slate-700">Escalate</span>
        </label>

      </div>

      {/* Rationale text area */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-600 font-medium">
          Rationale <span className="text-slate-400 font-normal">(required)</span>
        </label>
        <textarea
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          placeholder="Explain your reasoning for the decision..."
          rows={4}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        {/* Character count */}
        <p className="text-xs text-slate-400 text-right">{rationale.length}/1000</p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2">

        {/* Submit decision */}
        <button
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!decision || !rationale}
        >
          Submit Decision
        </button>

        {/* Save as draft */}
        <button className="w-full border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Save as Draft
        </button>

      </div>

    </div>
  )
}