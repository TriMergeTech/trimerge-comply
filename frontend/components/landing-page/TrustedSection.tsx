import { Globe, Train, HeartPulse, Building2, Users } from "lucide-react";

const clients = [
  { icon: Globe, color: "text-blue-600", bg: "bg-blue-100", line1: "CITY OF", line2: "ANYWHERE" },
  { icon: Train, color: "text-green-600", bg: "bg-green-100", line1: "STATE TRANSIT", line2: "AUTHORITY" },
  { icon: HeartPulse, color: "text-indigo-600", bg: "bg-indigo-100", line1: "PUBLIC HEALTH", line2: "DEPARTMENT" },
  { icon: Building2, color: "text-gray-700", bg: "bg-gray-100", line1: "COUNTY OF", line2: "ANYWHERE" },
  { icon: Users, color: "text-blue-700", bg: "bg-blue-50", line1: "WORKFORCE", line2: "SOLUTIONS" },
];

export default function TrustedSection() {
  return (
    <section className="bg-white py-16 px-6 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-2xl font-extrabold text-gray-900 mb-10">
          Trusted by Government Agencies and Organizations
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-10">
          {clients.map(({ icon: Icon, color, bg, line1, line2 }) => (
            <div key={`${line1}-${line2}`} className="flex flex-col items-center gap-2">
              <div className={`w-14 h-14 rounded-full ${bg} flex items-center justify-center`}>
                <Icon className={`w-7 h-7 ${color}`} />
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-[10px] font-semibold tracking-wider">{line1}</p>
                <p className="text-gray-900 text-xs font-extrabold tracking-wide">{line2}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}