'use client'

import { useState, useEffect } from 'react'
import FlagStatsSummary from '@/components/flags/FlagStatsSummary'
import FlagResultsTable from '@/components/flags/FlagResultsTable'
import { getFlags, FlagItem } from '@/lib/api/flags'

export default function FlagResults() {
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0, medium: 0, low: 0 })
  const [results, setResults] = useState<FlagItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFlags({ limit: 100 })
      .then((res) => {
        setResults(res.flags)
        setStats({
          total: res.total,
          critical: res.flags.filter((f) => f.severity === 'Critical').length,
          high: res.flags.filter((f) => f.severity === 'High').length,
          medium: res.flags.filter((f) => f.severity === 'Medium').length,
          low: res.flags.filter((f) => f.severity === 'Low').length,
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div>
        <h2 className="text-slate-800 font-semibold text-xl">
          Flag Results
        </h2>
        <p className="text-slate-400 text-sm mt-0.5">
          All compliance flags across engines.
        </p>
      </div>

      {/* Flag stats summary */}
      <FlagStatsSummary
        total={stats.total}
        critical={stats.critical}
        high={stats.high}
        medium={stats.medium}
        low={stats.low}
      />

      {/* Flag results table */}
      <FlagResultsTable results={results} loading={loading} />

    </div>
  )
}
