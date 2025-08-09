import { User } from '../../models/User'
import { Badge } from '../../models/Badge'
import { Mission } from '../../models/Mission'
import { Team, TeamMember } from '../../models/Team'
import { TeamService } from '../../services/TeamService'
import { BadgeService } from '../../services/BadgeService'
import { Dispatch, JSX, SetStateAction, useState } from 'react'
import { ActivityService } from '../../services/ActivityService'
import { TeamMemberService } from '../../services/TeamMemberService'
import { Activity, ActivityAssignment } from '../../models/Activity'
import { ActivityList } from '../../components/ActivityList/ActivityList'
import { ActivityAssignmentService } from '../../services/ActivityAssignmentService'
import { Page, ReactIncomingEvent, IPage, HeadContext, PageRenderContext } from '@stone-js/use-react'

/**
 * Activity Page options.
 */
interface ActivityPageOptions {
  teamService: TeamService
  badgeService: BadgeService
  activityService: ActivityService
  teamMemberService: TeamMemberService
  activityAssignmentService: ActivityAssignmentService
}

/**
 * Interface for the response of the ActivityPage.
 */
interface HandleResponse {
  teams: Team[]
  badges: Badge[]
  mission: Mission
  activities: Activity[]
  membersByTeam: Record<string, TeamMember[]>
}

/**
 * Activity Page component.
 */
@Page('/activities', { layout: 'header', middleware: ['auth-mission'] })
export class ActivityPage implements IPage<ReactIncomingEvent> {
  private readonly teamService: TeamService
  private readonly badgeService: BadgeService
  private readonly activityService: ActivityService
  private readonly teamMemberService: TeamMemberService
  private readonly activityAssignmentService: ActivityAssignmentService

  constructor ({ teamService, badgeService, activityService, teamMemberService, activityAssignmentService }: ActivityPageOptions) {
    this.teamService = teamService
    this.badgeService = badgeService
    this.activityService = activityService
    this.teamMemberService = teamMemberService
    this.activityAssignmentService = activityAssignmentService
  }

  async handle (event: ReactIncomingEvent): Promise<HandleResponse> {
    const membersByTeam: Record<string, TeamMember[]> = {}
    const mission = event.cookies.getValue<Mission>('mission') ?? {} as Mission
    const teamMeta = await this.teamService.list({ missionUuid: mission.uuid }, 1000)
    const badgeMeta = await this.badgeService.list({ missionUuid: mission.uuid }, 1000)
    const teamMembers = await this.teamMemberService.list({ missionUuid: mission.uuid }, 1000)
    const activityMeta = await this.activityService.list({ missionUuid: mission.uuid }, event.get('query.limit', 1000), event.get('query.page'))

    teamMeta.items.forEach((team) => {
      membersByTeam[team.uuid] = teamMembers.items.filter(member => member.teamUuid === team.uuid)
    })

    return {
      mission,
      membersByTeam,
      teams: teamMeta.items,
      badges: badgeMeta.items,
      activities: activityMeta.items,
    }
  }

  head (): HeadContext {
    return {
      title: 'Tralala - Activités',
      description: 'Gérez les activités',
    }
  }

  render ({ data, event }: PageRenderContext<HandleResponse>): JSX.Element {
    const [activities, setActivities] = useState<Activity[]>(data?.activities ?? [])
    const user = event.getUser<User>() ?? { username: 'John', fullname: 'Doe' } as unknown as User
    
    return (
      <main className="w-full">
        <ActivityList
          currentUser={user}
          activities={activities}
          mission={data?.mission}
          teams={data?.teams ?? []}
          availableBadges={data?.badges ?? []}
          membersByTeam={data?.membersByTeam ?? {}}
          onAssign={async (u, v) => await this.assignActivity(u, v)}
          onCreate={async (v) => await this.createActivity(v, setActivities)}
          onUpdate={async (u, v) => await this.updateActivity(u, v, setActivities)}
          onDelete={async (activity) => await this.deleteActivity(activity, setActivities)}
        />
      </main>
    )
  }

  private async listActivities (options: Partial<Activity> = {}, limit: number = 1000): Promise<Activity[]> {
    return (await this.activityService.list(options, limit)).items
  }

  private async createActivity (activity: Partial<Activity>, setActivities: Dispatch<SetStateAction<Activity[]>>): Promise<void> {
    await this.activityService.create(activity)
    setActivities(await this.listActivities())
  }

  private async updateActivity (activity: Activity, data: Partial<Activity>, setActivities: Dispatch<SetStateAction<Activity[]>>): Promise<void> {
    await this.activityService.update(activity, data)
    setActivities(await this.listActivities())
  }

  private async deleteActivity (activity: Activity, setActivities: Dispatch<SetStateAction<Activity[]>>): Promise<void> {
    await this.activityService.delete(activity)
    setActivities(await this.listActivities())
  }

  private async assignActivity (_activity: Activity, payload: Partial<ActivityAssignment>): Promise<void> {
    await this.activityAssignmentService.create(payload)
  }
}
