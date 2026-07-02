import axios from 'axios'
import api from './axios'
import { saveAuth, clearAuth, getAuth } from './storage'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

export async function login(userName, password) {
  const res = await axios.post(`${baseURL}/auth/login`, { userName, password })
  saveAuth(res.data)
  return res.data
}

export async function register(userName, password, displayName) {
  const res = await axios.post(`${baseURL}/auth/register`, { userName, password, displayName })
  saveAuth(res.data)
  return res.data
}

export async function logout() {
  const auth = getAuth()
  if (auth?.refreshToken) {
    try {
      await api.post('/auth/logout', { refreshToken: auth.refreshToken })
    } catch {
      // Ignore logout request failure, still clear local tokens
    }
  }
  clearAuth()
}

export function currentUser() {
  const auth = getAuth()
  return auth ? { userName: auth.userName, role: auth.role } : null
}
