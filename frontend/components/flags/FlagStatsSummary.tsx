// Flag stats summary component
// Displays total flags and breakdown by severity at the top of the results page

// Props for the stats summary
type FlagStatsSummaryProps = {
  total: number
  critical: number
  high: number
  medium: number
  low: number
}

export default function FlagStatsSummary({
  total,
  critical,
  high,
  medium,
  low,
}: FlagStatsSummaryProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">

      {/* Total flags */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-4 w-full">
        <p className="text-3xl font-bold text-slate-800">{total}</p>
        <p className="text-sm text-slate-400 mt-1">Total Flags</p>
        <a href="/flags/queue" className="text-xs text-indigo-500 hover:underline mt-1 inline-block">
          View all
        </a>
      </div>

      {/* Critical */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-4 w-full">
        <p className="text-3xl font-bold text-red-500">{critical}</p>
        <p className="text-sm text-slate-400 mt-1">Critical</p>
      </div>

      {/* High */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-4 w-full">
        <p className="text-3xl font-bold text-orange-400">{high}</p>
        <p className="text-sm text-slate-400 mt-1">High</p>
      </div>

      {/* Medium */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-4 w-full">
        <p className="text-3xl font-bold text-yellow-400">{medium}</p>
        <p className="text-sm text-slate-400 mt-1">Medium</p>
      </div>

      {/* Low */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-4 w-full">
        <p className="text-3xl font-bold text-green-400">{low}</p>
        <p className="text-sm text-slate-400 mt-1">Low</p>
      </div>

    </div>
  )
}