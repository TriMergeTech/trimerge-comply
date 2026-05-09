// Compliance stats component
// Displays high level flag metrics at the top of the compliance dashboard

type ComplianceStatsProps = {
  totalFlags: number
  pendingReview: number
  confirmedFindings: number
  dismissed: number
}

export default function ComplianceStats({
  totalFlags,
  pendingReview,
  confirmedFindings,
  dismissed,
}: ComplianceStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

      {/* Total Flags */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-4">
        <p className="text-3xl font-bold text-slate-800">{totalFlags}</p>
        <p className="text-sm text-slate-400 mt-1">Total Flags</p>
        <p className="text-xs text-green-500 mt-1">↑ 15 from last week</p>
      </div>

      {/* Pending Review */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-4">
        <p className="text-3xl font-bold text-slate-800">{pendingReview}</p>
        <p className="text-sm text-slate-400 mt-1">Pending Review</p>
        <p className="text-xs text-red-500 mt-1">↑ 5 from last week</p>
      </div>

      {/* Confirmed Findings */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-4">
        <p className="text-3xl font-bold text-slate-800">{confirmedFindings}</p>
        <p className="text-sm text-slate-400 mt-1">Confirmed Findings</p>
        <p className="text-xs text-green-500 mt-1">↑ 1 from last week</p>
      </div>

      {/* Dismissed */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-4">
        <p className="text-3xl font-bold text-slate-800">{dismissed}</p>
        <p className="text-sm text-slate-400 mt-1">Dismissed</p>
        <p className="text-xs text-slate-400 mt-1">↑ 2 from last week</p>
      </div>

    </div>
  )
}