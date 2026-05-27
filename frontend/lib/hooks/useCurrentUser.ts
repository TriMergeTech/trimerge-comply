import { useState, useEffect } from 'react'
import { getAccessToken } from '@/lib/authTokens'
import { getMe } from '@/lib/api/auth'

export interface CurrentUser {
  name: string       // e.g. "Ibrahim Chhapra"
  initials: string   // e.g. "IC"
  email: string
  role: string
  phone?: string       // from /api/auth/me
  companyName?: string // from /api/auth/me
}

/**
 * Fetches the current user from GET /api/auth/me using the stored access token.
 * Using the API (rather than decoding the JWT payload) ensures real-time,
 * authoritative data — even for users registered before the JWT payload
 * included the `name` field, or on live servers where the token may differ.
 *
 * Uses useEffect so the fetch only runs after hydration (browser-only),
 * preventing the server/client HTML mismatch that causes hydration errors.
 *
 * Returns null on the first render (server + hydration pass), then the real
 * user once the component mounts and the API call resolves.
 */
export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) return

    getMe(token)
      .then(({ user: apiUser }) => {
        const name = apiUser.name ?? ''
        const initials = name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((w: string) => w[0].toUpperCase())
          .join('')

        setUser({
          name,
          initials,
          email: apiUser.email,
          role: apiUser.role,
          phone: apiUser.phone,
          companyName: apiUser.companyName,
        })
      })
      .catch(() => setUser(null))
  }, [])

  return user
}
