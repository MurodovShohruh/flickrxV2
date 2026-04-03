import { api } from './axios'
export const notificationsApi = {
  getAll: () => api.get('/notifications/').then(r => r.data.data),
  deleteAll: () => api.delete('/notifications/'),
}
