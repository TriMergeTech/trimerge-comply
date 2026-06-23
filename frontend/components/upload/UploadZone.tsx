'use client'

import { useState } from 'react'
import { Upload, FileSpreadsheet } from 'lucide-react'
import { uploadCsv } from '@/lib/api/upload'

export default function UploadZone({ onSuccess }: { onSuccess?: () => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [certified, setCertified] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) setSelectedFile(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) { setSelectedFile(file); setUploadError(null); setUploadSuccess(false); setCertified(false) }
  }

  async function handleUpload() {
    if (!selectedFile) return
    setUploading(true)
    setUploadError(null)
    setUploadSuccess(false)
    try {
      await uploadCsv(selectedFile)
      setUploadSuccess(true)
      setSelectedFile(null)
      setCertified(false)
      onSuccess?.()
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
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
          <div className="p-4 bg-indigo-50 rounded-full">
            <Upload size={28} className="text-indigo-500" />
          </div>

          <div className="text-center">
            <p className="text-slate-700 font-medium">Drag and drop your file here</p>
            <p className="text-slate-400 text-sm mt-1">or</p>
          </div>

          <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Choose File
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <p className="text-slate-400 text-xs">CSV files only, up to 2MB</p>

          {selectedFile && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <FileSpreadsheet size={16} className="text-green-600" />
              <p className="text-green-700 text-sm font-medium">{selectedFile.name}</p>
            </div>
          )}

          {selectedFile && !uploadSuccess && (
            <label className="flex items-start gap-2.5 cursor-pointer max-w-sm text-left">
              <input
                type="checkbox"
                checked={certified}
                onChange={(e) => setCertified(e.target.checked)}
                className="mt-0.5 accent-indigo-600 w-4 h-4 flex-shrink-0"
              />
              <span className="text-xs text-slate-500 leading-relaxed">
                I certify that this data is current, accurate, and that I am authorized to submit it for analysis.
              </span>
            </label>
          )}

          {selectedFile && !uploadSuccess && (
            <button
              onClick={handleUpload}
              disabled={uploading || !certified}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload & Analyze'}
            </button>
          )}

          {uploadError && (
            <p className="text-red-500 text-sm">{uploadError}</p>
          )}

          {uploadSuccess && (
            <p className="text-green-600 text-sm font-medium">
              Upload complete! Flags have been generated.
            </p>
          )}
        </div>
      </div>

      {/* Right side — upload guidelines */}
      <div className="lg:w-64 bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
        <h4 className="text-slate-700 font-semibold text-sm mb-3">Upload Guidelines</h4>
        <ul className="flex flex-col gap-2 text-xs text-slate-500">
          <li>• Required columns: group, selected, total</li>
          <li>• group: demographic group name (e.g. Female, White, Hispanic)</li>
          <li>• selected: number of applicants selected</li>
          <li>• total: total number of applicants in that group</li>
        </ul>
      </div>

    </div>
  )
}
