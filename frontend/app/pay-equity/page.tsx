'use client'

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import PayEquityStats from '@/components/pay-equity/PayEquityStats'
import PayGapsChart from '@/components/pay-equity/PayGapsChart'
import DemographicGapsTable from '@/components/pay-equity/DemographicGapsTable'
import {
  getPayEquityAnalyses,
  downloadPayEquityReport,
  type PayEquityAnalysis,
} from '@/lib/api/payequity'

export default function PayEquity() {
  const [analysis, setAnalysis] = useState<PayEquityAnalysis | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Load most recent analysis on mount
  useEffect(() => {
    getPayEquityAnalyses()
      .then((data) => setAnalysis(data[0] ?? null))
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Failed to load analyses.'))
  }, [])

  async function handleExport() {
    if (!analysis) return
    setExporting(true)
    setExportError(null)
    try {
      const blob = await downloadPayEquityReport(analysis._id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'pay-equity-report.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: unknown) {
      setExportError(err instanceof Error ? err.message : 'Failed to download report.')
    } finally {
      setExporting(false)
    }
  }

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

        {/* Export report button */}
        <button
          onClick={handleExport}
          disabled={!analysis || exporting}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors w-fit"
        >
          <Download size={16} />
          {exporting ? 'Exporting…' : 'Export Data'}
        </button>
      </div>

      {/* Error messages */}
      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {loadError}
        </div>
      )}
      {exportError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {exportError}
        </div>
      )}

      {/* Summary stats */}
      <PayEquityStats
        departmentsAnalyzed={analysis?.departmentsAnalyzed ?? 0}
        demographicGroups={analysis?.demographicGroupsCount ?? 0}
        totalEmployees={analysis?.totalEmployees ?? 0}
        flagsGenerated={analysis?.flagsGenerated ?? 0}
      />

      {/* Charts and table side by side on desktop */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Pay gaps chart */}
        <div className="flex-1">
          <PayGapsChart gaps={analysis?.departmentGaps ?? null} />
        </div>

        {/* Demographic gaps table */}
        <div className="flex-1">
          <DemographicGapsTable gaps={analysis?.demographicGaps ?? null} />
        </div>

      </div>

    </div>
  )
}
