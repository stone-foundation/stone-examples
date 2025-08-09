import { User } from '../models/User'
import { Team } from '../models/Team'
import { PostModel } from '../models/Post'
import { PostEvent } from '../events/PostEvent'
import { ListMetadataOptions } from '../models/App'
import { TeamService } from '../services/TeamService'
import { PRESENCE_EVENT_CATEGORY } from '../constants'
import { ActivityAssignment } from '../models/Activity'
import { ActivityService } from '../services/ActivityService'
import { TeamMemberService } from '../services/TeamMemberService'
import { EventHandler, Get, Post, Patch, Delete } from '@stone-js/router'
import { EventEmitter, ILogger, isEmpty, isNotEmpty } from '@stone-js/core'
import { ActivityAssignmentService } from '../services/ActivityAssignmentService'
import { JsonHttpResponse, BadRequestError, IncomingHttpEvent, ForbiddenError } from '@stone-js/http-core'

/**
 * Activity Assignment Event Handler Options
 */
export interface ActivityAssignmentEventHandlerOptions {
  logger: ILogger
  teamService: TeamService
  eventEmitter: EventEmitter
  activityService: ActivityService
  teamMemberService: TeamMemberService
  activityAssignmentService: ActivityAssignmentService
}

/**
 * Activity Assignment Event Handler
 */
@EventHandler('/activity-assignments', { name: 'activityAssignments', middleware: ['auth'] })
export class ActivityAssignmentEventHandler {
  private readonly logger: ILogger
  private readonly teamService: TeamService
  private readonly eventEmitter: EventEmitter
  private readonly activityService: ActivityService
  private readonly teamMemberService: TeamMemberService
  private readonly activityAssignmentService: ActivityAssignmentService

  constructor ({ logger, teamService, eventEmitter, activityService, teamMemberService, activityAssignmentService }: ActivityAssignmentEventHandlerOptions) {
    this.logger = logger
    this.teamService = teamService
    this.eventEmitter = eventEmitter
    this.activityService = activityService
    this.teamMemberService = teamMemberService
    this.activityAssignmentService = activityAssignmentService
  }

  @Get('/')
  @JsonHttpResponse(200)
  async list (event: IncomingHttpEvent): Promise<ListMetadataOptions<ActivityAssignment>> {
    const missionUuid = event.get<string>('missionUuid')
    return await this.activityAssignmentService.listBy({ missionUuid }, Number(event.get('limit', 10)), event.get('page'))
  }

  @Get('/teams/:team@uuid', { rules: { team: /\S{30,40}/ }, bindings: { team: TeamService } })
  @JsonHttpResponse(200)
  async listByTeam (event: IncomingHttpEvent): Promise<ListMetadataOptions<ActivityAssignment>> {
    return await this.activityAssignmentService.listBy({ teamUuid: event.get('uuid') }, Number(event.get('limit', 10)), event.get('page'))
  }

  @Get('/activities/:activity@uuid', { rules: { activity: /\S{30,40}/ }, bindings: { activity: ActivityService } })
  @JsonHttpResponse(200)
  async listByActivity (event: IncomingHttpEvent): Promise<ListMetadataOptions<ActivityAssignment>> {
    return await this.activityAssignmentService.listBy({ activityUuid: event.get('uuid') }, Number(event.get('limit', 10)), event.get('page'))
  }

  @Get('/stats/:teamName?')
  @JsonHttpResponse(200)
  async stats (event: IncomingHttpEvent): Promise<Record<string, unknown>> {
    const name = event.get('teamName')
    const missionUuid = event.get<string>('missionUuid')
    const team = isNotEmpty(name) ? this.teamService.findBy({ name }) : undefined
    const conditions = isNotEmpty<Team>(team) ? { teamUuid: team?.uuid, missionUuid } : { missionUuid }
    return await this.activityAssignmentService.statistics(conditions)
  }

  @Get('/:assignment@uuid', {
    rules: { assignment: /\S{30,40}/ },
    bindings: { assignment: ActivityAssignmentService }
  })
  @JsonHttpResponse(200)
  async show (event: IncomingHttpEvent): Promise<ActivityAssignment | undefined> {
    return event.get<ActivityAssignment>('assignment')
  }

  @Post('/', { middleware: ['moderator'] })
  @JsonHttpResponse(201)
  async create (event: IncomingHttpEvent): Promise<{ uuid?: string }> {
    const user = event.getUser<User>()
    const data = event.getBody<ActivityAssignment>()

    if (!data?.activityUuid || !data?.teamUuid || !data?.missionUuid) {
      throw new BadRequestError('Activity UUID, team UUID and mission UUID are required')
    }

    return await this.createActivityAssignment(event, data, user)
  }

  @Post('/presence')
  @JsonHttpResponse(201)
  async createPresence (event: IncomingHttpEvent): Promise<{ uuid?: string }> {
    const missionUuid = event.get<string>('missionUuid')
    
    if (!missionUuid) {
      throw new BadRequestError('The mission UUID is required')
    }

    const user = event.getUser<User>()
    let activityUuid: string | undefined
    const teamMember = await this.teamMemberService.findBy({ userUuid: user.uuid, missionUuid })

    try {
      activityUuid = (await this.activityService.findBy({ category: PRESENCE_EVENT_CATEGORY, missionUuid })).uuid
    } catch {}

    if (isEmpty(activityUuid)) {
      activityUuid = await this.activityService.create({
        score: 3,
        name: 'Présence',
        impact: 'positive',
        categoryLabel: 'Présence',
        category: PRESENCE_EVENT_CATEGORY,
        missionUuid: event.get<string>('missionUuid'),
        description: 'Enregistrement de la présence individuelle des membres de l\'équipe lors de la mission.',
      }, user)
    }

    const data = {
      missionUuid,
      activityUuid,
      issuedByUuid: user.uuid,
      teamUuid: teamMember.teamUuid,
      teamMemberUuid: teamMember.uuid,
      comment: 'Le membre de l\'équipe a marqué sa présence',
    }

    return await this.createActivityAssignment(event, data, user)
  }

  @Patch('/:assignment@uuid', {
    rules: { assignment: /\S{30,40}/ },
    bindings: { assignment: ActivityAssignmentService },
    middleware: ['admin']
  })
  @JsonHttpResponse(200)
  async validateOrUpdate (event: IncomingHttpEvent): Promise<ActivityAssignment> {
    const user = event.getUser<User>()
    const data = event.getBody<Partial<ActivityAssignment>>({})
    const assignment = event.get<ActivityAssignment>('assignment', {} as unknown as ActivityAssignment)

    const updated = await this.activityAssignmentService.update(assignment, data, user)

    this.logger.info(`ActivityAssignment updated: ${assignment.uuid}, by admin: ${String(user.uuid)}`)

    return updated
  }

  @Delete('/:assignment@uuid', {
    rules: { assignment: /\S{30,40}/ },
    bindings: { assignment: ActivityAssignmentService },
    middleware: ['admin']
  })
  @JsonHttpResponse(204)
  async delete (event: IncomingHttpEvent): Promise<{ statusCode: number }> {
    const user = event.getUser<User>()
    const assignment = event.get<ActivityAssignment>('assignment', {} as unknown as ActivityAssignment)
    await this.activityAssignmentService.delete(assignment, user)
    this.logger.info(`ActivityAssignment deleted: ${assignment.uuid}, by admin: ${String(user.uuid)}`)
    return { statusCode: 204 }
  }

  @Patch('/:assignment@uuid/status', {
    rules: { assignment: /\S{30,40}/ },
    bindings: { assignment: ActivityAssignmentService }
  })
  @JsonHttpResponse(200)
  async changeStatus (event: IncomingHttpEvent): Promise<ActivityAssignment> {
    const user = event.getUser<User>()
    const { status } = event.getBody<Partial<ActivityAssignment>>({})
    const assignment = event.get<ActivityAssignment>('assignment', {} as unknown as ActivityAssignment)

    if (!status) throw new BadRequestError('Status is required')

    if (!Array().concat(user?.roles ?? []).some(v => ['moderator', 'admin'].includes(v)) && status !== 'contested') {
      throw new ForbiddenError('You are not allowed to change the status of this assignment')
    }

    const updated = await this.activityAssignmentService.update(assignment, { status, validatedAt: Date.now(), validatedByUuid: user.uuid }, user)

    if (status === 'approved' && assignment?.activityUuid) {
      const post: Partial<PostModel> = {
        visibility: 'public',
        authorUuid: user.uuid,
        type: 'activityAssignment',
        content: assignment.comment,
        teamUuid: assignment.teamUuid,
        missionUuid: assignment.missionUuid,
        activityAssignmentUuid: assignment.uuid
      }
      await this.eventEmitter.emit(new PostEvent(PostEvent.TIMELINE_PUBLISH, post))
    }

    this.logger.info(`ActivityAssignment status changed to ${status}: ${assignment.uuid}`)

    return updated
  }

  /**
   * Save a new activity assignment
   *
   * @param event - The incoming HTTP event
   * @param data - The activity assignment data
   * @param user - The user creating the assignment
   * @returns The created activity assignment UUID
   */
  private async createActivityAssignment (event: IncomingHttpEvent, data: Partial<ActivityAssignment>, user: User): Promise<{ uuid: string | undefined }> {
    data.origin = 'manual'
    data.userAgent = event.getHeader('user-agent')
    data.locationCity = event.getHeader('cloudfront-viewer-city')
    data.platform = event.getHeader('cloudfront-viewer-platform')
    data.locationIp = event.getHeader('cloudfront-viewer-address')
    data.device = event.getHeader('cloudfront-viewer-device-type')
    data.locationCountry = event.getHeader('cloudfront-viewer-country')
    data.locationLatitude = event.getHeader('cloudfront-viewer-latitude')
    data.locationTimezone = event.getHeader('cloudfront-viewer-time-zone')
    data.locationLongitude = event.getHeader('cloudfront-viewer-longitude')
    data.locationPostalCode = event.getHeader('cloudfront-viewer-postal-code')
    data.locationRegion = event.getHeader('cloudfront-viewer-country-region-name')

    const uuid = await this.activityAssignmentService.create(data, user)

    this.logger.info(`ActivityAssignment created: ${uuid}, by user: ${String(user.uuid)}`)

    return { uuid }
  }
}
