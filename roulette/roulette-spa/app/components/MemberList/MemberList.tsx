import { User } from '../../models/User'
import { isEmpty } from '@stone-js/core'
import { useState, useMemo, JSX } from 'react'
import { AlertBox } from '../AlertBox/AlertBox'
import { FilterTabs } from '../FilterTabs/FilterTabs'
import { MemberCard } from '../MemberCard/MemberCard'

export interface MemberListProps {
  members: User[]
  isPage?: boolean
}

export const MemberList = ({ members, isPage = true }: MemberListProps): JSX.Element => {
  const [filter, setFilter] = useState('all')

  const filteredMembers = useMemo(() => {
    if (filter === 'all') return members
    if (filter === 'no-team') return members.filter(m => isEmpty(m.team))
    if (filter === 'with-team') return members.filter(m => !isEmpty(m.team))
    return members.filter(m => m.team?.color === filter)
  }, [filter, members])

  return (
    <div>
      {isPage && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-4xl font-bold">Soldats</h1>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <FilterTabs value={filter} onChange={setFilter} />
          </div>
        </>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6'>
        {filteredMembers.length > 0
          ? (
              filteredMembers.map((member, i) => (
                <MemberCard key={`${member.username}-${i}`} member={member} />
              ))
            )
          : (
            <AlertBox className='col-span-full text-center text-white/70 text-sm italic mt-4'>
              Aucun soldat trouvé avec ce filtre.
            </AlertBox>
            )}
      </div>
    </div>
  )
}
