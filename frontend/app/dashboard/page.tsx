'use client'

import { useState, useEffect } from 'react'
import UserInfo from '@/components/sharedComponents/UserInfo'
import StatsCard from '@/components/dashboard/StatsCard'
import RecentAudits from '@/components/dashboard/RecentAudits'
import { Button } from '@/components/ui/button'
import {
  getDashboardSummary,
  getDashboardExport,
  type DashboardSummary,
} from '@/lib/api/dashboard'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'

export default function Dashboard() {
  const currentUser = useCurrentUser()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [exporting, setExporting] = useState(false)

  // Fetch dashboard summary on mount
  useEffect(() => {
    getDashboardSummary()
      .then((data) => setSummary(data))
      .catch((err) => console.error('Failed to load dashboard summary:', err))
  }, [])

  // Export all dashboard data as a JSON download
  async function handleExport() {
    setExporting(true)
    try {
      const data = await getDashboardExport()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dashboard-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Dashboard header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        {/* Welcome message */}
        <div>
          <h2 className="text-slate-800 font-semibold text-xl">
            Welcome, {currentUser?.name ?? 'there'}
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Good morning! Here&apos;s what&apos;s happening with your audits.
          </p>
        </div>

        {/* Right side — user info and export button */}
        <div className="flex items-center gap-4">
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-60"
          >
            {exporting ? 'Exporting…' : 'Export Data'}
          </Button>
          <UserInfo />
        </div>

      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Audits"
          value={summary?.totalAudits ?? 0}
          linkText="View all audits"
          linkHref="/audits"
        />
        <StatsCard
          label="Pending Flags"
          value={summary?.flagsByStatus.open ?? 0}
          linkText={summary?.flagsByStatus.open ? 'View open flags' : 'No pending reviews'}
          linkHref="/flags"
        />
        <StatsCard
          label="Confirmed Findings"
          value={summary?.flagsByStatus.reviewed ?? 0}
          linkText={summary?.flagsByStatus.reviewed ? 'View reviewed flags' : 'No findings yet'}
          linkHref="/flags"
        />
        <StatsCard
          label="Open Tasks"
          value={summary?.auditsByStatus.processing ?? 0}
          linkText={summary?.auditsByStatus.processing ? 'View in-progress audits' : 'Nothing assigned'}
          linkHref="/audits"
        />
      </div>

      {/* Recent audits table */}
      <RecentAudits audits={summary?.recentAudits ?? []} />

    </div>
  )
}
