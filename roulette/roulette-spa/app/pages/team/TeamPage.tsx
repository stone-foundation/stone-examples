import { JSX } from 'react'
import { User } from '../../models/User'
import { Post } from '../../models/Post'
import { Team } from '../../models/Team'
import { TeamService } from '../../services/TeamService'
import { PostService } from '../../services/PostService'
import { ActivityAssignment } from '../../models/Activity'
import { PageDetails } from '../../components/PageDetails/PageDetails'
import { ActivityAssignmentService } from '../../services/ActivityAssignmentService'
import { RightSidebarPanel } from '../../components/RightSidebarPanel/RightSidebarPanel'
import { SingleTeamStatsPanel } from '../../components/SingleTeamStatsPanel/SingleTeamStatsPanel'
import { Page, ReactIncomingEvent, IPage, HeadContext, PageRenderContext } from '@stone-js/use-react'

/**
 * Team Page options.
 */
interface TeamPageOptions {
  postService: PostService
  teamService: TeamService
  activityAssignmentService: ActivityAssignmentService
}

/**
 * Team Page component.
 */
@Page(
  '/page/:team@name/:tab?',
  {
    layout: 'app',
    middleware: ['auth'],
    rules: { team: /\w{0,32}/ },
    bindings: { team: TeamService }
  })
export class TeamPage implements IPage<ReactIncomingEvent> {
  private readonly postService: PostService
  private readonly teamService: TeamService
  private readonly activityAssignmentService: ActivityAssignmentService

  /**
   * Create a new Team Page component.
   */
  constructor ({ teamService, postService, activityAssignmentService }: TeamPageOptions) {
    this.teamService = teamService
    this.postService = postService
    this.activityAssignmentService = activityAssignmentService
  }

  async handle (event: ReactIncomingEvent): Promise<Record<string, any>> {
    const assignments = await this.listActivityAssignments(event.get<Team>('team', {} as any))
    const badges = assignments.filter(v => v.status === 'approved').map((a) => a.badge).filter((b) => b !== undefined)
    
    return {
      badges,
      assignments
    }
  }

  /**
   * Define the head of the page.
   *
   * @returns The head object containing title and description.
   */
  head (): HeadContext {
    return {
      title: 'Tralala  - Team - Timeline',
      description: 'Vivez l\'Tralala avec la timeline interactive !',
    }
  }

  /**
   * Render the component.
   *
   * @returns The rendered component.
   */
  render ({ data, event }: PageRenderContext): JSX.Element {
    const tab = event.get<string>('tab', 'timeline')
    const team = event.get<Team>('team', {} as any)
    const user = event.getUser<User>() ?? { username: 'Jonh', fullname: 'Doe' } as unknown as User

    return (
      <>
        <main className="flex-1 min-w-0">
          <PageDetails
            team={team}
            activePath={tab}
            currentUser={user}
            badges={data.badges ?? []}
            activityAssignments={data.assignments ?? []}
            onUpdateInfos={async (v) => await this.updateInfos(v, team)}
            savePost={async (v, file?: File) => await this.savePost(v, team, file)}
            onLogoChange={async (file: File) => await this.updateImage(team, file)}
            fetchPosts={async (u, v) => await this.postService.listByTeam(team.name, u, v)}
            onUpdateAssigmentStatus={async (u, v) => await this.onUpdateAssigmentStatus(u, v)}
            onBannerChange={async (file: File) => await this.updateImage(team, undefined, file)}
          />
        </main>
        <aside className="w-full lg:w-64 shrink-0 hidden xl:block">
          <SingleTeamStatsPanel team={team} />
          <RightSidebarPanel />
        </aside>
      </>
    )
  }
  
  async savePost (data: Partial<Post>, team: Team, file?: File): Promise<void> {
    await this.postService.create({ ...data, teamUuid: team.uuid }, file)
  }

  async updateImage (team: Team, logoFile?: File, bannerFile?: File): Promise<void> {
    await this.teamService.update(team.uuid, {}, logoFile, bannerFile)
  }
  
  async updateInfos (data: Partial<Post>, team: Team): Promise<void> {
    await this.teamService.update(team.uuid, data)
  }
  
  private async listActivityAssignments (team: Team): Promise<ActivityAssignment[]> {
    const meta = await this.activityAssignmentService.listByTeam(team, 1000)
    return meta.items ?? []
  }

  private async onUpdateAssigmentStatus (assignment: ActivityAssignment, data: Partial<ActivityAssignment>): Promise<void> {
    await this.activityAssignmentService.changeStatus(assignment.uuid, data.status ?? 'pending')
  }
}
