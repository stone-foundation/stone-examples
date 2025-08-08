import { JSX } from 'react'
import { User } from '../../models/User'
import { isEmpty } from '@stone-js/core'
import { Mission } from '../../models/Mission'
import { MissionService } from '../../services/MissionService'
import { TeamMemberService } from '../../services/TeamMemberService'
import { MissionListPage } from '../../components/Mission/MissionListPage'
import { Page, ReactIncomingEvent, IPage, HeadContext, PageRenderContext, IRouter } from '@stone-js/use-react'

/**
 * Missions Page options.
 */
interface MissionsPageOptions {
  router: IRouter
  missionService: MissionService
  teamMemberService: TeamMemberService
}

/**
 * Missions Page component.
 */
@Page('/missions/:uuid?', { layout: 'empty', middleware: ['auth'] })
export class MissionsPage implements IPage<ReactIncomingEvent> {
  private readonly router: IRouter
  private readonly missionService: MissionService
  private readonly teamMemberService: TeamMemberService

  /**
   * Create a new Missions Page component.
   */
  constructor ({ missionService, router, teamMemberService }: MissionsPageOptions) {
    this.router = router
    this.missionService = missionService
    this.teamMemberService = teamMemberService
  }

  /**
   * Handle the incoming event and fetch the list of missions.
   *
   * @param event - The incoming event containing query parameters.
   * @returns A promise that resolves to an array of Mission objects.
   */
  async handle (event: ReactIncomingEvent): Promise<{ mission?: Mission, missions: Mission[] }> {
    const uuid = event.get<string>('uuid')
    const mission = isEmpty(uuid) ? undefined : await this.missionService.get(uuid)
    const missions = (await this.missionService.list(event.get('query.limit', 55))).items
    return { mission, missions }
  }

  /**
   * Define the head of the page.
   *
   * @returns The head object containing title and description.
   */
  head (): HeadContext {
    return {
      title: 'Tralala - Missions',
      description: 'Liste des missions disponibles. Sélectionnez une mission pour voir les détails et commencer.'
    }
  }

  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render ({ event, data = { missions: [] } }: PageRenderContext<{ mission?: Mission, missions: Mission[] }>): JSX.Element {
    return <MissionListPage
      mission={data.mission}
      missions={data.missions}
      user={event.getUser<User>()}
      onStartMission={async v => await this.startMission(v, event)}
      onExploreMission={v => this.exploreMission(v, event)}
    />
  }

  /**
   * Start a mission.
   *
   * @param mission - The mission to start.
   */
  async startMission (mission: Mission, event: ReactIncomingEvent): Promise<void> {
    try {
      const teamMember = await this.teamMemberService.getByUser(event.getUser<User>()?.uuid ?? '', mission.uuid)
      event.cookies.add('teamMember', teamMember, { path: '/' })
    } catch {}
    
    event.cookies.add('mission', mission, { path: '/' })
    
    this.router.navigate('/')
  }

  /**
   * Explore a mission.
   *
   * @param mission - The mission to explore.
   */
  exploreMission (mission: Mission, event: ReactIncomingEvent): void {
    event.cookies.add('mission', mission, { path: '/' })
    this.router.navigate('/')
  }
}
