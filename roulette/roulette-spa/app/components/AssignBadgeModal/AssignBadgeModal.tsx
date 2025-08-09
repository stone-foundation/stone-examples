import { X } from "lucide-react"
import { FC, useState } from "react"
import { Badge } from "../../models/Badge"
import { Mission } from "../../models/Mission"
import { Team, TeamMember } from "../../models/Team"
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"

interface AssignBadgeModalProps {
  open: boolean,
  mission?: Mission
  onClose: () => void
  onAssign: (payload: {
    team: Team
    badge: Badge
    comment?: string
    missionUuid?: string
    member?: TeamMember
  }) => Promise<void>
  badge: Badge
  teams: Team[]
  membersByTeam: Record<string, TeamMember[]> // teamUuid → members
}

export const AssignBadgeModal: FC<AssignBadgeModalProps> = ({
  open,
  badge,
  teams,
  mission,
  onClose,
  onAssign,
  membersByTeam,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [comment, setComment] = useState("")

  const handleSubmit = () => {
    if (!selectedTeam) return
    onAssign({
      badge,
      team: selectedTeam,
      missionUuid: mission?.uuid,
      member: selectedMember ?? undefined,
      comment: comment.trim() || undefined,
    }).catch(() => {})
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-lg bg-zinc-900 rounded-xl p-6 text-white relative border border-white/10 shadow-lg">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white hover:text-red-400"
          >
            <X size={20} />
          </button>

          <DialogTitle className="text-xl font-bold mb-4">
            Assigner le badge à une équipe
          </DialogTitle>

          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm">Équipe</label>
              <select
                value={selectedTeam?.uuid ?? ""}
                onChange={(e) => {
                  const team = teams.find((t) => t.uuid === e.target.value) ?? null
                  setSelectedTeam(team)
                  setSelectedMember(null)
                }}
                className="w-full bg-zinc-800 border border-white/10 p-2 rounded-md text-white"
              >
                <option value="">Sélectionner une équipe</option>
                {teams.map((t) => (
                  <option key={t.uuid} value={t.uuid}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedTeam && (
              <div>
                <label className="block mb-1 text-sm">Membre (facultatif)</label>
                <select
                  value={selectedMember?.uuid ?? ""}
                  onChange={(e) => {
                    const member = membersByTeam[selectedTeam.uuid]?.find(
                      (m) => m.uuid === e.target.value
                    ) ?? null
                    setSelectedMember(member)
                  }}
                  className="w-full bg-zinc-800 border border-white/10 p-2 rounded-md text-white"
                >
                  <option value="">Aucun</option>
                  {membersByTeam[selectedTeam.uuid]?.map((m) => (
                    <option key={m.uuid} value={m.uuid}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block mb-1 text-sm">Commentaire (facultatif)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 p-2 rounded-md text-white"
                rows={3}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-orange-600 rounded-md hover:bg-orange-500 transition text-sm"
              disabled={!selectedTeam}
            >
              Assigner le badge
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
