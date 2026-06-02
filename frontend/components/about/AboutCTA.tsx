import Link from "next/link";

export default function AboutCTA() {
  return (
    <section className="bg-[#0F0A2E] py-20 px-8">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#4f46e5] rounded-2xl flex items-center justify-center shrink-0">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 3L4 8v8c0 7.18 5.16 13.9 12 15.93C23.84 29.9 28 23.18 28 16V8L16 3z" fill="white" fillOpacity="0.9"/>
              <path d="M11 16l3 3 7-7" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">
              Ready to Strengthen Your Compliance Program?
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Schedule a demo and see how TriMerge Comply can help you find risks, save time, and build a fairer workplace.
            </p>
          </div>
        </div>
        <Link
          href="/login"
          className="shrink-0 inline-flex items-center gap-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold px-8 py-4 rounded-xl transition-colors whitespace-nowrap"
        >
          Request Demo →
        </Link>
      </div>
    </section>
  );
}