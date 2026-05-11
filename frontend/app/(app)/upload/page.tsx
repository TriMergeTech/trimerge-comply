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

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {['Upload File', 'Validate Data', 'Processing', 'Complete'].map((step, index) => (
          <div key={index} className="flex items-center gap-2">

            {/* Step circle */}
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${
              index === 0
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-400'
            }`}>
              {index + 1}
            </div>

            {/* Step label */}
            <span className={`text-sm hidden sm:block ${
              index === 0 ? 'text-indigo-600 font-medium' : 'text-slate-400'
            }`}>
              {step}
            </span>

            {/* Divider */}
            {index < 3 && (
              <div className="w-8 h-px bg-slate-200 mx-1" />
            )}

          </div>
        ))}
      </div>

      {/* Upload zone */}
      <UploadZone />

      {/* Recent uploads */}
      <RecentUploads />

    </div>
  )
}