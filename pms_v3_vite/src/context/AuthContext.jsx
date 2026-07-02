import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getAuth } from '../api/storage'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authApi.currentUser())

  // 监听其他标签页登出（storage 事件）以及 axios 拦截器强制跳转登录时同步状态
  useEffect(() => {
    const sync = () => setUser(authApi.currentUser())
    window.addEventListener('storage', sync)
    window.addEventListener('hashchange', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('hashchange', sync)
    }
  }, [])

  const login = useCallback(async (userName, password) => {
    const data = await authApi.login(userName, password)
    setUser({ userName: data.userName, role: data.role })
    return data
  }, [])

  const register = useCallback(async (userName, password, displayName) => {
    const data = await authApi.register(userName, password, displayName)
    setUser({ userName: data.userName, role: data.role })
    return data
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  const isAuthenticated = !!user || !!getAuth()

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内部使用')
  return ctx
}
