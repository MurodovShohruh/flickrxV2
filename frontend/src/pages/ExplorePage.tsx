import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { postsApi } from '../api/posts'
import { usersApi } from '../api/users'
import { Post, User } from '../types'
import Avatar from '../components/ui/Avatar'
import { HiMagnifyingGlass, HiXMark, HiPlay } from 'react-icons/hi2'

export default function ExplorePage() {
  const [query, setQuery] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [trending, setTrending] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const timer = useRef<any>(null)

  useEffect(() => { postsApi.getTrending().then(d => setTrending(d?.results || (Array.isArray(d) ? d : []))) }, [])

  useEffect(() => {
    clearTimeout(timer.current)
    if (!query.trim()) { setPosts([]); setUsers([]); return }
    timer.current = setTimeout(async () => {
      setLoading(true)
      try {
        const [sr, ur] = await Promise.all([postsApi.search(query), usersApi.search(query)])
        setPosts(sr?.posts || []); setUsers(ur || [])
      } finally { setLoading(false) }
    }, 400)
  }, [query])

  const isSearching = query.trim().length > 0

  return (
    <div>
      {/* Search */}
      <div className="sticky top-0 z-10 px-4 py-3" style={{ background: 'rgba(6,6,8,0.95)', borderBottom: '1px solid rgba(255,45,120,0.1)', backdropFilter: 'blur(20px)' }}>
        <div className="relative flex items-center">
          <HiMagnifyingGlass className="absolute left-3 text-neon-pink text-lg" style={{ filter: 'drop-shadow(0 0 4px #ff2d78)' }}/>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Hashtag, username yoki kalit so'z..."
            className="input-neon pl-10 pr-10"/>
          {query && <button onClick={() => setQuery('')} className="absolute right-3 text-white/40 hover:text-neon-pink transition-colors"><HiXMark/></button>}
        </div>
      </div>

      {isSearching ? (
        <div>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 rounded-full border-2 border-neon-pink border-t-transparent animate-spin" style={{ filter: 'drop-shadow(0 0 6px #ff2d78)' }}/>
            </div>
          ) : (
            <>
              {users.length > 0 && (
                <div className="border-b border-dark-border">
                  {users.map(u => (
                    <Link key={u.id} to={`/profile/${u.username}`} className="flex items-center gap-3 px-4 py-3 hover:bg-dark-hover transition-colors">
                      <Avatar user={u} size="md" ring/>
                      <div>
                        <p className="font-semibold text-sm flex items-center gap-1">{u.username}
                          {u.is_verified && <span className="text-neon-cyan text-xs">✓</span>}
                        </p>
                        <p className="text-white/40 text-xs">{u.full_name} · {u.followers_count} follower</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {posts.length > 0 ? (
                <div className="grid grid-cols-3 gap-0.5 p-0.5">
                  {posts.map(p => (
                    <Link key={p.id} to={`/post/${p.id}`} className="relative aspect-square overflow-hidden group">
                      {p.media_type === 'video'
                        ? <><img src={p.thumbnail_url || p.media_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                            <HiPlay className="absolute top-2 right-2 text-white drop-shadow-lg"/></>
                        : <img src={p.media_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                      }
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <span className="text-white text-sm font-semibold" style={{ textShadow: '0 0 10px #ff2d78' }}>❤️ {p.likes_count}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : users.length === 0 && <p className="text-center text-white/30 py-10">Hech narsa topilmadi</p>}
            </>
          )}
        </div>
      ) : (
        <>
          <div className="px-4 py-3 flex items-center gap-2">
            <span className="font-display text-lg tracking-wider text-white/60">TRENDING</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(255,45,120,0.4), transparent)' }}/>
          </div>
          <div className="grid grid-cols-3 gap-0.5 px-0.5">
            {trending.map((p, i) => (
              <Link key={p.id} to={`/post/${p.id}`}
                className={`relative overflow-hidden group ${i % 7 === 0 ? 'col-span-2 row-span-2' : ''}`}>
                <div className="aspect-square">
                  {p.media_type === 'video'
                    ? <><img src={p.thumbnail_url || p.media_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                        <HiPlay className="absolute top-2 right-2 text-white drop-shadow-lg"/></>
                    : <img src={p.media_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
                  }
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3"
                    style={{ background: 'linear-gradient(135deg, rgba(255,45,120,0.3), rgba(191,0,255,0.3))' }}>
                    <span className="text-white font-semibold text-sm">❤️ {p.likes_count}</span>
                    <span className="text-white font-semibold text-sm">💬 {p.comments_count}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
