import ExportPanel from '@/components/reports/ExportPanel'
import ActivityLogTable from '@/components/reports/ActivityLogTable'

export default function ReportsExport() {
    return (
        <div className="flex flex-col gap-6">

            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-slate-800 font-semibold text-xl">
                        Reports & Export
                    </h2>
                    <p className="text-slate-400 text-sm mt-0.5">
                        Export confirmed findings and audit reports.
                    </p>
                </div>

                {/* Temporary back button */}
                <a
                    href="/pay-equity"
                    className="text-sm text-indigo-500 hover:underline"
                >
                    ← Back to Pay Equity
                </a>
            </div>

            {/* Export panel — full width */}
            <ExportPanel />

            {/* Activity log — full width */}
            <ActivityLogTable />

        </div>
    )
}