import { User } from '../../types'
interface Props { user: Pick<User,'username'|'profile_image_url'>; size?: 'xs'|'sm'|'md'|'lg'|'xl'; ring?: boolean; className?: string }
const sizes = { xs:'w-6 h-6 text-[9px]', sm:'w-8 h-8 text-xs', md:'w-10 h-10 text-sm', lg:'w-16 h-16 text-xl', xl:'w-24 h-24 text-3xl' }
export default function Avatar({ user, size='md', ring=false, className='' }: Props) {
  const inner = (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${ring ? '' : className}`}
      style={{ background: user.profile_image_url ? undefined : 'linear-gradient(135deg, #ff2d78, #bf00ff)' }}>
      {user.profile_image_url
        ? <img src={user.profile_image_url} alt={user.username} className="w-full h-full object-cover"/>
        : <span className="text-white font-semibold">{user.username[0]?.toUpperCase()}</span>
      }
    </div>
  )
  if (!ring) return inner
  return (
    <div className={`avatar-ring flex-shrink-0 ${className}`} style={{ padding: '2px', borderRadius: '50%' }}>
      <div className="bg-dark rounded-full p-0.5">{inner}</div>
    </div>
  )
}
