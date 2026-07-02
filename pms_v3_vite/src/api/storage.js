/**
 * 认证令牌本地存储封装。
 * 结构: { accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt, userName, role }
 * 时间字段统一保存为 ISO 字符串（后端返回的 UTC 时间）。
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
  // 提前 15 秒判定过期，留出请求往返时间余量
  return Date.now() >= new Date(auth.accessTokenExpiresAt).getTime() - 15000
}

export function isRefreshTokenExpired(auth) {
  if (!auth?.refreshTokenExpiresAt) return true
  return Date.now() >= new Date(auth.refreshTokenExpiresAt).getTime()
}
