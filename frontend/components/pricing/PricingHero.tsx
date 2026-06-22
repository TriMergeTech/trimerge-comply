'use client'

type Props = {
  isYearly: boolean
  onToggle: () => void
}

export default function PricingHero({ isYearly, onToggle }: Props) {
  return (
    <div className="text-center flex flex-col items-center gap-6 pt-24 pb-12 px-6">
      <h1 className="text-4xl font-extrabold text-slate-900">Simple, Transparent Pricing</h1>
      <p className="text-slate-500 text-base max-w-xl leading-relaxed">
        Choose the plan that fits your organization's needs. All plans include our core compliance engines and analyst workflow.
      </p>

      {/* Monthly / Yearly toggle */}
      <div className="flex items-center gap-3 text-sm font-medium">
        <span className={isYearly ? 'text-slate-400' : 'text-slate-700'}>Monthly</span>
        <button
          onClick={onToggle}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${isYearly ? 'bg-[#4f46e5]' : 'bg-slate-300'}`}
        >
          <span
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${isYearly ? 'translate-x-6' : 'translate-x-0'}`}
          />
        </button>
        <span className={isYearly ? 'text-slate-700' : 'text-slate-400'}>
          Yearly <span className="text-[#4f46e5] font-semibold">(Save 20%)</span>
        </span>
      </div>
    </div>
  )
}
