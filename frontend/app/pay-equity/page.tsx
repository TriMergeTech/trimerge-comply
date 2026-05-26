'use client'

import { useRef, useState, useEffect } from 'react'
import { Upload } from 'lucide-react'
import PayEquityStats from '@/components/pay-equity/PayEquityStats'
import PayGapsChart from '@/components/pay-equity/PayGapsChart'
import DemographicGapsTable from '@/components/pay-equity/DemographicGapsTable'
import {
  getPayEquityAnalyses,
  uploadPayEquityFile,
  type PayEquityAnalysis,
} from '@/lib/api/payequity'

export default function PayEquity() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [analysis, setAnalysis] = useState<PayEquityAnalysis | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load most recent analysis on mount
  useEffect(() => {
    getPayEquityAnalyses()
      .then((data) => setAnalysis(data[0] ?? null))
      .catch((err) => console.error('Failed to load pay equity analyses:', err))
  }, [])

  // Triggered when user picks a file
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const result = await uploadPayEquityFile(file)
      setAnalysis(result)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      // Reset the input so the same file can be re-uploaded if needed
      if (fileInputRef.current) fileInputRef.current.value = ''
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

        {/* Hidden file input — triggered by the button below */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Upload data button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors w-fit"
        >
          <Upload size={16} />
          {uploading ? 'Analyzing…' : 'Upload Data'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {error}
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
