import { User } from '../models/User'
import { ILogger } from '@stone-js/core'
import { BadgeAssignment } from '../models/Badge'
import { ListMetadataOptions } from '../models/App'
import { EventHandler, Get, Post, Delete } from '@stone-js/router'
import { BadgeAssignmentService } from '../services/BadgeAssignmentService'
import { JsonHttpResponse, BadRequestError, IncomingHttpEvent } from '@stone-js/http-core'

/**
 * Badge Assignment Event Handler Options
 */
export interface BadgeAssignmentEventHandlerOptions {
  logger: ILogger
  badgeAssignmentService: BadgeAssignmentService
}

/**
 * Badge Assignment Event Handler
 */
@EventHandler('/badge-assignments', { name: 'badgeAssignments' })
export class BadgeAssignmentEventHandler {
  private readonly logger: ILogger
  private readonly badgeAssignmentService: BadgeAssignmentService

  constructor ({ badgeAssignmentService, logger }: BadgeAssignmentEventHandlerOptions) {
    this.logger = logger
    this.badgeAssignmentService = badgeAssignmentService
  }

  /**
   * List all assignments
   */
  @Get('/', { name: 'list', middleware: ['auth'] })
  @JsonHttpResponse(200)
  async list (event: IncomingHttpEvent): Promise<ListMetadataOptions<BadgeAssignment>> {
    const missionUuid = event.get<string>('missionUuid')
    return await this.badgeAssignmentService.listBy({ missionUuid }, Number(event.get('limit', 10)), event.get('page'))
  }

  /**
   * Show an assignment by uuid
   */
  @Get('/:assignment@uuid', {
    rules: { assignment: /\S{30,40}/ },
    bindings: { assignment: BadgeAssignmentService },
    middleware: ['admin']
  })
  @JsonHttpResponse(200)
  async show (event: IncomingHttpEvent): Promise<BadgeAssignment | undefined> {
    return event.get<BadgeAssignment>('assignment')
  }

  /**
   * Assign a badge to a team
   */
  @Post('/teams', { middleware: ['admin'] })
  @JsonHttpResponse(201)
  async assignToTeam (event: IncomingHttpEvent): Promise<{ uuid?: string }> {
    const body = event.getBody<{ badgeUuid: string, teamUuid: string }>()

    if (!body?.badgeUuid || !body?.teamUuid) {
      throw new BadRequestError('badgeUuid and teamUuid are required')
    }

    const uuid = await this.badgeAssignmentService.assignToTeam(
      body.badgeUuid,
      body.teamUuid,
      event.getUser<User>()
    )

    this.logger.info(`Badge assigned to team: ${uuid}`)
    return { uuid }
  }

  /**
   * Assign a badge to a team member
   */
  @Post('/team-members', { middleware: ['admin'] })
  @JsonHttpResponse(201)
  async assignToTeamMember (event: IncomingHttpEvent): Promise<{ uuid?: string }> {
    const body = event.getBody<{ badgeUuid: string, teamMemberUuid: string, teamUuid: string }>()

    if (!body?.badgeUuid || !body?.teamMemberUuid || !body?.teamUuid) {
      throw new BadRequestError('badgeUuid, teamUuid and teamMemberUuid are required')
    }

    const uuid = await this.badgeAssignmentService.assignToMember(
      body.teamUuid,
      body.badgeUuid,
      body.teamMemberUuid,
      event.getUser<User>()
    )

    this.logger.info(`Badge assigned to team member: ${uuid}`)

    return { uuid }
  }

  /**
   * Get all assignments for a team
   */
  @Get('/team/:uuid', { middleware: ['auth'] })
  @JsonHttpResponse(200)
  async getAssignmentsForTeam (event: IncomingHttpEvent): Promise<BadgeAssignment[]> {
    return await this.badgeAssignmentService.getAssignmentsForTeam(event.getParam('uuid'))
  }

  /**
   * Get all assignments for a team member
   */
  @Get('/team-members/:uuid', { middleware: ['auth'] })
  @JsonHttpResponse(200)
  async getAssignmentsForMember (event: IncomingHttpEvent): Promise<BadgeAssignment[]> {
    return await this.badgeAssignmentService.getAssignmentsForMember(event.getParam<string>('uuid'))
  }

  /**
   * Get all assignments for a badge
   */
  @Get('/badges/:uuid', { middleware: ['auth'] })
  @JsonHttpResponse(200)
  async getAssignmentsForBadge (event: IncomingHttpEvent): Promise<BadgeAssignment[]> {
    return await this.badgeAssignmentService.getAssignmentsForBadge(event.getParam('uuid'))
  }

  /**
   * Unassign (delete) a badge assignment by uuid
   */
  @Delete('/:assignment@uuid', {
    rules: { assignment: /\S{30,40}/ },
    bindings: { assignment: BadgeAssignmentService },
    middleware: ['admin']
  })
  @JsonHttpResponse(204)
  async delete (event: IncomingHttpEvent): Promise<void> {
    const user = event.getUser<User>()
    const assignment = event.get<BadgeAssignment>('assignment', {} as unknown as BadgeAssignment)
    await this.badgeAssignmentService.delete(assignment, user)
    this.logger.info(`Badge assignment deleted: ${assignment.uuid}`)
  }

  /**
   * Unassign all assignments for a badge
   */
  @Delete('/badges/:uuid', { middleware: ['admin'] })
  @JsonHttpResponse(200)
  async unassignAllFromBadge (event: IncomingHttpEvent): Promise<{ removed: number }> {
    const user = event.getUser<User>()
    const badgeUuid = event.getParam<string>('uuid')
    const count = await this.badgeAssignmentService.unassignAllFromBadge(badgeUuid, user)
    this.logger.info(`All assignments removed for badge: ${String(badgeUuid)} (${count})`)
    return { removed: count }
  }
}
