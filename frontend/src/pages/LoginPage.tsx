import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import Logo from '../components/ui/Logo'

interface F { email: string; password: string }

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit } = useForm<F>()

  const onSubmit = async (data: F) => {
    try {
      setLoading(true)
      const res = await authApi.login(data)
      await login(res)
      navigate('/')
    } catch (e: any) {
      const err = e.response?.data
      toast.error(err?.error?.detail || err?.detail || 'Email yoki parol noto\'g\'ri')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* BG effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ff2d78, transparent)', filter: 'blur(80px)' }}/>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-8" style={{ background: '#bf00ff', filter: 'blur(100px)' }}/>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-8" style={{ background: '#00f5ff', filter: 'blur(80px)' }}/>
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-3"/>
          <p className="text-white/40 text-sm font-body">Kontent yarating, ulashing, kashf eting</p>
        </div>

        {/* Card */}
        <div className="card-neon p-7" style={{ boxShadow: '0 0 60px rgba(255,45,120,0.15)' }}>
          <h2 className="font-display text-2xl tracking-wider mb-6 text-center text-neon" style={{ filter: 'drop-shadow(0 0 10px rgba(255,45,120,0.4))' }}>
            KIRISH
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input {...register('email', { required: true })} type="email" placeholder="Email manzil" className="input-neon"/>
            <input {...register('password', { required: true })} type="password" placeholder="Parol" className="input-neon"/>
            <button type="submit" disabled={loading} className="btn-neon w-full py-3 mt-2 disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  Kirmoqda...
                </span>
              ) : 'KIRISH'}
            </button>
          </form>

          <div className="divider-neon my-5"/>
          <p className="text-white/30 text-xs text-center">Parolni unutdingizmi?</p>
        </div>

        <div className="card-neon p-4 text-center mt-3">
          <p className="text-sm text-white/60">
            Hisob yo'qmi?{' '}
            <Link to="/register" className="text-neon-pink hover:text-neon-purple transition-colors font-semibold">
              Ro'yxatdan o'ting
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
