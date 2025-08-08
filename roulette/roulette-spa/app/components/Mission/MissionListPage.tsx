import { useState } from 'react'
import { User } from '../../models/User'
import { Avatar } from '../Avatar/Avatar'
import { Mission } from '../../models/Mission'
import { StoneLink } from '@stone-js/use-react'
import { MissionListCard } from './MissionListCard'
import { FormButton } from '../FormButton/FormButton'
import { ConfirmModal } from '../ConfirmModal/ConfirmModal'

interface MissionListPageProps {
  user?: User
  mission?: Mission
  missions: Mission[]
  onExploreMission: (mission: Mission) => void
  onStartMission: (mission: Mission) => Promise<void>
}

export function MissionListPage({ user, missions, mission, onStartMission, onExploreMission }: MissionListPageProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [currentMission, setCurrentMission] = useState<Mission | null>(null)

  const onStartMissionHandler = (mission: Mission) => {
    setShowConfirm(true)
    setCurrentMission(mission)
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col lg:flex-row gap-6 lg:mt-20">
      <div className="flex-1 bg-neutral-800 p-6 rounded-xl shadow border border-white/10">
        {mission ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar size={120} name={mission.name} imageUrl={mission.imageUrl} className="rounded-lg object-cover border border-white/10" />
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{mission.name}</h2>
                <p className="text-sm text-gray-400">Code : {mission.code}</p>
                <p className="text-sm text-gray-400">Visibilité : {mission.visibility}</p>
                {mission.location && <p className="text-sm text-gray-400">Lieu : {mission.location}</p>}
                {mission.startDate && <p className="text-sm text-gray-400">Début : {mission.startDate}</p>}
                {mission.endDate && <p className="text-sm text-gray-400">Fin : {mission.endDate}</p>}
                {mission.openDate && <p className="text-sm text-gray-400">Ouvert : {mission.openDate}</p>}
              </div>
            </div>

            <p className="text-gray-400 leading-relaxed">{mission.description}</p>

            <div className="flex flex-wrap gap-4 pt-2">
              {mission.endDate && <FormButton onClick={() => onExploreMission(mission)}>
                Explorer la mission
              </FormButton>}
              {!mission.endDate && <FormButton onClick={() => onStartMissionHandler(mission)}>
                Commencer la mission
              </FormButton>}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-12">
            <h2 className="text-5xl font-bold text-white mb-4">Bienvenue sur <br /> Tralala</h2>
            <p className="text-lg max-w-md">
              Sélectionnez une mission pour voir les détails et commencer votre aventure.
            </p>
            {user?.isAdmin && <p>
              <StoneLink to="/" className="w-full mt-10 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-md transition">
                Retour à l'accueil
              </StoneLink>
            </p>}
          </div>
        )}
      </div>

      <div className="w-full sm:w-72 lg:max-h-[70vh] overflow-y-auto">
        <div className="space-y-4">
          {missions.map((mission) => (
            <MissionListCard
              key={mission.uuid}
              mission={mission}
            />
          ))}
        </div>
      </div>

      <ConfirmModal
        open={showConfirm}
        title="Confirmer le début de la mission"
        message="Êtes-vous sûr de vouloir commencer cette mission ?"
        onConfirm={() => {
          setShowConfirm(false)
          currentMission && onStartMission(currentMission).catch(() => {})
        }}
        onClose={() => setShowConfirm(false)}
      />
    </div>
  )
}
