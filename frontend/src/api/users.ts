import { api } from './axios'
export const usersApi = {
  getMe: () => api.get('/users/me/').then(r => r.data.data),
  updateMe: (d: any) => api.put('/users/me/', d).then(r => r.data.data),
  updateAvatar: (file: File) => {
    const fd = new FormData(); fd.append('file', file)
    return api.post('/users/me/avatar/', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data.data)
  },
  getProfile: (username: string) => api.get(`/users/${username}/`).then(r => r.data.data),
  follow: (id: string) => api.post(`/users/${id}/follow/`).then(r => r.data.data),
  unfollow: (id: string) => api.delete(`/users/${id}/follow/`).then(r => r.data.data),
  getFollowers: (id: string) => api.get(`/users/${id}/followers/`).then(r => r.data.data),
  getFollowing: (id: string) => api.get(`/users/${id}/following/`).then(r => r.data.data),
  search: (q: string) => api.get(`/users/search/?q=${encodeURIComponent(q)}`).then(r => r.data.data),
}
