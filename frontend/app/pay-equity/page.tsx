import { Upload } from 'lucide-react'
import PayEquityStats from '@/components/pay-equity/PayEquityStats'
import PayGapsChart from '@/components/pay-equity/PayGapsChart'
import DemographicGapsTable from '@/components/pay-equity/DemographicGapsTable'

export default function PayEquity() {
  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-slate-800 font-semibold text-xl">
            Pay Equity Analysis
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Compensation data analysis and gap detection.
          </p>
        </div>

        {/* Upload data button */}
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors w-fit">
          <Upload size={16} />
          Upload Data
        </button>
      </div>

      {/* Summary stats */}
      <PayEquityStats
        departmentsAnalyzed={12}
        demographicGroups={4}
        totalEmployees={1248}
        flagsGenerated={8}
      />

      {/* Charts and table side by side on desktop */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Pay gaps chart */}
        <div className="flex-1">
          <PayGapsChart />
        </div>

        {/* Demographic gaps table */}
        <div className="flex-1">
          <DemographicGapsTable />
        </div>

      </div>

      {/* Temporary link to reports and export */}
      <div className="flex justify-start">
        <a
          href="/pay-equity/reports"
          className="text-sm text-indigo-500 hover:underline"
        >
          View Reports & Export →
        </a>
      </div>

    </div>
  )
}