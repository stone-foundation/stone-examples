import clsx from "clsx"
import { FC, useState } from "react"
import { User } from "../../models/User"
import { Badge } from "../../models/Badge"
import { Plus, Search } from "lucide-react"
import { Mission } from "../../models/Mission"
import { Team, TeamMember } from "../../models/Team"
import { ActivityCard } from "../ActivityCard/ActivityCard"
import { Activity, ActivityAssignment } from "../../models/Activity"
import { ActivityModalForm } from "../ActivityModalForm/ActivityModalForm"
import { AssignActivityModal } from "../AssignActivityModal/AssignActivityModal"

interface ActivityListProps {
  teams: Team[]
  mission?: Mission
  currentUser: User
  activities: Activity[]
  availableBadges: Badge[]
  membersByTeam: Record<string, TeamMember[]>
  onDelete: (activity: Activity) => Promise<void>
  onCreate: (data: Partial<Activity>) => Promise<void>
  onUpdate: (activity: Activity, data: Partial<Activity>) => Promise<void>
  onAssign: (activity: Activity, payload: Partial<ActivityAssignment>) => Promise<void>
}

export const ActivityList: FC<ActivityListProps> = ({
  teams,
  mission,
  onUpdate,
  onDelete,
  onCreate,
  onAssign,
  activities,
  currentUser,
  membersByTeam,
  availableBadges
}) => {
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | undefined>()
  const [assigningActivity, setAssigningActivity] = useState<Activity | undefined>()
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>("all")

  const FILTERS = [
    { label: "Tous", value: "all" },
    { label: "Positif", value: "positive" },
    { label: "Neutre", value: "neutral" },
    { label: "Négatif", value: "negative" },
  ]

  const filteredActivities = activities.filter((activity) => {
    const matchSearch = activity.name.toLowerCase().includes(search.toLowerCase()) 
      || activity.description.toLowerCase().includes(search.toLowerCase())
    const matchImpact = filter === "all" || activity.impact === filter
    return matchSearch && matchImpact
  })

  return (
    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-4xl font-bold">Activités</h1>
        {currentUser?.isAdmin && <button
          onClick={() => {
            setShowForm(true)
            setEditingActivity(undefined)
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-orange-600 hover:bg-orange-500"
        >
          <Plus size={16} /> Créer une activité
        </button>}
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une activité"
            className="w-full pl-10 pr-4 py-2 rounded-md bg-zinc-800 border border-white/10 text-white"
          />
        </div>

        <div className="w-full md:w-auto">
          <div className="flex justify-between md:justify-start gap-2 w-full">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value as any)}
                className={clsx(
                  "flex-1 px-4 py-2 rounded-md text-sm font-medium transition",
                  filter === f.value
                    ? "bg-orange-600 text-white"
                    : "bg-zinc-800 text-white/70 hover:bg-zinc-700"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredActivities.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center text-white/60 border border-white/10 rounded-md p-6 mt-6">
            Aucune activité trouvée
          </div>
        )}
        {filteredActivities.map((activity) => (
          <div key={activity.uuid} className="relative group">
            <ActivityCard
              activity={activity}
              currentUser={currentUser}
              onEdit={() => {
                setEditingActivity(activity)
                setShowForm(true)
              }}
              onAssign={() => setAssigningActivity(activity)}
              onDelete={() => onDelete(activity).catch(() => {})}
            />
          </div>
        ))}
      </div>

      {showForm && (
        <ActivityModalForm
          open={showForm}
          mission={mission}
          initialData={editingActivity}
          availableBadges={availableBadges}
          onClose={() => setShowForm(false)}
          onSubmit={async (a) => {
            if (editingActivity) await onUpdate(editingActivity, a)
            else await onCreate(a)
          }}
        />
      )}

      {assigningActivity && (
        <AssignActivityModal
          teams={teams}
          mission={mission}
          onAssign={onAssign}
          open={!!assigningActivity}
          activity={assigningActivity}
          membersByTeam={membersByTeam}
          onClose={() => setAssigningActivity(undefined)}
        />
      )}
    </div>
  )
}
