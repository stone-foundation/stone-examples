import { User } from '../models/User'
import { BadgeAssignment } from '../models/Badge'
import { ListMetadataOptions } from '../models/App'
import { ILogger, isEmpty, isNotEmpty } from '@stone-js/core'
import { EventHandler, Get, Post, Delete } from '@stone-js/router'
import { BadgeAssignmentService } from '../services/BadgeAssignmentService'
import { JsonHttpResponse, BadRequestError, IncomingHttpEvent, NotFoundError } from '@stone-js/http-core'

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
    return await this.badgeAssignmentService.list(Number(event.get('limit', 10)), event.get('page'))
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
    const assignment = event.get<BadgeAssignment>('assignment')
    return isNotEmpty(assignment) ? assignment : undefined
  }

  /**
   * Assign a badge to a member
   */
  @Post('/assign-member', { middleware: ['admin'] })
  @JsonHttpResponse(201)
  async assignToMember (event: IncomingHttpEvent): Promise<{ uuid?: string }> {
    const body = event.getBody<{ badgeUuid: string, memberUuid: string, teamUuid: string }>()

    if (!body?.badgeUuid || !body?.memberUuid || !body?.teamUuid) {
      throw new BadRequestError('badgeUuid, teamUuid and memberUuid are required')
    }

    const uuid = await this.badgeAssignmentService.assignToMember(
      body.badgeUuid,
      body.teamUuid,
      body.memberUuid,
      event.getUser<User>()
    )

    this.logger.info(`Badge assigned to member: ${uuid}`)
  
    return { uuid }
  }

  /**
   * Assign a badge to a team
   */
  @Post('/assign-team', { middleware: ['admin'] })
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
   * Get all assignments for a member
   */
  @Get('/member/:uuid', { middleware: ['auth'] })
  @JsonHttpResponse(200)
  async getAssignmentsForMember (event: IncomingHttpEvent): Promise<BadgeAssignment[]> {
    const result = await this.badgeAssignmentService.getAssignmentsForMember(event.getParam<string>('uuid'))

    if (isEmpty(result)) {
      throw new NotFoundError(`No badge assignments found for member: ${event.getParam<string>('uuid')}`)
    }

    return result
  }

  /**
   * Get all assignments for a team
   */
  @Get('/team/:uuid', { middleware: ['auth'] })
  @JsonHttpResponse(200)
  async getAssignmentsForTeam (event: IncomingHttpEvent): Promise<BadgeAssignment[]> {
    const result = await this.badgeAssignmentService.getAssignmentsForTeam(event.getParam('uuid'))

    if (isEmpty(result)) {
      throw new NotFoundError(`No badge assignments found for team: ${event.getParam<string>('uuid')}`)
    }

    return result
  }

  /**
   * Get all assignments for a badge
   */
  @Get('/badge/:uuid', { middleware: ['auth'] })
  @JsonHttpResponse(200)
  async getAssignmentsForBadge (event: IncomingHttpEvent): Promise<BadgeAssignment[]> {
    const result = await this.badgeAssignmentService.getAssignmentsForBadge(event.getParam('uuid'))

    if (isEmpty(result)) {
      throw new NotFoundError(`No badge assignments found for badge: ${event.getParam<string>('uuid')}`)
    }

    return result
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
    const assignment = event.get<BadgeAssignment>('assignment', {} as unknown as BadgeAssignment)
    await this.badgeAssignmentService.delete(assignment)
    this.logger.info(`Badge assignment deleted: ${assignment.uuid}`)
  }

  /**
   * Unassign all assignments for a badge
   */
  @Delete('/badge/:uuid', { middleware: ['admin'] })
  @JsonHttpResponse(200)
  async unassignAllFromBadge (event: IncomingHttpEvent): Promise<{ removed: number }> {
    const badgeUuid = event.getParam<string>('uuid')
    const count = await this.badgeAssignmentService.unassignAllFromBadge(badgeUuid)
    this.logger.info(`All assignments removed for badge: ${String(badgeUuid)} (${count})`)
    return { removed: count }
  }
}
