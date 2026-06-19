'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import FlagDetail from '@/components/flags/FlagDetail'
import DecisionPanel from '@/components/flags/DecisionPanel'
import { getFlagById, FlagItem } from '@/lib/api/flags'
import { getActivityLogs } from '@/lib/api/activity'

type DecisionSummary = { decision: string; rationale: string; decidedAt: string }

export default function FlagDetailPage() {
    const { id } = useParams<{ id: string }>()

    const [flag, setFlag] = useState<FlagItem | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')
    const [decisionSummary, setDecisionSummary] = useState<DecisionSummary | null>(null)

    useEffect(() => {
        if (!id) return
        getFlagById(id)
            .then(async (res) => {
                const f = res.flag
                setFlag(f)

                if (f.status === 'reviewed' || f.status === 'dismissed') {
                    try {
                        const { logs } = await getActivityLogs({ action: 'flag_decided', targetType: 'flag', limit: 200 })
                        const match = logs.find((l) => {
                            const t = l.target as { flag?: { id: string } }
                            return t.flag?.id === f._id
                        })
                        if (match) {
                            const details = match.details as { decision?: string; reason?: string }
                            setDecisionSummary({
                                decision: details.decision ?? f.status,
                                rationale: details.reason ?? '',
                                decidedAt: match.date,
                            })
                        }
                    } catch {
                        // activity log unavailable — summary falls back to status + updatedAt
                    }
                }
            })
            .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load flag.'))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
                Loading flag details…
            </div>
        )
    }

    if (error || !flag) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <p className="text-red-500 text-sm">{error || 'Flag not found.'}</p>
                <Link href="/flags/queue" className="text-indigo-500 text-sm hover:underline">
                    ← Back to Queue
                </Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">

            {/* Page header */}
            <div className="flex items-center justify-between">
                <Link
                    href="/flags/queue"
                    className="text-sm text-indigo-500 hover:underline"
                >
                    ← Back to Queue
                </Link>
            </div>

            {/* Main content — flag detail and decision panel side by side */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Flag detail — takes up more space */}
                <div className="flex-1">
                    <FlagDetail flag={flag} decisionSummary={decisionSummary} />
                </div>

                {/* Decision panel — only shown for pending flags */}
                <div className="lg:w-80">
                    {flag.status.toLowerCase() === 'open' ? (
                        <DecisionPanel
                            flagId={flag._id}
                            onDecided={(decision, rationale) =>
                                setDecisionSummary({ decision, rationale, decidedAt: new Date().toISOString() })
                            }
                        />
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 text-sm text-slate-400">
                            This flag has already been reviewed.
                        </div>
                    )}
                </div>

            </div>

        </div>
    )
}
