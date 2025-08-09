import React from 'react'
import clsx from 'clsx'

interface AvatarProps {
  name: string
  size?: number
  imageUrl?: string
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUrl,
  size = 40,
  className
}) => {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-full bg-white/10 text-white font-semibold',
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {imageUrl ? (
        <img
          alt={name}
          src={imageUrl}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
