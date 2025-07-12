import React from 'react'
import { User } from '../../models/User'
import { Avatar } from '../Avatar/Avatar'
import { TeamMember } from '../../models/Team'

interface PageMembersProps {
  currentUser: User
  members: TeamMember[]
}

export const PageMembers: React.FC<PageMembersProps> = ({ members, currentUser }) => {
  return (
    <div className="bg-white/5 rounded-xl p-6 text-white">
      <h2 className="text-xl font-semibold mb-4">Soldats ({members.length})</h2>

      {members.length > 0 ? (<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {members.map((member) => (
          <li key={member.uuid} className='bg-[#123840] border border-neutral-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md'>
            <div className='flex items-center gap-4'>
              <Avatar name={member.fullname} size={36} />
              <div>
                <p className='text-lg font-semibold text-white capitalize'>{member.username}</p>
                {currentUser.isAdmin  && <p className='text-sm text-white/80 capitalize'>@{member.fullname}</p>}
                {member.isPresent ? <p className={`text-xs font-medium mt-1 ${!member.isLate ? 'text-green-400' : 'text-yellow-500'}`}>
                  {member.isLate ? 'En retard' : "A l'heure"}
                </p> : <p className='text-xs font-medium mt-1 text-yellow-500'>Absent</p>}
              </div>
            </div>
      
            <div>
              {member.isCaptain ? (
                <span className="ml-auto text-xs px-2 py-1 bg-orange-600/80 rounded-full text-white">
                  Capitaine
                </span>
              ) : (<span className="ml-auto text-xs px-2 py-1 bg-yellow-600/80 rounded-full text-white">
                  Soldat
                </span>)}
            </div>
          </li>
        ))}
      </ul>) : (
        <p className="text-white/60 text-center border border-white/10 p-6 rounded-lg">
          Cette équipe ne contient aucun soldat.
        </p>
      )}
    </div>
  )
}
