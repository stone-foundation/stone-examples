import { BadgeTeam } from "../../models/Badge"
import { StoneLink } from "@stone-js/use-react"

interface RecentBadgesCardProps {
  readonly badges: BadgeTeam[]
}

export function RecentBadgesCard({ badges }: RecentBadgesCardProps) {
  return (
    <ul className="space-y-3">
      {badges.map((badge) => (
        <li
          key={badge.uuid}
          className="bg-white/5 border border-white/10 rounded-md p-3 text-white text-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-semibold">{badge.name}</span>
              <span className="text-xs text-white/60">{badge.description}</span>
              {badge.team.name && (
                <span
                  className="mt-1 text-xs inline-block px-2 py-0.5 rounded-full text-white font-medium"
                  style={{ backgroundColor: badge.team.color }}
                >
                  <StoneLink to={`/teams/${badge.team.name}`}>{badge.team.name}</StoneLink>
                </span>
              )}
            </div>
            <span className="text-[10px] text-white/40">{new Date(badge.issuedAt).toLocaleDateString()}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
