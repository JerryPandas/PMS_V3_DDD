import axios from 'axios'
import { getAuth, saveAuth, clearAuth, isAccessTokenExpired, isRefreshTokenExpired } from './storage'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({ baseURL })

// 跳转登录页（使用 hash 路由）并清空本地令牌
function forceLogin() {
  clearAuth()
  if (window.location.hash !== '#/login') {
    window.location.hash = '#/login'
  }
}

// 用刷新令牌换取新的 access/refresh token 对（旋转刷新）
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

// 并发请求期间只发起一次刷新请求，其余请求排队等待结果
let refreshPromise = null
async function getValidAccessToken() {
  const auth = getAuth()
  if (!auth) return null

  if (!isAccessTokenExpired(auth)) {
    return auth.accessToken
  }

  // AccessToken 已过期（或即将过期）：检查 RefreshToken 是否仍然有效
  if (isRefreshTokenExpired(auth)) {
    // RefreshToken 也过期（默认 1 天）——必须重新登录
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

// 请求拦截器：主动检查并刷新即将过期的 AccessToken
api.interceptors.request.use(async (config) => {
  if (!config.skipAuth) {
    const token = await getValidAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// 响应拦截器：兜底处理 401（例如令牌被服务端提前吊销的情况）
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
