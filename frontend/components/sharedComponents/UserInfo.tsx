'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Settings, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { clearTokens } from '@/lib/authTokens'

export default function UserInfo() {
  const user = useCurrentUser()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    clearTokens()
    router.replace('/login')
  }

  return (
    <div className="flex items-center gap-4">

      {/* Notification bell */}
      <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
        <Bell size={20} className="text-slate-500" />
        {/* Notification dot — shows when there are unread notifications */}
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      {/* User avatar with dropdown */}
      <div className="relative" ref={dropdownRef}>

        {/* Clickable avatar row */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-3 rounded-lg hover:bg-slate-100 px-2 py-1 transition-colors"
        >
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-indigo-600 text-white text-sm font-medium">
              {user?.initials ?? '?'}
            </AvatarFallback>
          </Avatar>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-800">{user?.name ?? '—'}</p>
            <p className="text-xs text-slate-400">{user?.role ?? '—'}</p>
          </div>
        </button>

        {/* Dropdown menu */}
        {open && (
          <div className="absolute top-full right-0 mt-2 w-44 bg-white rounded-xl border border-slate-100 shadow-lg py-1 z-50">

            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full"
            >
              <Settings size={15} className="text-slate-400" />
              Settings
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
            >
              <LogOut size={15} />
              Logout
            </button>

          </div>
        )}

      </div>

    </div>
  )
}
