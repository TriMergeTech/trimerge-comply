'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getDemoRequests, DemoRequest } from '@/lib/api/demoRequests'

const STATUS_COLORS: Record<string, string> = {
  new:       'bg-blue-100 text-blue-600',
  contacted: 'bg-yellow-100 text-yellow-600',
  scheduled: 'bg-indigo-100 text-indigo-600',
  closed:    'bg-green-100 text-green-600',
}

const STATUS_LABEL: Record<string, string> = {
  new:       'New',
  contacted: 'Contacted',
  scheduled: 'Scheduled',
  closed:    'Closed',
}

export default function WaitlistPage() {
  const [requests, setRequests] = useState<DemoRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const statusOptions = ['all', 'new', 'contacted', 'scheduled', 'closed']

  useEffect(() => {
    setLoading(true)
    getDemoRequests({ limit: 100 })
      .then((res) => setRequests(res.requests))
      .catch(() => toast.error('Failed to load demo requests.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = statusFilter === 'all'
    ? requests
    : requests.filter((r) => r.status === statusFilter)

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-800 font-semibold text-xl">Demo Waitlist</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Manage incoming demo requests and move them through the workflow.
          </p>
        </div>
        <span className="text-sm text-slate-400">{filtered.length} request{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500 font-medium">Status:</span>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 hover:bg-slate-50 transition-colors capitalize">
            {statusFilter === 'all' ? 'All Statuses' : STATUS_LABEL[statusFilter]}
            <ChevronDown size={14} className="text-slate-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {statusOptions.map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => setStatusFilter(s)}
                className="cursor-pointer capitalize"
              >
                {s === 'all' ? 'All Statuses' : STATUS_LABEL[s]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-left border-b border-slate-100">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Organization</th>
                <th className="pb-3 font-medium">Job Title</th>
                <th className="pb-3 font-medium">Company Size</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium whitespace-nowrap">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 text-sm">Loading…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 text-sm">No requests found.</td>
                </tr>
              ) : (
                filtered.map((req) => {
                  return (
                    <tr key={req._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3">
                        <Link href={`/waitlist/${req._id}`} className="text-indigo-500 hover:underline font-medium text-sm">
                          {req.firstName} {req.lastName}
                        </Link>
                        <p className="text-slate-400 text-xs">{req.workEmail}</p>
                      </td>
                      <td className="py-3 text-slate-500 text-sm">{req.organization}</td>
                      <td className="py-3 text-slate-500 text-sm">{req.jobTitle}</td>
                      <td className="py-3 text-slate-500 text-sm whitespace-nowrap">{req.companySize}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[req.status]}`}>
                          {STATUS_LABEL[req.status]}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
