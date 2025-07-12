import { User } from '../models/User'
import { Team } from '../models/Team'
import { Post as PostType } from '../models/Post'
import { ListMetadataOptions } from '../models/App'
import { ILogger, isNotEmpty } from '@stone-js/core'
import { UserService } from '../services/UserService'
import { PostService } from '../services/PostService'
import { TeamService } from '../services/TeamService'
import { BadgeService } from '../services/BadgeService'
import { ActivityAssignment } from '../models/Activity'
import { ActivityService } from '../services/ActivityService'
import { EventHandler, Get, Post, Patch, Delete } from '@stone-js/router'
import { ActivityAssignmentService } from '../services/ActivityAssignmentService'
import { JsonHttpResponse, BadRequestError, IncomingHttpEvent } from '@stone-js/http-core'

/**
 * Activity Assignment Event Handler Options
 */
export interface ActivityAssignmentEventHandlerOptions {
  logger: ILogger
  userService: UserService
  postService: PostService
  teamService: TeamService
  badgeService: BadgeService
  activityService: ActivityService
  activityAssignmentService: ActivityAssignmentService
}

/**
 * Activity Assignment Event Handler
 */
@EventHandler('/activity-assignments', { name: 'activityAssignments' })
export class ActivityAssignmentEventHandler {
  private readonly logger: ILogger
  private readonly postService: PostService
  private readonly userService: UserService
  private readonly teamService: TeamService
  private readonly badgeService: BadgeService
  private readonly activityService: ActivityService
  private readonly activityAssignmentService: ActivityAssignmentService

  constructor ({ logger, teamService, badgeService, postService, userService, activityService, activityAssignmentService }: ActivityAssignmentEventHandlerOptions) {
    this.logger = logger
    this.postService = postService
    this.userService = userService
    this.teamService = teamService
    this.badgeService = badgeService
    this.activityService = activityService
    this.activityAssignmentService = activityAssignmentService
  }

  @Get('/')
  @JsonHttpResponse(200)
  async list (event: IncomingHttpEvent): Promise<ListMetadataOptions<ActivityAssignment>> {
    const meta = await this.activityAssignmentService.list(Number(event.get('limit', 10)), event.get('page'))

    meta.items = await this.populateActivityAssignment(meta.items)

    return meta
  }

  @Get('/team/:teamUuid', { middleware: ['authOrNot'] })
  @JsonHttpResponse(200)
  async listByTeam (event: IncomingHttpEvent): Promise<ListMetadataOptions<ActivityAssignment>> {
    const meta = await this.activityAssignmentService.listBy({ teamUuid: event.get('teamUuid') }, Number(event.get('limit', 10)), event.get('page'))
    
    meta.items = await this.populateActivityAssignment(meta.items)

    return meta
  }

  @Get('/activity/:activityUuid', { middleware: ['authOrNot'] })
  @JsonHttpResponse(200)
  async listByActivity (event: IncomingHttpEvent): Promise<ListMetadataOptions<ActivityAssignment>> {
    const meta = await this.activityAssignmentService.listBy({ activityUuid: event.get('activityUuid') }, Number(event.get('limit', 10)), event.get('page'))
    
    meta.items = await this.populateActivityAssignment(meta.items)

    return meta
  }

  @Get('/stats/:teamName?', { middleware: ['authOrNot'] })
  @JsonHttpResponse(200)
  async stats (event: IncomingHttpEvent): Promise<Record<string, unknown>> {
    const name = event.get('teamName')
    const team = isNotEmpty(name) ? this.teamService.findBy({ name }) : undefined
    const conditions = isNotEmpty<Team>(team) ? { teamUuid: team?.uuid } : {}
    return await this.activityAssignmentService.statistics(conditions)
  }

  @Get('/:assignment@uuid', {
    rules: { assignment: /\S{30,40}/ },
    bindings: { assignment: ActivityAssignmentService },
    middleware: ['authOrNot']
  })
  @JsonHttpResponse(200)
  async show (event: IncomingHttpEvent): Promise<ActivityAssignment | undefined> {
    const assignment = event.get<ActivityAssignment>('assignment')
    return isNotEmpty(assignment) ? assignment : undefined
  }

  @Post('/', { middleware: ['auth'] })
  @JsonHttpResponse(201)
  async create (event: IncomingHttpEvent): Promise<{ uuid?: string }> {
    const user = event.getUser<User>()
    const data = event.getBody<ActivityAssignment>()

    if ((!data?.activityCategory && !data?.activityUuid) || !data?.teamUuid) {
      throw new BadRequestError('Activity UUID and team UUID are required')
    }

    // For presence activities, we need to find the activity UUID by category
    if (isNotEmpty<string>(data?.activityCategory)) {
      if (isNotEmpty(user.presenceActivityUuid)) {
        throw new BadRequestError(`User already has a presence activity assigned for category ${data.activityCategory}`)
      }

      const activityUuid = (await this.activityService.findBy({ category: data.activityCategory })).uuid

      if (!activityUuid) {
        throw new BadRequestError(`Activity with category ${data.activityCategory} not found`)
      }

      data.activityUuid = activityUuid
      this.userService.update(user, { presenceActivityUuid: data.activityCategory }) // Update user with category
      data.activityCategory = undefined // Clear category to avoid duplication
    }

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

  @Patch('/:assignment@uuid', {
    rules: { assignment: /\S{30,40}/ },
    bindings: { assignment: ActivityAssignmentService },
    middleware: ['admin']
  })
  @JsonHttpResponse(200)
  async validateOrUpdate (event: IncomingHttpEvent): Promise<ActivityAssignment> {
    const data = event.getBody<Partial<ActivityAssignment>>({})
    const assignment = event.get<ActivityAssignment>('assignment', {} as unknown as ActivityAssignment)

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
    const assignment = event.get<ActivityAssignment>('assignment', {} as unknown as ActivityAssignment)
    await this.activityAssignmentService.delete(assignment)
    this.logger.info(`ActivityAssignment deleted: ${assignment.uuid}, by admin: ${String(event.getUser<User>().uuid)}`)
    return { statusCode: 204 }
  }

  @Patch('/:assignment@uuid/status', {
    rules: { assignment: /\S{30,40}/ },
    bindings: { assignment: ActivityAssignmentService },
    middleware: ['admin']
  })
  @JsonHttpResponse(200)
  async changeStatus (event: IncomingHttpEvent): Promise<ActivityAssignment> {
    const user = event.getUser<User>()
    const assignment = event.get<ActivityAssignment>('assignment', {} as unknown as ActivityAssignment)
    const { status } = event.getBody<Partial<ActivityAssignment>>({})

    if (!status) throw new BadRequestError('Status is required')

    const updated = await this.activityAssignmentService.update(assignment, { status, validatedAt: Date.now(), validatedByUuid: user.uuid })

    if (status === 'approved' && assignment?.activityUuid) {
      this.postService.create({
        type: 'activity',
        visibility: 'public',
        authorUuid: assignment.uuid,
        content: assignment.comment,
        teamUuid: assignment.teamUuid,
        activityUuid: assignment.activityUuid
      } as unknown as PostType, user)
    }

    this.logger.info(`ActivityAssignment status changed to ${status}: ${assignment.uuid}`)

    return updated
  }

  private async populateActivityAssignment (assignments: ActivityAssignment[]): Promise<ActivityAssignment[]> {
    return (await Promise.all(assignments.flatMap(async (assignment) => {
       const activity = await this.activityService.findByUuid(assignment.activityUuid)
      if (activity) {
        assignment.activity = activity
        assignment.activity.badge = assignment.activity.badgeUuid ? await this.badgeService.findByUuid(assignment.activity.badgeUuid) : undefined
        const member = assignment?.memberUuid ? await this.userService.findByUuid(assignment?.memberUuid) : undefined
        assignment.team = assignment?.teamUuid ? await this.teamService.findByUuid(assignment?.teamUuid) : undefined
        assignment.member = member ? this.teamService.toTeamMember(member) : undefined

        return assignment
      }
      return undefined
    }))).filter(v => isNotEmpty<ActivityAssignment>(v))
  }
}
