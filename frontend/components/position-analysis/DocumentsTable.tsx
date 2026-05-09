'use client'

// Document tabs component
// Filters documents by status: All, Processing, Completed, Flagged

import { useState } from 'react'

// Tab options
const tabs = ['All Documents', 'Processing', 'Completed', 'Flagged']

type DocumentTabsProps = {
  onTabChange: (tab: string) => void
}

export default function DocumentTabs({ onTabChange }: DocumentTabsProps) {
  const [activeTab, setActiveTab] = useState('All Documents')

  function handleTabClick(tab: string) {
    setActiveTab(tab)
    onTabChange(tab)
  }

  return (
    <div className="flex gap-1 border-b border-slate-100">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabClick(tab)}
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
  )
}