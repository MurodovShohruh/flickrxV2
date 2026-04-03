import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { postsApi } from '../api/posts'
import { Post } from '../types'
import PostCard from '../components/post/PostCard'
import { useAuthStore } from '../store/authStore'
import Logo from '../components/ui/Logo'
import toast from 'react-hot-toast'

export default function HomePage() {
  const { isAuthenticated } = useAuthStore()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)

  useEffect(() => { loadFeed(1, true) }, [isAuthenticated])

  const loadFeed = async (p: number, replace = false) => {
    try {
      p === 1 && setLoading(true)
      const fn = isAuthenticated ? postsApi.getFeed : postsApi.getTrending
      const data = await fn(p)
      // Backend { results: [...], page: N } qaytaradi
      const results = data?.results || (Array.isArray(data) ? data : [])
      setPosts(prev => replace ? results : [...prev, ...results])
      setHasNext(!!data?.next)
      setPage(p)
    } catch { toast.error('Yuklab bo\'lmadi') }
    finally { setLoading(false) }
  }

  const handleDelete = (id: string) => setPosts(prev => prev.filter(p => p.id !== id))

  if (loading) return (
    <div className="pt-4">
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b mb-4"
        style={{ borderColor: 'rgba(255,45,120,0.15)' }}>
        <Logo size="sm"/>
      </div>
      {[1,2].map(i => (
        <div key={i} className="card-neon mb-4 overflow-hidden animate-pulse mx-4">
          <div className="flex gap-3 p-4">
            <div className="w-10 h-10 rounded-full bg-dark-border"/>
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 bg-dark-border rounded w-24"/>
              <div className="h-2 bg-dark-border rounded w-16"/>
            </div>
          </div>
          <div className="aspect-square bg-dark-border"/>
          <div className="p-4"><div className="h-3 bg-dark-border rounded w-32"/></div>
        </div>
      ))}
    </div>
  )

  return (
    <div>
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b"
        style={{ background: 'rgba(6,6,8,0.95)', borderColor: 'rgba(255,45,120,0.15)', backdropFilter: 'blur(20px)' }}>
        <Logo size="sm"/>
        <span className="text-xs text-white/30 font-mono tracking-widest">
          {isAuthenticated ? 'FEED' : 'TRENDING'}
        </span>
      </div>

      <div className="pt-2">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-20 h-20 rounded-full mb-6 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(255,45,120,0.15), rgba(191,0,255,0.15))', border: '1px solid rgba(255,45,120,0.3)' }}>
              <span className="text-3xl">📸</span>
            </div>
            <h3 className="font-display text-2xl tracking-wider mb-2 text-neon">YANGI KONTENTLAR</h3>
            <p className="text-white/40 text-sm mb-6">
              {isAuthenticated ? 'Odamlarni kuzating va postlarini ko\'ring' : 'Kirish qiling va shaxsiylashtirilgan feed ko\'ring'}
            </p>
            {!isAuthenticated
              ? <Link to="/login" className="btn-neon px-8 py-3">KIRISH</Link>
              : <Link to="/explore" className="btn-neon px-8 py-3">EXPLORE</Link>
            }
          </div>
        ) : (
          <>
            {posts.map(post => (
              <div key={post.id} className="px-4">
                <PostCard post={post} onDelete={handleDelete}/>
              </div>
            ))}
            {hasNext && (
              <div className="flex justify-center py-6">
                <button onClick={() => loadFeed(page + 1)} className="btn-ghost-neon px-8">
                  Ko'proq yuklash
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
