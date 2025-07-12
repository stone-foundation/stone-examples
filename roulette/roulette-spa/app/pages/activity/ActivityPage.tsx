import { User } from '../../models/User'
import { Badge } from '../../models/Badge'
import { Team, TeamMember } from '../../models/Team'
import { TeamService } from '../../services/TeamService'
import { BadgeService } from '../../services/BadgeService'
import { Dispatch, JSX, SetStateAction, useState } from 'react'
import { ActivityService } from '../../services/ActivityService'
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
  activityAssignmentService: ActivityAssignmentService
}

/**
 * Interface for the response of the ActivityPage.
 */
interface HandleResponse {
  teams: Team[]
  badges: Badge[]
  activities: Activity[]
  membersByTeam: Record<string, TeamMember[]>
}

/**
 * Activity Page component.
 */
@Page('/activities', { layout: 'private-default', middleware: ['auth'] })
export class ActivityPage implements IPage<ReactIncomingEvent> {
  private readonly teamService: TeamService
  private readonly badgeService: BadgeService
  private readonly activityService: ActivityService
  private readonly activityAssignmentService: ActivityAssignmentService

  constructor ({ teamService, badgeService, activityService, activityAssignmentService }: ActivityPageOptions) {
    this.teamService = teamService
    this.badgeService = badgeService
    this.activityService = activityService
    this.activityAssignmentService = activityAssignmentService
  }

  async handle (event: ReactIncomingEvent): Promise<HandleResponse> {
    const membersByTeam: Record<string, TeamMember[]> = {}
    const teams = await this.teamService.list(1000)
    const badgeMeta = await this.badgeService.list(1000)
    const activityMeta = await this.activityService.list(event.get('limit', 1000))

    teams.forEach((team) => {
      membersByTeam[team.uuid] = team.members || []
    })

    return {
      teams,
      membersByTeam,
      badges: badgeMeta.items,
      activities: activityMeta.items,
    }
  }

  head (): HeadContext {
    return {
      title: 'Opération Adrénaline - Activités',
      description: 'Gérez les activités de l\'opération Adrénaline',
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
          teams={data?.teams ?? []}
          availableBadges={data?.badges ?? []}
          membersByTeam={data?.membersByTeam ?? {}}
          onAssign={(u, v) => this.assignActivity(u, v)}
          onCreate={(v) => this.createActivity(v, setActivities)}
          onUpdate={(u, v) => this.updateActivity(u, v, setActivities)}
          onDelete={(activity) => this.deleteActivity(activity, setActivities)}
        />
      </main>
    )
  }

  private async listActivities (limit: number = 1000): Promise<Activity[]> {
    return (await this.activityService.list(limit)).items
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
