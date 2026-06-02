'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { getAccessToken } from '@/lib/authTokens'
import { getMe } from '@/lib/api/auth'
import type { CurrentUser } from '@/lib/hooks/useCurrentUser'

const UserContext = createContext<CurrentUser | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) return

    getMe(token)
      .then(({ user: u }) => {
        const name = u.name ?? ''
        const initials = name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((w: string) => w[0].toUpperCase())
          .join('')

        setUser({
          name,
          initials,
          email: u.email,
          role: u.role,
          phone: u.phone,
          companyName: u.companyName,
        })
      })
      .catch(() => setUser(null))
  }, [])

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export function useUser(): CurrentUser | null {
  return useContext(UserContext)
}
