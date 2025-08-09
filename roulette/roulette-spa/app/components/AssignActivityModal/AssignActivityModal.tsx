import { X } from "lucide-react"
import { FC, useState } from "react"
import { Mission } from "../../models/Mission"
import { Team, TeamMember } from "../../models/Team"
import { Activity, ActivityAssignment } from "../../models/Activity"
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"

interface AssignActivityModalProps {
  open: boolean
  teams: Team[]
  mission?: Mission
  activity: Activity
  onClose: () => void
  membersByTeam: Record<string, TeamMember[]>
  onAssign: (activity: Activity, payload: Partial<ActivityAssignment>) => Promise<void>
}

export const AssignActivityModal: FC<AssignActivityModalProps> = ({
  open,
  teams,
  mission,
  onClose,
  onAssign,
  activity,
  membersByTeam,
}) => {
  const [comment, setComment] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  const handleSubmit = () => {
    if (!selectedTeam) return
    onAssign(activity, {
      missionUuid: mission?.uuid,
      activityUuid: activity.uuid,
      teamUuid: selectedTeam.uuid,
      badgeUuid: activity.badge?.uuid,
      teamMemberUuid: selectedMember?.uuid,
      comment: comment.trim() || undefined,
    }).catch(() => {})
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center md:p-4 overflow-y-auto">
        <DialogPanel className="w-full h-full md:h-auto max-w-lg bg-zinc-900 md:rounded-xl text-white relative border border-white/10 shadow-lg flex flex-col max-h-screen">
          <div className="px-6 pt-6 pb-2 flex items-center justify-between">
            <DialogTitle className="text-xl font-bold mb-4">
              Assigner une activité
            </DialogTitle>

            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-white hover:text-red-400"
            >
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
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

          <div className="px-6 py-4 border-t border-white/10">
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-orange-600 rounded-md hover:bg-orange-500 transition text-sm"
                disabled={!selectedTeam}
              >
                Assigner l’activité
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
