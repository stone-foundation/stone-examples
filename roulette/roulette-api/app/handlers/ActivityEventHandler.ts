import { User } from '../models/User'
import { convertCSVtoJSON } from '../utils'
import { ILogger, isEmpty } from '@stone-js/core'
import { ListMetadataOptions } from '../models/App'
import { Activity, ActivityModel } from '../models/Activity'
import { ActivityService } from '../services/ActivityService'
import { EventHandler, Get, Post, Patch, Delete } from '@stone-js/router'
import { JsonHttpResponse, BadRequestError, IncomingHttpEvent } from '@stone-js/http-core'

/**
 * Activity Event Handler Options
 */
export interface ActivityEventHandlerOptions {
  logger: ILogger
  activityService: ActivityService
}

/**
 * Activity Event Handler
 */
@EventHandler('/activities', { name: 'activities', middleware: ['auth'] })
export class ActivityEventHandler {
  private readonly logger: ILogger
  private readonly activityService: ActivityService

  constructor ({ activityService, logger }: ActivityEventHandlerOptions) {
    this.logger = logger
    this.activityService = activityService
  }

  /**
   * List all activities
   */
  @Get('/', { name: 'list' })
  @JsonHttpResponse(200)
  async list (event: IncomingHttpEvent): Promise<ListMetadataOptions<Activity>> {
    const missionUuid = event.get<string>('missionUuid')
    return await this.activityService.listBy({ missionUuid }, Number(event.get('limit', 10)), event.get('page'))
  }

  /**
   * Show a single activity
   */
  @Get('/:activity@uuid', {
    rules: { activity: /\S{30,40}/ },
    bindings: { activity: ActivityService }
  })
  @JsonHttpResponse(200)
  async show (event: IncomingHttpEvent): Promise<Activity | undefined> {
    return event.get<Activity>('activity')
  }

  /**
   * Create a new activity
   */
  @Post('/', { middleware: ['admin'] })
  @JsonHttpResponse(201)
  async create (event: IncomingHttpEvent): Promise<{ uuid?: string }> {
    const user = event.getUser<User>()
    const data = event.getBody<Activity>()

    if (!data?.name || data.score == null || data.missionUuid == null) {
      throw new BadRequestError('Activity name, score and missionUuid are required')
    }

    const uuid = await this.activityService.create(data, user)

    this.logger.info(`Activity created: ${uuid}, by user: ${String(user.uuid)}`)

    return { uuid }
  }

  /**
   * Update an activity
   */
  @Patch('/:activity@uuid', {
    rules: { activity: /\S{30,40}/ },
    bindings: { activity: ActivityService },
    middleware: ['admin']
  })
  @JsonHttpResponse(200)
  async update (event: IncomingHttpEvent): Promise<Activity> {
    const user = event.getUser<User>()
    const data = event.getBody<Partial<Activity>>({})
    const activity = event.get<Activity>('activity', {} as unknown as ActivityModel)

    const updated = await this.activityService.update(activity, data, user)

    this.logger.info(`Activity updated: ${activity.uuid}, by user: ${String(user.uuid)}`)

    return updated
  }

  /**
   * Delete an activity
   */
  @Delete('/:activity@uuid', {
    rules: { activity: /\S{30,40}/ },
    bindings: { activity: ActivityService },
    middleware: ['admin']
  })
  async delete (event: IncomingHttpEvent): Promise<{ statusCode: number }> {
    const user = event.getUser<User>()
    const activity = event.get<Activity>('activity', {} as unknown as ActivityModel)

    await this.activityService.delete(activity, user)

    this.logger.info(`Activity deleted: ${activity.uuid}, by user: ${String(user.uuid)}`)

    return { statusCode: 204 }
  }

  /**
   * Bulk create activities from CSV
   */
  @Post('/from-csv', { middleware: ['admin'] })
  @JsonHttpResponse(201)
  async createManyFromCSV (event: IncomingHttpEvent): Promise<{ uuids?: Array<string | undefined> }> {
    const user = event.getUser<User>()
    const tmpFile = event.getFile('file')?.[0]

    if (isEmpty(tmpFile) || !tmpFile.isValid()) {
      throw new BadRequestError('Invalid file')
    }

    const activities = convertCSVtoJSON<Array<Record<string, any>>>(tmpFile.getContent() ?? '').map<Activity>(v => {
      return {
        name: v.name,
        category: v.category,
        badgeUuid: v.badgeUuid,
        description: v.description,
        missionUuid: v.missionUuid,
        score: Number(v.score) || 0,
        impact: v.impact ?? 'neutral',
        conversionWindow: v.conversionWindow,
        categoryLabel: v.categoryLabel ??  v.category,
        autoConvertToBadge: v.autoConvertToBadge === 'true',
        validityDuration: v.validityDuration ? Number(v.validityDuration) : undefined,
        conversionThreshold: v.conversionThreshold ? Number(v.conversionThreshold) : undefined,
      } as unknown as Activity
    })

    tmpFile.remove(true)

    const uuids = await this.activityService.createMany(activities, user)

    this.logger.info(`Activities created: ${String(uuids.join(', '))}, by user: ${String(user.uuid)}`)

    return { uuids }
  }
}
