import Link from 'next/link'
import LandingNav from '@/components/landing-page/LandingNav'
import LandingFooter from '@/components/landing-page/LandingFooter'

export default function TermsPage() {
  return (
    <>
      <LandingNav />
      <main className="max-w-3xl mx-auto px-6 py-16">

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-slate-400 text-sm mb-10">Effective date: June 23, 2026</p>

        <div className="flex flex-col gap-10 text-slate-600 text-sm leading-relaxed">

          {/* AI Advisory */}
          <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h2 className="text-base font-semibold text-amber-800 mb-2">Important: AI-Generated Results Are Advisory Only</h2>
            <p className="text-amber-700">
              TriMerge Comply uses artificial intelligence to analyze workforce data and generate findings, flags, criteria, and recommendations. <strong>These outputs are informational and advisory in nature — they are not legal advice, regulatory determinations, or definitive compliance conclusions.</strong>
            </p>
            <p className="text-amber-700 mt-3">
              All AI-generated content must be reviewed and validated by a qualified HR professional, employment attorney, or compliance officer before being relied upon for any employment decision, regulatory filing, audit response, or legal proceeding. TriMerge Comply expressly disclaims any liability arising from reliance on AI-generated outputs without independent human review.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using TriMerge Comply ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Platform. These Terms apply to all users, including organization administrators, analysts, and compliance officers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-3">2. Description of Service</h2>
            <p>
              TriMerge Comply is a compliance analytics platform that assists organizations in identifying potential adverse impact, pay equity gaps, and position description issues in their workforce data. The Platform applies statistical methods and AI-assisted analysis to uploaded datasets and generates findings for analyst review.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-3">3. Data Certification and Accuracy</h2>
            <p>
              When you upload data to the Platform, you certify that the data is current, accurate, and that you are authorized to submit it for analysis. You are solely responsible for the accuracy of data you submit. TriMerge Comply does not independently verify uploaded data and is not liable for findings derived from inaccurate or incomplete inputs.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-3">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 mt-2 flex flex-col gap-1.5">
              <li>Upload data you are not authorized to process or analyze.</li>
              <li>Use the Platform to discriminate against any individual or group in violation of applicable law.</li>
              <li>Reverse engineer, copy, or redistribute any part of the Platform.</li>
              <li>Attempt to circumvent any security or access control measures.</li>
              <li>Use AI-generated outputs as the sole basis for adverse employment actions without independent review.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-3">5. Data Privacy and Security</h2>
            <p>
              TriMerge Comply handles uploaded workforce data in accordance with our Privacy Policy. Data is processed within your organization's scoped environment and is not shared with other organizations. We employ industry-standard security controls to protect data in transit and at rest. You retain ownership of all data you upload.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-3">6. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, TriMerge Comply and its affiliates, officers, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including but not limited to regulatory penalties, adverse legal judgments, employment-related claims, or lost profits — arising from your use of the Platform or reliance on any AI-generated output.
            </p>
            <p className="mt-3">
              Our total aggregate liability for any claim arising out of or relating to these Terms or the Platform shall not exceed the amount you paid to TriMerge Comply in the three months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-3">7. Modifications</h2>
            <p>
              We reserve the right to update these Terms at any time. Material changes will be communicated via email or an in-platform notice. Continued use of the Platform after changes take effect constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-3">8. Contact</h2>
            <p>
              Questions about these Terms may be directed to{' '}
              <a href="mailto:legal@trimergetech.com" className="text-indigo-600 hover:underline">
                legal@trimergetech.com
              </a>.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
            <Link href="/landing-page" className="text-indigo-500 hover:underline">← Back to home</Link>
          </div>

        </div>
      </main>
      <LandingFooter />
    </>
  )
}
