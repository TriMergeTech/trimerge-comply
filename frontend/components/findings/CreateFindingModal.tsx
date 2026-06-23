'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Bot } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Audit } from '@/lib/api/audits'
import { createFinding } from '@/lib/api/findings'

const RISK_LEVELS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high',     label: 'High' },
  { value: 'medium',   label: 'Medium' },
  { value: 'low',      label: 'Low' },
]

type Props = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  audits: Audit[]
  defaultAuditId?: string
}

export default function CreateFindingModal({ open, onClose, onSuccess, audits, defaultAuditId }: Props) {
  const [auditId, setAuditId] = useState('')
  const [observation, setObservation] = useState('')
  const [riskLevel, setRiskLevel] = useState('')
  const [riskDescription, setRiskDescription] = useState('')
  const [analystNotes, setAnalystNotes] = useState('')
  const [flagId, setFlagId] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setAuditId(defaultAuditId ?? (audits[0]?._id ?? ''))
      setObservation('')
      setRiskLevel('')
      setRiskDescription('')
      setAnalystNotes('')
      setFlagId('')
      setErrors({})
    }
  }, [open, defaultAuditId, audits])

  const selectedAudit = audits.find((a) => a._id === auditId)

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {}
    if (!auditId) newErrors.auditId = 'Required'
    if (!observation.trim()) newErrors.observation = 'Required'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setLoading(true)
    try {
      await createFinding({
        auditId,
        observation: observation.trim(),
        ...(riskLevel ? { risk: { level: riskLevel as 'low' | 'medium' | 'high' | 'critical', description: riskDescription.trim() || undefined } } : {}),
        ...(analystNotes.trim() ? { analystNotes: analystNotes.trim() } : {}),
        ...(flagId.trim() ? { flagId: flagId.trim() } : {}),
      })
      toast.success('Finding created. AI is drafting criteria and recommendation.')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create finding.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field: string) =>
    `text-sm border rounded-lg px-3 py-2 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full ${
      errors[field] ? 'border-red-400' : 'border-slate-200'
    }`

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>New Finding</DialogTitle>
          <DialogDescription>
            Enter the observation and risk. The AI will draft criteria and recommendation from your handbook.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2 overflow-y-auto pr-1">

          {/* Audit selector */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Audit <span className="text-red-500">*</span>
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger className={`flex items-center justify-between gap-2 text-sm border rounded-lg px-3 py-2 bg-white hover:bg-slate-50 transition-colors ${errors.auditId ? 'border-red-400' : 'border-slate-200'}`}>
                <span className={selectedAudit ? 'text-slate-700 truncate' : 'text-slate-400'}>
                  {selectedAudit ? selectedAudit.name : 'Select an audit'}
                </span>
                <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-w-sm">
                {audits.map((a) => (
                  <DropdownMenuItem
                    key={a._id}
                    onClick={() => { setAuditId(a._id); setErrors({ ...errors, auditId: '' }) }}
                    className="cursor-pointer truncate"
                  >
                    {a.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {errors.auditId && <p className="text-xs text-red-500">{errors.auditId}</p>}
          </div>

          {/* Observation */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Observation <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="e.g. Female applicants selected at 60% vs 80% for males (impact ratio 0.75, below the 4/5ths threshold)."
              value={observation}
              onChange={(e) => { setObservation(e.target.value); setErrors({ ...errors, observation: '' }) }}
              className={`${inputClass('observation')} resize-none`}
            />
            {errors.observation && <p className="text-xs text-red-500">{errors.observation}</p>}
          </div>

          {/* Risk level + description */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Risk Level</label>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-between gap-2 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white hover:bg-slate-50 transition-colors">
                  <span className={riskLevel ? 'text-slate-700 capitalize' : 'text-slate-400'}>
                    {riskLevel ? RISK_LEVELS.find((r) => r.value === riskLevel)?.label : 'Select level'}
                  </span>
                  <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {RISK_LEVELS.map((r) => (
                    <DropdownMenuItem key={r.value} onClick={() => setRiskLevel(r.value)} className="cursor-pointer">
                      {r.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Risk Description</label>
              <input
                type="text"
                placeholder="Brief risk summary"
                value={riskDescription}
                onChange={(e) => setRiskDescription(e.target.value)}
                disabled={!riskLevel}
                className={`${inputClass('riskDescription')} disabled:opacity-40`}
              />
            </div>
          </div>

          {/* Analyst notes */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Analyst Notes</label>
            <textarea
              rows={2}
              placeholder="Initial review notes (optional)."
              value={analystNotes}
              onChange={(e) => setAnalystNotes(e.target.value)}
              className={`${inputClass('analystNotes')} resize-none`}
            />
          </div>

          {/* Flag ID (optional) */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Linked Flag ID <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. 64f1a2b3c4d5e6f7a8b9c0d1"
              value={flagId}
              onChange={(e) => setFlagId(e.target.value)}
              className={inputClass('flagId')}
            />
          </div>

          {/* AI notice */}
          <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2.5 text-xs text-indigo-600">
            <Bot size={13} className="mt-0.5 flex-shrink-0" />
            <span>Criteria and recommendation will be AI-drafted from your handbook after saving. Review before approving.</span>
          </div>

        </div>

        {/* Actions — pinned outside scroll */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 mt-1 flex-shrink-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {loading ? 'Creating…' : 'Create Finding'}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}
