import { create } from 'zustand'
import { User } from '../types'
import { authApi } from '../api/auth'
interface AuthState {
  user: User | null; isAuthenticated: boolean; isLoading: boolean
  login: (data: any) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
  setUser: (u: User) => void
}
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  login: async (data) => {
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    set({ isAuthenticated: true, user: data.user || null })
    if (!data.user) await get().fetchMe()
  },
  logout: () => {
    const r = localStorage.getItem('refresh_token')
    if (r) authApi.logout(r).catch(() => {})
    localStorage.clear()
    set({ user: null, isAuthenticated: false })
  },
  fetchMe: async () => {
    try {
      set({ isLoading: true })
      const user = await authApi.getMe()
      set({ user, isAuthenticated: true })
    } catch { localStorage.clear(); set({ user: null, isAuthenticated: false }) }
    finally { set({ isLoading: false }) }
  },
  setUser: (user) => set({ user }),
}))
