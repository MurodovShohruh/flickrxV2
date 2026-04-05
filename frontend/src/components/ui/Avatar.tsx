import { User } from '../../types'

interface Props {
  user: Pick<User, 'username' | 'profile_image_url'>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  ring?: boolean;
  className?: string;
}

const sizes = {
  xs: 'w-6 h-6 text-[9px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
};

export default function Avatar({ user, size = 'md', ring = false, className = '' }: Props) {
  const hasImage = Boolean(user.profile_image_url);

  const inner = (
    <div
      className={`
        ${sizes[size]}
        rounded-full 
        flex items-center justify-center 
        flex-shrink-0 overflow-hidden
        transition-transform duration-200 ease-in-out
        ${!ring ? className : ''}
        ${ring ? 'hover:scale-105' : ''}
      `}
      style={{
        background: hasImage ? undefined : 'linear-gradient(135deg, #ff2d78, #bf00ff)',
      }}
    >
      {hasImage ? (
        <img
          src={user.profile_image_url ?? undefined}  // null → undefined
          alt={user.username}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-white font-semibold">{user.username[0]?.toUpperCase()}</span>
      )}
    </div>
  );

  if (!ring) return inner;

  return (
    <div
      className={`
        flex-shrink-0 
        rounded-full 
        transition-all duration-300 ease-in-out
        hover:shadow-lg hover:scale-105
        ${className}
      `}
      style={{
        padding: '2px',
        background: 'linear-gradient(135deg, #ff2d78, #bf00ff)', // ring gradient
      }}
    >
      <div className="bg-dark rounded-full p-0.5">{inner}</div>
    </div>
  );
}