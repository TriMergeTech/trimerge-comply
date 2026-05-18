'use client'

import { useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import FlagQueueTable from '@/components/flags/FlagQueueTable'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function FlagQueue() {
  const [selectedEngine, setSelectedEngine] = useState('All Engines')
  const [selectedSeverity, setSelectedSeverity] = useState('All Severities')
  const [selectedStatus, setSelectedStatus] = useState('Pending')

  const engineOptions = ['All Engines', 'Adverse Impact', 'Position Description', 'Pay Equity']
  const severityOptions = ['All Severities', 'Critical', 'High', 'Medium', 'Low']
  const statusOptions = ['Pending', 'Confirmed', 'Dismissed', 'Escalated']

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

        {/* Temporary back button */}
        <a href="/flags" className="text-sm text-indigo-500 hover:underline">
          ← Back to Results
        </a>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

        {/* Engine filter */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            {selectedEngine}
            <ChevronDown size={14} className="text-slate-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {engineOptions.map((engine) => (
              <DropdownMenuItem
                key={engine}
                onClick={() => setSelectedEngine(engine)}
                className="cursor-pointer"
              >
                {engine}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Severity filter */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            {selectedSeverity}
            <ChevronDown size={14} className="text-slate-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {severityOptions.map((severity) => (
              <DropdownMenuItem
                key={severity}
                onClick={() => setSelectedSeverity(severity)}
                className="cursor-pointer"
              >
                {severity}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status filter */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            {selectedStatus}
            <ChevronDown size={14} className="text-slate-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {statusOptions.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => setSelectedStatus(status)}
                className="cursor-pointer"
              >
                {status}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

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