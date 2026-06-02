'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { X, ExternalLink } from 'lucide-react'
import { getPositionDocumentById, type PositionDocumentDetail } from '@/lib/api/position'

// ── Helpers ────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${date} - ${time}`
}

function severityColors(severity: string) {
  switch (severity.toLowerCase()) {
    case 'high':   return { bg: 'bg-red-500',   text: 'text-red-600',   light: 'bg-red-50 border-red-100' }
    case 'medium': return { bg: 'bg-amber-400',  text: 'text-amber-600', light: 'bg-amber-50 border-amber-100' }
    case 'low':    return { bg: 'bg-green-500',  text: 'text-green-600', light: 'bg-green-50 border-green-100' }
    default:       return { bg: 'bg-slate-400',  text: 'text-slate-600', light: 'bg-slate-50 border-slate-100' }
  }
}

function riskBadgeColors(risk: string) {
  switch (risk.toLowerCase()) {
    case 'high':   return 'text-red-600'
    case 'medium': return 'text-amber-500'
    case 'low':    return 'text-green-600'
    default:       return 'text-slate-500'
  }
}

function statusBadgeColors(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':  return 'bg-green-100 text-green-700'
    case 'processing': return 'bg-yellow-100 text-yellow-700'
    case 'failed':     return 'bg-red-100 text-red-700'
    default:           return 'bg-slate-100 text-slate-500'
  }
}

// ── Page ───────────────────────────────────────────────────────

export default function PositionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [doc, setDoc] = useState<PositionDocumentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    getPositionDocumentById(id)
      .then(setDoc)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load document.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Loading document details…
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-500 text-sm">{error || 'Document not found.'}</p>
        <Link href="/position-analysis" className="text-indigo-500 text-sm hover:underline">
          ← Back to Position Analysis
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-slate-800 font-semibold text-xl">Position Document Details</h2>
          <p className="text-slate-400 text-sm mt-0.5">Position document detail retrieved successfully.</p>
        </div>
        <Link
          href="/position-analysis"
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
          aria-label="Close detail view"
        >
          <X size={20} />
        </Link>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Left panel: metadata ──────────────────────────────── */}
        <div className="w-full lg:w-80 shrink-0 bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">

          {/* Document ID + status */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Document ID:</p>
              <p className="text-xs font-mono text-slate-600 break-all">{doc.id}</p>
            </div>
            <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusBadgeColors(doc.status)}`}>
              Overall {doc.status}
            </span>
          </div>

          <hr className="border-slate-100" />

          {/* Document Name */}
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Document Name:</p>
            <p className="text-sm text-slate-700 font-medium">{doc.documentName}</p>
          </div>

          {/* Uploaded By */}
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Uploaded By:</p>
            <p className="text-sm text-slate-700">{doc.uploadedBy}</p>
          </div>

          {/* Upload Date */}
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Upload Date:</p>
            <p className="text-sm text-slate-700">{formatDate(doc.date)}</p>
          </div>

          {/* File Name + download link */}
          <div>
            <p className="text-xs text-slate-400 mb-0.5">File Name:</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-slate-700 break-all">{doc.fileName}</p>
              {doc.storage?.secureUrl && (
                <a
                  href={doc.storage.secureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-500 transition-colors"
                  aria-label="Open file"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>

          {/* File Type */}
          <div>
            <p className="text-xs text-slate-400 mb-0.5">File Type:</p>
            <p className="text-sm text-slate-700 break-all">{doc.mimeType}</p>
          </div>

          {/* Storage Path */}
          {doc.storage?.publicId && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Storage Path:</p>
              <p className="text-xs text-slate-500 break-all">{doc.storage.publicId}</p>
            </div>
          )}

          {/* Mini risk summary in left panel */}
          {doc.flagSummary && doc.flagSummary.length > 0 && (
            <>
              <hr className="border-slate-100" />
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Risk Summary</p>
                <div className="flex flex-col gap-2">
                  {doc.flagSummary.map((flag) => {
                    const colors = severityColors(flag.severity)
                    return (
                      <div key={flag.id} className="flex items-start gap-2">
                        <span className={`shrink-0 mt-0.5 w-3 h-3 rounded-sm ${colors.bg}`} />
                        <p className="text-xs text-slate-600 leading-relaxed">{flag.title}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

        </div>

        {/* ── Right panel: analysis ─────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-5">

          {/* Risk Summary card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">

            {/* Card header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ExternalLink size={18} className="text-slate-500" />
                <h3 className="text-slate-800 font-semibold text-base">Risk Summary</h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                {doc.flags} {doc.flags === 1 ? 'Flag' : 'Flags'}
              </span>
            </div>

            {/* Overall risk */}
            <p className="text-sm font-semibold mb-4">
              Overall Risk:{' '}
              <span className={`capitalize ${riskBadgeColors(doc.overallRisk)}`}>
                {doc.overallRisk}
              </span>
            </p>

            {/* Flag cards */}
            <div className="flex flex-col gap-3">
              {doc.flagSummary?.map((flag) => {
                const colors = severityColors(flag.severity)
                return (
                  <div
                    key={flag.id}
                    className={`rounded-lg border p-3.5 flex items-start gap-3 ${colors.light}`}
                  >
                    <span className={`shrink-0 mt-0.5 w-4 h-4 rounded-sm ${colors.bg}`} />
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <p className="text-sm text-slate-700">{flag.title}</p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded text-xs bg-white border border-slate-200 text-slate-500 capitalize">
                          {flag.category.replace(/_/g, ' ')}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs bg-white border border-slate-200 text-slate-500 capitalize">
                          {flag.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Storage file link row */}
              {doc.storage?.publicId && (
                <a
                  href={doc.storage.secureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-3 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-400">☰</span>
                    <p className="text-xs text-slate-500 truncate">File {doc.storage.publicId}</p>
                  </div>
                  <X size={14} className="shrink-0 text-slate-400 rotate-45" />
                </a>
              )}
            </div>
          </div>

          {/* AI Recommendations card */}
          {doc.aiRecommendations && doc.aiRecommendations.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-slate-800 font-semibold text-base mb-3">AI Recommendations</h3>
              <ul className="flex flex-col gap-2">
                {doc.aiRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Document Preview card */}
          {doc.textPreview && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-slate-800 font-semibold text-base mb-3">Document Preview</h3>
              <div className="bg-slate-50 rounded-lg border border-slate-100 p-4">
                <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
                  {doc.textPreview}
                </pre>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
