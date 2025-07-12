import { FC } from "react"
import { User } from "../../models/User"
import { Badge } from "../../models/Badge"

interface BadgeCardProps {
  badge: Badge
  currentUser: User
  onEdit?: () => void
  onDelete?: () => void
  onAssign?: () => void
  onUnassign?: () => void
}

export const BadgeCard: FC<BadgeCardProps> = ({
  badge,
  onEdit,
  onDelete,
  onAssign,
  onUnassign,
  currentUser
}) => {
  return (
    <div className="p-4 overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl border border-white/10 shadow-md text-white flex flex-col md:flex-row items-center gap-4">
      <div>
        {badge.iconUrl ? (
          <img
            alt={badge.name}
            src={badge.iconUrl}
            className="w-12 h-12 md:w-16 md:h-16 object-contain rounded"
          />
        ) : (
          <span className="text-5xl md:text-6xl text-yellow-400">🏅</span>
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-lg md:text-xl font-semibold mb-1">{badge.name}</h3>
        <p className="text-sm text-white/60">{badge.categoryLabel}</p>
        <p className="text-base font-bold text-yellow-400 mt-1">{badge.score} pts</p>
        <p className="text-sm text-white/80 mt-1">{badge.description}</p>

        {(onEdit || onDelete || onAssign || onUnassign) && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {currentUser.isAdmin && onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-sm transition"
              >
                Modifier
              </button>
            )}
            {currentUser.isAdmin && onDelete && (
              <button
                onClick={onDelete}
                className="px-4 py-1 rounded bg-red-700 hover:bg-red-600 text-sm transition"
              >
                Supprimer
              </button>
            )}
            {currentUser.isModerator && badge.activityUuid && onAssign && (
              <button
                onClick={onAssign}
                className="px-4 py-1 rounded bg-orange-600 hover:bg-orange-500 text-sm transition"
              >
                Assigner
              </button>
            )}
            {currentUser.isAdmin && onUnassign && (
              <button
                onClick={onUnassign}
                className="px-4 py-1 rounded bg-pink-600 hover:bg-pink-500 text-sm transition"
              >
                Désassigner
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
