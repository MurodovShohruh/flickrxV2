import axios from 'axios'
const BASE = import.meta.env.VITE_API_URL || '/api/v1'
export const api = axios.create({ baseURL: BASE })
api.interceptors.request.use(c => {
  const t = localStorage.getItem('access_token')
  if (t) c.headers.Authorization = `Bearer ${t}`
  return c
})
api.interceptors.response.use(r => r, async err => {
  const orig = err.config
  if (err.response?.status === 401 && !orig._retry) {
    orig._retry = true
    const refresh = localStorage.getItem('refresh_token')
    if (refresh) {
      try {
        const { data } = await axios.post(`${BASE}/auth/refresh/`, { refresh })
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)
        orig.headers.Authorization = `Bearer ${data.access}`
        return api(orig)
      } catch { localStorage.clear(); window.location.href = '/login' }
    } else { localStorage.clear(); window.location.href = '/login' }
  }
  return Promise.reject(err)
})
