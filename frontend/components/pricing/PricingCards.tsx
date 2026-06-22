import Link from 'next/link'
import { User, Briefcase, Building2, Landmark, CheckCircle2 } from 'lucide-react'

type Plan = {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  name: string
  desc: string
  monthlyPrice: string
  yearlyPrice: string
  priceLabel: string
  features: string[]
  cta: string
  ctaHref: string
  popular?: boolean
  filled?: boolean
}

const plans: Plan[] = [
  {
    icon: User,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-500',
    name: 'Starter',
    desc: 'Perfect for small teams getting started with compliance audits.',
    monthlyPrice: '$499',
    yearlyPrice: '$399',
    priceLabel: '/month',
    features: [
      'Up to 5 Audits',
      'Adverse Impact Analysis',
      'Position Description Review',
      'Pay Equity Analysis',
      '1,000 AI Credits / month',
      'Email Support',
    ],
    cta: 'Get Started',
    ctaHref: '/request-demo',
  },
  {
    icon: Briefcase,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-500',
    name: 'Professional',
    desc: 'Ideal for growing teams that need advanced insights and flexibility.',
    monthlyPrice: '$1,499',
    yearlyPrice: '$1,199',
    priceLabel: '/month',
    features: [
      'Up to 20 Audits',
      'Adverse Impact Analysis',
      'Position Description Review',
      'Pay Equity Analysis',
      '5,000 AI Credits / month',
      'Advanced Analytics & Dashboards',
      'Priority Email & Chat Support',
    ],
    cta: 'Get Started',
    ctaHref: '/request-demo',
    popular: true,
    filled: true,
  },
  {
    icon: Building2,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    name: 'Enterprise',
    desc: 'Built for large organizations with complex compliance needs.',
    monthlyPrice: '$2,999',
    yearlyPrice: '$2,399',
    priceLabel: '/month',
    features: [
      'Unlimited Audits',
      'Adverse Impact Analysis',
      'Position Description Review',
      'Pay Equity Analysis',
      '10,000 AI Credits / month',
      'Advanced Analytics & Reports',
      'Role-Based Access Control',
      'Priority Support & Onboarding',
    ],
    cta: 'Contact Sales',
    ctaHref: '/request-demo',
  },
  {
    icon: Landmark,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500',
    name: 'Government',
    desc: 'Specialized for public sector agencies and institutions.',
    monthlyPrice: 'Custom',
    yearlyPrice: 'Custom',
    priceLabel: 'Custom pricing',
    features: [
      'Unlimited Audits',
      'All Core Features',
      'Custom Integrations',
      'Dedicated Success Manager',
      'SLA & Compliance Support',
      'On-Premise / GovCloud Options',
      'Training & Implementation',
    ],
    cta: 'Contact Sales',
    ctaHref: '/request-demo',
  },
]

type Props = { isYearly: boolean }

export default function PricingCards({ isYearly }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-6 pb-16 grid grid-cols-4 gap-4">
      {plans.map((plan) => {
        const Icon = plan.icon
        const price = plan.monthlyPrice === 'Custom'
          ? 'Custom'
          : isYearly ? plan.yearlyPrice : plan.monthlyPrice
        const isCustom = price === 'Custom'

        return (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-2xl border bg-white p-5 ${
              plan.popular
                ? 'border-[#4f46e5] shadow-lg shadow-indigo-100'
                : 'border-slate-200 shadow-sm'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-[#4f46e5] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            {/* Icon + name */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-xl ${plan.iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${plan.iconColor}`} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-base">{plan.name}</p>
                <p className="text-slate-400 text-xs leading-snug">{plan.desc}</p>
              </div>
            </div>

            {/* Price */}
            <div className="mb-1">
              {isCustom ? (
                <p className="text-3xl font-extrabold text-slate-900">Custom</p>
              ) : (
                <p className="text-3xl font-extrabold text-slate-900">
                  {price}
                  <span className="text-sm font-medium text-slate-400 ml-1">/month</span>
                </p>
              )}
              <p className="text-xs text-slate-400 mt-0.5">
                {isCustom ? 'Custom pricing' : isYearly ? 'Billed yearly' : 'Billed monthly'}
              </p>
            </div>

            <hr className="my-4 border-slate-100" />

            {/* Features */}
            <ul className="flex flex-col gap-2.5 flex-1 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-[#4f46e5] flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              href={plan.ctaHref}
              className={`w-full text-center py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                plan.filled
                  ? 'bg-[#4f46e5] hover:bg-[#4338ca] text-white'
                  : 'border border-[#4f46e5] text-[#4f46e5] hover:bg-indigo-50'
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        )
      })}
    </div>
  )
}
