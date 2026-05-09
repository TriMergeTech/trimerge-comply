'use client'

// Flag detail component
// Displays detailed information about a specific flag
// Includes tabs for Summary, Test Results, Charts and Applicant Flow

import { useState } from 'react'

// Tab options for the flag detail view
const tabs = ['Summary', 'Test Results', 'Charts', 'Applicant Flow']

// Temporary mock flag data — will be replaced with real API data later
const flagData = {
  title: 'Police Officer – Interview – Female',
  severity: 'Critical',
  engine: 'Adverse Impact',
  audit: 'City of Springfield',
  stage: 'Interview',
  demographicGroup: 'Female',
  comparisonGroup: 'Male',
  fourFifthsRule: 0.63,
  chiSquare: 0.0012,
  fishersExact: 0.0008,
}

export default function FlagDetail() {
  // Track active tab
  const [activeTab, setActiveTab] = useState('Summary')

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-5">

      {/* Flag title and severity badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-slate-800 font-semibold text-base">
          {flagData.title}
        </h3>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
          {flagData.severity}
        </span>
      </div>

      {/* Flag metadata */}
      <div className="grid grid-cols-2 gap-4 text-sm">

        <div>
          <p className="text-slate-400">Engine</p>
          <p className="text-slate-700 font-medium mt-0.5">{flagData.engine}</p>
        </div>

        <div>
          <p className="text-slate-400">Audit</p>
          <p className="text-slate-700 font-medium mt-0.5">{flagData.audit}</p>
        </div>

        <div>
          <p className="text-slate-400">Stage</p>
          <p className="text-slate-700 font-medium mt-0.5">{flagData.stage}</p>
        </div>

        <div>
          <p className="text-slate-400">Demographic Group</p>
          <p className="text-slate-700 font-medium mt-0.5">{flagData.demographicGroup}</p>
        </div>

        <div>
          <p className="text-slate-400">Comparison Group</p>
          <p className="text-slate-700 font-medium mt-0.5">{flagData.comparisonGroup}</p>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-100">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>

        {/* Summary tab */}
        {activeTab === 'Summary' && (
          <div className="grid grid-cols-3 gap-4">

            {/* 4/5ths Rule */}
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-xs text-slate-400 mb-1">4/5ths Rule</p>
              <p className="text-2xl font-bold text-red-500">
                {flagData.fourFifthsRule.toFixed(2)}
              </p>
              <p className="text-xs text-red-400 mt-1">Violation</p>
            </div>

            {/* Chi-Square */}
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-xs text-slate-400 mb-1">Chi-Square p-value</p>
              <p className="text-2xl font-bold text-slate-800">
                {flagData.chiSquare.toFixed(4)}
              </p>
              <p className="text-xs text-slate-400 mt-1">p-value</p>
            </div>

            {/* Fisher's Exact */}
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-xs text-slate-400 mb-1">Fisher&apos;s Exact</p>
              <p className="text-2xl font-bold text-slate-800">
                {flagData.fishersExact.toFixed(4)}
              </p>
              <p className="text-xs text-slate-400 mt-1">p-value</p>
            </div>

          </div>
        )}

        {/* Test Results tab */}
        {activeTab === 'Test Results' && (
          <div className="text-sm text-slate-500 py-4 text-center">
            Test results will be displayed here.
          </div>
        )}

        {/* Charts tab */}
        {activeTab === 'Charts' && (
          <div className="text-sm text-slate-500 py-4 text-center">
            Charts will be displayed here.
          </div>
        )}

        {/* Applicant Flow tab */}
        {activeTab === 'Applicant Flow' && (
          <div className="text-sm text-slate-500 py-4 text-center">
            Applicant flow data will be displayed here.
          </div>
        )}

      </div>
    </div>
  )
}