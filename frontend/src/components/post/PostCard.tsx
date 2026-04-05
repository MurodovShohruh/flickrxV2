import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Post } from '../../types'
import { postsApi } from '../../api/posts'
import { useAuthStore } from '../../store/authStore'
import Avatar from '../ui/Avatar'
import CommentModal from './CommentModal'
import toast from 'react-hot-toast'
import { HiHeart, HiOutlineHeart, HiChatBubbleOvalLeft, HiPaperAirplane, HiBookmark, HiOutlineBookmark, HiEllipsisHorizontal } from 'react-icons/hi2'

interface Props { post: Post; onDelete?: (id: string) => void }

export default function PostCard({ post, onDelete }: Props) {
  const { user, isAuthenticated } = useAuthStore()
  const [liked, setLiked] = useState(post.is_liked)
  const [saved, setSaved] = useState(post.is_saved)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [showComments, setShowComments] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const isOwner = user?.id === post.author.id

  const handleLike = async () => {
    if (!isAuthenticated) return toast.error('Kirish kerak')
    setLiked(p => !p); setLikesCount(p => liked ? p - 1 : p + 1)
    try { await postsApi.like(post.id) }
    catch { setLiked(p => !p); setLikesCount(p => liked ? p + 1 : p - 1) }
  }

  const handleSave = async () => {
    if (!isAuthenticated) return toast.error('Kirish kerak')
    setSaved(p => !p)
    try { await postsApi.save(post.id) }
    catch { setSaved(p => !p) }
  }

  const handleShare = () => { navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`); toast.success('Havola nusxalandi') }

  const handleDelete = async () => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return
    try { await postsApi.delete(post.id); onDelete?.(post.id) }
    catch { toast.error('Xato') }
  }

  return (
    <>
      <article className="card-neon mb-4 overflow-hidden group">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <Link to={`/profile/${post.author.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Avatar user={post.author} size="sm" ring/>
            <div>
              <p className="font-semibold text-sm flex items-center gap-1">
                {post.author.username}
                {post.author.is_verified && <span className="text-neon-cyan text-xs" style={{ filter: 'drop-shadow(0 0 4px #00f5ff)' }}>✓</span>}
              </p>
              {post.location && <p className="text-white/40 text-xs">{post.location}</p>}
            </div>
          </Link>
          <div className="relative">
            <button onClick={() => setShowMenu(p => !p)} className="text-white/40 hover:text-neon-pink transition-colors p-1">
              <HiEllipsisHorizontal className="text-xl"/>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-dark-card border border-dark-border rounded-xl overflow-hidden z-10 min-w-[140px] shadow-neon-pink"
                onMouseLeave={() => setShowMenu(false)}>
                {isOwner && onDelete && (
                  <button onClick={handleDelete} className="w-full px-4 py-2.5 text-sm text-left text-red-400 hover:bg-dark-hover transition-colors">O'chirish</button>
                )}
                <button onClick={handleShare} className="w-full px-4 py-2.5 text-sm text-left hover:bg-dark-hover transition-colors">Ulashish</button>
              </div>
            )}
          </div>
        </div>

        {/* Media */}
        <div className="relative bg-dark overflow-hidden" onDoubleClick={handleLike}>
          {post.media_type === 'video'
            ? <video src={post.media_url} poster={post.thumbnail_url||undefined} controls className="w-full max-h-[600px] object-contain" preload="metadata"/>
            : <img src={post.media_url} alt={post.caption} className="w-full object-cover" loading="lazy"/>
          }
          {/* Neon glow on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ boxShadow: 'inset 0 0 40px rgba(255,45,120,0.05)' }}/>
        </div>

        {/* Actions */}
        <div className="px-4 pt-3 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-5">
              <button onClick={handleLike} className={`flex items-center gap-1.5 transition-all active:scale-90 ${liked ? 'text-neon-pink' : 'text-white/60 hover:text-white'}`}
                style={liked ? { filter: 'drop-shadow(0 0 6px #ff2d78)' } : undefined}>
                {liked ? <HiHeart className="text-2xl"/> : <HiOutlineHeart className="text-2xl"/>}
                <span className="text-sm font-medium">{likesCount}</span>
              </button>
              <button onClick={() => setShowComments(true)} className="flex items-center gap-1.5 text-white/60 hover:text-neon-cyan transition-colors">
                <HiChatBubbleOvalLeft className="text-2xl"/>
                <span className="text-sm font-medium">{post.comments_count}</span>
              </button>
              <button onClick={handleShare} className="text-white/60 hover:text-neon-purple transition-colors">
                <HiPaperAirplane className="text-xl"/>
              </button>
            </div>
            <button onClick={handleSave} className={`transition-all active:scale-90 ${saved ? 'text-neon-pink' : 'text-white/60 hover:text-white'}`}
              style={saved ? { filter: 'drop-shadow(0 0 6px #ff2d78)' } : undefined}>
              {saved ? <HiBookmark className="text-2xl"/> : <HiOutlineBookmark className="text-2xl"/>}
            </button>
          </div>

          {post.caption && (
            <p className="text-sm mb-1.5">
              <Link to={`/profile/${post.author.username}`} className="font-semibold mr-2 hover:text-neon-pink transition-colors">{post.author.username}</Link>
              <span className="text-white/80">{post.caption}</span>
            </p>
          )}
          {post.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {post.hashtags.map(t => <span key={t} className="text-neon-pink text-sm hover:text-neon-purple transition-colors cursor-pointer">#{t}</span>)}
            </div>
          )}
          {post.comments_count > 0 && (
            <button onClick={() => setShowComments(true)} className="text-white/30 text-sm hover:text-white/60 transition-colors">
              {post.comments_count} ta izohni ko'rish
            </button>
          )}
          <p className="text-white/25 text-xs mt-1 uppercase tracking-wider">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>
        </div>
      </article>

      {showComments && (
        <CommentModal post={{ ...post, is_liked: liked, likes_count: likesCount }} onClose={() => setShowComments(false)}/>
      )}
    </>
  )
}
