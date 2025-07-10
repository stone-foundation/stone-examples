import React from 'react'
import { Badge } from 'lucide-react'
import { Team } from '../../models/Team'
import { COLOR_TITLES } from '../../constants'

interface PageInfoProps {
  team: Team
}

export const PageInfo: React.FC<PageInfoProps> = ({ team }) => {
  return (
    <div className="bg-white/5 rounded-xl p-6 space-y-4 text-white">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{team.name}</h2>
        <Badge color={team.color}>{COLOR_TITLES[team.color]}</Badge>
      </div>

      {team.slogan && (
        <div>
          <p className="text-sm text-white/70 uppercase font-medium">Slogan</p>
          <p className="text-lg italic">« {team.slogan} »</p>
        </div>
      )}

      {team.motto && (
        <div>
          <p className="text-sm text-white/70 uppercase font-medium">Devise</p>
          <p className="text-base">{team.motto}</p>
        </div>
      )}

      {team.captain && (
        <div>
          <p className="text-sm text-white/70 uppercase font-medium">Capitaine</p>
          <p className="text-base font-medium">{team.captain.fullname}</p>
        </div>
      )}

      {team.description && (
        <div>
          <p className="text-sm text-white/70 uppercase font-medium">Description</p>
          <p className="text-base">{team.description}</p>
        </div>
      )}

      {team.rules && (
        <div>
          <p className="text-sm text-white/70 uppercase font-medium">Règlements</p>
          <p className="text-base">{team.rules}</p>
        </div>
      )}
    </div>
  )
}
