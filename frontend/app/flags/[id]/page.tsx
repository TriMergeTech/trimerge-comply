import FlagDetail from '@/components/flags/FlagDetail'
import DecisionPanel from '@/components/flags/DecisionPanel'

export default function FlagDetailPage() {
    return (
        <div className="flex flex-col gap-6">

            {/* Page header */}
            <div className="flex items-center justify-between">

                {/* Back to queue link */}
                <a
                    href="/flags/queue"
                    className="text-sm text-indigo-500 hover:underline"
                >
                    ← Back to Queue
                </a>

            </div>

            {/* Main content — flag detail and decision panel side by side */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Flag detail — takes up more space */}
                <div className="flex-1">
                    <FlagDetail />
                </div>

                {/* Decision panel — fixed width on desktop */}
                <div className="lg:w-80">
                    <DecisionPanel />
                </div>

            </div>

        </div>
    )
}
