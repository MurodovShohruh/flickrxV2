import { Link } from 'react-router-dom'

interface Props { size?: 'sm' | 'md' | 'lg'; className?: string }

export default function Logo({ size = 'md', className = '' }: Props) {
  const h = { sm: 28, md: 40, lg: 60 }[size]

  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <svg viewBox="0 0 210 52" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ height: h, width: 'auto' }}>
        <defs>
          <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff2d78"/>
            <stop offset="50%" stopColor="#bf00ff"/>
            <stop offset="100%" stopColor="#00f5ff"/>
          </linearGradient>
          <linearGradient id="lgbg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff2d78" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#00f5ff" stopOpacity="0.10"/>
          </linearGradient>
        </defs>
        <polygon points="22,2 42,2 52,26 42,50 22,50 12,26"
          fill="url(#lgbg)" stroke="url(#lg)" strokeWidth="1.8"/>
        <text x="32" y="35" fontFamily="sans-serif" fontWeight="800"
          fontSize="22" fill="url(#lg)" textAnchor="middle">F</text>
        <text x="62" y="34" fontFamily="sans-serif" fontWeight="300"
          fontSize="24" letterSpacing="1" fill="white">lickr</text>
        <text x="152" y="34" fontFamily="sans-serif" fontWeight="900"
          fontSize="24" fill="url(#lg)">X</text>
        <text x="62" y="47" fontFamily="sans-serif" fontSize="7"
          letterSpacing="3.5" fill="#666666">SOCIAL MEDIA</text>
      </svg>
    </Link>
  )
}
