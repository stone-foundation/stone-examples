import { X } from "lucide-react"
import { FC, useState } from "react"
import { Badge } from "../../models/Badge"
import { Activity } from "../../models/Activity"
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"

interface ActivityModalFormProps {
  open: boolean
  onClose: () => void
  availableBadges: Badge[]
  initialData?: Partial<Activity>
  onSubmit: (activity: Partial<Activity>) => void
}

const IMPACT_OPTIONS = [
  { label: "Positive", value: "positive" },
  { label: "Négative", value: "negative" },
  { label: "Neutre", value: "neutral" },
]

const CONVERSION_WINDOWS = [
  { label: "Par équipe", value: "team" },
  { label: "Par membre", value: "member" },
]

export const ActivityModalForm: FC<ActivityModalFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData = {},
  availableBadges = [],
}) => {
  const [form, setForm] = useState<Partial<Activity>>(initialData)

  const handleChange = (key: keyof Activity, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = () => {
    if (!form.name || !form.description || !form.category || !form.categoryLabel || !form.impact || !form.score)
      return
    onSubmit(form)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center md:p-4 overflow-y-auto">
        <DialogPanel className="w-full h-full md:h-auto max-w-lg bg-zinc-900 md:rounded-xl text-white relative border border-white/10 shadow-lg flex flex-col max-h-screen">
          <div className="px-6 pt-6 pb-2 flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {form.uuid ? "Modifier l’activité" : "Créer une activité"}
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-white hover:text-red-400"
            >
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
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
              <label className="block mb-1 text-sm">Catégorie</label>
              <input
                value={form.category ?? ""}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 p-2 rounded-md text-white"
              />
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
              <label className="block mb-1 text-sm">Impact</label>
              <select
                value={form.impact ?? ""}
                onChange={(e) => handleChange("impact", e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 p-2 rounded-md text-white"
              >
                <option value="">Sélectionner un impact</option>
                {IMPACT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm">Badge associé (optionnel)</label>
              <select
                value={form.badgeUuid ?? ""}
                onChange={(e) => handleChange("badgeUuid", e.target.value || null)}
                className="w-full bg-zinc-800 border border-white/10 p-2 rounded-md text-white"
              >
                <option value="">Aucun</option>
                {availableBadges.map((badge) => (
                  <option key={badge.uuid} value={badge.uuid}>
                    {badge.category} / {badge.name} ({badge.score} pts)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!!form.autoConvertToBadge}
                onChange={(e) => handleChange("autoConvertToBadge", e.target.checked)}
              />
              <label>Conversion automatique en badge</label>
            </div>
            {form.autoConvertToBadge && (
              <>
                <div>
                  <label className="block mb-1 text-sm">Seuil de conversion</label>
                  <input
                    type="number"
                    value={form.conversionThreshold ?? ""}
                    onChange={(e) =>
                      handleChange("conversionThreshold", parseInt(e.target.value))
                    }
                    className="w-full bg-zinc-800 border border-white/10 p-2 rounded-md text-white"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm">Fenêtre de conversion</label>
                  <select
                    value={form.conversionWindow ?? ""}
                    onChange={(e) =>
                      handleChange("conversionWindow", e.target.value as "team" | "member")
                    }
                    className="w-full bg-zinc-800 border border-white/10 p-2 rounded-md text-white"
                  >
                    <option value="">Sélectionner</option>
                    {CONVERSION_WINDOWS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm">Durée de validité (en jours)</label>
                  <input
                    type="number"
                    value={form.validityDuration ?? ""}
                    onChange={(e) =>
                      handleChange("validityDuration", parseInt(e.target.value))
                    }
                    className="w-full bg-zinc-800 border border-white/10 p-2 rounded-md text-white"
                  />
                </div>
              </>
            )}
          </div>

          <div className="px-6 py-4 border-t border-white/10">
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
