import { Color } from '../../constants'
import { User } from '../../models/User'
import { Logger } from '@stone-js/core'
import { JSX, useContext, useState } from 'react'
import { TeamBadge } from '../TeamBadge/TeamBadge'
import { UserService } from '../../services/UserService'
import { ConfirmModal } from '../ConfirmModal/ConfirmModal'
import { ReactIncomingEvent, StoneContext } from '@stone-js/use-react'

export interface MemberCardProps {
  member: User
}

export const MemberCard = ({ member }: MemberCardProps): JSX.Element => {
  const [showModal, setShowModal] = useState(false)
  const container = useContext(StoneContext).container
  const userService = container.resolve<UserService>('userService')
  const currentUser = container.resolve<ReactIncomingEvent>('event').getUser<User>()

  const promoteToCaptain = (member: User) => {
    userService.toggleCaptainGrade(member).catch((error) => {
      Logger.error('Error promoting member to captain:', error)
    })
  }

  return (
    <div className='bg-[#123840] border border-neutral-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md'>
      <div>
        <p className='text-lg font-semibold text-white'>{member.fullname ?? member.username}</p>
        {member.fullname  && <p className='text-sm text-white/80'>@{member.username}</p>}
        {member.phone && <p className='text-sm text-white/80'>#{member.phone}</p>}
        <p className={`text-xs font-medium mt-1 ${member.isActive ? 'text-green-400' : 'text-yellow-500'}`}>
          {member.isActive ? 'Actif' : "En attente d’activation"}
        </p>
      
        {currentUser?.isAdmin && (
          <div className="flex gap-2 mt-2 flex-wrap">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-sm transition"
            >
              {member.isCaptain ? 'Retirer le grade de capitaine' : 'Promouvoir au grade de capitaine'}
            </button>
          </div>
        )}
      </div>

      <div>
        <TeamBadge color={member.team?.color ?? '' as Color} />
      </div>
      <ConfirmModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => {
          setShowModal(false)
          promoteToCaptain(member)
        }}
        message='Es-tu sûr de vouloir effectuer cette action ?'
      />
    </div>
  )
}
