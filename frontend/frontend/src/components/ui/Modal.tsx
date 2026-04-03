import { useEffect } from 'react'
import { HiXMark } from 'react-icons/hi2'
import FocusTrap from 'focus-trap-react'
import { CSSTransition } from 'react-transition-group'

interface Props {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  maxWidth?: string
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = 'max-w-lg'
}: Props) {
  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Escape tugmasi bilan yopish
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <CSSTransition
      in={isOpen}
      timeout={200}
      classNames={{
        enter: 'opacity-0 scale-95',
        enterActive: 'opacity-100 scale-100 transition ease-out duration-200',
        exit: 'opacity-100 scale-100',
        exitActive: 'opacity-0 scale-95 transition ease-in duration-200'
      }}
      unmountOnExit
    >
      <FocusTrap>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />

          {/* Modal box */}
          <div
            className={`relative card-neon w-full ${maxWidth} max-h-[90vh] overflow-hidden z-10`}
            style={{
              boxShadow: '0 0 60px rgba(255,45,120,0.2), 0 0 120px rgba(191,0,255,0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title bar */}
            {title && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
                <h2 className="font-semibold text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-white/40 hover:text-neon-pink transition-colors"
                >
                  <HiXMark className="text-xl" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className={`${title ? 'p-5' : 'p-4'} overflow-auto max-h-[80vh]`}>
              {children}
            </div>
          </div>
        </div>
      </FocusTrap>
    </CSSTransition>
  )
}