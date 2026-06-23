import { CalendarDays, BarChart2, ShieldCheck, Phone } from 'lucide-react'

export default function RequestDemoInfo() {
  return (
    <section className="bg-[#f5f6fb] py-14 px-6 border-t border-slate-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#eef2ff] flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-[#4f46e5]" />
          </div>
          <h3 className="text-slate-800 font-bold text-sm">What to Expect ?</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            A interactive demo tailored to your organization's needs. We will walk you through real use cases and answer your questions.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#eef2ff] flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-[#4f46e5]" />
          </div>
          <h3 className="text-slate-800 font-bold text-sm"> Real Results</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Explore how TriMerge Comply identifies risks, streamlines audits, and helps drive better outcomes across your Organization.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#eef2ff] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#4f46e5]" />
          </div>
          <h3 className="text-slate-800 font-bold text-sm">No Obligation</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            This is a no-pressure conversation. We're here to help you find the right solution for your compliance goals.
          </p>
        </div>

        <div className="bg-[#0d0f2b] rounded-xl border border-white/10 shadow-sm p-6 flex flex-col gap-3">
          <h3 className="text-white font-bold text-sm">Contact Us</h3>
          <p className="text-white/60 text-sm leading-relaxed">
            Speak with our compliance experts to learn how we can help.
          </p>
          <a
            href="tel:+18881234567"
            className="mt-auto flex items-center gap-2 border border-white/20 hover:border-white/40 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors w-fit"
          >
            <Phone className="w-4 h-4" />
            (305) 940-5344
          </a>
        </div>

      </div>
    </section>
  )
}
