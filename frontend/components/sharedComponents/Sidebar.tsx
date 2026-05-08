'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  FileText,
  Upload,
  Flag,
  BriefcaseBusiness,
  DollarSign,
  LogOut,
  Menu,
  X as CloseIcon,
} from 'lucide-react'

// Navigation links configuration
const navLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Audits', href: '/audits', icon: FileText },
  { label: 'Upload Data', href: '/upload', icon: Upload },
  { label: 'Flags', href: '/flags', icon: Flag },
  { label: 'Position Analysis', href: '/position-analysis', icon: BriefcaseBusiness },
  { label: 'Pay Equity', href: '/pay-equity', icon: DollarSign },
]

export default function Sidebar() {
  // Controls mobile sidebar open/close state
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile hamburger button — only visible on mobile */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-[#0f1535] text-white rounded-lg md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <CloseIcon size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay — dark background behind sidebar on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-full w-64 bg-[#0f1535] flex flex-col justify-between py-6 px-4
        transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:min-h-screen
      `}>

        {/* Top section — logo and navigation */}
        <div>

          {/* Logo */}
          <div className="mb-8 px-2">
            <h1 className="text-white text-lg font-bold tracking-wide">
              TRIME<span className="text-blue-400">RGE</span>
            </h1>
            <p className="text-blue-400 text-xs tracking-widest uppercase">Comply</p>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-col gap-1">
            {navLinks.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom section — logout */}
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-white/10 hover:text-white transition-colors w-full">
          <LogOut size={18} />
          Logout
        </button>

      </aside>
    </>
  )
}