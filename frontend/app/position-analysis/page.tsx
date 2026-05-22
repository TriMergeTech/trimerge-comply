'use client'

import { useState, useEffect, useCallback } from 'react'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'
import DocumentTabs from '@/components/position-analysis/DocumentTabs'
import DocumentsTable from '@/components/position-analysis/DocumentsTable'
import { getPositionDocuments, uploadPositionDocument, PositionDocument } from '@/lib/api/position'

export default function PositionAnalysis() {
  // Track active tab to filter documents table
  const [activeTab, setActiveTab] = useState('All Documents')

  // Track documents data, loading and error states
  const [documents, setDocuments] = useState<PositionDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // Fetch documents from API
  const fetchDocuments = useCallback(async () => {
    try {
      const data = await getPositionDocuments()
      setDocuments(data)
    } catch (err) {
      toast.error('Failed to load documents.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  // Handle file upload
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      await uploadPositionDocument(file)
      toast.success('Document uploaded successfully')
      fetchDocuments()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-slate-800 font-semibold text-xl">
            Position Description Analysis
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Upload job descriptions for AI-powered compliance review.
          </p>
        </div>

        {/* Upload documents button */}
        <label className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors w-fit cursor-pointer">
          <Upload size={16} />
          {uploading ? 'Uploading...' : 'Upload Documents'}
          <input
            type="file"
            accept=".txt,.csv,.pdf,.docx"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Document tabs */}
      <DocumentTabs onTabChange={setActiveTab} />

      {/* Documents table — pass real data */}
      <DocumentsTable
        activeTab={activeTab}
        documents={documents}
        loading={loading}
        onRefresh={fetchDocuments}
      />

    </div>
  )
}