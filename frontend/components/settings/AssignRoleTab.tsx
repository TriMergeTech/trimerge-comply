'use client'

// Assign Role tab component
// Admin only — allows assigning roles to users

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ChevronDown } from 'lucide-react'
import { updateUserRole, getUsers } from '@/lib/api/auth'
import { getAccessToken } from '@/lib/authTokens'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Role options matching backend enum
const roleOptions = ['viewer', 'analyst', 'admin'] as const
type Role = typeof roleOptions[number]

// User type from API
interface User {
  _id: string
  name: string
  email: string
  role: string
  companyName?: string
}

export default function AssignRoleTab() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role>('analyst')
  const [loading, setLoading] = useState(false)
  const [usersLoading, setUsersLoading] = useState(true)

  // Fetch all users on mount
  useEffect(() => {
    async function fetchUsers() {
      const token = getAccessToken()
      if (!token) return
      try {
        const res = await getUsers(token)
        setUsers(res.users)
      } catch (err) {
        toast.error('Failed to load users')
        console.error(err)
      } finally {
        setUsersLoading(false)
      }
    }
    fetchUsers()
  }, [])

  async function handleAssignRole() {
    if (!selectedUser) {
      toast.error('Please select a user')
      return
    }

    const token = getAccessToken()
    if (!token) return

    setLoading(true)
    try {
      await updateUserRole(selectedUser._id, selectedRole, token)
      toast.success(`Role updated to ${selectedRole} for ${selectedUser.name}`)
      setSelectedUser(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update role')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">

      {/* Section header */}
      <div>
        <h3 className="text-slate-800 font-medium text-sm mb-1">Assign User Role</h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          Select a user and assign a role. Admin access required.
        </p>
      </div>

      {/* User and Role side by side */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">

        {/* Left — User selector */}
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Select User
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-between gap-2 text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-white text-slate-600 hover:bg-slate-50 transition-colors w-full">
              {usersLoading
                ? 'Loading users...'
                : selectedUser
                  ? `${selectedUser.name} (${selectedUser.email})`
                  : 'Select a user'}
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80">
              {users.map((user) => (
                <DropdownMenuItem
                  key={user._id}
                  onClick={() => {
                    setSelectedUser(user)
                    setSelectedRole(user.role as Role)
                  }}
                  className="cursor-pointer flex flex-col items-start gap-0.5"
                >
                  <span className="text-slate-700 font-medium">{user.name}</span>
                  <span className="text-slate-400 text-xs">{user.email} · {user.role}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right — Role selector */}
        <div className="flex flex-col gap-1.5 w-full sm:w-48">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Assign Role
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-between gap-2 text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-white text-slate-600 hover:bg-slate-50 transition-colors w-full">
              <span className="capitalize">{selectedRole}</span>
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-48"
              side="bottom"
              align="start"
            >
              {roleOptions.map((role) => (
                <DropdownMenuItem
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className="cursor-pointer capitalize"
                >
                  {role}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>

      {/* Assign button — bottom right */}
      <div className="flex items-center justify-end pt-2 border-t border-slate-100">
        <button
          onClick={handleAssignRole}
          disabled={loading || !selectedUser}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? 'Assigning…' : 'Assign Role'}
        </button>
      </div>

    </div>
  )
}