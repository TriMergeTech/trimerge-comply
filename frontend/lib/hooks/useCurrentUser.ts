import { useState, useEffect } from 'react'
import { getAccessToken } from '@/lib/authTokens'

export interface CurrentUser {
  name: string      // e.g. "Ibrahim Chhapra"
  initials: string  // e.g. "IC"
  email: string
  role: string
}

/**
 * Reads the current user's identity from the stored JWT access token.
 * Uses useEffect so localStorage is only read after hydration — this prevents
 * the server/client HTML mismatch (hydration error) that occurs when reading
 * localStorage synchronously during render.
 *
 * Returns null on first render (server + hydration pass), then updates to
 * the real user once the component mounts in the browser.
 */
export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) return

    try {
      // JWT payload is the middle segment, base64url-encoded
      const payload = JSON.parse(atob(token.split('.')[1]))

      const name: string  = payload.name  ?? ''
      const email: string = payload.email ?? ''
      const role: string  = payload.role  ?? 'analyst'

      // Derive initials: first letter of each word in the name, max 2
      const initials = name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w: string) => w[0].toUpperCase())
        .join('')

      setUser({ name, email, role, initials })
    } catch {
      setUser(null)
    }
  }, [])

  return user
}
