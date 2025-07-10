import { Medal } from 'lucide-react'
import { Team } from '../../models/Team'
import { StoneLink } from '@stone-js/use-react'

interface TopTeamCardProps {
  readonly teams: Team[]
}

export function TopTeamCard({ teams }: TopTeamCardProps) {
  return (
    <div className="space-y-2">
      {teams.slice(0, 3).map((team, index) => (
        <StoneLink
          key={team.name}
          to={`/teams/${team.name}/stats`}
          className={`flex w-full items-center justify-between px-3 py-2 rounded-lg ${
            index === 0
              ? 'bg-yellow-500/10 border border-yellow-400/30'
              : 'bg-white/5 border border-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: team.color }}
            />
            <span className="text-sm font-medium text-white">{team.name}</span>
          </div>

          <div className="flex items-center gap-1">
            {index === 0 && <Medal size={16} className="text-yellow-400" />}
            <span className="text-xs text-white/80 font-semibold">{team.score} pts</span>
          </div>
        </StoneLink>
      ))}
    </div>
  )
}
