import clsx from "clsx"
import { FC, useState } from "react"
import { User } from "../../models/User"
import { Plus, Search } from "lucide-react"
import { BadgeCard } from "../BadgeCard/BadgeCard"
import { Team, TeamMember } from "../../models/Team"
import { Badge, BadgeType } from "../../models/Badge"
import { ActivityAssignment } from "../../models/Activity"
import { BadgeModalForm } from "../BadgeModalForm/BadgeModalForm"
import { AssignActivityModal } from "../AssignActivityModal/AssignActivityModal"

interface BadgeListProps {
  teams: Team[]
  badges: Badge[]
  currentUser: User
  onDelete: (badge: Badge) => void
  onCreate: (data: Partial<Badge>) => void
  membersByTeam: Record<string, TeamMember[]>
  onUpdate: (badge: Badge, data: Partial<Badge>) => void
  onAssign: (payload: Partial<ActivityAssignment>) => void
}

export const BadgeList: FC<BadgeListProps> = ({
  teams,
  badges,
  onUpdate,
  onDelete,
  onCreate,
  onAssign,
  currentUser,
  membersByTeam
}) => {
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<BadgeType | "all">("all")
  const [editingBadge, setEditingBadge] = useState<Badge | undefined>()
  const [assigningBadge, setAssigningBadge] = useState<Badge | undefined>()

  const FILTERS = badges.reduce((prev, badge) => {
    return prev.some(f => f.value.toLowerCase() === badge.category.toLowerCase()) ? prev : [...prev, { value: badge.category, label: badge.categoryLabel }]
  }, [] as { value: string, label: string }[]).slice(0, 5)

  const filteredBadges = badges.filter((badge) => {
    const matchSearch = badge.name.toLowerCase().includes(search.toLowerCase())
      || badge.description.toLowerCase().includes(search.toLowerCase())
    const matchType = filter === "all" || badge.category === filter
    return matchSearch && matchType
  })

  return (
    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-4xl font-bold">Badges</h1>
        {currentUser?.isAdmin && <button
          onClick={() => {
            setShowForm(true)
            setEditingBadge(undefined)
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-orange-600 hover:bg-orange-500"
        >
          <Plus size={16} /> Créer un badge
        </button>}
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un badge"
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
        {filteredBadges.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center text-white/60 border border-white/10 rounded-md p-6 mt-6">
            Aucun badge trouvé
          </div>
        )}
        {filteredBadges.map((badge) => (
          <div key={badge.uuid} className="relative group">
            <BadgeCard
              badge={badge}
              onEdit={() => {
                setEditingBadge(badge)
                setShowForm(true)
              }}
              currentUser={currentUser}
              onDelete={() => onDelete(badge)}
              onAssign={() => setAssigningBadge(badge)}
            />
          </div>
        ))}
      </div>

      {showForm && (
        <BadgeModalForm
          open={showForm}
          initialData={editingBadge}
          onClose={() => setShowForm(false)}
          onSubmit={(b) => {
            if (editingBadge) onUpdate(editingBadge, b)
            else onCreate(b)
          }}
        />
      )}
      
      {assigningBadge?.activityUuid && (
        <AssignActivityModal
          teams={teams}
          open={!!assigningBadge}
          membersByTeam={membersByTeam}
          onAssign={(_, v) => onAssign(v)}
          onClose={() => setAssigningBadge(undefined)}
          activity={{ uuid: assigningBadge.activityUuid, badge: assigningBadge } as any}
        />
      )}
    </div>
  )
}
