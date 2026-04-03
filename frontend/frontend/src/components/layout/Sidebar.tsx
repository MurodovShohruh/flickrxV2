import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import Logo from '../ui/Logo'
import Avatar from '../ui/Avatar'
import {
  HiOutlineHome, HiHome,
  HiOutlineMagnifyingGlass, HiMagnifyingGlass,
  HiOutlinePlusCircle, HiPlusCircle,
  HiOutlineChatBubbleOvalLeft, HiChatBubbleOvalLeft,
  HiOutlineBell, HiBell,
  HiOutlineUser, HiUser,
  HiOutlineFilm, HiFilm,
  HiArrowRightOnRectangle,
} from 'react-icons/hi2'

export default function Sidebar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const items = [
    { to: '/', label: 'Bosh sahifa', icon: HiOutlineHome, activeIcon: HiHome },
    { to: '/explore', label: 'Qidirish', icon: HiOutlineMagnifyingGlass, activeIcon: HiMagnifyingGlass },
    { to: '/upload', label: 'Yaratish', icon: HiOutlinePlusCircle, activeIcon: HiPlusCircle },
    { to: '/reels', label: 'Reels', icon: HiOutlineFilm, activeIcon: HiFilm },
    { to: '/chat', label: 'Xabarlar', icon: HiOutlineChatBubbleOvalLeft, activeIcon: HiChatBubbleOvalLeft },
    { to: '/notifications', label: 'Bildirishnomalar', icon: HiOutlineBell, activeIcon: HiBell },
    { to: `/profile/${user?.username}`, label: 'Profil', icon: HiOutlineUser, activeIcon: HiUser },
  ]

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-[260px] flex-col px-4 py-8 z-40"
        style={{ background: 'linear-gradient(180deg, #060608 0%, #0a0a10 100%)', borderRight: '1px solid rgba(255,45,120,0.1)' }}>

        {/* Logo */}
        <div className="px-3 mb-10">
          <Logo size="md"/>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {isAuthenticated && items.map(item => {
            const active = pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to))
            const Icon = active ? item.activeIcon : item.icon
            return (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  active ? 'text-white' : 'text-white/50 hover:text-white hover:bg-dark-hover'
                }`}
                style={active ? {
                  background: 'linear-gradient(135deg, rgba(255,45,120,0.15), rgba(191,0,255,0.1))',
                  borderLeft: '2px solid #ff2d78',
                  boxShadow: 'inset 0 0 20px rgba(255,45,120,0.05)',
                } : undefined}
              >
                <Icon className={`text-2xl flex-shrink-0 ${active ? 'text-neon-pink' : ''}`}
                  style={active ? { filter: 'drop-shadow(0 0 6px #ff2d78)' } : undefined}/>
                <span className={`text-[15px] font-medium ${active ? 'text-white' : ''}`}>{item.label}</span>
                {item.to === '/notifications' && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-neon-pink animate-pulse-neon"/>
                )}
              </Link>
            )
          })}

          {!isAuthenticated && (
            <div className="mt-4 space-y-2 px-3">
              <Link to="/login" className="btn-neon block text-center py-2.5">Kirish</Link>
              <Link to="/register" className="btn-ghost-neon block text-center py-2.5">Ro'yxatdan o'tish</Link>
            </div>
          )}
        </nav>

        {/* User */}
        {isAuthenticated && user && (
          <div className="mt-auto pt-4 border-t border-dark-border">
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-dark-hover transition-colors group cursor-pointer">
              <Avatar user={user} size="sm" ring/>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.username}</p>
                <p className="text-xs text-white/40 truncate">{user.full_name}</p>
              </div>
              <button onClick={() => { logout(); navigate('/login') }}
                className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all">
                <HiArrowRightOnRectangle className="text-lg"/>
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile bottom */}
      {isAuthenticated && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center py-2 px-2"
          style={{ background: 'rgba(6,6,8,0.95)', borderTop: '1px solid rgba(255,45,120,0.15)', backdropFilter: 'blur(20px)' }}>
          {items.slice(0, 5).map(item => {
            const active = pathname === item.to
            const Icon = active ? item.activeIcon : item.icon
            return (
              <Link key={item.to} to={item.to}
                className={`flex flex-col items-center gap-0.5 p-2 transition-colors ${active ? 'text-neon-pink' : 'text-white/40'}`}
                style={active ? { filter: 'drop-shadow(0 0 6px #ff2d78)' } : undefined}>
                <Icon className="text-[22px]"/>
                <span className="text-[9px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      )}
    </>
  )
}
