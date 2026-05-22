'use client'

import { Bell } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'

export default function UserInfo() {
  const user = useCurrentUser()

  return (
    <div className="flex items-center gap-4">

      {/* Notification bell */}
      <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
        <Bell size={20} className="text-slate-500" />
        {/* Notification dot — shows when there are unread notifications */}
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      {/* User avatar and info */}
      <div className="flex items-center gap-3">
        <Avatar className="w-9 h-9">
          <AvatarFallback className="bg-indigo-600 text-white text-sm font-medium">
            {user?.initials ?? '?'}
          </AvatarFallback>
        </Avatar>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-800">{user?.name ?? '—'}</p>
          <p className="text-xs text-slate-400">{user?.role ?? '—'}</p>
        </div>
      </div>

    </div>
  )
}
