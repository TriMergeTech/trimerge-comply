'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, UploadCloud, FileText, X } from 'lucide-react'
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
import { addEvidence, uploadEvidence, AddEvidenceData } from '@/lib/api/findings'

const SOURCES = [
  { value: 'manual',         label: 'Manual Entry' },
  { value: 'flag',           label: 'Flag' },
  { value: 'payequity',      label: 'Pay Equity' },
  { value: 'adverse_impact', label: 'Adverse Impact' },
  { value: 'position',       label: 'Position Document' },
  { value: 'handbook',       label: 'Handbook' },
]

const MANUAL_TYPES = [
  { value: 'statistical_result', label: 'Statistical Result' },
  { value: 'interview_note',     label: 'Interview Note' },
  { value: 'policy_excerpt',     label: 'Policy Excerpt' },
  { value: 'data_extract',       label: 'Data Extract' },
  { value: 'observation_note',   label: 'Observation Note' },
]

const ACCEPTED = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg'

type Tab = 'text' | 'upload'

type Props = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  findingId: string
}

export default function AddEvidenceModal({ open, onClose, onSuccess, findingId }: Props) {
  const [tab, setTab] = useState<Tab>('text')

  // ── Text entry state ──────────────────────────────────────────
  const [source, setSource] = useState<AddEvidenceData['source']>('manual')
  const [sourceId, setSourceId] = useState('')
  const [gapIndex, setGapIndex] = useState('')
  const [type, setType] = useState<AddEvidenceData['type'] | ''>('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [interviewee, setInterviewee] = useState('')
  const [interviewDate, setInterviewDate] = useState('')

  // ── Upload state ──────────────────────────────────────────────
  const [file, setFile] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isManual = source === 'manual'
  const isPayEquity = source === 'payequity'
  const isInterviewNote = type === 'interview_note'
  const needsSourceId = source !== 'manual'

  useEffect(() => {
    if (open) {
      setTab('text')
      setSource('manual'); setSourceId(''); setGapIndex(''); setType('')
      setTitle(''); setDescription(''); setContent('')
      setInterviewee(''); setInterviewDate('')
      setFile(null); setUploadTitle(''); setUploadDescription('')
      setErrors({})
    }
  }, [open])

  // ── Handlers ──────────────────────────────────────────────────

  function handleFileChange(chosen: File | null) {
    if (!chosen) return
    setFile(chosen)
    if (!uploadTitle) setUploadTitle(chosen.name.replace(/\.[^/.]+$/, ''))
    setErrors({ ...errors, file: '' })
  }

  async function handleTextSubmit() {
    const newErrors: Record<string, string> = {}
    if (isManual && !type) newErrors.type = 'Required for manual entries'
    if (needsSourceId && !sourceId.trim()) newErrors.sourceId = 'Required'
    if (isManual && !content.trim() && !title.trim()) newErrors.content = 'Provide at least a title or content'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setLoading(true)
    try {
      const payload: AddEvidenceData = {
        source,
        ...(needsSourceId && sourceId.trim() ? { sourceId: sourceId.trim() } : {}),
        ...(isPayEquity && gapIndex !== '' ? { gapIndex: Number(gapIndex) } : {}),
        ...(type ? { type } : {}),
        ...(title.trim() ? { title: title.trim() } : {}),
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(content.trim() ? { content: content.trim() } : {}),
        ...(isInterviewNote && interviewee.trim() ? { interviewee: interviewee.trim() } : {}),
        ...(isInterviewNote && interviewDate ? { interviewDate } : {}),
      }
      await addEvidence(findingId, payload)
      toast.success('Evidence added.')
      onSuccess(); onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add evidence.')
    } finally {
      setLoading(false)
    }
  }

  async function handleUploadSubmit() {
    if (!file) { setErrors({ file: 'Please select a file.' }); return }
    setLoading(true)
    try {
      await uploadEvidence(findingId, file, {
        title: uploadTitle.trim() || undefined,
        description: uploadDescription.trim() || undefined,
      })
      toast.success('Document uploaded and attached.')
      onSuccess(); onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field: string) =>
    `text-sm border rounded-lg px-3 py-2 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full ${
      errors[field] ? 'border-red-400' : 'border-slate-200'
    }`

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Evidence</DialogTitle>
          <DialogDescription>
            Attach evidence to this finding by entering details manually or uploading a document.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 -mx-1">
          {(['text', 'upload'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setErrors({}) }}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'text' ? 'Text Entry' : 'Upload Document'}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 mt-1 overflow-y-auto pr-1">

          {/* ── TEXT ENTRY TAB ──────────────────────────────────── */}
          {tab === 'text' && (
            <>
              {/* Source */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Source</label>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center justify-between gap-2 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white hover:bg-slate-50 transition-colors">
                    <span className="text-slate-700">
                      {SOURCES.find((s) => s.value === source)?.label ?? 'Select source'}
                    </span>
                    <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {SOURCES.map((s) => (
                      <DropdownMenuItem
                        key={s.value}
                        onClick={() => { setSource(s.value as AddEvidenceData['source']); setErrors({}) }}
                        className="cursor-pointer"
                      >
                        {s.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Source ID */}
              {needsSourceId && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">
                    Source ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 64f1a2b3c4d5e6f7a8b9c0d1"
                    value={sourceId}
                    onChange={(e) => { setSourceId(e.target.value); setErrors({ ...errors, sourceId: '' }) }}
                    className={inputClass('sourceId')}
                  />
                  {errors.sourceId && <p className="text-xs text-red-500">{errors.sourceId}</p>}
                </div>
              )}

              {/* Gap Index */}
              {isPayEquity && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Gap Index</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={gapIndex}
                    onChange={(e) => setGapIndex(e.target.value)}
                    className={inputClass('gapIndex')}
                  />
                  <p className="text-xs text-slate-400">Index into the payGaps array of the pay equity analysis.</p>
                </div>
              )}

              {/* Type */}
              {isManual && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger className={`flex items-center justify-between gap-2 text-sm border rounded-lg px-3 py-2 bg-white hover:bg-slate-50 transition-colors ${errors.type ? 'border-red-400' : 'border-slate-200'}`}>
                      <span className={type ? 'text-slate-700' : 'text-slate-400'}>
                        {MANUAL_TYPES.find((t) => t.value === type)?.label ?? 'Select type'}
                      </span>
                      <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {MANUAL_TYPES.map((t) => (
                        <DropdownMenuItem
                          key={t.value}
                          onClick={() => { setType(t.value as AddEvidenceData['type']); setErrors({ ...errors, type: '' }) }}
                          className="cursor-pointer"
                        >
                          {t.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
                </div>
              )}

              {/* Title */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">
                  Title {!isManual && <span className="text-slate-400 font-normal">(optional override)</span>}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Interview with HR Director"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass('title')}
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <input
                  type="text"
                  placeholder="Brief summary of this evidence item"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={inputClass('description')}
                />
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Content</label>
                <textarea
                  rows={4}
                  placeholder={
                    type === 'statistical_result'
                      ? 'e.g. Group: Female\nReference Group: Male\nImpact Ratio: 75.0%'
                      : type === 'interview_note'
                      ? 'e.g. HR Director stated that structured interview guides were not introduced until Q1 2024…'
                      : 'Enter the evidence content here.'
                  }
                  value={content}
                  onChange={(e) => { setContent(e.target.value); setErrors({ ...errors, content: '' }) }}
                  className={`${inputClass('content')} resize-none ${type === 'statistical_result' ? 'font-mono' : ''}`}
                />
                {errors.content && <p className="text-xs text-red-500">{errors.content}</p>}
              </div>

              {/* Interview fields */}
              {isInterviewNote && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Interviewee</label>
                    <input
                      type="text"
                      placeholder="e.g. Jane Smith, HR Director"
                      value={interviewee}
                      onChange={(e) => setInterviewee(e.target.value)}
                      className={inputClass('interviewee')}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Interview Date</label>
                    <input
                      type="date"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className={inputClass('interviewDate')}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                <Button type="button" onClick={handleTextSubmit} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {loading ? 'Adding…' : 'Add Evidence'}
                </Button>
              </div>
            </>
          )}

          {/* ── UPLOAD TAB ──────────────────────────────────────── */}
          {tab === 'upload' && (
            <>
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault(); setDragOver(false)
                  handleFileChange(e.dataTransfer.files[0] ?? null)
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-10 transition-colors ${
                  dragOver
                    ? 'border-indigo-400 bg-indigo-50'
                    : errors.file
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                <UploadCloud size={28} className={dragOver ? 'text-indigo-500' : 'text-slate-300'} />
                <div className="text-center">
                  <p className="text-sm text-slate-600 font-medium">Drop a file here or click to browse</p>
                  <p className="text-xs text-slate-400 mt-0.5">PDF, Word, Excel, CSV, images</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED}
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />
              </div>
              {errors.file && <p className="text-xs text-red-500 -mt-2">{errors.file}</p>}

              {/* Selected file pill */}
              {file && (
                <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                  <FileText size={14} className="text-indigo-500 flex-shrink-0" />
                  <span className="text-xs text-indigo-700 font-medium truncate flex-1">{file.name}</span>
                  <span className="text-xs text-indigo-400">{formatBytes(file.size)}</span>
                  <button onClick={() => setFile(null)} className="text-indigo-300 hover:text-indigo-500 transition-colors flex-shrink-0">
                    <X size={13} />
                  </button>
                </div>
              )}

              {/* Optional metadata */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">
                  Title <span className="text-slate-400 font-normal">(optional — defaults to filename)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Applicant Flow Data Q1 2026"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className={inputClass('uploadTitle')}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Description <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  placeholder="Brief note about this document"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className={inputClass('uploadDescription')}
                />
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                <Button type="button" onClick={handleUploadSubmit} disabled={loading || !file} className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed">
                  {loading ? 'Uploading…' : 'Upload Document'}
                </Button>
              </div>
            </>
          )}

        </div>
      </DialogContent>
    </Dialog>
  )
}
