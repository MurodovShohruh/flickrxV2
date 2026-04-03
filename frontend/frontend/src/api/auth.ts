import { api } from './axios'
export const authApi = {
  register: (d: any) => api.post('/auth/register/', d).then(r => r.data.data),
  login: (d: any) => api.post('/auth/login/', d).then(r => r.data.data),
  logout: (refresh: string) => api.post('/auth/logout/', { refresh }),
  getMe: () => api.get('/users/me/').then(r => r.data.data),
}
