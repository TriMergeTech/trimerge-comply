import { useUser } from '@/lib/context/UserContext'

export interface CurrentUser {
  name: string
  initials: string
  email: string
  role: string
  phone?: string
  companyName?: string
}

/**
 * Returns the current authenticated user.
 * Data is fetched once by UserProvider in AppShell and shared via context —
 * calling this hook does NOT trigger an additional API call.
 *
 * Returns null during the brief loading window after page mount, then the
 * real user once GET /api/auth/me resolves (~100ms).
 */
export function useCurrentUser(): CurrentUser | null {
  return useUser()
}
