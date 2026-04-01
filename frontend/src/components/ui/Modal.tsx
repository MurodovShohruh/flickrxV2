import { useEffect } from 'react'
import { HiXMark } from 'react-icons/hi2'
interface Props { isOpen: boolean; onClose: () => void; children: React.ReactNode; title?: string; maxWidth?: string }
export default function Modal({ isOpen, onClose, children, title, maxWidth = 'max-w-lg' }: Props) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}/>
      <div className={`relative card-neon w-full ${maxWidth} max-h-[90vh] overflow-hidden z-10`}
        style={{ boxShadow: '0 0 60px rgba(255,45,120,0.2), 0 0 120px rgba(191,0,255,0.1)' }}>
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
            <h2 className="font-semibold text-white">{title}</h2>
            <button onClick={onClose} className="text-white/40 hover:text-neon-pink transition-colors">
              <HiXMark className="text-xl"/>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
