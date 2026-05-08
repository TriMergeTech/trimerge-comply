// Reusable stats card component used on the dashboard
// Displays a single metric with a label, value and optional link

import { Card, CardContent } from '@/components/ui/Card'

// Props for the stats card
type StatsCardProps = {
    label: string       // Card title e.g. "Total Audits"
    value: number       // The metric value e.g. 3
    linkText?: string   // Optional link text below the value
    linkHref?: string   // Optional link href
}

export default function StatsCard({ label, value, linkText, linkHref }: StatsCardProps) {
    return (
        <Card className="bg-white rounded-xl shadow-sm border border-slate-100">
            <CardContent className="p-5">

                {/* Metric value */}
                <p className="text-3xl font-bold text-slate-800">{value}</p>

                {/* Card label */}
                <p className="text-sm text-slate-400 mt-1">{label}</p>

                {/* Optional link */}
                {linkText && linkHref && (
                    <a
                        href={linkHref}
                        className="text-xs text-indigo-500 hover:underline mt-2 inline-block"
                    >
                        {linkText}
                    </a>
                )}

            </CardContent>
        </Card>
    )
}