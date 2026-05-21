import UploadZone from '@/components/upload/UploadZone'
import RecentUploads from '@/components/upload/RecentUploads'

export default function Upload() {
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
      <UploadZone />

      {/* Recent uploads */}
      <RecentUploads />

    </div>
  )
}
