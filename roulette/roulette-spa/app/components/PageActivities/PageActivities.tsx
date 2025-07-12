import { FC } from "react"
import { User } from "../../models/User"
import { ActivityAssignment } from "../../models/Activity"
import { ActivityCard } from "../ActivityCard/ActivityCard"

interface PageActivitiesProps {
  currentUser: User
  assignments: ActivityAssignment[]
  onApprove?: (assignment: ActivityAssignment) => void
  onCancel?: (assignment: ActivityAssignment) => void
  onContest?: (assignment: ActivityAssignment) => void
  onArchive?: (assignment: ActivityAssignment) => void
}

export const PageActivities: FC<PageActivitiesProps> = ({
  assignments,
  currentUser,
  onApprove,
  onCancel,
  onContest,
  onArchive,
}) => {
  return (
    <div className="bg-white/5 rounded-xl p-6 space-y-4 text-white">
      <h2 className="text-xl font-bold text-white">Activités attribuées ({assignments.length})</h2>

      {assignments.length === 0 ? (
        <div className="text-white/60 text-center border border-white/10 p-6 rounded-lg">
          Aucune activité assignée à cette équipe.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((a) => (
            <ActivityCard
              key={a.uuid}
              assignment={a}
              activity={a.activity}
              currentUser={currentUser}
              onApprove={onApprove ? () => onApprove(a) : undefined}
              onCancel={onCancel ? () => onCancel(a) : undefined}
              onContest={onContest ? () => onContest(a) : undefined}
              onArchive={onArchive ? () => onArchive(a) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
