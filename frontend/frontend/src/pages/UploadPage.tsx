import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { postsApi } from '../api/posts'
import { HiCloudArrowUp, HiXMark, HiPhoto, HiFilm } from 'react-icons/hi2'
import toast from 'react-hot-toast'

interface F { caption: string; hashtags_str: string; location: string }

export default function UploadPage() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const { register, handleSubmit } = useForm<F>()

  const handleFile = (f: File) => {
    if (!f.type.startsWith('video/') && !f.type.startsWith('image/')) return toast.error('Faqat video yoki rasm')
    if (f.type.startsWith('image/') && f.size > 10 * 1024 * 1024) return toast.error('Rasm 10MB dan oshmasin')
    if (f.type.startsWith('video/') && f.size > 500 * 1024 * 1024) return toast.error('Video 500MB dan oshmasin')
    setFile(f); setPreview(URL.createObjectURL(f))
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]; if (f) handleFile(f)
  }, [])

  const onSubmit = async (data: F) => {
    if (!file) return toast.error('Fayl tanlang')
    const fd = new FormData()
    fd.append('file', file)
    if (data.caption) fd.append('caption', data.caption)
    if (data.hashtags_str) fd.append('hashtags_str', data.hashtags_str)
    if (data.location) fd.append('location', data.location)
    try {
      setUploading(true)
      const interval = setInterval(() => setProgress(p => p < 85 ? p + 8 : p), 300)
      await postsApi.create(fd)
      clearInterval(interval); setProgress(100)
      toast.success('Kontent yuklandi!')
      navigate('/')
    } catch (e: any) { toast.error(e.response?.data?.error?.file?.[0] || 'Yuklashda xato') }
    finally { setUploading(false); setProgress(0) }
  }

  if (!file) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <h1 className="font-display text-3xl tracking-wider text-center mb-8 text-neon" style={{ filter: 'drop-shadow(0 0 15px rgba(255,45,120,0.5))' }}>
          YANGI POST
        </h1>
        <div
          className={`rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 ${dragging ? 'scale-105' : ''}`}
          style={{
            border: `2px dashed ${dragging ? '#ff2d78' : 'rgba(255,45,120,0.3)'}`,
            background: dragging ? 'rgba(255,45,120,0.08)' : 'rgba(255,255,255,0.02)',
            boxShadow: dragging ? '0 0 40px rgba(255,45,120,0.3)' : 'none',
          }}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <div className="flex justify-center gap-6 mb-6">
            <HiPhoto className="text-5xl text-neon-pink" style={{ filter: 'drop-shadow(0 0 10px #ff2d78)' }}/>
            <HiFilm className="text-5xl text-neon-purple" style={{ filter: 'drop-shadow(0 0 10px #bf00ff)' }}/>
          </div>
          <p className="text-xl font-medium mb-2 text-white/80">Rasm va videolarni bu yerga tashlang</p>
          <p className="text-white/40 text-sm mb-6">Yoki kompyuteringizdan tanlang</p>
          <button className="btn-neon px-8 py-3">FAYL TANLASH</button>
          <p className="text-white/25 text-xs mt-4 font-mono">MP4 · WebM · JPG · PNG · WebP</p>
          <input ref={fileRef} type="file" accept="video/*,image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}/>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-dark-border"
        style={{ background: 'rgba(6,6,8,0.95)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => { setFile(null); setPreview(null) }} className="text-white/40 hover:text-neon-pink transition-colors"><HiXMark className="text-2xl"/></button>
        <h1 className="font-display text-xl tracking-wider text-neon">YANGI POST</h1>
        <button onClick={handleSubmit(onSubmit)} disabled={uploading} className="btn-neon py-1.5 px-5 text-sm disabled:opacity-50">
          {uploading ? 'YUKLANMOQDA...' : 'ULASHISH'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="md:flex-1 bg-dark flex items-center justify-center min-h-[50vh]">
          {file?.type.startsWith('video/')
            ? <video src={preview!} controls className="max-h-[70vh] max-w-full object-contain"/>
            : <img src={preview!} alt="" className="max-h-[70vh] max-w-full object-contain"/>
          }
        </div>
        <div className="md:w-80 p-5 border-l border-dark-border space-y-4">
          <textarea {...register('caption')} placeholder="Tavsif yozing..." rows={5}
            className="w-full bg-transparent text-sm outline-none resize-none placeholder-white/25 border-b border-dark-border pb-4"
            style={{ caretColor: '#ff2d78' }} maxLength={2200}/>
          <div>
            <label className="text-white/40 text-xs font-mono uppercase tracking-wider block mb-2">Hashtaglar</label>
            <input {...register('hashtags_str')} placeholder="#travel, #uzbekistan" className="input-neon text-sm"/>
          </div>
          <div>
            <label className="text-white/40 text-xs font-mono uppercase tracking-wider block mb-2">Joylashuv</label>
            <input {...register('location')} placeholder="Toshkent, Uzbekistan" className="input-neon text-sm"/>
          </div>
          {uploading && (
            <div>
              <div className="flex justify-between text-xs text-white/40 font-mono mb-1">
                <span>YUKLANMOQDA</span><span>{progress}%</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden bg-dark-border">
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #ff2d78, #bf00ff, #00f5ff)', boxShadow: '0 0 10px rgba(255,45,120,0.5)' }}/>
              </div>
            </div>
          )}
          <button onClick={handleSubmit(onSubmit)} disabled={uploading} className="btn-neon w-full py-3 disabled:opacity-50">
            {uploading ? 'YUKLANMOQDA...' : 'ULASHISH'}
          </button>
        </div>
      </div>
    </div>
  )
}
