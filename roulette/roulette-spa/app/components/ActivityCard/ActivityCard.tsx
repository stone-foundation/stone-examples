import clsx from "clsx"
import dayjs from "dayjs"
import { FC, useState } from "react"
import { User } from "../../models/User"
import { ConfirmModal } from "../ConfirmModal/ConfirmModal"
import { Activity, ActivityAssignment } from "../../models/Activity"

type ActivityAction = (activity: Activity, assignment?: ActivityAssignment) => void

interface ActivityCardProps {
  currentUser: User
  activity: Activity
  assignment?: ActivityAssignment

  // Page: gestion
  onEdit?: ActivityAction
  onDelete?: ActivityAction
  onAssign?: ActivityAction

  // Page: équipe / utilisateur
  onCancel?: ActivityAction
  onApprove?: ActivityAction
  onContest?: ActivityAction
  onArchive?: ActivityAction
}

export const ActivityCard: FC<ActivityCardProps> = ({
  activity,
  assignment,
  currentUser,
  onEdit,
  onDelete,
  onAssign,
  onApprove,
  onCancel,
  onContest,
  onArchive,
}) => {
  const [showModal, setShowModal] = useState(false)
  const badge = activity.badge ?? assignment?.badge
  const [action, setAction] = useState<ActivityAction>(() => {})
  const [confirmMessage, setConfirmMessage] = useState<string>("")
  const showActions = !!(onEdit || onDelete || onAssign || onApprove || onCancel || onContest || onArchive)

  const confirm = (action: ActivityAction, message: string) => {
    setShowModal(true)
    setAction(() => action)
    setConfirmMessage(message || "Es-tu sûr de vouloir effectuer cette action ?")
  }

  return (
    <div className="bg-gradient-to-br overflow-hidden from-white/5 to-white/10 border border-white/10 rounded-xl p-4 mt-2 text-white shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-orange-400">{activity.name ?? 'Inconnue'}</h4>
        <span
          className={clsx(
            "text-sm px-3 py-1 rounded-full font-bold shadow-inner",
            activity.impact === "positive" && "bg-green-600/80",
            activity.impact === "negative" && "bg-red-600/80",
            activity.impact === "neutral" && "bg-zinc-700/70"
          )}
        >
          {activity.impact === "positive" ? "+" : ""}
          {activity.impact === "negative" ? "-" : ""}
          {activity.score ?? 0}
        </span>
      </div>

      {activity.description && (
        <p className="text-sm text-white/80 leading-snug">{activity.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
        <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md">
          🎯 {activity.categoryLabel ?? activity.category}
        </span>
        {badge && (
          <span className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 rounded-md flex items-center gap-1">
            <span className="text-md">🏅</span> {badge.category} / {badge.name} ({badge.score})
          </span>
        )}
      </div>

      {assignment && (
        <div className="text-sm text-white/70 mt-2 space-y-1">
          {assignment.member && (
            <div>
              👤 <strong>{assignment.member.username}</strong>
            </div>
          )}
          {assignment.locationCity && (
            <div>
              📍 {decodeURIComponent(assignment.locationCity)}, {decodeURIComponent(assignment.locationRegion ?? '')}
            </div>
          )}
          {assignment.comment && (
            <div>
              💬 « {assignment.comment} »
            </div>
          )}
          <div>
            📅 « {dayjs(assignment.createdAt).format('D-MM-YYYY h:mm A')} »
          </div>
          <div>
            📌 Statut :{" "}
            <span className="font-semibold capitalize text-white">
              {assignment.status}
            </span>
          </div>
        </div>
      )}

      {showActions && (
        <div className="flex flex-wrap gap-2 mt-4 text-sm">
          {onEdit && currentUser.isAdmin && (
            <button
              onClick={() => onEdit(activity, assignment)}
              className="px-4 py-1 rounded bg-zinc-700 hover:bg-zinc-600"
            >
              Modifier
            </button>
          )}
          {onDelete && currentUser.isAdmin && (
            <button
              onClick={() => confirm(onDelete, "Es-tu sûr de vouloir supprimer cette activité ?")}
              className="px-4 py-1 rounded bg-red-700 hover:bg-red-600"
            >
              Supprimer
            </button>
          )}
          {onAssign && currentUser.isModerator && (
            <button
              onClick={() => onAssign(activity, assignment)}
              className="px-4 py-1 rounded bg-orange-600 hover:bg-orange-500"
            >
              Assigner
            </button>
          )}

          {onApprove && assignment?.status === 'pending' && (
            <button
              onClick={() => confirm(onApprove, "Es-tu sûr de vouloir approuver cette activité ?")}
              className="px-4 py-1 rounded bg-green-700 hover:bg-green-600"
            >
              Approuver
            </button>
          )}
          {onCancel && assignment?.status === 'pending' && (
            <button
              onClick={() => confirm(onCancel, "Es-tu sûr de vouloir annuler cette activité ?")}
              className="px-4 py-1 rounded bg-red-600 hover:bg-red-500"
            >
              Annuler
            </button>
          )}
          {onContest && assignment?.status === 'pending' && (
            <button
              onClick={() => confirm(onContest, "Es-tu sûr de vouloir contester cette activité ?")}
              className="px-4 py-1 rounded bg-yellow-700 hover:bg-yellow-600"
            >
              Contester
            </button>
          )}
          {onArchive && currentUser.isAdmin && assignment?.status === 'pending' && (
            <button
              onClick={() => confirm(onArchive, "Es-tu sûr de vouloir archiver cette activité ?")}
              className="px-4 py-1 rounded bg-zinc-600 hover:bg-zinc-500"
            >
              Archiver
            </button>
          )}
        </div>
      )}
      
      <ConfirmModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => {
          setShowModal(false)
          action(activity, assignment)
        }}
        message={confirmMessage}
      />
    </div>
  )
}
