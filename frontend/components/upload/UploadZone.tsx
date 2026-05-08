'use client'

// Upload zone component with drag and drop functionality
// Handles CSV and Excel file uploads for adverse impact analysis

import { useState } from 'react'
import { Upload, FileSpreadsheet } from 'lucide-react'

export default function UploadZone() {
  // Track drag over state for visual feedback
  const [isDragging, setIsDragging] = useState(false)
  // Track selected file
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Handle drag events
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  // Handle file drop
  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) setSelectedFile(file)
  }

  // Handle file input change
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">

      {/* Left side — drop zone */}
      <div className="flex-1">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-4 transition-colors ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-slate-200 bg-white hover:border-indigo-300'
          }`}
        >
          {/* Upload icon */}
          <div className="p-4 bg-indigo-50 rounded-full">
            <Upload size={28} className="text-indigo-500" />
          </div>

          {/* Upload text */}
          <div className="text-center">
            <p className="text-slate-700 font-medium">
              Drag and drop your file here
            </p>
            <p className="text-slate-400 text-sm mt-1">or</p>
          </div>

          {/* File input button */}
          <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Choose File
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {/* Supported formats */}
          <p className="text-slate-400 text-xs">
            Supports CSV, Excel (.xlsx) files up to 10MB
          </p>

          {/* Selected file name */}
          {selectedFile && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <FileSpreadsheet size={16} className="text-green-600" />
              <p className="text-green-700 text-sm font-medium">{selectedFile.name}</p>
            </div>
          )}

        </div>
      </div>

      {/* Right side — upload guidelines */}
      <div className="lg:w-64 bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
        <h4 className="text-slate-700 font-semibold text-sm mb-3">
          Upload Guidelines
        </h4>
        <ul className="flex flex-col gap-2 text-xs text-slate-500">
          <li>• Required columns: job, stage, demographicGroup, selected</li>
          <li>• Each row represents one applicant</li>
          <li>• Only verified applicants advanced to next stage</li>
          <li>• Demographic group examples: Female, Male, White, Black, Hispanic, Asian</li>
        </ul>
      </div>

    </div>
  )
}