import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { notificationsApi } from '../api/notifications'
import { Notification } from '../types'
import Avatar from '../components/ui/Avatar'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const icons: Record<string, string> = { like: '❤️', comment: '💬', follow: '👤', message: '✉️' }

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { notificationsApi.getAll().then(setNotifs).catch(() => toast.error('Xato')).finally(() => setLoading(false)) }, [])

  return (
    <div>
      <div className="sticky top-0 z-10 px-4 py-4 border-b flex items-center justify-between"
        style={{ background: 'rgba(6,6,8,0.95)', borderColor: 'rgba(255,45,120,0.15)', backdropFilter: 'blur(20px)' }}>
        <h1 className="font-display text-xl tracking-wider text-neon">BILDIRISHNOMALAR</h1>
        {notifs.length > 0 && (
          <button onClick={() => { notificationsApi.deleteAll(); setNotifs([]) }} className="text-white/30 hover:text-red-400 text-xs font-mono transition-colors">
            HAMMASINI O'CHIRISH
          </button>
        )}
      </div>

      {loading ? (
        <div className="divide-y divide-dark-border">
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-dark-border"/>
              <div className="flex-1 h-3 bg-dark-border rounded"/>
            </div>
          ))}
        </div>
      ) : notifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4" style={{ filter: 'drop-shadow(0 0 10px rgba(255,45,120,0.5))' }}>🔔</div>
          <h3 className="font-display text-2xl tracking-wider text-neon mb-2">FAOLIYAT</h3>
          <p className="text-white/40 text-sm">Postlaringizdagi like, izoh va boshqalar ko'rinadi</p>
        </div>
      ) : (
        <div className="divide-y divide-dark-border">
          {notifs.map(n => (
            <div key={n.id} className={`flex items-center gap-3 px-4 py-3 transition-colors ${!n.is_read ? 'bg-dark-hover' : ''}`}>
              {n.actor
                ? <Link to={`/profile/${n.actor.username}`}><Avatar user={n.actor} size="md" ring={!n.is_read}/></Link>
                : <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ background: 'linear-gradient(135deg, rgba(255,45,120,0.2), rgba(191,0,255,0.2))' }}>{icons[n.type]}</div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  {n.actor && <Link to={`/profile/${n.actor.username}`} className="font-semibold mr-1 hover:text-neon-pink transition-colors">{n.actor.username}</Link>}
                  <span className="text-white/80">{n.content}</span>
                </p>
                <p className="text-white/30 text-xs mt-0.5 font-mono">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
              </div>
              {!n.is_read && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#ff2d78', boxShadow: '0 0 6px #ff2d78' }}/>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
