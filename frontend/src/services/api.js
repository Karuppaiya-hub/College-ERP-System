import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// ── Request interceptor — attach Bearer token ──────────────
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor — silent token refresh on 401 ─────
let isRefreshing = false
let failedQueue  = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token))
  failedQueue = []
}

const SKIP_REFRESH = ['/auth/login/', '/auth/token/refresh/', '/auth/logout/']

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    const url = original?.url || ''

    // Skip refresh for auth endpoints or already-retried requests
    if (
      err.response?.status !== 401 ||
      original._retry ||
      SKIP_REFRESH.some(path => url.includes(path))
    ) {
      return Promise.reject(err)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(token => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }

    original._retry = true
    isRefreshing    = true

    const refresh = localStorage.getItem('refresh_token')
    if (!refresh) {
      isRefreshing = false
      localStorage.removeItem('access_token')
      window.location.href = '/login'
      return Promise.reject(err)
    }

    try {
      const { data } = await axios.post('/api/auth/token/refresh/', { refresh })
      localStorage.setItem('access_token', data.access)
      if (data.refresh) localStorage.setItem('refresh_token', data.refresh)
      api.defaults.headers.common.Authorization = `Bearer ${data.access}`
      original.headers.Authorization = `Bearer ${data.access}`
      processQueue(null, data.access)
      return api(original)
    } catch (refreshErr) {
      processQueue(refreshErr, null)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
      return Promise.reject(refreshErr)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
