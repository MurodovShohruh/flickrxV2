export interface User {
  id: string; username: string; full_name: string; email?: string
  bio: string; phone?: string; website?: string
  profile_image_url: string | null
  followers_count: number; following_count: number; posts_count: number
  is_verified: boolean; is_private: boolean; is_admin?: boolean; is_following?: boolean
  created_at: string
}
export interface Post {
  id: string; author: User; media_type: 'video' | 'photo'
  media_url: string; thumbnail_url: string | null
  caption: string; hashtags: string[]; location: string
  likes_count: number; comments_count: number; views_count: number; saves_count: number
  duration_sec: number | null; status: string
  is_liked: boolean; is_saved: boolean; created_at: string
}
export interface Comment {
  id: string; author: User; text: string
  likes_count: number; replies_count: number; parent: string | null; created_at: string
}
export interface ChatMessage {
  id: string; sender: User; sender_id?: string; sender_username?: string
  sender_profile_image?: string | null
  message_type: 'text' | 'image' | 'video'
  text: string; media_url: string | null
  is_read: boolean; is_mine: boolean; created_at: string
}
export interface Conversation {
  partner: User
  last_message: { text: string; message_type: string; is_mine: boolean; created_at: string } | null
  unread_count: number
}
export interface Notification {
  id: string; type: string; content: string
  actor: User | null; is_read: boolean; created_at: string
}
