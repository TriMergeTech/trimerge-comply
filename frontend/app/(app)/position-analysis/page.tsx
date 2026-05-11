'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import DocumentTabs from '@/components/position-analysis/DocumentsTable'
import DocumentsTable from '@/components/position-analysis/DocumentTabs'

export default function PositionAnalysis() {
  // Track active tab to filter documents table
  const [activeTab, setActiveTab] = useState('All Documents')

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
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors w-fit">
          <Upload size={16} />
          Upload Documents
        </button>
      </div>

      {/* Document tabs */}
      <DocumentTabs onTabChange={setActiveTab} />

      {/* Documents table */}
      <DocumentsTable activeTab={activeTab} />

    </div>
  )
}