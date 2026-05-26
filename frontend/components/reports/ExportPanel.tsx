'use client'

// Export panel component
// Allows analyst to export confirmed findings as CSV
// Audit dropdown uses real API data

import { useState, useEffect } from 'react'
import { Download, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getAudits, Audit } from '@/lib/api/audits'
import { exportDashboardCSV } from '@/lib/api/dashboard'

export default function ExportPanel() {
  const [audits, setAudits] = useState<Audit[]>([])
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null)
  const [exporting, setExporting] = useState(false)

  

  // Fetch real audits for the dropdown
  useEffect(() => {
    async function fetchAudits() {
      try {
        const data = await getAudits()
        setAudits(data)
        if (data.length > 0) setSelectedAudit(data[0])
      } catch (err) {
        console.error(err)
      }
    }
    fetchAudits()
  }, [])

  // Handle export button click
  async function handleExport() {
    setExporting(true)
    try {
      await exportDashboardCSV()
      toast.success('Export downloaded successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

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
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-between gap-2 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 hover:bg-slate-50 transition-colors w-full">
              {selectedAudit ? `${selectedAudit.organization ?? '—'} — ${selectedAudit.name}` : 'Select audit'}
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[400px]">
              {audits.map((audit) => (
                <DropdownMenuItem
                  key={audit._id}
                  onClick={() => setSelectedAudit(audit)}
                  className="cursor-pointer"
                >
                  {audit.organization ?? '—'} — {audit.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>




        {/* Export button */}
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors sm:mb-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={16} />
          {exporting ? 'Exporting...' : 'Export'}
        </button>

      </div>
    </div>
  )
}