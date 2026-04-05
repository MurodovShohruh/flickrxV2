import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Post, Comment } from '../../types'
import { postsApi } from '../../api/posts'
import { useAuthStore } from '../../store/authStore'
import Avatar from '../ui/Avatar'
import { HiHeart, HiOutlineHeart, HiXMark } from 'react-icons/hi2'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

interface Props { post: Post; onClose: () => void; onLike?: () => void }

export default function CommentModal({ post, onClose, onLike }: Props) {
  const { user, isAuthenticated } = useAuthStore()
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(post.is_liked)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    postsApi.getComments(post.id).then(d => setComments(Array.isArray(d) ? d : d?.results || [])).finally(() => setLoading(false))
  }, [post.id])

  const handleLike = async () => {
    setLiked(p => !p); setLikesCount(p => liked ? p - 1 : p + 1)
    try { await postsApi.like(post.id); onLike?.() }
    catch { setLiked(p => !p); setLikesCount(p => liked ? p + 1 : p - 1) }
  }

  const handleComment = async () => {
    if (!text.trim()) return
    try {
      const c = await postsApi.addComment(post.id, text)
      setComments(p => [c, ...p]); setText('')
    } catch { toast.error('Xato yuz berdi') }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm" onClick={onClose}>
      <div className="flex w-full max-w-5xl max-h-[92vh] rounded-xl overflow-hidden" style={{ boxShadow: '0 0 80px rgba(255,45,120,0.25), 0 0 160px rgba(191,0,255,0.15)' }}
        onClick={e => e.stopPropagation()}>

        {/* Media */}
        <div className="flex-1 bg-black flex items-center justify-center relative min-w-0">
          {post.media_type === 'video'
            ? <video src={post.media_url} poster={post.thumbnail_url||undefined} controls className="max-h-[92vh] w-full object-contain" autoPlay/>
            : <img src={post.media_url} alt="" className="max-h-[92vh] w-full object-contain"/>
          }
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:text-neon-pink transition-colors">
            <HiXMark className="text-lg"/>
          </button>
        </div>

        {/* Right panel */}
        <div className="w-96 flex-shrink-0 flex flex-col bg-dark-card border-l border-dark-border">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-border">
            <Avatar user={post.author} size="sm" ring/>
            <Link to={`/profile/${post.author.username}`} onClick={onClose} className="font-semibold text-sm hover:text-neon-pink transition-colors">
              {post.author.username}
            </Link>
            {post.author.is_verified && <span className="text-neon-cyan text-xs">✓</span>}
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {post.caption && (
              <div className="flex gap-3">
                <Avatar user={post.author} size="sm"/>
                <div>
                  <span className="font-semibold text-sm mr-2">{post.author.username}</span>
                  <span className="text-sm text-white/80">{post.caption}</span>
                  {post.hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {post.hashtags.map(t => <span key={t} className="text-neon-pink text-xs">#{t}</span>)}
                    </div>
                  )}
                </div>
              </div>
            )}
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 rounded-full border-2 border-neon-pink border-t-transparent animate-spin"/>
              </div>
            ) : comments.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-6">Hali izoh yo'q</p>
            ) : comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <Avatar user={c.author} size="sm"/>
                <div className="flex-1">
                  <span className="font-semibold text-sm mr-2">{c.author.username}</span>
                  <span className="text-sm text-white/80">{c.text}</span>
                  <p className="text-white/30 text-xs mt-0.5">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="border-t border-dark-border p-4 space-y-3">
            <div className="flex items-center gap-4">
              <button onClick={handleLike} className={`transition-all active:scale-90 ${liked ? 'text-neon-pink' : 'text-white/60 hover:text-white'}`}
                style={liked ? { filter: 'drop-shadow(0 0 6px #ff2d78)' } : undefined}>
                {liked ? <HiHeart className="text-2xl"/> : <HiOutlineHeart className="text-2xl"/>}
              </button>
            </div>
            {likesCount > 0 && <p className="text-sm font-semibold">{likesCount.toLocaleString()} ta like</p>}
            <p className="text-white/30 text-xs uppercase tracking-wide">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>

          {/* Comment input */}
          {isAuthenticated && (
            <div className="flex items-center gap-3 px-4 py-3 border-t border-dark-border">
              <input ref={inputRef} value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()}
                placeholder="Izoh qo'shing..." className="flex-1 bg-transparent text-sm outline-none placeholder-white/25"/>
              <button onClick={handleComment} disabled={!text.trim()} className="text-neon-pink font-semibold text-sm disabled:opacity-30 hover:text-neon-purple transition-colors">
                Yuborish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
