import { FC } from "react"
import { User } from "../../models/User"
import { Badge } from "../../models/Badge"
import { BadgeCard } from "../BadgeCard/BadgeCard"

interface PageBadgesProps {
  badges: Badge[]
  currentUser: User
}

export const PageBadges: FC<PageBadgesProps> = ({ badges, currentUser }) => {
  return (
    <div className="bg-white/5 rounded-xl p-6 space-y-4 text-white">
      <h2 className="text-xl font-bold text-white">Badges obtenus ({badges.length})</h2>

      {badges.length === 0 ? (
        <div className="text-white/60 text-center border border-white/10 p-6 rounded-lg">
          Aucun badge attribué à cette équipe.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {badges.map((badge) => (
            <BadgeCard
              key={badge.uuid}
              badge={badge}
              onUnassign={() => {}}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  )
}
