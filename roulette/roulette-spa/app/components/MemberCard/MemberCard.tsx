import { Color, COLOR_MAP } from '../../constants'
import { User } from '../../models/User'
import { Logger } from '@stone-js/core'
import { TeamMember } from '../../models/Team'
import { JSX, useContext, useState } from 'react'
import { ConfirmModal } from '../ConfirmModal/ConfirmModal'
import { TeamMemberService } from '../../services/TeamMemberService'
import { ReactIncomingEvent, StoneContext } from '@stone-js/use-react'
import { Star } from 'lucide-react'

export interface MemberCardProps {
  member: TeamMember
}

export const MemberCard = ({ member }: MemberCardProps): JSX.Element => {
  const [showModal, setShowModal] = useState(false)
  const container = useContext(StoneContext).container
  const teamMemberService = container.resolve<TeamMemberService>(TeamMemberService)
  const currentUser = container.resolve<ReactIncomingEvent>('event').getUser<User>()

  const promoteToCaptain = (member: TeamMember) => {
    teamMemberService.updateRole(member.uuid, 'captain').catch((error) => {
      Logger.error('Error promoting member to captain:', error)
    })
  }

  return (
    <div className='bg-[#123840] border border-neutral-800 rounded-lg p-4 shadow-md'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <p className='text-lg font-semibold text-white'>{member.user?.fullname ?? member.name}</p>
          {member.user?.fullname  && <p className='text-sm text-white/80'>@{member.name}</p>}
          {member.user?.phone && <p className='text-sm text-white/80'>#{member.user?.phone}</p>}
          <p className={`text-xs font-medium mt-1 ${member.isActive ? 'text-green-400' : 'text-yellow-500'}`}>
            {member.isActive ? 'Actif' : "En attente d’activation"}
          </p>
        </div>

        <div className='flex items-center gap-2 mt-2 sm:mt-0'>
          <span
            className='text-xs font-semibold px-2 py-1 rounded-md text-white shadow'
            style={{ backgroundColor: COLOR_MAP[member.team?.color as Color] ?? '#555' }}
          >
            {member.team?.name ?? 'Aucune équipe'}
          </span>
          {member.role === 'captain' && (
            <span className="inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow border border-yellow-300">
              <Star className="w-4 h-4 text-yellow-700" />
              Capitaine
            </span>
          )}
        </div>
      </div>

      {currentUser?.isAdmin && (
        <div className="flex gap-2 mt-3 flex-wrap">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-sm transition"
          >
            {member.isCaptain ? 'Retirer le grade de capitaine' : 'Promouvoir au grade de capitaine'}
          </button>
        </div>
      )}
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
