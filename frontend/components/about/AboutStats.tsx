const stats = [
  { value: "500+", label: "Organizations Supported" },
  { value: "10K+", label: "Audits Completed" },
  { value: "25K+", label: "Risks Identified" },
  { value: "98%",  label: "Analyst Satisfaction" },
];

export default function AboutStats() {
  return (
    <section className="border-y border-gray-200 py-16 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-4">
            <div>
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
              <p className="text-gray-500 text-sm">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}