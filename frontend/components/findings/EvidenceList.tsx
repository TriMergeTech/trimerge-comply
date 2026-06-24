'use client'

import { useState } from 'react'
import { FileText, ExternalLink, Trash2, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getAccessToken } from '@/lib/authTokens'
import { Evidence } from '@/lib/api/findings'

const TYPE_LABEL: Record<string, string> = {
  document:          'Document',
  statistical_result:'Statistical Result',
  interview_note:    'Interview Note',
  policy_excerpt:    'Policy Excerpt',
  data_extract:      'Data Extract',
  observation_note:  'Observation Note',
}

const TYPE_COLORS: Record<string, string> = {
  document:           'bg-slate-100 text-slate-600',
  statistical_result: 'bg-blue-100 text-blue-600',
  interview_note:     'bg-purple-100 text-purple-600',
  policy_excerpt:     'bg-amber-100 text-amber-700',
  data_extract:       'bg-indigo-100 text-indigo-600',
  observation_note:   'bg-teal-100 text-teal-600',
}

const SOURCE_LABEL: Record<string, string> = {
  manual:         'Manual',
  flag:           'Flag',
  payequity:      'Pay Equity',
  adverse_impact: 'Adverse Impact',
  position:       'Position',
  handbook:       'Handbook',
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type CardProps = {
  item: Evidence
  canDelete: boolean
  onDelete: (id: string) => void
}

async function openWithAuth(fileUrl: string, fileName: string) {
  const token = getAccessToken()
  try {
    const proxyUrl = `/api/evidence-file?url=${encodeURIComponent(fileUrl)}`
    const res = await fetch(proxyUrl, {
      headers: token ? { 'x-auth-token': token } : {},
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.target = '_blank'
    a.download = fileName
    a.click()
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000)
  } catch (err) {
    toast.error(`Could not open file: ${err instanceof Error ? err.message : 'unknown error'}`)
  }
}

function EvidenceCard({ item, canDelete, onDelete }: CardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [fileLoading, setFileLoading] = useState(false)

  return (
    <>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Evidence</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove &ldquo;{item.title}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => { setConfirmOpen(false); onDelete(item._id) }}
            >
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-4 flex flex-col gap-3">

        {/* Header */}
        <div className="flex items-start gap-2 flex-wrap">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[item.type]}`}>
            {TYPE_LABEL[item.type] ?? item.type}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 capitalize">
            {SOURCE_LABEL[item.source] ?? item.source}
          </span>
          {canDelete && (
            <button
              onClick={() => setConfirmOpen(true)}
              className="ml-auto text-slate-300 hover:text-red-400 transition-colors"
              title="Remove evidence"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

      {/* Title + description */}
      <div>
        <p className="text-sm font-medium text-slate-700">{item.title}</p>
        {item.description && (
          <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
        )}
      </div>

      {/* Content (preformatted for statistical data) */}
      {item.content && (
        <pre className="bg-slate-50 rounded-lg px-3 py-2.5 text-xs text-slate-600 font-mono leading-relaxed whitespace-pre-wrap">
          {item.content}
        </pre>
      )}

      {/* File attachment */}
      {item.file && (
        <button
          disabled={fileLoading}
          onClick={async () => {
            setFileLoading(true)
            await openWithAuth(item.file!.fileUrl, item.file!.fileName)
            setFileLoading(false)
          }}
          className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg px-3 py-2 transition-colors w-fit disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {fileLoading
            ? <Loader2 size={14} className="text-indigo-400 animate-spin flex-shrink-0" />
            : <FileText size={14} className="text-indigo-500 flex-shrink-0" />
          }
          <span className="text-xs text-indigo-600 font-medium truncate max-w-[200px]">{item.file.fileName}</span>
          <span className="text-xs text-indigo-400 ml-1">{formatBytes(item.file.sizeBytes)}</span>
          <ExternalLink size={11} className="text-indigo-400 flex-shrink-0" />
        </button>
      )}

      {/* Interview details */}
      {item.interviewee && (
        <div className="text-xs text-slate-400">
          Interviewee: <span className="text-slate-600 font-medium">{item.interviewee}</span>
          {item.interviewDate && (
            <> &mdash; {new Date(item.interviewDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</>
          )}
        </div>
      )}

      {/* Collected by */}
      {item.collectedBy && (
        <div className="text-xs text-slate-400 border-t border-slate-100 pt-2">
          Collected by <span className="text-slate-500 font-medium">{item.collectedBy.name}</span>
          {' · '}
          {new Date(item.collectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      )}

      </div>
    </>
  )
}

type Props = {
  evidence: Evidence[]
  loading: boolean
  total: number
  findingStatus?: string
  onDelete?: (evidenceId: string) => void
}

const LOCKED_STATUSES = new Set(['approved', 'closed'])

export default function EvidenceList({ evidence, loading, total, findingStatus, onDelete }: Props) {
  const canDelete = !!onDelete && !LOCKED_STATUSES.has(findingStatus ?? '')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24 text-slate-400 text-sm">
        Loading evidence…
      </div>
    )
  }

  if (evidence.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-slate-400 text-sm bg-white rounded-xl border border-slate-100 shadow-sm">
        No evidence attached to this finding.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-slate-400">{total} item{total !== 1 ? 's' : ''}</p>
      {evidence.map((item) => (
        <EvidenceCard
          key={item._id}
          item={item}
          canDelete={canDelete}
          onDelete={onDelete ?? (() => {})}
        />
      ))}
    </div>
  )
}
