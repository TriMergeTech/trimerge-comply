'use client'

// Export panel component
// Allows analyst to export confirmed findings
// Layout: audit dropdown, format dropdown and export button in one row

import { useState } from 'react'
import { Download } from 'lucide-react'

// Temporary audit options — will be replaced with real API data later
const auditOptions = [
  'City of Springfield – Full Audit',
  'State Transit Authority – Adverse Impact',
  'Public Health Dept – Pay Equity',
  'County of Madison – Position Description',
]

// Format options
const formatOptions = ['CSV', '.docx', 'PDF']

export default function ExportPanel() {
  const [selectedAudit, setSelectedAudit] = useState(auditOptions[0])
  const [selectedFormat, setSelectedFormat] = useState('CSV')

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">

      {/* Card header */}
      <h3 className="text-slate-800 font-semibold text-base mb-1">
        Export Confirmed Findings
      </h3>
      <p className="text-slate-400 text-sm mb-5">
        Download confirmed findings for this audit.
      </p>

      {/* Audit, format and export button in one row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">

        {/* Audit selector */}
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm text-slate-600 font-medium">Audit</label>
          <select
            value={selectedAudit}
            onChange={(e) => setSelectedAudit(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {auditOptions.map((audit, index) => (
              <option key={index} value={audit}>{audit}</option>
            ))}
          </select>
        </div>

        {/* Format selector */}
        <div className="flex flex-col gap-1 sm:w-36">
          <label className="text-sm text-slate-600 font-medium">Format</label>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {formatOptions.map((format, index) => (
              <option key={index} value={format}>{format}</option>
            ))}
          </select>
        </div>

        {/* Export button */}
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors sm:mb-0.5">
          <Download size={16} />
          Export
        </button>

      </div>
    </div>
  )
}