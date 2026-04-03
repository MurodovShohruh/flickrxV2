import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import UploadPage from './pages/UploadPage'
import ProfilePage from './pages/ProfilePage'
import ChatPage from './pages/ChatPage'
import NotificationsPage from './pages/NotificationsPage'
import PostDetailPage from './pages/PostDetailPage'

function Guard({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace/>
}

export default function App() {
  const { isAuthenticated, fetchMe } = useAuthStore()
  useEffect(() => { if (isAuthenticated) fetchMe() }, [])

  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#0d0d12',
          color: '#f0f0f8',
          border: '1px solid rgba(255,45,120,0.3)',
          boxShadow: '0 0 20px rgba(255,45,120,0.2)',
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: '#ff2d78', secondary: '#0d0d12' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#0d0d12' } },
      }}/>

      <Routes>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/register" element={<RegisterPage/>}/>
        <Route element={<Layout/>}>
          <Route path="/" element={<HomePage/>}/>
          <Route path="/explore" element={<ExplorePage/>}/>
          <Route path="/post/:id" element={<PostDetailPage/>}/>
          <Route path="/profile/:username" element={<ProfilePage/>}/>
          <Route path="/reels" element={<HomePage/>}/>
          <Route path="/upload" element={<Guard><UploadPage/></Guard>}/>
          <Route path="/chat" element={<Guard><ChatPage/></Guard>}/>
          <Route path="/chat/:partnerId" element={<Guard><ChatPage/></Guard>}/>
          <Route path="/notifications" element={<Guard><NotificationsPage/></Guard>}/>
        </Route>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </BrowserRouter>
  )
}
