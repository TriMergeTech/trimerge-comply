import { Monitor, BarChart2, Users, Shield } from 'lucide-react'

const features = [
  {
    icon: Monitor,
    title: 'Personalized Walkthrough',
    desc: "See how TriMerge Comply fits your organization's unique needs.",
  },
  {
    icon: BarChart2,
    title: 'Explore Key Features',
    desc: 'Dashboard, risk detection engines, analyst workflow, and reporting.',
  },
  {
    icon: Users,
    title: 'Expert Guidance',
    desc: 'Get answers from our compliance and analytics experts.',
  },
  {
    icon: Shield,
    title: 'Built for Security',
    desc: 'Enterprise-grade security and privacy you can trust.',
  },
]

export default function RequestDemoHero() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-[#4f46e5] text-xs font-bold tracking-widest uppercase mb-3">Request a Demo</p>
        <h1 className="text-4xl font-extrabold text-slate-900 leading-tight mb-4">
          See TriMerge Comply<br />in Action
        </h1>
        <p className="text-slate-500 text-base leading-relaxed max-w-md">
          Discover how our AI-powered compliance platform helps organizations identify risks, ensure fairness, and build stronger, more equitable workplaces—faster.
        </p>
        <div className="mt-5 w-12 h-1 rounded-full bg-[#4f46e5]" />
      </div>

      <div className="flex flex-col gap-6">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#eef2ff] flex items-center justify-center">
              <Icon className="w-5 h-5 text-[#4f46e5]" />
            </div>
            <div>
              <p className="text-slate-800 font-semibold text-sm">{title}</p>
              <p className="text-slate-500 text-sm mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
