'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileDown, ChevronDown, Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getAudits, Audit } from '@/lib/api/audits'
import { getFindings, downloadFindingsReport, Finding, GetFindingsParams } from '@/lib/api/findings'
import FindingsList from '@/components/findings/FindingsList'
import CreateFindingModal from '@/components/findings/CreateFindingModal'

const LIMIT = 20

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'additional_info_required', label: 'Info Required' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'closed', label: 'Closed' },
]

const RISK_OPTIONS = [
  { value: '', label: 'All Risk Levels' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export default function FindingsPage() {
  const [audits, setAudits] = useState<Audit[]>([])
  const [auditFilter, setAuditFilter] = useState<Audit | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [riskFilter, setRiskFilter] = useState('')
  const [findings, setFindings] = useState<Finding[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [downloading, setDownloading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    getAudits().then(setAudits).catch(() => {})
  }, [])

  const fetchFindings = useCallback((params: GetFindingsParams) => {
    setLoading(true)
    getFindings(params)
      .then((res) => {
        setFindings(res.findings)
        setTotal(res.pagination.total)
        setTotalPages(res.pagination.totalPages)
      })
      .catch(() => toast.error('Failed to load findings.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchFindings({
      auditId: auditFilter?._id,
      status: statusFilter || undefined,
      riskLevel: riskFilter || undefined,
      page,
      limit: LIMIT,
    })
  }, [auditFilter, statusFilter, riskFilter, page, fetchFindings])

  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v)
    setPage(1)
  }

  const handleDownload = async () => {
    if (!auditFilter) return
    setDownloading(true)
    try {
      await downloadFindingsReport(
        auditFilter._id,
        `${auditFilter.name.replace(/\s+/g, '_')}_Findings_Report.pdf`
      )
    } catch {
      toast.error('Failed to download report.')
    } finally {
      setDownloading(false)
    }
  }

  const criticalCount = findings.filter((f) => f.risk.level === 'critical').length
  const highCount = findings.filter((f) => f.risk.level === 'high').length
  const mediumCount = findings.filter((f) => f.risk.level === 'medium').length
  const lowCount = findings.filter((f) => f.risk.level === 'low').length

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-slate-800 font-semibold text-xl">Findings</h2>
          <p className="text-slate-400 text-sm mt-0.5">Review compliance findings across all audits.</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading || !auditFilter}
          title={!auditFilter ? 'Select an audit filter to download its report' : undefined}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors w-fit"
        >
          <FileDown size={15} />
          {downloading ? 'Downloading…' : 'Download PDF'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 justify-between">

        {/* Audit filter */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 hover:bg-slate-50 transition-colors max-w-[220px]">
            <span className="truncate">{auditFilter ? auditFilter.name : 'All Audits'}</span>
            <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-w-xs">
            <DropdownMenuItem onClick={() => { setAuditFilter(null); setPage(1) }} className="cursor-pointer">
              All Audits
            </DropdownMenuItem>
            {audits.map((a) => (
              <DropdownMenuItem
                key={a._id}
                onClick={() => { setAuditFilter(a); setPage(1) }}
                className="cursor-pointer truncate"
              >
                {a.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status filter */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? 'All Statuses'}
            <ChevronDown size={14} className="text-slate-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {STATUS_OPTIONS.map((o) => (
              <DropdownMenuItem key={o.value} onClick={() => handleFilterChange(setStatusFilter)(o.value)} className="cursor-pointer">
                {o.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Risk filter */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            {RISK_OPTIONS.find((o) => o.value === riskFilter)?.label ?? 'All Risk Levels'}
            <ChevronDown size={14} className="text-slate-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {RISK_OPTIONS.map((o) => (
              <DropdownMenuItem key={o.value} onClick={() => handleFilterChange(setRiskFilter)(o.value)} className="cursor-pointer">
                {o.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* New finding — far right of filter row */}
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ml-auto"
        >
          <Plus size={13} />
          New Finding
        </button>

      </div>

      {/* KPI bar */}
      {!loading && findings.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
            <p className="text-xs text-slate-400">Critical</p>
            <p className="text-lg font-semibold text-slate-800 mt-0.5">{criticalCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
            <p className="text-xs text-slate-400">High Risk</p>
            <p className="text-lg font-semibold text-slate-800 mt-0.5">{highCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
            <p className="text-xs text-slate-400">Medium Risk</p>
            <p className="text-lg font-semibold text-slate-800 mt-0.5">{mediumCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
            <p className="text-xs text-slate-400">Low Risk</p>
            <p className="text-lg font-semibold text-slate-800 mt-0.5">{lowCount}</p>
          </div>
        </div>
      )}

      {/* Create finding modal */}
      <CreateFindingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => fetchFindings({ auditId: auditFilter?._id, status: statusFilter || undefined, riskLevel: riskFilter || undefined, page: 1, limit: LIMIT })}
        audits={audits}
        defaultAuditId={auditFilter?._id}
      />

      {/* Findings list */}
      <FindingsList
        findings={findings}
        loading={loading}
        page={page}
        totalPages={totalPages}
        total={total}
        onPrevious={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />

    </div>
  )
}
