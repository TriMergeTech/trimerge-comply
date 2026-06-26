'use client'

import { useState } from 'react'
import { useUser } from '@/lib/context/UserContext'

const DISCLAIMER_KEY = (email: string) => `tc_disclaimer_${email}`

export default function DisclaimerModal() {
  const user = useUser()
  const [agreed, setAgreed] = useState(false)

  if (!user) return null
  if (agreed) return null
  if (typeof window !== 'undefined' && localStorage.getItem(DISCLAIMER_KEY(user.email))) return null

  function handleAgree() {
    if (!user) return
    localStorage.setItem(DISCLAIMER_KEY(user.email), '1')
    setAgreed(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-8 pt-8 pb-4 shrink-0">
          <h2 className="text-slate-800 font-bold text-lg text-center leading-snug">
            TriMerge Comply User Acknowledgment and Disclaimer
          </h2>
          <p className="text-slate-400 text-xs text-center mt-1">
            Please read the following carefully before continuing.
          </p>
        </div>

        {/* Scrollable disclaimer text */}
        <div className="px-8 pb-2 overflow-y-auto flex-1 min-h-0">
          <div className="text-slate-600 text-sm leading-relaxed space-y-4">

            <p>
              By creating an account, accessing, or using TriMerge Comply, you acknowledge and agree to the following:
            </p>

            <div>
              <p className="font-semibold text-slate-700 mb-1">User Responsibility for Data</p>
              <p>
                You are solely responsible for the accuracy, completeness, legality, and appropriateness of all information, documents, files, data, and content uploaded, entered, or maintained within the platform.
              </p>
              <p className="mt-2">
                You represent and warrant that you have the legal authority and permission to upload, access, analyze, and maintain any information submitted to the platform.
              </p>
              <p className="mt-2">
                TriMerge does not verify the accuracy, authenticity, completeness, or legality of user-provided information.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-700 mb-1">Professional Judgment Required</p>
              <p>
                TriMerge Comply is designed to support workforce governance, compliance reviews, audits, compensation analyses, workforce assessments, and related activities.
              </p>
              <p className="mt-2">
                The platform is a decision-support tool and does not replace professional judgment, legal review, human resources expertise, audit procedures, management oversight, or regulatory compliance responsibilities.
              </p>
              <p className="mt-2">
                Users remain solely responsible for evaluating, validating, and approving all conclusions, recommendations, analyses, reports, and actions derived from the platform.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-700 mb-1">Artificial Intelligence and Automated Analysis</p>
              <p>
                Certain features may utilize artificial intelligence, machine learning, statistical models, automation, or other analytical tools.
              </p>
              <p className="mt-2">
                AI-generated content, recommendations, summaries, findings, and analyses are provided solely as informational support and may contain inaccuracies, omissions, assumptions, or errors.
              </p>
              <p className="mt-2">
                TriMerge does not guarantee the accuracy, completeness, or suitability of any AI-generated output.
              </p>
              <p className="mt-2">
                Users must independently review, validate, and approve all outputs prior to reliance, publication, reporting, decision-making, or implementation.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-700 mb-1">No Legal, Employment, Accounting, Audit, or Regulatory Determinations</p>
              <p>
                The platform does not provide legal advice, employment decisions, compliance determinations, audit opinions, accounting opinions, compensation determinations, discrimination findings, adverse impact findings, or regulatory conclusions.
              </p>
              <p className="mt-2">
                Any decisions regarding employment practices, compensation, compliance, investigations, disciplinary actions, litigation, or regulatory matters remain the sole responsibility of the user and their organization.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-700 mb-1">Confidential and Sensitive Information</p>
              <p>
                Users are responsible for safeguarding confidential, proprietary, personnel, compensation, applicant, and other sensitive information uploaded to the platform.
              </p>
              <p className="mt-2">
                Users agree to comply with all applicable laws, regulations, contractual obligations, privacy requirements, records retention requirements, and organizational policies governing the information they upload and manage.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-700 mb-1">Limitation of Liability</p>
              <p>
                To the fullest extent permitted by law, TriMerge Consulting Group, P.A., its affiliates, officers, employees, contractors, developers, consultants, and representatives shall not be liable for any direct, indirect, incidental, consequential, special, punitive, or exemplary damages arising from:
              </p>
              <ul className="mt-2 ml-4 list-disc space-y-1 text-slate-500">
                <li>User-provided data</li>
                <li>Inaccurate or incomplete information</li>
                <li>Reliance upon reports, analyses, recommendations, or AI-generated content</li>
                <li>Data entry errors</li>
                <li>User decisions or actions</li>
                <li>Regulatory findings</li>
                <li>Employment decisions</li>
                <li>Compensation decisions</li>
                <li>Litigation outcomes</li>
                <li>Any use of the platform</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-slate-700 mb-1">Acceptance</p>
              <p>
                By selecting "I Agree" and accessing the platform, you acknowledge that you have read, understood, and agree to these terms and accept responsibility for all use of the platform and all decisions made based upon information contained within it.
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 shrink-0 border-t border-slate-100">
          <button
            onClick={handleAgree}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
          >
            I Agree
          </button>
        </div>

      </div>
    </div>
  )
}
