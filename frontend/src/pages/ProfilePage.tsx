import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { usersApi } from '../api/users'
import { postsApi } from '../api/posts'
import { useAuthStore } from '../store/authStore'
import { User, Post } from '../types'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import CommentModal from '../components/post/CommentModal'
import { HiPlay, HiCog6Tooth, HiCamera } from 'react-icons/hi2'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const { user: me, setUser, logout } = useAuthStore()
  const [profile, setProfile] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'posts'|'saved'>('posts')
  const [showEdit, setShowEdit] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const avatarRef = useRef<HTMLInputElement>(null)
  const isMe = me?.username === username

  const { register, handleSubmit, reset } = useForm<any>()

  useEffect(() => { if (username) load() }, [username])

  const load = async () => {
    try {
      setLoading(true)
      const data = await usersApi.getProfile(username!)
      setProfile(data)
      reset({ username: data.username, full_name: data.full_name, bio: data.bio, phone: data.phone || '', website: data.website || '' })
      const pd = await postsApi.getUserPosts(username!)
      setPosts(pd?.results || (Array.isArray(pd) ? pd : []))
    } catch { toast.error('Profil topilmadi') }
    finally { setLoading(false) }
  }

  const handleFollow = async () => {
    if (!profile) return
    try {
      if (profile.is_following) {
        await usersApi.unfollow(profile.id)
        setProfile(p => p ? { ...p, is_following: false, followers_count: p.followers_count - 1 } : p)
      } else {
        await usersApi.follow(profile.id)
        setProfile(p => p ? { ...p, is_following: true, followers_count: p.followers_count + 1 } : p)
      }
    } catch (e: any) { toast.error(e.response?.data?.error?.detail || 'Xato') }
  }

  const handleSaveProfile = async (data: any) => {
    try {
      const updated = await usersApi.updateMe(data)
      setUser(updated); setProfile(updated); setShowEdit(false)
      toast.success('Profil yangilandi')
      if (data.username !== me?.username) navigate(`/profile/${data.username}`)
    } catch (e: any) {
      const err = e.response?.data?.error
      toast.error(typeof err === 'object' ? Object.values(err).flat().join(', ') : 'Xato')
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    try { const u = await usersApi.updateAvatar(file); setUser(u); setProfile(u); toast.success('Rasm yangilandi') }
    catch { toast.error('Xato') }
  }

  if (loading) return (
    <div className="animate-pulse p-6">
      <div className="flex items-center gap-8 mb-8">
        <div className="w-24 h-24 rounded-full bg-dark-border"/>
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-dark-border rounded w-32"/>
          <div className="flex gap-6"><div className="h-3 bg-dark-border rounded w-16"/><div className="h-3 bg-dark-border rounded w-16"/></div>
        </div>
      </div>
    </div>
  )

  if (!profile) return <div className="text-center py-20 text-white/30">Profil topilmadi</div>

  return (
    <div>
      {/* Cover glow */}
      <div className="h-32 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,45,120,0.15), rgba(191,0,255,0.1), rgba(0,245,255,0.08))' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,45,120,0.2), transparent)' }}/>
      </div>

      <div className="px-5 pb-5">
        {/* Avatar + actions */}
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="relative">
            <div style={{ padding: '3px', background: 'linear-gradient(135deg, #ff2d78, #bf00ff, #00f5ff)', borderRadius: '50%' }}>
              <div style={{ background: '#060608', padding: '3px', borderRadius: '50%' }}>
                <Avatar user={profile} size="xl"/>
              </div>
            </div>
            {isMe && (
              <>
                <button onClick={() => avatarRef.current?.click()}
                  className="absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                  style={{ background: 'linear-gradient(135deg, #ff2d78, #bf00ff)', boxShadow: '0 0 10px rgba(255,45,120,0.5)' }}>
                  <HiCamera/>
                </button>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 mt-14">
            {isMe ? (
              <>
                <button onClick={() => setShowEdit(true)} className="btn-ghost-neon py-1.5 px-4 text-sm">Tahrirlash</button>
                <button onClick={() => { logout(); navigate('/login') }}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white/40 hover:text-neon-pink transition-colors border border-dark-border">
                  <HiCog6Tooth/>
                </button>
              </>
            ) : (
              <>
                <button onClick={handleFollow} className={profile.is_following ? 'btn-ghost-neon py-1.5 px-5 text-sm' : 'btn-neon py-1.5 px-5 text-sm'}>
                  {profile.is_following ? 'Kuzatilmoqda' : 'Kuzatish'}
                </button>
                {me && <button onClick={() => navigate(`/chat/${profile.id}`)} className="btn-ghost-neon py-1.5 px-4 text-sm">Xabar</button>}
              </>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-semibold">{profile.username}</h1>
            {profile.is_verified && <span className="text-neon-cyan text-sm" style={{ filter: 'drop-shadow(0 0 6px #00f5ff)' }}>✓</span>}
          </div>
          {profile.full_name && <p className="text-white/60 text-sm mb-1">{profile.full_name}</p>}
          {profile.bio && <p className="text-sm text-white/80 whitespace-pre-wrap">{profile.bio}</p>}
          {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-neon-cyan text-sm hover:underline">{profile.website}</a>}
        </div>

        {/* Stats */}
        <div className="flex gap-6 py-3 border-y border-dark-border mb-4">
          {[{ label: 'post', val: profile.posts_count }, { label: 'obunachilar', val: profile.followers_count }, { label: 'obunalar', val: profile.following_count }].map(s => (
            <div key={s.label} className="text-center">
              <p className="font-semibold text-lg" style={{ background: 'linear-gradient(135deg, #ff2d78, #bf00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.val}</p>
              <p className="text-white/40 text-xs font-mono">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-border">
        <button onClick={() => { setActiveTab('posts'); postsApi.getUserPosts(username!).then(d => setPosts(d?.results || (Array.isArray(d) ? d : []))) }}
          className={`flex-1 py-3 text-xs tracking-widest font-mono uppercase border-b-2 transition-all ${activeTab === 'posts' ? 'border-neon-pink text-neon-pink' : 'border-transparent text-white/40'}`}
          style={activeTab === 'posts' ? { textShadow: '0 0 10px #ff2d78' } : undefined}>☰ POSTLAR</button>
        {isMe && (
          <button onClick={() => { setActiveTab('saved'); postsApi.getSaved().then(d => setPosts(d?.results || (Array.isArray(d) ? d : []))) }}
            className={`flex-1 py-3 text-xs tracking-widest font-mono uppercase border-b-2 transition-all ${activeTab === 'saved' ? 'border-neon-cyan text-neon-cyan' : 'border-transparent text-white/40'}`}
            style={activeTab === 'saved' ? { textShadow: '0 0 10px #00f5ff' } : undefined}>🔖 SAQLANGAN</button>
        )}
      </div>

      {/* Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-16 px-4">
          <p className="text-white/30 font-mono text-sm">POST YO'Q</p>
          {isMe && <Link to="/upload" className="btn-neon inline-block mt-4 px-6 py-2 text-sm">BIRINCHI POST</Link>}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5">
          {posts.map(p => (
            <button key={p.id} onClick={() => setSelectedPost(p)} className="relative aspect-square overflow-hidden group">
              {p.media_type === 'video'
                ? <><img src={p.thumbnail_url || p.media_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                    <HiPlay className="absolute top-2 right-2 text-white drop-shadow-lg"/></>
                : <img src={p.media_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
              }
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3"
                style={{ background: 'linear-gradient(135deg, rgba(255,45,120,0.4), rgba(191,0,255,0.3))' }}>
                <span className="text-white font-semibold text-sm" style={{ textShadow: '0 0 8px #ff2d78' }}>❤️ {p.likes_count}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Profilni tahrirlash">
        <form onSubmit={handleSubmit(handleSaveProfile)} className="p-5 space-y-4">
          {[
            { field: 'username', label: 'Foydalanuvchi nomi' },
            { field: 'full_name', label: "To'liq ism" },
            { field: 'bio', label: 'Bio', isArea: true },
            { field: 'phone', label: 'Telefon' },
            { field: 'website', label: 'Vebsayt' },
          ].map(({ field, label, isArea }) => (
            <div key={field}>
              <label className="text-white/40 text-xs font-mono uppercase tracking-wider block mb-1.5">{label}</label>
              {isArea
                ? <textarea {...register(field)} rows={3} className="input-neon resize-none text-sm"/>
                : <input {...register(field)} className="input-neon text-sm"/>
              }
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setShowEdit(false)} className="flex-1 btn-ghost-neon py-2.5">Bekor</button>
            <button type="submit" className="flex-1 btn-neon py-2.5">Saqlash</button>
          </div>
        </form>
      </Modal>

      {selectedPost && <CommentModal post={selectedPost} onClose={() => setSelectedPost(null)}/>}
    </div>
  )
}
