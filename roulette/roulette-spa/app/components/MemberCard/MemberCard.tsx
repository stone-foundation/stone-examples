import { JSX } from 'react'
import { Color } from '../../constants'
import { User } from '../../models/User'
import { TeamBadge } from '../TeamBadge/TeamBadge'

export interface MemberCardProps {
  member: User
}

export const MemberCard = ({ member }: MemberCardProps): JSX.Element => {
  return (
    <div className='bg-[#123840] border border-neutral-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md'>
      <div>
        <p className='text-lg font-semibold text-white'>{member.fullname.split(' ')[0]}</p>
        <p className='text-sm text-white/80'>@{member.username}</p>
        <p className={`text-xs font-medium mt-1 ${member.isActive ? 'text-green-400' : 'text-yellow-500'}`}>
          {member.isActive ? 'Actif' : 'En attente d’activation'}
        </p>
      </div>

      <div>
        <TeamBadge color={member.team?.color ?? '' as Color} />
      </div>
    </div>
  )
}
