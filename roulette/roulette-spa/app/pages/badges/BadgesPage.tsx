import { User } from '../../models/User'
import { Badge } from '../../models/Badge'
import { Mission } from '../../models/Mission'
import { Team, TeamMember } from '../../models/Team'
import { TeamService } from '../../services/TeamService'
import { BadgeService } from '../../services/BadgeService'
import { ActivityAssignment } from '../../models/Activity'
import { Dispatch, JSX, SetStateAction, useState } from 'react'
import { BadgeList } from '../../components/BadgeList/BadgeList'
import { TeamMemberService } from '../../services/TeamMemberService'
import { ActivityAssignmentService } from '../../services/ActivityAssignmentService'
import { Page, ReactIncomingEvent, IPage, HeadContext, PageRenderContext } from '@stone-js/use-react'

/**
 * Home Page options.
 */
interface BadgesPageOptions {
  teamService: TeamService
  badgeService: BadgeService
  teamMemberService: TeamMemberService
  activityAssignmentService: ActivityAssignmentService
}

/**
 * Interface for the response of the BadgesPage.
 */
interface HandleResponse {
  teams: Team[]
  badges: Badge[]
  mission: Mission
  membersByTeam: Record<string, TeamMember[]>
}

/**
 * Badges Page component.
 */
@Page('/badges', { layout: 'header', middleware: ['auth-mission'] })
export class BadgesPage implements IPage<ReactIncomingEvent> {
  private readonly teamService: TeamService
  private readonly badgeService: BadgeService
  private readonly teamMemberService: TeamMemberService
  private readonly activityAssignmentService: ActivityAssignmentService

  /**
   * Create a new Login Page component.
   */
  constructor ({ teamService, badgeService, activityAssignmentService, teamMemberService }: BadgesPageOptions) {
    this.teamService = teamService
    this.badgeService = badgeService
    this.teamMemberService = teamMemberService
    this.activityAssignmentService = activityAssignmentService
  }

  /**
   * Handle the incoming event and return a list of badges.
   *
   * @param event - The incoming event containing user information.
   * @returns A promise that resolves to an array of Badge objects.
   */
  async handle (event: ReactIncomingEvent): Promise<HandleResponse> {
    const membersByTeam: Record<string, TeamMember[]> = {}
    const mission = event.cookies.getValue<Mission>('mission') ?? {} as Mission
    const teamMeta = await this.teamService.list({ missionUuid: mission.uuid }, 1000)
    const teamMembers = await this.teamMemberService.list({ missionUuid: mission.uuid }, 1000)
    const badgeMeta = await this.badgeService.list({ missionUuid: mission.uuid }, event.get('query.limit', 1000), event.get('query.page'))

    teamMeta.items.forEach((team) => {
      membersByTeam[team.uuid] = teamMembers.items.filter(member => member.teamUuid === team.uuid)
    })

    return {
      mission,
      membersByTeam,
      teams: teamMeta.items,
      badges: badgeMeta.items,
    }
  }

  /**
   * Define the head of the page.
   *
   * @returns The head object containing title and description.
   */
  head (): HeadContext {
    return {
      title: 'Tralala - Badges',
      description: 'Gérez les badges',
    }
  }

  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render ({ data, event }: PageRenderContext<HandleResponse>): JSX.Element {
    const [badges, setBadges] = useState<Badge[]>(data?.badges ?? [])
    const user = event.getUser<User>() ?? { username: 'Jonh', fullname: 'Doe' } as unknown as User

    return (
      <main className="w-full">
        <BadgeList
          badges={badges}
          currentUser={user}
          mission={data?.mission}
          teams={data?.teams ?? []}
          membersByTeam={data?.membersByTeam ?? {}}
          onCreate={async v => await this.createBadge(v, setBadges)}
          onAssign={async payload => await this.assignActivity(payload)}
          onUpdate={async (u, v) => await this.updateBadge(u, v, setBadges)}
          onDelete={async badge => await this.deleteBadge(badge, setBadges)}
        />
      </main>
    )
  }
  
  private async listBadges (options: Partial<Badge>, limit: number = 1000): Promise<Badge[]> {
    return (await this.badgeService.list(options, limit)).items
  }

  private async createBadge (badge: Partial<Badge>, setActivities: Dispatch<SetStateAction<Badge[]>>): Promise<void> {
    await this.badgeService.create(badge)
    setActivities(await this.listBadges(badge))
  }

  private async updateBadge (badge: Badge, data: Partial<Badge>, setActivities: Dispatch<SetStateAction<Badge[]>>): Promise<void> {
    await this.badgeService.update(badge.uuid, data)
    setActivities(await this.listBadges(badge))
  }

  private async deleteBadge (badge: Badge, setActivities: Dispatch<SetStateAction<Badge[]>>): Promise<void> {
    await this.badgeService.delete(badge.uuid)
    setActivities(await this.listBadges(badge))
  }
  
  private async assignActivity (payload: Partial<ActivityAssignment>): Promise<void> {
    await this.activityAssignmentService.create(payload)
  }
}
