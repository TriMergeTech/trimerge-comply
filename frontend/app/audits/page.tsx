import { Search } from 'lucide-react'
import AuditsTable from '@/components/audits/AuditsTable'

export default function Audits() {
  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-slate-800 font-semibold text-xl">Audits</h2>
          <p className="text-slate-400 text-sm mt-0.5">Manage all compliance audits.</p>
        </div>

        {/* New Audit button */}
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors w-fit">
          + New Audit
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

        {/* Search bar */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search audits..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Status filter */}
        <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option>All Status</option>
          <option>In Progress</option>
          <option>Draft</option>
          <option>Completed</option>
        </select>

        {/* Type filter */}
        <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option>All Types</option>
          <option>Full Audit</option>
          <option>Adverse Impact</option>
          <option>Pay Equity</option>
          <option>Position Description</option>
        </select>

      </div>

      {/* Audits table */}
      <AuditsTable />

    </div>
  )
}
