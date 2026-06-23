import Link from "next/link";
import Image from "next/image";

export default function CTASection() {
  return (
    <section className="bg-[#0d0f2b] py-16 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          {/* Shield image */}
          <div className="w-20 h-20 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="TriMerge Comply"
              width={80}
              height={80}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white leading-tight mb-2">
              Ready to Strengthen Your Compliance Program?
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xl">
              Schedule a demo and see how TriMerge Comply can help you find risks,
              save time, and build a fairer workplace.
            </p>
          </div>
        </div>
        <Link
          href="/request-demo"
          className="flex-shrink-0 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold px-8 py-4 rounded-lg flex items-center gap-2 transition-colors text-sm whitespace-nowrap shadow-lg"
        >
          Request Demo →
        </Link>
      </div>
    </section>
  );
}
