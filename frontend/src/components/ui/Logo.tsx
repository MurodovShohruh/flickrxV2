import { Link } from 'react-router-dom'

interface Props { size?: 'sm' | 'md' | 'lg'; className?: string }

export default function Logo({ size = 'md', className = '' }: Props) {
  const sizes = { sm: 'h-7', md: 'h-9', lg: 'h-14' }
  const textSizes = { sm: 'text-xl', md: 'text-2xl', lg: 'text-4xl' }

  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`}>
      {/* Camera icon - SVG neon version */}
      <div className={`${sizes[size]} aspect-square relative flex-shrink-0`}>
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="camGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff2d78"/>
              <stop offset="50%" stopColor="#bf00ff"/>
              <stop offset="100%" stopColor="#00f5ff"/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <rect x="6" y="14" width="36" height="26" rx="5" stroke="url(#camGrad)" strokeWidth="2.5" filter="url(#glow)"/>
          <path d="M16 14l3-6h10l3 6" stroke="url(#camGrad)" strokeWidth="2.5" strokeLinecap="round" filter="url(#glow)"/>
          <circle cx="24" cy="27" r="7" stroke="url(#camGrad)" strokeWidth="2.5" filter="url(#glow)"/>
          <circle cx="24" cy="27" r="3.5" fill="url(#camGrad)" opacity="0.8"/>
          <circle cx="35" cy="21" r="1.5" fill="#ff2d78"/>
        </svg>
      </div>
      {/* Text */}
      <span className={`font-display tracking-wider ${textSizes[size]}`}>
        <span className="text-white" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
          Flickr
        </span>
        <span style={{
          background: 'linear-gradient(135deg, #ff2d78, #bf00ff, #00f5ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 8px rgba(255,45,120,0.6))',
        }}>X</span>
      </span>
    </Link>
  )
}
