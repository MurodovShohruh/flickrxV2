import { api } from './axios'
export const chatApi = {
  getConversations: () => api.get('/chat/conversations/').then(r => r.data.data),
  getMessages: (partnerId: string, page = 1) => api.get(`/chat/messages/${partnerId}/?page=${page}`).then(r => r.data.data),
  sendMedia: (partnerId: string, file: File) => {
    const fd = new FormData(); fd.append('file', file)
    return api.post(`/chat/messages/${partnerId}/media/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data.data)
  },
}
