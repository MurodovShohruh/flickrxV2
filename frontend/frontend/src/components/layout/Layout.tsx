import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex min-h-screen scanlines noise">
      {/* BG glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: '#ff2d78', filter: 'blur(120px)' }}/>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: '#bf00ff', filter: 'blur(120px)' }}/>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 rounded-full opacity-3"
          style={{ background: '#00f5ff', filter: 'blur(100px)' }}/>
      </div>

      <Sidebar/>
      <main className="flex-1 lg:ml-[260px] pb-20 lg:pb-0 relative z-10">
        <div className="max-w-[620px] mx-auto">
          <Outlet/>
        </div>
      </main>
    </div>
  )
}
