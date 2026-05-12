import ComplianceStats from '@/components/compliance/ComplianceStats'
import FlagsByEngine from '@/components/compliance/FlagsByEngine'
import FlagsBySeverity from '@/components/compliance/FlagsBySeverity'
import RecentFlagActivity from '@/components/compliance/RecentFlagActivity'

export default function ComplianceDashboard() {
    return (
        <div className="flex flex-col gap-6">

            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-slate-800 font-semibold text-xl">
                        Compliance Dashboard
                    </h2>
                    <p className="text-slate-400 text-sm mt-0.5">
                        City of Springfield – Full Audit · May 18 – May 21, 2024
                    </p>
                </div>

                {/* Temporary back button */}
                <a
                    href="/dashboard"
                    className="text-sm text-indigo-500 hover:underline"
                >
                    ← Back to Dashboard
                </a>
            </div>

            {/* Compliance stats */}
            <ComplianceStats
                totalFlags={48}
                pendingReview={23}
                confirmedFindings={16}
                dismissed={9}
            />

            {/* Flags by engine and severity side by side */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                    <FlagsByEngine />
                </div>
                <div className="flex-1">
                    <FlagsBySeverity />
                </div>
            </div>

            {/* Recent flag activity */}
            <RecentFlagActivity />

        </div>
    )
}
