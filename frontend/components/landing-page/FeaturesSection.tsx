import Link from "next/link";
import { Users, FileText, Scale } from "lucide-react";

const features = [
  {
    icon: Users,
    iconBg: "bg-[#ede9fe]",
    iconColor: "text-[#4f46e5]",
    title: "Adverse Impact Analysis",
    description:
      "Detect potential discrimination in hiring, promotions, and other workforce decisions with advanced statistical tests.",
  },
  {
    icon: FileText,
    iconBg: "bg-[#dcfce7]",
    iconColor: "text-[#16a34a]",
    title: "Position Description Review",
    description:
      "AI analyzes job descriptions to identify vague language, unnecessary requirements, and risk factors.",
  },
  {
    icon: Scale,
    iconBg: "bg-[#ffedd5]",
    iconColor: "text-[#ea580c]",
    title: "Pay Equity Analysis",
    description:
      "Uncover unexplained pay gaps across demographic groups using regression modeling and gap analysis.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            Comprehensive Compliance. One Unified Platform.
          </h2>
          <p className="text-gray-500 text-base max-w-2xl mx-auto leading-relaxed">
            TriMerge Comply brings together three powerful engines to help you uncover risks,
            ensure fairness, and maintain compliance with confidence.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, iconBg, iconColor, title, description }) => (
            <div
              key={title}
              className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
              <h3 className="text-gray-900 font-bold text-base mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{description}</p>
              <Link
                href="#"
                className="text-[#4f46e5] text-sm font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all"
              >
                Learn more →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}