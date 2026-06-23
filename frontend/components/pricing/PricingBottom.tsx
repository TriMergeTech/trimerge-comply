'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Lock, BrainCircuit, ClipboardList, ScrollText, RefreshCw, ChevronDown } from 'lucide-react'

const allPlans = [
  { icon: Lock, title: 'Secure & Compliant', desc: 'Enterprise-grade security and data protection' },
  { icon: BrainCircuit, title: 'AI-Powered Analysis', desc: 'Advanced AI models and statistical tests' },
  { icon: ClipboardList, title: 'Analyst Workflow', desc: 'Review, collaborate, and track findings' },
  { icon: ScrollText, title: 'Audit Trail & Logs', desc: 'Complete activity logs and export capabilities' },
  { icon: RefreshCw, title: 'Regular Updates', desc: 'Continuous improvements and new features' },
]

const faqs = [
  {
    q: 'Can I change plans later?',
    a: 'Yes. You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. All data is encrypted at rest and in transit. We are SOC 2 Type II compliant and follow enterprise-grade security practices.',
  },
  {
    q: 'Do you offer a free trial?',
    a: 'We offer a guided demo and a 14-day pilot for qualifying organizations. Contact our sales team to get started.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards, ACH transfers, and can accommodate government purchase orders.',
  },
]

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left text-sm font-semibold text-slate-800 hover:text-[#4f46e5] transition-colors"
      >
        {q}
        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="text-sm text-slate-500 leading-relaxed pb-4">{a}</p>}
    </div>
  )
}

export default function PricingBottom() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-5 gap-10">

      {/* All Plans Include */}
      <div className="lg:col-span-3">
        <h2 className="text-lg font-bold text-slate-800 mb-6">All Plans Include</h2>
        <div className="grid grid-cols-5 gap-5">
          {allPlans.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Icon className="w-4 h-4 text-[#4f46e5]" />
              </div>
              <p className="text-sm font-semibold text-slate-800">{title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="lg:col-span-2">
        <h2 className="text-lg font-bold text-slate-800 mb-2">Frequently Asked Questions</h2>
        <div>
          {faqs.map((f) => <FAQ key={f.q} q={f.q} a={f.a} />)}
        </div>
        <Link
          href="/request-demo"
          className="mt-4 inline-flex items-center gap-1 text-sm text-[#4f46e5] font-semibold hover:underline"
        >
          View all FAQs →
        </Link>
      </div>

    </div>
  )
}
