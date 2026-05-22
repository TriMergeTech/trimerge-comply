import { getAccessToken } from '@/lib/authTokens'

export interface CurrentUser {
  name: string      // e.g. "Ibrahim Chhapra"
  initials: string  // e.g. "IC"
  email: string
  role: string
}

/**
 * Decodes the stored JWT access token and returns the current user's
 * name and initials. No API call needed — the name is embedded in the token.
 *
 * Returns null if there is no token or if it cannot be decoded.
 */
export function useCurrentUser(): CurrentUser | null {
  const token = getAccessToken()
  if (!token) return null

  try {
    // JWT payload is the middle segment, base64url-encoded
    const payload = JSON.parse(atob(token.split('.')[1]))

    const name: string   = payload.name  ?? ''
    const email: string  = payload.email ?? ''
    const role: string   = payload.role  ?? 'analyst'

    // Derive initials: first letter of each word in the name, max 2
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w: string) => w[0].toUpperCase())
      .join('')

    return { name, email, role, initials }
  } catch {
    return null
  }
}
