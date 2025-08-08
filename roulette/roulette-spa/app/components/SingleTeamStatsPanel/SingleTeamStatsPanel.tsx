import { Logger } from '@stone-js/core'
import { Team } from '../../models/Team'
import { Avatar } from '../Avatar/Avatar'
import { StoneContext } from '@stone-js/use-react'
import { useState, useContext, useEffect } from 'react'
import { ActivityAssignmentService } from '../../services/ActivityAssignmentService'

interface SingleTeamStatsPanelProps {
  team: Team
}

export const SingleTeamStatsPanel: React.FC<SingleTeamStatsPanelProps> = ({ team }) => {
  const [currentTeam, setCurrentTeam] = useState<Team>()
  const activityAssignmentService = useContext(StoneContext).container.resolve<ActivityAssignmentService>(ActivityAssignmentService)

  useEffect(() => {
    activityAssignmentService
      .stats()
      .then(v => {
        setCurrentTeam(v.teams.find(t => t.name === team.name) ?? team)
      })
      .catch(error => {
        Logger.error("Failed to fetch stats:", error)
      })
  }, [])

  return (
    <div className="space-y-6 mb-6 bg-white/5 rounded-xl p-4 shadow-sm border border-white/10">
      {/* Derniers Badges */}
      {Boolean(currentTeam?.countBadges) && <section>
        <h3 className="text-sm text-white/60 uppercase font-semibold mb-2">Derniers badges reçus</h3>
        <div className="space-y-2">
          {currentTeam?.badges?.slice(0, 3).map(badge => (
            <div
              key={badge.name}
              className="flex items-center bg-white/5 rounded-lg px-3 py-2 gap-3 shadow-sm"
            >
              <div className="flex-shrink-0">
                <Avatar size={32} name={badge.name} imageUrl={badge.iconUrl} className="bg-gradient-to-tr from-yellow-400 to-yellow-600 shadow" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-base">{badge.name}</span>
                <span className="text-yellow-300 font-bold text-sm">{badge.score} pts</span>
              </div>
            </div>
          ))}
        </div>
      </section>}

      {/* Classement interne */}
      <section>
        <h3 className="text-sm text-white/60 uppercase font-semibold mb-2">Classement de l’unité</h3>
        <div className="bg-white/5 p-4 rounded-xl">
          <p className="text-white text-lg font-bold">#{team.rank ?? 'N/A'}</p>
          <p className="text-sm text-white/70">Score total : <span className="font-semibold">{team.score} pts</span></p>
        </div>
      </section>

      {/* Événements majeurs */}
      {Boolean(currentTeam?.countActivities) && <section>
        <h3 className="text-sm text-white/60 uppercase font-semibold mb-2">Activités majeures</h3>
        <div className="space-y-2">
          {currentTeam?.activities?.slice(0, 3).map(activity => (
            <div
              key={activity.uuid}
              className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 gap-3 shadow-sm"
            >
              <div className="flex flex-col">
                <span className="text-white font-semibold text-base">{activity.name}</span>
                <span className="bg-white/10 text-xs text-white rounded-md px-2 py-0.5 mt-1 w-fit">
                  {activity.category}
                </span>
              </div>
              <div
                className={`rounded-full px-4 py-1 font-bold text-white text-sm ${
                  activity.impact === 'negative'
                    ? 'bg-red-500'
                    : activity.impact === 'positive'
                    ? 'bg-green-500'
                    : 'bg-gray-500'
                }`}
              >
                {activity.impact === 'negative' ? `-${activity.score}` : `+${activity.score}`}
              </div>
            </div>
          ))}
        </div>
      </section>}

      {/* Bio du capitaine */}
      {currentTeam?.captain !== undefined && <section>
        <h3 className="text-sm text-white/60 uppercase font-semibold mb-2">Capitaine</h3>
        <div className="bg-white/5 p-4 rounded-xl flex items-center gap-3">
          <Avatar size={24} name={currentTeam.captain.username} />
          <div>
            <p className="text-white font-medium capitalize">{currentTeam.captain.username}</p>
          </div>
        </div>
      </section>}
    </div>
  )
}
