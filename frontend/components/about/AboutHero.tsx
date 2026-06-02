import Link from "next/link";
import Image from "next/image";

export default function AboutHero() {
  return (
    <section className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-4">About Us</p>
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
          Built for Fairness.<br />Designed for Impact.
        </h1>
        <p className="text-gray-600 text-base leading-relaxed mb-8 max-w-md">
          TriMerge Comply empowers organizations and government agencies to proactively identify and
          address workforce risks with AI-powered audits, advanced analytics, and expert-guided
          workflows—driving fairness, transparency, and compliance at every level.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-medium px-6 py-3 rounded-md transition-colors"
        >
          Request Demo →
        </Link>
      </div>

      <div className="rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] relative">
        <Image
          src="/about-team.png"
          alt="TriMerge Comply team"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
    </section>
  );
}