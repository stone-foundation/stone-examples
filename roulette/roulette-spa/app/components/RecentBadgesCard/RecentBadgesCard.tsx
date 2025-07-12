import { Team } from "../../models/Team"
import { StoneLink } from "@stone-js/use-react"

interface RecentBadgesCardProps {
  readonly teams: Team[]
}

export function RecentBadgesCard({ teams }: RecentBadgesCardProps) {
  return (
    <ul className="space-y-3">
      {teams.filter(v => v.badges && v.badges.length > 0).map((team) => (
        <li
          key={team.uuid}
          className="bg-white/5 border border-white/10 rounded-md p-3 text-white text-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-semibold">{team.badges?.[0].name}</span>
              <span className="text-xs text-white/60">{team.badges?.[0].description}</span>
              {team.name && (
                <span
                  className="mt-1 text-xs inline-block px-2 py-0.5 rounded-full text-white font-medium"
                  style={{ backgroundColor: team.color }}
                >
                  <StoneLink to={`/page/${team.name}/badges`}>{team.name}</StoneLink>
                </span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
