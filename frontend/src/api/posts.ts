import { api } from './axios'

export const postsApi = {
  getFeed: (page = 1) =>
    api.get(`/posts/feed/?page=${page}`).then(r => r.data.data),

  getTrending: (page = 1) =>
    api.get(`/posts/trending/?page=${page}`).then(r => r.data.data),

  search: (q: string) =>
    api.get(`/posts/search/?q=${encodeURIComponent(q)}`).then(r => r.data.data),

  getPost: (id: string) =>
    api.get(`/posts/${id}/`).then(r => r.data.data),

  create: (fd: FormData) =>
    api.post('/posts/create/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data.data),

  update: (id: string, d: any) =>
    api.put(`/posts/${id}/`, d).then(r => r.data.data),

  delete: (id: string) =>
    api.delete(`/posts/${id}/`),

  like: (id: string) =>
    api.post(`/interactions/posts/${id}/like/`).then(r => r.data.data),

  save: (id: string) =>
    api.post(`/interactions/posts/${id}/save/`).then(r => r.data.data),

  getComments: (id: string, page = 1) =>
    api.get(`/interactions/posts/${id}/comments/?page=${page}`).then(r => r.data.data),

  addComment: (id: string, text: string, parent_id?: string) =>
    api.post(`/interactions/posts/${id}/comments/`, { text, parent_id }).then(r => r.data.data),

  getUserPosts: (username: string, page = 1) =>
    api.get(`/posts/user/${username}/?page=${page}`).then(r => r.data.data),

  getSaved: (page = 1) =>
    api.get(`/posts/saved/?page=${page}`).then(r => r.data.data),
}
