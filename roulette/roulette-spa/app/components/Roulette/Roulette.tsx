import { User } from '../../models/User'
import { Mission } from '../../models/Mission'
import { AlertBox } from '../AlertBox/AlertBox'
import { JSX, useEffect, useState } from 'react'
import { TeamPanel } from '../TeamPanel/TeamPanel'
import { IBlueprint, Logger } from '@stone-js/core'
import { Team, TeamMember } from '../../models/Team'
import { TeamService } from '../../services/TeamService'
import { ReactIncomingEvent } from '@stone-js/use-react'
import { RouletteWheel } from '../RouletteWheel/RouletteWheel'
import { SpinPayload, SpinResult } from '../../models/Roulette'
import { RouletteService } from '../../services/RouletteService'
import { TeamStatsPanel } from '../TeamStatsPanel/TeamStatsPanel'
import { TeamPanelSkeleton } from '../TeamPanel/TeamPanelSkeleton'
import { TeamMemberService } from '../../services/TeamMemberService'
import { TeamStatsPanelSkeleton } from '../TeamStatsPanel/TeamStatsPanelSkeleton'

interface RouletteProps {
  blueprint: IBlueprint
  teamService: TeamService
  event: ReactIncomingEvent
  rouletteService: RouletteService
  teamMemberService: TeamMemberService
}

export const Roulette = ({ blueprint, teamService, rouletteService, teamMemberService, event }: RouletteProps): JSX.Element => {
  const user = event.getUser<User>()
  const [teams, setTeams] = useState<Team[]>([])
  const [loadingTeam, setLoadingTeam] = useState(true)
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [error, setError] = useState<string | undefined>()
  const [currentTeam, setCurrentTeam] = useState<Team | undefined>()
  const teamMember = event.cookies.getValue<TeamMember>('teamMember')
  const spinningTime = blueprint.get('app.roulette.spinningTime', 10000)
  const missionUuid = event.cookies.getValue<Mission>('mission')?.uuid ?? ''
  const [currentTeamMembers, setCurrentTeamMembers] = useState<TeamMember[]>([])
  const [currentTeamMember, setCurrentTeamMember] = useState<TeamMember | undefined>(teamMember)

  useEffect(() => {
    let cancelled = false

    setLoadingTeams(true)

    teamService
      .list({ missionUuid }, 50)
      .then(v => {
        if (!cancelled) {
          setTeams(v.items)
          setCurrentTeam(v.items.find(t => t.uuid === teamMember?.teamUuid))
        }
      })
      .catch(e => {
        if (!cancelled) setError(e.response?.data?.errors?.message ?? e.message)
      })
      .finally(() => {
        if (!cancelled) setTimeout(() => setLoadingTeams(false), 500)
      })

    setLoadingTeam(true)

    teamMemberService
      .listByCurrentUser(missionUuid, 50)
      .then(v => {
        if (!cancelled) {
          setCurrentTeamMembers(v.items)
        }
      })
      .catch(e => {
        if (!cancelled) Logger.error(e.response?.data?.errors?.message ?? e.message)
      })
      .finally(() => {
        if (!cancelled) setTimeout(() => setLoadingTeam(false), 500)
      })

    return () => {
      cancelled = true
    }
  }, [teamService])

  const spinRoulette = async (data: SpinPayload): Promise<{ result: SpinResult, teams: Team[], teamMembers: TeamMember[] }> => {
    const result = await rouletteService.spin(data)
    const teams = await teamService.list({ missionUuid }, 50).then(v => v.items)
    const teamMembers = await teamMemberService.listByCurrentUser(missionUuid, 50).then(v => v.items)

    return { result, teams, teamMembers }
  }

  const onSpin = async (data: SpinPayload): Promise<SpinResult> => {
    setError(undefined)
    setLoadingTeam(true)

    return await new Promise<SpinResult>((resolve, reject) => {
      spinRoulette(data)
        .then(v => {
          const teamMember = v.teamMembers.find(w => w.userUuid === user?.uuid)
          event.cookies.add('teamMember', teamMember, { path: '/' })
          
          setTimeout(() => {
            setTeams(v.teams)
            setCurrentTeamMember(teamMember)
            setCurrentTeamMembers(v.teamMembers)
            setCurrentTeam(v.teams.find(t => t.uuid === teamMember?.teamUuid))
            resolve(v.result)
          }, spinningTime)
        })
        .catch((e: any) => {
          setTimeout(() => {
            setError(e.response?.data?.errors?.message ?? e.message)
            reject(new Error(e.response?.data?.errors?.message ?? e.message))
          }, spinningTime)
        }).finally(() => {
          setTimeout(() => setLoadingTeam(false), spinningTime)
        })
    })
  }

  return (
    <>
      <div className='sm:w-64 transition-all duration-500'>
        {loadingTeams
          ? (
            <TeamStatsPanelSkeleton length={5} />
            )
          : (
              teams.length > 0 && <TeamStatsPanel stats={teams} />
            )}
      </div>

      <div className='flex-1 flex flex-col'>
        {error !== undefined && (
          <AlertBox variant='error' className='mb-10 text-center'>
            {error}
          </AlertBox>
        )}
        {(currentTeam !== undefined && error === undefined) && (
          <AlertBox variant='success' className='mb-10 text-center'>
            🎉 Felicitations! <br />
            Vous avez été affecté(e) à l’unité <strong>{currentTeam.name}</strong>!
          </AlertBox>
        )}
        <div className='flex-1 flex justify-center items-start transition-all duration-500'>
          <RouletteWheel onSpin={onSpin} missionUuid={missionUuid} memberName={currentTeamMember?.name} />
        </div>
      </div>

      <div className='sm:w-64 transition-all duration-500'>
        {loadingTeam
          ? (
            <TeamPanelSkeleton length={5} />
            )
          : (
              (currentTeam !== undefined) && <TeamPanel team={currentTeam} members={currentTeamMembers} />
            )}
      </div>
    </>
  )
}
