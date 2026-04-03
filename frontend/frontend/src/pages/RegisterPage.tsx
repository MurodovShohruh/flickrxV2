import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import Logo from '../components/ui/Logo'

interface F { username: string; full_name: string; email: string; password: string; confirm_password: string }

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch } = useForm<F>()

  const onSubmit = async (data: F) => {
    if (data.password !== data.confirm_password) return toast.error('Parollar mos emas')
    try {
      setLoading(true)
      const res = await authApi.register(data)
      await login(res)
      navigate('/')
    } catch (e: any) {
      const err = e.response?.data?.error
      const msg = err ? (typeof err === 'object' ? Object.values(err).flat().join(', ') : err) : 'Xato yuz berdi'
      toast.error(msg)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #bf00ff, transparent)', filter: 'blur(80px)' }}/>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full opacity-8" style={{ background: '#ff2d78', filter: 'blur(100px)' }}/>
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-3"/>
          <p className="text-white/40 text-sm">Do'stlaringizning postlarini ko'ring</p>
        </div>

        <div className="card-neon p-7" style={{ boxShadow: '0 0 60px rgba(191,0,255,0.15)' }}>
          <h2 className="font-display text-2xl tracking-wider mb-6 text-center" style={{
            background: 'linear-gradient(135deg, #bf00ff, #00f5ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 10px rgba(191,0,255,0.4))'
          }}>RO'YXATDAN O'TISH</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <input {...register('email', { required: true })} type="email" placeholder="Email manzil" className="input-neon"/>
            <input {...register('full_name')} placeholder="To'liq ism" className="input-neon"/>
            <input {...register('username', { required: true })} placeholder="Foydalanuvchi nomi" className="input-neon"/>
            <input {...register('password', { required: true, minLength: 8 })} type="password" placeholder="Parol (min 8 belgi)" className="input-neon"/>
            <input {...register('confirm_password', { required: true })} type="password" placeholder="Parolni tasdiqlang" className="input-neon"/>
            <button type="submit" disabled={loading} className="btn-neon w-full py-3 mt-2 disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #bf00ff, #00f5ff)' }}>
              {loading ? 'Yuklanmoqda...' : 'RO\'YXATDAN O\'TISH'}
            </button>
          </form>
        </div>

        <div className="card-neon p-4 text-center mt-3">
          <p className="text-sm text-white/60">
            Hisobingiz bormi?{' '}
            <Link to="/login" className="text-neon-cyan hover:text-neon-pink transition-colors font-semibold">Kirish</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
