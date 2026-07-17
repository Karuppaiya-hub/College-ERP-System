import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

// ── helpers ──────────────────────────────────────────────
const setTokens = (access, refresh) => {
  localStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)
}
const clearTokens = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount — verify stored token by fetching /me/
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { setLoading(false); return }

    api.get('/auth/me/')
      .then(r => setUser(r.data))
      .catch(() => clearTokens())
      .finally(() => setLoading(false))
  }, [])

  /**
   * login(username, password, role?)
   * role is optional — if provided the backend validates it matches the user's role.
   * Returns the user object on success.
   */
  const login = useCallback(async (username, password, role = null) => {
    const payload = { username, password }
    if (role) payload.role = role

    const { data } = await api.post('/auth/login/', payload)
    // New response shape: { access, refresh, user }
    setTokens(data.access, data.refresh)
    setUser(data.user)
    return data.user
  }, [])

  /**
   * logout — blacklists the refresh token on the server, then clears local state.
   */
  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token')
    try {
      if (refresh) await api.post('/auth/logout/', { refresh })
    } catch { /* ignore network errors on logout */ }
    clearTokens()
    setUser(null)
  }, [])

  /**
   * updateProfile — patch the profile and refresh local user state.
   */
  const updateProfile = useCallback(async (data) => {
    const res = await api.patch('/auth/profile/', data)
    setUser(res.data)
    return res.data
  }, [])

  /**
   * changePassword
   */
  const changePassword = useCallback(async (old_password, new_password) => {
    await api.post('/auth/change-password/', { old_password, new_password })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
