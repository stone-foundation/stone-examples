import { X } from "lucide-react"
import { FC, useState } from "react"
import { Mission } from "../../models/Mission"
import { Badge, BadgeType } from "../../models/Badge"
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"

interface BadgeModalFormProps {
  open: boolean
  mission?: Mission
  onClose: () => void
  initialData?: Partial<Badge>
  onSubmit: (badge: Partial<Badge>) => Promise<void>
}

const BADGE_TYPES: { label: string; value: BadgeType }[] = [
  { label: "Victoire", value: "victory" },
  { label: "Participation", value: "participation" },
  { label: "Accomplissement", value: "achievement" },
  { label: "Spécial", value: "special" },
]

const BADGE_VISIBILITIES: { label: string; value: 'public' | 'private' }[] = [
  { label: "Privé", value: "private" },
  { label: "Public", value: "public" },
]

const COLOR_OPTIONS = [
  "#f87171", "#facc15", "#4ade80", "#60a5fa", "#a78bfa", "#f472b6", "#f97316", "#14b8a6"
]

export const BadgeModalForm: FC<BadgeModalFormProps> = ({
  open,
  mission,
  onClose,
  onSubmit,
  initialData = {},
}) => {
  const [form, setForm] = useState<Partial<Badge>>(initialData)

  const handleChange = (key: keyof Badge, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = () => {
    form.missionUuid = mission?.uuid
    if (!form.name || !form.category || !form.color || !form.categoryLabel) return
    onSubmit(form).then(() => {
      setForm({})
      onClose()
    })
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
          <DialogTitle className="text-xl font-bold mb-4">{
            form.uuid ? "Modifier le badge" : "Créer un badge"
          }</DialogTitle>

          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm">Nom</label>
              <input
                value={form.name ?? ""}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 p-2 rounded-md text-white"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Description</label>
              <textarea
                value={form.description ?? ""}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 p-2 rounded-md text-white"
                rows={3}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Points</label>
              <input
                type="number"
                value={form.score ?? 0}
                onChange={(e) => handleChange("score", parseInt(e.target.value))}
                className="w-full bg-zinc-800 border border-white/10 p-2 rounded-md text-white"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Affectations maximales</label>
              <input
                type="number"
                value={form.maxAssignments ?? 0}
                onChange={(e) => handleChange("maxAssignments", parseInt(e.target.value))}
                className="w-full bg-zinc-800 border border-white/10 p-2 rounded-md text-white"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Visibilité</label>
              <select
                value={form.visibility ?? ""}
                onChange={(e) => handleChange("visibility", e.target.value as BadgeType)}
                className="w-full bg-zinc-800 border border-white/10 p-2 rounded-md text-white"
              >
                <option value="">Sélectionner une visibilité</option>
                {BADGE_VISIBILITIES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm">Catégorie</label>
              <select
                value={form.category ?? ""}
                onChange={(e) => handleChange("category", e.target.value as BadgeType)}
                className="w-full bg-zinc-800 border border-white/10 p-2 rounded-md text-white"
              >
                <option value="">Sélectionner un type</option>
                {BADGE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm">Label de catégorie</label>
              <input
                value={form.categoryLabel ?? ""}
                onChange={(e) => handleChange("categoryLabel", e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 p-2 rounded-md text-white"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Icône (URL)</label>
              <input
                value={form.iconUrl ?? ""}
                onChange={(e) => handleChange("iconUrl", e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 p-2 rounded-md text-white"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Couleur</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      form.color === color ? "border-white" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleChange("color", color)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t mt-5 border-white/10">
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-orange-600 rounded-md hover:bg-orange-500 transition text-sm"
              >
                {form.uuid ? "Modifier" : "Créer"}
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
