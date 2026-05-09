// Pay equity stats component
// Displays summary metrics at the top of the pay equity page

type PayEquityStatsProps = {
  departmentsAnalyzed: number
  demographicGroups: number
  totalEmployees: number
  flagsGenerated: number
}

export default function PayEquityStats({
  departmentsAnalyzed,
  demographicGroups,
  totalEmployees,
  flagsGenerated,
}: PayEquityStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

      {/* Departments Analyzed */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-4">
        <p className="text-3xl font-bold text-slate-800">{departmentsAnalyzed}</p>
        <p className="text-sm text-slate-400 mt-1">Departments Analyzed</p>
      </div>

      {/* Demographic Groups */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-4">
        <p className="text-3xl font-bold text-slate-800">{demographicGroups}</p>
        <p className="text-sm text-slate-400 mt-1">Demographic Groups</p>
      </div>

      {/* Total Employees */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-4">
        <p className="text-3xl font-bold text-slate-800">{totalEmployees.toLocaleString()}</p>
        <p className="text-sm text-slate-400 mt-1">Total Employees</p>
      </div>

      {/* Flags Generated */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-4">
        <p className="text-3xl font-bold text-red-500">{flagsGenerated}</p>
        <p className="text-sm text-slate-400 mt-1">Flags Generated</p>
      </div>

    </div>
  )
}