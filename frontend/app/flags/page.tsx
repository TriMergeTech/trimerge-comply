import FlagStatsSummary from '@/components/flags/FlagStatsSummary'
import FlagResultsTable from '@/components/flags/FlagResultsTable'

export default function FlagResults() {
  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div>
        <h2 className="text-slate-800 font-semibold text-xl">
          Adverse Impact – Flag Results
        </h2>
        <p className="text-slate-400 text-sm mt-0.5">
          City of Springfield – Applicant Flow Analysis
        </p>
      </div>

      {/* Flag stats summary */}
      <FlagStatsSummary
        total={18}
        critical={4}
        high={7}
        medium={5}
        low={2}
      />

      {/* Flag results table */}
      <FlagResultsTable />

    </div>
  )
}
