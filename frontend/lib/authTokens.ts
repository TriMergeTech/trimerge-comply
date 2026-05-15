const ACCESS_KEY = "tc_access";
const REFRESH_KEY = "tc_refresh";

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  // Set a cookie so Next.js middleware can detect auth state (middleware can't read localStorage)
  document.cookie = "tc_session=1; path=/; max-age=604800; SameSite=Lax";
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  document.cookie = "tc_session=; path=/; max-age=0";
}
