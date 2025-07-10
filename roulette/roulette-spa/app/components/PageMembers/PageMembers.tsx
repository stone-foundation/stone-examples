import React from 'react'
import { User } from '../../models/User'
import { Avatar } from '../Avatar/Avatar'

interface PageMembersProps {
  members: User[]
}

export const PageMembers: React.FC<PageMembersProps> = ({ members }) => {
  return (
    <div className="bg-white/5 rounded-xl p-6 text-white">
      <h2 className="text-xl font-semibold mb-4">Soldats ({members.length})</h2>

      <ul className="space-y-3">
        {members.map((member) => (
          <li key={member.uuid} className="flex items-center gap-4">
            <Avatar name={member.fullname} size={36} />
            <div className="flex flex-col">
              <span className="font-medium">{member.fullname}</span>
              <span className="text-sm text-white/60">@{member.username}</span>
            </div>
            {member.isCaptain && (
              <span className="ml-auto text-xs px-2 py-1 bg-orange-600/80 rounded-full text-white">
                Capitaine
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
