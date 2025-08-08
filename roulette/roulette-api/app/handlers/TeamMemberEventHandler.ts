import { User } from '../models/User'
import { ILogger } from '@stone-js/core'
import { ListMetadataOptions } from '../models/App'
import { TeamService } from '../services/TeamService'
import { UserService } from '../services/UserService'
import { Team, TeamMember, TeamMemberRole } from '../models/Team'
import { TeamMemberService } from '../services/TeamMemberService'
import { EventHandler, Get, Post, Patch, Delete } from '@stone-js/router'
import { JsonHttpResponse, BadRequestError, IncomingHttpEvent, ForbiddenError } from '@stone-js/http-core'

/**
 * TeamMember Event Handler Options
 */
export interface TeamMemberEventHandlerOptions {
  logger: ILogger
  teamMemberService: TeamMemberService
}

/**
 * TeamMember Event Handler
 */
@EventHandler('/team-members', { name: 'teamMembers', middleware: ['auth'] })
export class TeamMemberEventHandler {
  private readonly logger: ILogger
  private readonly teamMemberService: TeamMemberService

  constructor ({ teamMemberService, logger }: TeamMemberEventHandlerOptions) {
    this.logger = logger
    this.teamMemberService = teamMemberService
  }

  /**
   * List all team members (admin only)
   */
  @Get('/', { name: 'list' })
  @JsonHttpResponse(200)
  async list (event: IncomingHttpEvent): Promise<ListMetadataOptions<TeamMember>> {
    const role = event.get<TeamMemberRole>('role')
    const teamUuid = event.get<string>('teamUuid')
    const isActive = event.get<boolean>('isActive')
    const missionUuid = event.get<string>('missionUuid')

    return await this.teamMemberService.listBy({ role, isActive, teamUuid, missionUuid }, Number(event.get('limit', 10)), event.get('page'))
  }

  /**
   * Get team members by team
   */
  @Get('/teams/:team@uuid', {
    name: 'teamMembers',
    rules: { team: /\S{30,40}/ },
    bindings: { team: TeamService }
  })
  @JsonHttpResponse(200)
  async teamMembers (event: IncomingHttpEvent): Promise<ListMetadataOptions<TeamMember>> {
    const { uuid: teamUuid } = event.get<Team>('team', {} as Team)
    return await this.teamMemberService.listBy({ teamUuid, isActive: true }, Number(event.get('limit', 10)), event.get('page'))
  }

  /**
   * Get team members by current user
   */
  @Get('/users/me', { name: 'userTeamMemberMe' })
  @JsonHttpResponse(200)
  async teamMembersByMe (event: IncomingHttpEvent): Promise<ListMetadataOptions<TeamMember>> {
    const user = event.getUser<User>()
    const missionUuid = event.get<string>('missionUuid')
    const { teamUuid } = await this.teamMemberService.findBy({ userUuid: user.uuid, missionUuid, isActive: true })
    return await this.teamMemberService.listBy({ teamUuid, isActive: true }, Number(event.get('limit', 10)), event.get('page'))
  }

  /**
   * Get team member by user
   */
  @Get('/users/:user@uuid', {
    name: 'userTeamMember',
    rules: { user: /\S{30,40}/ },
    bindings: { user: UserService }
  })
  @JsonHttpResponse(200)
  async showByUser (event: IncomingHttpEvent): Promise<TeamMember | undefined> {
    const user = event.get<User>('user', {} as User)
    const missionUuid = event.get<string>('missionUuid')
    return await this.teamMemberService.findBy({ userUuid: user.uuid, missionUuid, isActive: true })
  }

  /**
   * Show a single team member
   */
  @Get('/:teamMember@uuid', { rules: { teamMember: /\S{30,40}/ }, bindings: { teamMember: TeamMemberService }, middleware: ['admin'] })
  @JsonHttpResponse(200)
  async show (event: IncomingHttpEvent): Promise<TeamMember | undefined> {
    return event.get<TeamMember>('teamMember', {} as unknown as TeamMember)
  }

  /**
   * Add a member to a team (captain/admin only)
   */
  @Post('/', { middleware: ['captain'] })
  @JsonHttpResponse(201)
  async addMember (event: IncomingHttpEvent): Promise<{ uuid?: string }> {
    const user = event.getUser<User>()
    const data = event.getBody<TeamMember>()

    if (!data?.userUuid || !data?.teamUuid || !data?.missionUuid) {
      throw new BadRequestError('User UUID, team UUID, and mission UUID are required')
    }

    // Validate role assignment permissions
    const requestedRole = data.role || 'member'
    if (requestedRole === 'admin' && !Array().concat(user.roles ?? []).includes('admin')) {
      throw new ForbiddenError('Only admins can assign admin role')
    }

    const uuid = await this.teamMemberService.addMember(
      data.name || 'Unnamed',
      data.userUuid,
      data.teamUuid,
      data.missionUuid,
      requestedRole,
      user
    )

    this.logger.info(`Team member added: ${uuid}, user: ${data.userUuid}, team: ${data.teamUuid}, by: ${user.uuid}`)

    return { uuid }
  }

  /**
   * Update team member role (admin only)
   */
  @Patch('/:teamMember@uuid', { rules: { teamMember: /\S{30,40}/ }, bindings: { teamMember: TeamMemberService }, middleware: ['admin'] })
  @JsonHttpResponse(200)
  async updateRole (event: IncomingHttpEvent): Promise<TeamMember> {
    const user = event.getUser<User>()
    const { role } = event.getBody<{ role: TeamMemberRole }>({ role: 'member' })
    const teamMember = event.get<TeamMember>('teamMember', {} as unknown as TeamMember)

    if (role === 'admin' && !Array().concat(user.roles ?? []).includes('admin')) {
      throw new ForbiddenError('Only admins can assign admin role')
    }

    const updated = await this.teamMemberService.updateRole(teamMember, role, user)

    this.logger.info(`Team member role updated: ${teamMember.uuid}, new role: ${role}, by: ${user.uuid}`)

    return updated
  }

  /**
   * Delete team member permanently (admin only)
   */
  @Delete('/:teamMember@uuid', { rules: { teamMember: /\S{30,40}/ }, bindings: { teamMember: TeamMemberService }, middleware: ['admin'] })
  async delete (event: IncomingHttpEvent): Promise<{ statusCode: number }> {
    const user = event.getUser<User>()
    const teamMember = event.get<TeamMember>('teamMember', {} as unknown as TeamMember)

    await this.teamMemberService.delete(teamMember, user)

    this.logger.info(`Team member permanently deleted: ${teamMember.uuid}, by: ${user.uuid}`)

    return { statusCode: 204 }
  }
}