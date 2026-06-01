import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const bullets = [
  "Upload data in CSV or Excel",
  "Automated analysis & risk scoring",
  "Analyst review and decision tracking",
  "Audit trails and activity logs",
  "Export confirmed findings for reporting",
];

const flags = [
  {
    flag: "Female interview rate lower than benchmark",
    engine: "Adverse Impact",
    audit: "City of Springfield",
    severity: "Critical",
    severityColor: "bg-red-100 text-red-700",
    status: "Pending",
    assigned: "John Smith",
  },
  {
    flag: "Hispanic selection rate disparity",
    engine: "Adverse Impact",
    audit: "State Transit Authority",
    severity: "High",
    severityColor: "bg-orange-100 text-orange-700",
    status: "Pending",
    assigned: "You",
  },
  {
    flag: "Degree requirement may be excessive",
    engine: "Position Description",
    audit: "Public Health Dept",
    severity: "Medium",
    severityColor: "bg-yellow-100 text-yellow-700",
    status: "Pending",
    assigned: "Sarah Analyst",
  },
  {
    flag: "Gender pay gap detected (8.2%)",
    engine: "Pay Equity",
    audit: "Public Health Dept",
    severity: "High",
    severityColor: "bg-orange-100 text-orange-700",
    status: "Pending",
    assigned: "Unassigned",
  },
];

export default function WorkflowSection() {
  return (
    <section className="bg-[#f8f9ff] py-20 px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-14">
        {/* Left */}
        <div className="flex-1 max-w-md">
          <p className="text-[#4f46e5] text-xs font-bold uppercase tracking-widest mb-3">
            BUILT FOR ANALYSTS. DESIGNED FOR IMPACT.
          </p>
          <h2 className="text-3xl font-extrabold text-gray-900 leading-tight mb-6">
            Streamline Your Workflow<br />
            From Data to Defensible Findings
          </h2>
          <ul className="space-y-3 mb-8">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#4f46e5] flex-shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard"
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold text-sm px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
          >
            See How It Works →
          </Link>
        </div>

        {/* Right - Flag Queue mockup */}
        <div className="flex-1 w-full">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-5 pb-3 border-b border-gray-100">
              <h3 className="text-gray-900 font-bold text-base mb-3">Flag Review Queue</h3>
              {/* Filters row */}
              <div className="flex flex-wrap gap-2">
                {["All Engines ▾", "All Severities ▾", "Pending ▾"].map((f) => (
                  <button
                    key={f}
                    className="border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-md hover:border-gray-300 transition-colors"
                  >
                    {f}
                  </button>
                ))}
                <div className="flex-1 min-w-[140px]">
                  <div className="border border-gray-200 rounded-md px-3 py-1.5 flex items-center gap-2">
                    <span className="text-gray-400 text-xs">🔍</span>
                    <span className="text-gray-400 text-xs">Search flags...</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_80px_70px_80px] gap-2 px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500">
              <span>Flag</span>
              <span>Engine</span>
              <span>Audit</span>
              <span>Severity</span>
              <span>Status</span>
              <span>Assigned To</span>
            </div>

            {/* Table rows */}
            {flags.map(({ flag, engine, audit, severity, severityColor, status, assigned }) => (
              <div
                key={flag}
                className="grid grid-cols-[2fr_1fr_1fr_80px_70px_80px] gap-2 px-5 py-3 border-b border-gray-50 last:border-0 items-center hover:bg-gray-50 transition-colors"
              >
                <span className="text-[#4f46e5] text-xs font-medium truncate cursor-pointer hover:underline">
                  {flag}
                </span>
                <span className="text-gray-600 text-xs">{engine}</span>
                <span className="text-[#4f46e5] text-xs font-medium cursor-pointer hover:underline">
                  {audit}
                </span>
                <span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${severityColor}`}>
                    {severity}
                  </span>
                </span>
                <span className="text-gray-500 text-xs">{status}</span>
                <span className="text-gray-600 text-xs">{assigned}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}