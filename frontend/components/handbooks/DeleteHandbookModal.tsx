'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { deleteHandbook } from '@/lib/api/handbooks'

interface Props {
  open: boolean
  handbookId: string
  handbookName: string
  onClose: () => void
  onSuccess: () => void
}

export default function DeleteHandbookModal({ open, handbookId, handbookName, onClose, onSuccess }: Props) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteHandbook(handbookId)
      toast.success(`"${handbookName}" deleted.`)
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !deleting) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Handbook</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-1">
          <div className="flex gap-3">
            <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-700">
                Are you sure you want to delete <span className="font-medium">"{handbookName}"</span>?
              </p>
              <p className="text-xs text-slate-400 mt-1">
                This permanently removes the handbook and all its indexed chunks. Existing findings will retain their excerpt snapshots.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              disabled={deleting}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
