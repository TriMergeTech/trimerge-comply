'use client'

import { useState } from 'react'
import UploadZone from '@/components/upload/UploadZone'
import RecentUploads from '@/components/upload/RecentUploads'

export default function Upload() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div>
        <h2 className="text-slate-800 font-semibold text-xl">
          Upload Applicant Flow Data
        </h2>
        <p className="text-slate-400 text-sm mt-0.5">
          Adverse Impact Analysis
        </p>
      </div>

      {/* Upload zone */}
      <UploadZone onSuccess={() => setRefreshKey((k) => k + 1)} />

      {/* Recent uploads */}
      <RecentUploads refreshKey={refreshKey} />

    </div>
  )
}
