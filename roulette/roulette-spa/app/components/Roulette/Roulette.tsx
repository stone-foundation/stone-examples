import { AlertBox } from '../AlertBox/AlertBox'
import { JSX, useEffect, useState } from 'react'
import { TeamPanel } from '../TeamPanel/TeamPanel'
import { SpinResult } from '../../models/Roulette'
import { Team, TeamStat } from '../../models/Team'
import { IBlueprint, Logger } from '@stone-js/core'
import { TeamService } from '../../services/TeamService'
import { RouletteWheel } from '../RouletteWheel/RouletteWheel'
import { RouletteService } from '../../services/RouletteService'
import { TeamStatsPanel } from '../TeamStatsPanel/TeamStatsPanel'
import { TeamPanelSkeleton } from '../TeamPanel/TeamPanelSkeleton'
import { TeamStatsPanelSkeleton } from '../TeamStatsPanel/TeamStatsPanelSkeleton'

interface RouletteProps {
  blueprint: IBlueprint
  teamService: TeamService
  rouletteService: RouletteService
}

export const Roulette = ({ blueprint, teamService, rouletteService }: RouletteProps): JSX.Element => {
  const [stats, setStats] = useState<TeamStat[]>([])
  const [team, setTeam] = useState<Team | undefined>()
  const [loadingTeam, setLoadingTeam] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [error, setError] = useState<string | undefined>()
  const spinningTime = blueprint.get('app.roulette.spinningTime', 10000)

  useEffect(() => {
    let cancelled = false

    setLoadingStats(true)

    teamService
      .stats()
      .then(v => {
        if (!cancelled) setStats(v)
      })
      .catch(e => {
        if (!cancelled) setError(e.response?.data?.errors?.message ?? e.message)
      })
      .finally(() => {
        if (!cancelled) setTimeout(() => setLoadingStats(false), 500)
      })

    setLoadingTeam(true)

    teamService
      .currentTeam()
      .then(v => {
        if (!cancelled) setTeam(v)
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

  const spinRoulette = async (): Promise<{ result: SpinResult, stats: TeamStat[], team: Team }> => {
    const result = await rouletteService.spin()
    const team = await teamService.currentTeam()
    const stats = await teamService.stats()

    return { result, stats, team }
  }

  const onSpin = async (): Promise<SpinResult> => {
    setLoadingTeam(true)

    return await new Promise<SpinResult>((resolve, reject) => {
      spinRoulette()
        .then(v => {
          setTimeout(() => {
            setTeam(v.team)
            setStats(v.stats)
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
        {loadingStats
          ? (
            <TeamStatsPanelSkeleton length={5} />
            )
          : (
              stats.length > 0 && <TeamStatsPanel stats={stats} />
            )}
      </div>

      <div className='flex-1 flex flex-col'>
        {error !== undefined && (
          <AlertBox variant='error' className='mb-10 text-center'>
            {error}
          </AlertBox>
        )}
        {(team !== undefined) && (
          <AlertBox variant='success' className='mb-10 text-center'>
            🎉 Felicitations Soldat! <br />
            Vous avez été affecté(e) à l’unité <strong>{team.name}</strong>!
          </AlertBox>
        )}
        <div className='flex-1 flex justify-center items-start transition-all duration-500'>
          <RouletteWheel onSpin={onSpin} />
        </div>
      </div>

      <div className='sm:w-64 transition-all duration-500'>
        {loadingTeam
          ? (
            <TeamPanelSkeleton length={5} />
            )
          : (
              (team != null) && <TeamPanel team={team} />
            )}
      </div>
    </>
  )
}
