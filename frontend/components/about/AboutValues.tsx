const values = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 3L4 8v8c0 7.18 5.16 13.9 12 15.93C23.84 29.9 28 23.18 28 16V8L16 3z" stroke="#4F46E5" strokeWidth="2" strokeLinejoin="round" fill="none"/>
        <path d="M11 16l3 3 7-7" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Integrity",
    description: "We uphold the highest standards of data integrity, security, and ethical AI.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="11" cy="10" r="4" stroke="#22C55E" strokeWidth="2"/>
        <circle cx="21" cy="10" r="4" stroke="#22C55E" strokeWidth="2"/>
        <path d="M4 26c0-4 3.13-7 7-7h10c3.87 0 7 3 7 7" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    label: "Fairness",
    description: "We are committed to promoting equity and reducing bias across the entire employee lifecycle.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <polyline points="4,22 11,14 17,18 28,8" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="24,8 28,8 28,12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Innovation",
    description: "We leverage AI and advanced analytics to solve complex compliance challenges.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="8" y="14" width="16" height="14" rx="2" stroke="#8B5CF6" strokeWidth="2"/>
        <path d="M11 14v-3a5 5 0 0110 0v3" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="16" cy="21" r="2" fill="#8B5CF6"/>
      </svg>
    ),
    label: "Transparency",
    description: "We believe in clear insights, explainable results, and accountable workflows.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="10" r="4" stroke="#F97316" strokeWidth="2"/>
        <path d="M8 26c0-4 3.13-7 8-7s8 3 8 7" stroke="#F97316" strokeWidth="2" strokeLinecap="round"/>
        <path d="M22 6l2 2-2 2M26 8h-2" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Impact",
    description: "We help organizations build fairer workplaces and stronger communities.",
  },
];

export default function AboutValues() {
  return (
    <section className="bg-gray-50 py-20 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Our Values</h2>
          <div className="w-12 h-1 bg-[#4f46e5] mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {values.map((v) => (
            <div key={v.label} className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100">
                {v.icon}
              </div>
              <p className="font-semibold text-gray-900 text-sm">{v.label}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}