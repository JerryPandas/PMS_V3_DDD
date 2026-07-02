import axios from 'axios'
import { getAuth, saveAuth, clearAuth, isAccessTokenExpired, isRefreshTokenExpired } from './storage'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({ baseURL })

// Redirect to login page (using hash routing) and clear local tokens
function forceLogin() {
  clearAuth()
  if (window.location.hash !== '#/login') {
    window.location.hash = '#/login'
  }
}

// Exchange refresh token for new access/refresh token pair (rotation)
async function performRefresh(refreshToken) {
  const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken })
  const data = res.data
  saveAuth({
    accessToken: data.accessToken,
    accessTokenExpiresAt: data.accessTokenExpiresAt,
    refreshToken: data.refreshToken,
    refreshTokenExpiresAt: data.refreshTokenExpiresAt,
    userName: data.userName,
    role: data.role
  })
  return data.accessToken
}

// Only one refresh request at a time during concurrent requests; others wait for the result
let refreshPromise = null
async function getValidAccessToken() {
  const auth = getAuth()
  if (!auth) return null

  if (!isAccessTokenExpired(auth)) {
    return auth.accessToken
  }

  // AccessToken expired (or about to expire): check if RefreshToken is still valid
  if (isRefreshTokenExpired(auth)) {
    // RefreshToken also expired (default 1 day) — must re-login
    forceLogin()
    return null
  }

  if (!refreshPromise) {
    refreshPromise = performRefresh(auth.refreshToken)
      .catch((err) => {
        forceLogin()
        throw err
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

// Request interceptor: proactively check and refresh expiring AccessToken
api.interceptors.request.use(async (config) => {
  if (!config.skipAuth) {
    const token = await getValidAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Response interceptor: fallback handling of 401 (e.g., token revoked by server)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry && !original.skipAuth) {
      original._retry = true
      const auth = getAuth()
      if (auth && !isRefreshTokenExpired(auth)) {
        try {
          const token = await getValidAccessToken()
          if (token) {
            original.headers.Authorization = `Bearer ${token}`
            return api(original)
          }
        } catch {
          // fallthrough to forceLogin below
        }
      }
      forceLogin()
    }
    return Promise.reject(error)
  }
)

export default api
