import React, { useState } from 'react'
import { Team } from '../../models/Team'
import { User } from '../../models/User'
import { Pencil, Save, X } from 'lucide-react'

interface PageInfoProps {
  team: Team
  currentUser: User
  onUpdate: (data: Partial<Team>) => Promise<void>
}

export const PageInfo: React.FC<PageInfoProps> = ({ team, currentUser, onUpdate }) => {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Team>>({
    slogan: team.slogan ?? '',
    motto: team.motto ?? '',
    description: team.description ?? '',
    rules: team.rules ?? '',
  })

  const canEdit = team.members.some(member => member.uuid === currentUser.uuid) || currentUser.isAdmin

  const handleChange = (key: keyof Team, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleCancel = () => {
    setForm({
      slogan: team.slogan ?? '',
      motto: team.motto ?? '',
      description: team.description ?? '',
      rules: team.rules ?? '',
    })
    setEditing(false)
  }

  const handleSave = () => {
    onUpdate(form)
    setEditing(false)
  }

  return (
    <div className="bg-white/5 rounded-xl p-6 space-y-4 text-white">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{team.name}</h2>
        {!editing && canEdit && <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-600 hover:bg-orange-500 rounded-md"
        >
          <Pencil size={16} /> Modifier
        </button>}
      </div>

      {!editing && (
        <>
          {team.slogan && (
            <Section label="Slogan">« {team.slogan} »</Section>
          )}
          {team.motto && (
            <Section label="Devise">{team.motto}</Section>
          )}
          {team.captain && (
            <Section label="Capitaine">{team.captain.username}</Section>
          )}
          {team.description && (
            <Section label="Description"><pre>{team.description}</pre></Section>
          )}
          {team.rules && (
            <Section label="Règlements"><pre>{team.rules}</pre></Section>
          )}
          {!team.slogan && !team.motto && !team.description && !team.rules && (
            <p className="text-white/60 text-center border border-white/10 p-6 rounded-lg">
              Aucune information disponible. <br /> Cliquez sur "Modifier" pour ajouter des détails.
            </p>
          )}
        </>
      )}

      {editing && (
        <>
          <FormInput label="Slogan" value={form.slogan} onChange={(v) => handleChange('slogan', v)} />
          <FormInput label="Devise" value={form.motto} onChange={(v) => handleChange('motto', v)} />
          <FormInput label="Description" value={form.description} onChange={(v) => handleChange('description', v)} multiline />
          <FormInput label="Règlements" value={form.rules} onChange={(v) => handleChange('rules', v)} multiline />

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-700 hover:bg-zinc-600 rounded-md"
            >
              <X size={16} /> Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 hover:bg-green-500 rounded-md"
            >
              <Save size={16} /> Enregistrer
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const Section: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <p className="text-sm text-white/70 uppercase font-medium">{label}</p>
    <p className="text-base">{children}</p>
  </div>
)

const FormInput: React.FC<{
  label: string
  value?: string
  onChange: (v: string) => void
  multiline?: boolean
}> = ({ label, value, onChange, multiline = false }) => (
  <div>
    <p className="text-sm text-white/70 uppercase font-medium mb-1">{label}</p>
    {multiline ? (
      <textarea
        rows={3}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-800 border border-white/10 p-2 rounded-md text-white"
      />
    ) : (
      <input
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-800 border border-white/10 p-2 rounded-md text-white"
      />
    )}
  </div>
)
