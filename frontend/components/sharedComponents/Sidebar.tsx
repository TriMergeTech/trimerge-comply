'use client'

// Next.js navigation utilities
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Lucide icons for each nav item
import {
  LayoutDashboard,
  FileText,
  Upload,
  Flag,
  BriefcaseBusiness,
  DollarSign,
  LogOut,
} from 'lucide-react'

// Navigation links configuration
// Add or remove routes here as new pages are created
const navLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Audits', href: '/audits', icon: FileText },
  { label: 'Upload Data', href: '/upload', icon: Upload },
  { label: 'Flags', href: '/flags', icon: Flag },
  { label: 'Position Analysis', href: '/position-analysis', icon: BriefcaseBusiness },
  { label: 'Pay Equity', href: '/pay-equity', icon: DollarSign },
]

export default function Sidebar() {
  // Get the current route path to highlight the active link
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-[#0f1535] flex flex-col justify-between py-6 px-4">
      
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
            // Check if this link matches the current route
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white font-medium' // Active link styles
                    : 'text-slate-400 hover:bg-white/10 hover:text-white' // Inactive link styles
                }`}
              >
                {/* Nav icon */}
                <Icon size={18} />
                {/* Nav label */}
                {label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom section — logout button */}
      <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-white/10 hover:text-white transition-colors w-full">
        <LogOut size={18} />
        Logout
      </button>

    </aside>
  )
}