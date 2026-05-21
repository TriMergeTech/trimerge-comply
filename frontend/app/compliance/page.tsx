'use client'

import { useEffect, useState } from 'react'
import { getDashboardSummary, DashboardSummary } from '@/lib/api/dashboard'
import ComplianceStats from '@/components/compliance/ComplianceStats'
import FlagsByEngine from '@/components/compliance/FlagsByEngine'
import FlagsBySeverity from '@/components/compliance/FlagsBySeverity'
import RecentFlagActivity from '@/components/compliance/RecentFlagActivity'

export default function ComplianceDashboard() {
  // Track summary data, loading and error states
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard summary on mount
  useEffect(() => {
    async function fetchSummary() {
      try {
        const data = await getDashboardSummary()
        setSummary(data)
      } catch (err) {
        setError('Failed to load compliance dashboard.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400 text-sm">Loading compliance dashboard...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div>
        <h2 className="text-slate-800 font-semibold text-xl">
          Compliance Dashboard
        </h2>
        <p className="text-slate-400 text-sm mt-0.5">
          Overview of all compliance findings across engines
        </p>
      </div>

      {/* Compliance stats — using real API data */}
      <ComplianceStats
        totalFlags={summary?.totalFlags ?? 0}
        pendingReview={summary?.flagsByStatus?.open ?? 0}
        confirmedFindings={summary?.flagsByStatus?.reviewed ?? 0}
        dismissed={summary?.flagsByStatus?.dismissed ?? 0}
      />

      {/* Flags by engine and severity side by side */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          {/* Pass real totalFlags — chart data pending backend flagsByEngine breakdown */}
          <FlagsByEngine totalFlags={summary?.totalFlags ?? 0} />
        </div>
        <div className="flex-1">
          <FlagsBySeverity flagsBySeverity={summary?.flagsBySeverity} />
        </div>
      </div>

      {/* Recent flag activity */}
      <RecentFlagActivity recentFlags={(summary?.recentFlags ?? []) as any} />

    </div>
  )
}