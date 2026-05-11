import { Search } from 'lucide-react'
import FlagQueueTable from '@/components/flags/FlagQueueTable'

export default function FlagQueue() {
    return (
        <div className="flex flex-col gap-6">

            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-slate-800 font-semibold text-xl">Flag Queue</h2>
                    <p className="text-slate-400 text-sm mt-0.5">
                        Review and take action on compliance flags.
                    </p>
                </div>

                {/* Temporary back button — will be replaced with proper navigation later */}
                <a
                    href="/flags"
                    className="text-sm text-indigo-500 hover:underline"
                >
                    ← Back to Results
                </a>
            </div>

            {/* Filters and search */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                {/* Engine filter */}
                <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>All Engines</option>
                    <option>Adverse Impact</option>
                    <option>Position Description</option>
                    <option>Pay Equity</option>
                </select>

                {/* Severity filter */}
                <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>All Severities</option>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                </select>

                {/* Status filter */}
                <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>Pending</option>
                    <option>Confirmed</option>
                    <option>Dismissed</option>
                    <option>Escalated</option>
                </select>

                {/* Search bar */}
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search flags..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

            </div>

            {/* Flag queue table */}
            <FlagQueueTable />

        </div>
    )
}