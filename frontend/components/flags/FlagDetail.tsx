'use client'

import { FlagItem } from '@/lib/api/flags'

const engineLabel: Record<string, string> = {
  adverse_impact: 'Adverse Impact',
  position_description: 'Position Description',
  pay_equity: 'Pay Equity',
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'Critical': return 'bg-red-100 text-red-600'
    case 'High':     return 'bg-orange-100 text-orange-500'
    case 'Medium':   return 'bg-yellow-100 text-yellow-600'
    case 'Low':      return 'bg-green-100 text-green-600'
    default:         return 'bg-slate-100 text-slate-500'
  }
}

type DecisionSummary = {
  decision: string
  rationale: string
  decidedAt: string
}

type Props = {
  flag: FlagItem
  decisionSummary?: DecisionSummary | null
}

const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
    timeZoneName: 'short',
  })

export default function FlagDetail({ flag, decisionSummary }: Props) {
  const { results } = flag
  const fourFifths = results?.fourFifthsRule
  const isViolation = fourFifths !== undefined && fourFifths !== null && fourFifths < (flag.threshold ?? 0.8)

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-5">

      {/* Flag title and severity badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-slate-800 font-semibold text-base">
          {flag.name ?? '—'}
        </h3>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getSeverityColor(flag.severity)}`}>
          {flag.severity}
        </span>
      </div>

      {/* Flag metadata */}
      <div className="grid grid-cols-2 gap-4 text-sm">

        <div>
          <p className="text-slate-400">Engine</p>
          <p className="text-slate-700 font-medium mt-0.5">{engineLabel[flag.testType] ?? flag.testType}</p>
        </div>

        <div>
          <p className="text-slate-400">Status</p>
          <p className="text-slate-700 font-medium mt-0.5">{capitalize(flag.status)}</p>
        </div>

        <div>
          <p className="text-slate-400">Stage</p>
          <p className="text-slate-700 font-medium mt-0.5">{results?.stage ?? '—'}</p>
        </div>

        <div>
          <p className="text-slate-400">Demographic Group</p>
          <p className="text-slate-700 font-medium mt-0.5">{results?.demographicGroup ?? '—'}</p>
        </div>

        <div>
          <p className="text-slate-400">Assigned To</p>
          <p className="text-slate-700 font-medium mt-0.5">{flag.assignedTo}</p>
        </div>

        <div>
          <p className="text-slate-400">Job Title</p>
          <p className="text-slate-700 font-medium mt-0.5">{results?.jobTitle ?? '—'}</p>
        </div>

      </div>

      {/* Statistical results — always visible */}
      <div className="grid grid-cols-3 gap-4">

        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <p className="text-xs text-slate-400 mb-1">4/5ths Rule</p>
          <p className={`text-2xl font-bold ${isViolation ? 'text-red-500' : 'text-green-600'}`}>
            {fourFifths !== undefined && fourFifths !== null ? fourFifths.toFixed(2) : '—'}
          </p>
          <p className={`text-xs mt-1 ${isViolation ? 'text-red-400' : 'text-green-500'}`}>
            {isViolation ? 'Violation' : 'Pass'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <p className="text-xs text-slate-400 mb-1">Chi&apos;s-Square</p>
          <p className="text-2xl font-bold text-slate-800">
            {results?.chiSquare !== undefined && results.chiSquare !== null
              ? results.chiSquare.toFixed(4)
              : '—'}
          </p>
          <p className="text-xs text-slate-400 mt-1">Statistic</p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <p className="text-xs text-slate-400 mb-1">Fisher&apos;s Exact</p>
          <p className="text-2xl font-bold text-slate-800">
            {results?.fishersExact !== undefined && results.fishersExact !== null
              ? results.fishersExact.toFixed(4)
              : '—'}
          </p>
          <p className="text-xs text-slate-400 mt-1">P-value</p>
        </div>

      </div>

      {/* Decision summary */}
      <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
        <p className="text-sm font-medium text-slate-700">Summary</p>

        {decisionSummary ? (
          // Decided this session — full details available
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Decision</span>
              <span className="font-medium text-slate-700 capitalize">{decisionSummary.decision}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Decided</span>
              <span className="text-slate-700">{formatDate(decisionSummary.decidedAt)}</span>
            </div>
            {decisionSummary.rationale && (
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-slate-400">Rationale</span>
                <p className="text-slate-700 bg-slate-50 rounded-lg p-3 leading-relaxed">{decisionSummary.rationale}</p>
              </div>
            )}
          </>
        ) : flag.status === 'reviewed' || flag.status === 'dismissed' ? (
          // Already reviewed before this session — derive from flag fields
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Decision</span>
              <span className="font-medium text-slate-700">
                {flag.status === 'reviewed' ? 'Approved' : 'Dismissed'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Decided</span>
              <span className="text-slate-700">{formatDate(flag.updatedAt)}</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400">No decision has been made yet.</p>
        )}
      </div>

    </div>
  )
}
