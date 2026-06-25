'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, FileText } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { uploadHandbook } from '@/lib/api/handbooks'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const ACCEPTED = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const ACCEPTED_EXT = '.pdf, .docx'

export default function UploadHandbookModal({ open, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleClose() {
    if (uploading) return
    setFile(null)
    setDragging(false)
    onClose()
  }

  function pickFile(f: File) {
    if (!ACCEPTED.includes(f.type)) {
      toast.error('Only PDF and DOCX files are accepted.')
      return
    }
    setFile(f)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) pickFile(f)
  }, [])

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadHandbook(file)
      toast.success(`"${result.name}" uploaded — ${result.chunkCount} chunks indexed.`)
      setFile(null)
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Handbook</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-1">
          <p className="text-sm text-slate-500">
            Upload a PDF or DOCX employee handbook. The document will be indexed and used by the Findings AI when drafting criteria and recommendations.
          </p>

          {/* Drop zone */}
          {!file ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
                dragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
              }`}
            >
              <Upload size={28} className="text-slate-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">Drop file here or click to browse</p>
                <p className="text-xs text-slate-400 mt-1">PDF or DOCX only</p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_EXT}
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f) }}
              />
            </div>
          ) : (
            /* File pill */
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <FileText size={20} className="text-indigo-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                disabled={uploading}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={handleClose}
              disabled={uploading}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
