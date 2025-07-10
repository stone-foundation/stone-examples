import { FC, useState } from "react"
import { User } from "../../models/User"
import { Plus, Search } from "lucide-react"
import { BadgeCard } from "../BadgeCard/BadgeCard"
import { Team, TeamMember } from "../../models/Team"
import { BadgeModalForm } from "../BadgeModalForm/BadgeModalForm"
import { AssignBadgeModal } from "../AssignBadgeModal/AssignBadgeModal"
import { Badge, BadgeAssignPayload, BadgeType } from "../../models/Badge"

interface BadgesProps {
  teams: Team[]
  badges: Badge[]
  currentUser?: User
  membersByTeam: Record<string, TeamMember[]>
  onDelete: (badge: Badge) => void
  onCreate: (data: Partial<Badge>) => void
  onAssign: (payload: BadgeAssignPayload) => void
  onUpdate: (badge: Badge, data: Partial<Badge>) => void
}

export const Badges: FC<BadgesProps> = ({
  teams,
  badges,
  onUpdate,
  onDelete,
  onCreate,
  onAssign,
  membersByTeam
}) => {
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<BadgeType | "all">("all")
  const [editingBadge, setEditingBadge] = useState<Badge | undefined>()
  const [assigningBadge, setAssigningBadge] = useState<Badge | undefined>()

  const filteredBadges = badges.filter((badge) => {
    const matchSearch = badge.name.toLowerCase().includes(search.toLowerCase())
    const matchType = filter === "all" || badge.type === filter
    return matchSearch && matchType
  })

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Liste des badges</h1>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingBadge(undefined)
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-orange-600 hover:bg-orange-500"
        >
          <Plus size={16} /> Créer un badge
        </button>
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

        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 rounded-md bg-zinc-800 border border-white/10 text-white px-4"
          >
            <option value="all">Tous les types</option>
            <option value="victory">Victoire</option>
            <option value="participation">Participation</option>
            <option value="achievement">Réalisation</option>
            <option value="special">Spécial</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {assigningBadge && (
        <AssignBadgeModal
          open={!!assigningBadge}
          badge={assigningBadge}
          teams={teams}
          membersByTeam={membersByTeam}
          onAssign={onAssign}
          onClose={() => setAssigningBadge(undefined)}
        />
      )}
    </div>
  )
}
