import { Link } from 'react-router-dom'

interface Props { size?: 'sm' | 'md' | 'lg'; className?: string }

export default function Logo({ size = 'md', className = '' }: Props) {
  const sizes = { sm: 'h-7', md: 'h-10', lg: 'h-14' }
  const textSizes = { sm: 'text-xl', md: 'text-2xl', lg: 'text-4xl' }

  return (
    <Link 
      to="/" 
      className={`group flex items-center gap-3 ${className}`}
    >
      
      {/* ICON */}
      <div className={`${sizes[size]} aspect-square transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
        <svg viewBox="0 0 48 48" className="w-full h-full">
          <defs>
            <linearGradient id="camGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff2d78"/>
              <stop offset="50%" stopColor="#7a00ff"/>
              <stop offset="100%" stopColor="#00eaff"/>
            </linearGradient>

            <filter id="softGlow">
              <feGaussianBlur stdDeviation="1.2" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <rect
            x="6"
            y="14"
            width="36"
            height="26"
            rx="6"
            stroke="url(#camGrad)"
            strokeWidth="2"
            filter="url(#softGlow)"
            className="transition-all duration-300 group-hover:opacity-100 opacity-90"
          />

          <path
            d="M16 14l3-6h10l3 6"
            stroke="url(#camGrad)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <circle cx="24" cy="27" r="7" stroke="url(#camGrad)" strokeWidth="2"/>
          <circle cx="24" cy="27" r="3.5" fill="url(#camGrad)" opacity="0.9"/>

          <circle cx="35" cy="21" r="1.5" fill="#ff2d78"/>
        </svg>
      </div>

      {/* TEXT */}
      <span className={`font-semibold tracking-wide ${textSizes[size]}`}>
        
        {/* Flick */}
        <span className="text-white/90 transition-all duration-300 group-hover:text-white">
          Flick
        </span>

        {/* RX */}
        <span
          className="transition-all duration-300 group-hover:brightness-125"
          style={{
            background: 'linear-gradient(135deg, #ff2d78, #7a00ff, #00eaff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          RX
        </span>
      </span>
    </Link>
  )
}