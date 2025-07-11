import { User } from '../models/User'
import { ListMetadataOptions } from '../models/App'
import { ILogger, isNotEmpty } from '@stone-js/core'
import { ActivityAssignment } from '../models/Activity'
import { EventHandler, Get, Post, Patch, Delete } from '@stone-js/router'
import { ActivityAssignmentService } from '../services/ActivityAssignmentService'
import { JsonHttpResponse, BadRequestError, IncomingHttpEvent } from '@stone-js/http-core'

/**
 * Activity Assignment Event Handler Options
 */
export interface ActivityAssignmentEventHandlerOptions {
  logger: ILogger
  activityAssignmentService: ActivityAssignmentService
}

/**
 * Activity Assignment Event Handler
 */
@EventHandler('/activity-assignments', { name: 'activityAssignments' })
export class ActivityAssignmentEventHandler {
  private readonly logger: ILogger
  private readonly activityAssignmentService: ActivityAssignmentService

  constructor ({ logger, activityAssignmentService }: ActivityAssignmentEventHandlerOptions) {
    this.logger = logger
    this.activityAssignmentService = activityAssignmentService
  }

  @Get('/', { middleware: ['auth'] })
  @JsonHttpResponse(200)
  async list (event: IncomingHttpEvent): Promise<ListMetadataOptions<ActivityAssignment>> {
    return await this.activityAssignmentService.list(Number(event.get('limit', 10)), event.get('page'))
  }

  @Get('/:assignment@uuid', {
    rules: { assignment: /\S{30,40}/ },
    bindings: { assignment: ActivityAssignmentService },
    middleware: ['auth']
  })
  @JsonHttpResponse(200)
  async show (event: IncomingHttpEvent): Promise<ActivityAssignment | undefined> {
    const assignment = event.get<ActivityAssignment>('assignment')
    return isNotEmpty(assignment) ? assignment : undefined
  }

  @Post('/', { middleware: ['moderator'] })
  @JsonHttpResponse(201)
  async create (event: IncomingHttpEvent): Promise<{ uuid?: string }> {
    const data = event.getBody<ActivityAssignment>()

    if (!data?.activityUuid || !data.teamUuid) {
      throw new BadRequestError('Activity UUID and team UUID are required')
    }

    const uuid = await this.activityAssignmentService.create(data, event.getUser<User>())

    this.logger.info(`ActivityAssignment created: ${uuid}, by user: ${String(event.getUser<User>().uuid)}`)

    return { uuid }
  }

  @Patch('/:assignment@uuid', {
    rules: { assignment: /\S{30,40}/ },
    bindings: { assignment: ActivityAssignmentService },
    middleware: ['admin']
  })
  @JsonHttpResponse(200)
  async validateOrUpdate (event: IncomingHttpEvent): Promise<ActivityAssignment> {
    const data = event.getBody<Partial<ActivityAssignment>>()
    const assignment = event.get<ActivityAssignment>('assignment')

    const updated = await this.activityAssignmentService.update(assignment, data)

    this.logger.info(`ActivityAssignment updated: ${assignment.uuid}, by admin: ${String(event.getUser<User>().uuid)}`)

    return updated
  }

  @Delete('/:assignment@uuid', {
    rules: { assignment: /\S{30,40}/ },
    bindings: { assignment: ActivityAssignmentService },
    middleware: ['admin']
  })
  @JsonHttpResponse(204)
  async delete (event: IncomingHttpEvent): Promise<{ statusCode: number }> {
    const assignment = event.get<ActivityAssignment>('assignment')
    await this.activityAssignmentService.delete(assignment)
    this.logger.info(`ActivityAssignment deleted: ${assignment.uuid}, by admin: ${String(event.getUser<User>().uuid)}`)
    return { statusCode: 204 }
  }

  @Post('/:assignment@uuid/status', {
    rules: { assignment: /\S{30,40}/ },
    bindings: { assignment: ActivityAssignmentService },
    middleware: ['admin']
  })
  @JsonHttpResponse(200)
  async changeStatus (event: IncomingHttpEvent): Promise<ActivityAssignment> {
    const assignment = event.get<ActivityAssignment>('assignment')
    const { status } = event.getBody<{ status: ActivityAssignmentStatus }>()

    if (!status) throw new BadRequestError('Status is required')

    const updated = await this.activityAssignmentService.update(assignment, { status })

    this.logger.info(`ActivityAssignment status changed to ${status}: ${assignment.uuid}`)

    return updated
  }

  @Get('/team/:teamUuid', { middleware: ['auth'] })
  @JsonHttpResponse(200)
  async getByTeam (event: IncomingHttpEvent): Promise<ActivityAssignment[]> {
    return await this.activityAssignmentService.getAssignmentsForTeam(event.get('teamUuid'))
  }

  @Get('/activity/:activityUuid', { middleware: ['auth'] })
  @JsonHttpResponse(200)
  async getByActivity (event: IncomingHttpEvent): Promise<ActivityAssignment[]> {
    return await this.activityAssignmentService.getAssignmentsForActivity(event.get('activityUuid'))
  }

  @Get('/status/:status', { middleware: ['admin'] })
  @JsonHttpResponse(200)
  async getByStatus (event: IncomingHttpEvent): Promise<ActivityAssignment[]> {
    return await this.activityAssignmentService.getAssignmentsByStatus(event.get('status'))
  }
} 
