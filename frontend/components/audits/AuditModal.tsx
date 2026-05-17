'use client'

// Audit modal component
// Used for both creating and editing audits
// Receives an optional audit object — if provided it's in edit mode

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Audit, CreateAuditData, createAudit, updateAudit } from '@/lib/api/audits'

type AuditModalProps = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  audit?: Audit // if provided we're in edit mode
}

export default function AuditModal({ open, onClose, onSuccess, audit }: AuditModalProps) {
  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [organization, setOrganization] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // If editing pre-fill the form with existing audit data
  useEffect(() => {
    if (audit) {
      setName(audit.name)
      setDescription(audit.description ?? '')
      setOrganization(audit.organization ?? '')
    } else {
      setName('')
      setDescription('')
      setOrganization('')
    }
  }, [audit, open])

  // Determine if we're in edit or create mode
  const isEditMode = !!audit

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isEditMode && audit) {
        // Update existing audit
        await updateAudit(audit._id, { name, description, organization })
      } else {
        // Create new audit
        const data: CreateAuditData = { name, description, organization }
        await createAudit(data)
      }
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Audit' : 'New Audit'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the audit details below.' : 'Fill in the details to create a new audit.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">

          {/* Audit name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Audit Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q1 2026 Pay Equity Review"
              required
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Organization */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Organization
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. TriMerge Consulting"
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Initial audit for Q1 payroll data"
              rows={3}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Audit'}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}