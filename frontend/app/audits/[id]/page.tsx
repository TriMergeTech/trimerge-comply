'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AuditDetail from '@/components/audits/AuditDetail'
import DecisionPanel from '@/components/flags/DecisionPanel'
import { getAuditById, Audit } from '@/lib/api/audits'

export default function AuditDetailPage() {
    const { id } = useParams<{ id: string }>()

    const [audit, setAudit] = useState<Audit | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')

    useEffect(() => {
        if (!id) return
        getAuditById(id)
            .then(setAudit)
            .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load audit.'))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
                Loading audit details…
            </div>
        )
    }

    if (error || !audit) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <p className="text-red-500 text-sm">{error || 'Audit not found.'}</p>
                <Link href="/audits" className="text-indigo-500 text-sm hover:underline">
                    ← Back to Audits
                </Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">

            {/* Page header */}
            <div className="flex items-center justify-between">
                <Link href="/audits" className="text-sm text-indigo-500 hover:underline">
                    ← Back to Audits
                </Link>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">

                <div className="flex-1">
                    <AuditDetail audit={audit} />
                </div>

                <div className="lg:w-80">
                    <DecisionPanel />
                </div>

            </div>

        </div>
    )
}
