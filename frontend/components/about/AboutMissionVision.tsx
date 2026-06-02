import Image from "next/image";

const visionPoints = [
  "Proactive Risk Detection",
  "AI-Powered Intelligence",
  "Human Expertise",
  "Better Outcomes",
];

export default function AboutMissionVision() {
  return (
    <section className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Mission */}
      <div className="relative rounded-2xl overflow-hidden text-white">
        <Image
          src="/about-mission.png"
          alt="Our mission"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0F0A2E]/50" />
        <div className="relative z-10 p-10">
          <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
          <div className="w-10 h-0.5 bg-[#4f46e5] mb-6 rounded-full" />
          <p className="text-gray-300 leading-relaxed text-sm">
            To empower organizations with the tools and intelligence they need to ensure fair treatment,
            equal opportunity, and regulatory compliance across their workforce.
          </p>
        </div>
      </div>

      {/* Vision */}
      <div className="flex flex-col gap-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Vision</h3>
          <div className="w-10 h-0.5 bg-[#4f46e5] mb-4 rounded-full" />
          <p className="text-gray-600 text-sm leading-relaxed">
            A world where every organization has the clarity and confidence to build inclusive
            workplaces—where data drives decisions, and fairness drives success.
          </p>
        </div>
        <div className="bg-indigo-50 rounded-2xl p-8 flex items-center gap-8">
          <div className="w-20 h-20 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
            <div className="w-12 h-12 bg-[#4f46e5] rounded-xl flex items-center justify-center shadow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6v6c0 5.4 3.84 10.4 8 11.94C16.16 22.4 20 17.4 20 12V6L12 2z" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
          </div>
          <ul className="flex flex-col gap-3">
            {visionPoints.map((point) => (
              <li key={point} className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-5 h-5 rounded-full border-2 border-[#4f46e5] flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}