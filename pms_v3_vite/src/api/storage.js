/**
 * Authentication token local storage wrapper.
 * Structure: { accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt, userName, role }
 * Time fields stored as ISO strings (UTC time returned by backend).
 */
const KEY = 'pms_auth'

export function saveAuth(auth) {
  localStorage.setItem(KEY, JSON.stringify(auth))
}

export function getAuth() {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearAuth() {
  localStorage.removeItem(KEY)
}

export function isAccessTokenExpired(auth) {
  if (!auth?.accessTokenExpiresAt) return true
  // Consider expired 15 seconds early to account for request round-trip time
  return Date.now() >= new Date(auth.accessTokenExpiresAt).getTime() - 15000
}

export function isRefreshTokenExpired(auth) {
  if (!auth?.refreshTokenExpiresAt) return true
  return Date.now() >= new Date(auth.refreshTokenExpiresAt).getTime()
}
