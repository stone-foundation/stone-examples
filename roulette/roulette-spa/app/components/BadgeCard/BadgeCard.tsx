import { FC } from "react"
import { Badge } from "../../models/Badge"

interface BadgeCardProps {
  badge: Badge
  onEdit?: () => void
  onDelete?: () => void
  onAssign?: () => void
}

export const BadgeCard: FC<BadgeCardProps> = ({ badge, onEdit, onDelete, onAssign }) => {
  return (
    <div className="p-4 overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl border border-white/10 shadow-md text-white flex flex-col md:flex-row items-center gap-4">
      <div>
        {badge.iconUrl ? (
          <img
            alt={badge.name}
            src={badge.iconUrl}
            className="w-12 h-12 md:w-16 md:h-16 object-contain"
          />
        ) : (
          <span className="text-5xl md:text-6xl text-orange-400">🏅</span>
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-lg md:text-xl font-semibold mb-1">{badge.name}</h3>
        <p className="text-base font-bold text-orange-400 mt-1">{badge.score} pts</p>
        <p className="text-md text-white/80 mt-1">{badge.description}</p>
        <div className="flex gap-2 mt-4 flex-wrap">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white font-medium shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
              title="Edit badge"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-1 rounded-lg bg-red-600 hover:bg-red-700 transition text-white font-medium shadow focus:outline-none focus:ring-2 focus:ring-red-400"
              title="Delete badge"
            >
              Delete
            </button>
          )}
          {onAssign && (
            <button
              onClick={onAssign}
              className="px-4 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 transition text-white font-medium shadow focus:outline-none focus:ring-2 focus:ring-amber-300"
              title="Assign badge"
            >
              Assign
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
