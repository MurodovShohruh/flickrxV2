import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { chatApi } from '../api/chat'
import { useAuthStore } from '../store/authStore'
import { ChatMessage, Conversation } from '../types'
import Avatar from '../components/ui/Avatar'
import { HiArrowLeft, HiPaperAirplane, HiFaceSmile, HiPhoto, HiVideoCamera } from 'react-icons/hi2'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function ChatPage() {
  const { partnerId } = useParams<{ partnerId?: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [partner, setPartner] = useState<Conversation['partner'] | null>(null)
  const [showEmoji, setShowEmoji] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { chatApi.getConversations().then(setConversations).catch(() => {}) }, [partnerId])

  useEffect(() => {
    if (!partnerId) return
    chatApi.getMessages(partnerId).then(msgs => { setMessages(Array.isArray(msgs) ? msgs : []); scrollToBottom() }).catch(() => {})
  }, [partnerId])

  useEffect(() => {
    if (partnerId) {
      const conv = conversations.find(c => c.partner.id === partnerId)
      if (conv) setPartner(conv.partner)
    }
  }, [partnerId, conversations])

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token || !partnerId) return
    const wsBase = (import.meta.env.VITE_WS_URL || `ws://${window.location.host}`)
    const ws = new WebSocket(`${wsBase}/ws/chat/?token=${token}`)
    wsRef.current = ws
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.sender_id === partnerId || msg.receiver_id === partnerId || msg.is_mine) {
        setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, {
          id: msg.id, sender: { id: msg.sender_id, username: msg.sender_username, profile_image_url: msg.sender_profile_image } as any,
          message_type: msg.message_type || 'text', text: msg.text, media_url: null,
          is_read: msg.is_read, is_mine: msg.is_mine || msg.sender_id === user?.id, created_at: msg.created_at,
        }])
        scrollToBottom()
      }
    }
    return () => ws.close()
  }, [partnerId, user?.id])

  const scrollToBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

  const sendMessage = (t?: string) => {
    const content = (t || text).trim()
    if (!content || !partnerId || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ type: 'text', receiver_id: partnerId, text: content }))
    setText(''); setShowEmoji(false); inputRef.current?.focus()
  }

  const handleEmoji = (d: EmojiClickData) => { setText(p => p + d.emoji); inputRef.current?.focus() }

  const handleMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !partnerId) return
    try { const msg = await chatApi.sendMedia(partnerId, file); setMessages(p => [...p, { ...msg, is_mine: true }]); scrollToBottom() }
    catch { toast.error('Fayl yuklashda xato') }
  }

  if (!partnerId) return (
    <div>
      <div className="sticky top-0 z-10 px-4 py-4 border-b border-dark-border flex items-center justify-between"
        style={{ background: 'rgba(6,6,8,0.95)', backdropFilter: 'blur(20px)' }}>
        <h1 className="font-display text-xl tracking-wider text-neon">XABARLAR</h1>
        <span className="text-white/30 text-xs font-mono">{user?.username}</span>
      </div>
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg, rgba(255,45,120,0.2), rgba(191,0,255,0.2))', border: '1px solid rgba(255,45,120,0.3)' }}>
            <HiPaperAirplane className="text-3xl text-neon-pink" style={{ filter: 'drop-shadow(0 0 8px #ff2d78)' }}/>
          </div>
          <h3 className="font-display text-2xl tracking-wider text-neon mb-2">XABARLARINGIZ</h3>
          <p className="text-white/40 text-sm">Do'stlarga shaxsiy xabar yuboring</p>
        </div>
      ) : (
        <div>
          {conversations.map(conv => (
            <Link key={conv.partner.id} to={`/chat/${conv.partner.id}`}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-dark-hover transition-colors border-b border-dark-border">
              <Avatar user={conv.partner} size="md" ring/>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{conv.partner.username}</p>
                <p className="text-white/40 text-xs truncate">
                  {conv.last_message?.is_mine ? 'Siz: ' : ''}{conv.last_message?.message_type !== 'text' ? '📎 Media' : conv.last_message?.text}
                </p>
              </div>
              {conv.unread_count > 0 && (
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #ff2d78, #bf00ff)', boxShadow: '0 0 10px rgba(255,45,120,0.5)' }}>
                  {conv.unread_count}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
        style={{ background: 'rgba(6,6,8,0.95)', borderColor: 'rgba(255,45,120,0.15)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => navigate('/chat')} className="text-white/40 hover:text-neon-pink transition-colors lg:hidden"><HiArrowLeft className="text-xl"/></button>
        {partner && (
          <Link to={`/profile/${partner.username}`} className="flex items-center gap-3 flex-1">
            <Avatar user={partner} size="sm" ring/>
            <div>
              <p className="font-semibold text-sm">{partner.username}</p>
              {partner.full_name && <p className="text-white/40 text-xs">{partner.full_name}</p>}
            </div>
          </Link>
        )}
        <button className="text-white/40 hover:text-neon-cyan transition-colors"><HiVideoCamera className="text-xl"/></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'} gap-2`}>
            {!msg.is_mine && partner && <Avatar user={partner} size="xs" className="flex-shrink-0 mt-1"/>}
            <div className={`max-w-[70%] flex flex-col ${msg.is_mine ? 'items-end' : 'items-start'}`}>
              {msg.message_type === 'image' && msg.media_url && (
                <img src={msg.media_url} alt="" className="rounded-2xl max-w-[220px] max-h-[280px] object-cover" style={{ boxShadow: msg.is_mine ? '0 0 15px rgba(255,45,120,0.3)' : 'none' }}/>
              )}
              {msg.message_type === 'video' && msg.media_url && (
                <video src={msg.media_url} controls className="rounded-2xl max-w-[220px]"/>
              )}
              {msg.message_type === 'text' && (
                <div className={`px-4 py-2.5 rounded-3xl text-sm ${msg.is_mine ? 'rounded-br-md text-white' : 'rounded-bl-md text-white/90'}`}
                  style={msg.is_mine ? {
                    background: 'linear-gradient(135deg, #ff2d78, #bf00ff)',
                    boxShadow: '0 0 15px rgba(255,45,120,0.3)',
                  } : { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {msg.text}
                </div>
              )}
              <p className="text-white/25 text-[10px] mt-0.5 px-1 font-mono">
                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                {msg.is_mine && <span className="ml-1">{msg.is_read ? ' ✓✓' : ' ✓'}</span>}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div className="absolute bottom-20 left-4 z-20">
          <EmojiPicker onEmojiClick={handleEmoji} theme={'dark' as any} width={300} height={360}/>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-3 px-4 py-3 border-t flex-shrink-0"
        style={{ background: 'rgba(6,6,8,0.95)', borderColor: 'rgba(255,45,120,0.15)' }}>
        <button onClick={() => setShowEmoji(p => !p)} className={`text-2xl transition-colors ${showEmoji ? 'text-neon-pink' : 'text-white/40 hover:text-neon-pink'}`}
          style={showEmoji ? { filter: 'drop-shadow(0 0 6px #ff2d78)' } : undefined}>
          <HiFaceSmile/>
        </button>
        <div className="flex-1 rounded-full px-4 py-2 flex items-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,45,120,0.2)' }}>
          <input ref={inputRef} value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Xabar yozing..." className="flex-1 bg-transparent text-sm outline-none placeholder-white/25"
            style={{ caretColor: '#ff2d78' }}/>
        </div>
        <button onClick={() => fileRef.current?.click()} className="text-white/40 hover:text-neon-purple transition-colors"><HiPhoto className="text-2xl"/></button>
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleMedia}/>
        {text.trim()
          ? <button onClick={() => sendMessage()} className="text-neon-pink font-semibold text-sm" style={{ filter: 'drop-shadow(0 0 6px #ff2d78)' }}>Yuborish</button>
          : <button className="text-white/30"><HiPaperAirplane className="text-2xl"/></button>
        }
      </div>
    </div>
  )
}
