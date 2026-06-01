import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

const bullets = [
  "Upload data in CSV or Excel",
  "Automated analysis & risk scoring",
  "Analyst review and decision tracking",
  "Audit trails and activity logs",
  "Export confirmed findings for reporting",
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

        {/* Right - Flag Queue screenshot */}
        <div className="flex-1 w-full">
          <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <Image
              src="/flag-queue-screenshot.png"
              alt="Flag Review Queue"
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}