import { User } from '../models/User'
import { convertCSVtoJSON } from '../utils'
import { ListMetadataOptions } from '../models/App'
import { BadgeService } from '../services/BadgeService'
import { Activity, ActivityModel } from '../models/Activity'
import { ActivityService } from '../services/ActivityService'
import { ILogger, isEmpty, isNotEmpty } from '@stone-js/core'
import { EventHandler, Get, Post, Patch, Delete } from '@stone-js/router'
import { JsonHttpResponse, BadRequestError, IncomingHttpEvent } from '@stone-js/http-core'

/**
 * Activity Event Handler Options
 */
export interface ActivityEventHandlerOptions {
  logger: ILogger
  badgeService: BadgeService
  activityService: ActivityService
}

/**
 * Activity Event Handler
 */
@EventHandler('/activities', { name: 'activities', middleware: ['auth'] })
export class ActivityEventHandler {
  private readonly logger: ILogger
  private readonly badgeService: BadgeService
  private readonly activityService: ActivityService

  constructor ({ activityService, badgeService, logger }: ActivityEventHandlerOptions) {
    this.logger = logger
    this.badgeService = badgeService
    this.activityService = activityService
  }

  /**
   * List all activities
   */
  @Get('/', { name: 'list' })
  @JsonHttpResponse(200)
  async list (event: IncomingHttpEvent): Promise<ListMetadataOptions<Activity>> {
    const meta = await this.activityService.list(Number(event.get('limit', 10)), event.get('page'))
    meta.items = await Promise.all(meta.items.map(async (v) => {
      v.badge = v.badgeUuid ? await this.badgeService.findByUuid(v.badgeUuid) : undefined
      return v
    }))

    return meta
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
    const activity = event.get<Activity>('activity')
    return isNotEmpty<Activity>(activity) ? this.activityService.toActivity(activity) : undefined
  }

  /**
   * Create a new activity
   */
  @Post('/', { middleware: ['admin'] })
  @JsonHttpResponse(201)
  async create (event: IncomingHttpEvent): Promise<{ uuid?: string }> {
    const data = event.getBody<Activity>()

    if (!data?.name || data.score == null) {
      throw new BadRequestError('Activity name and score are required')
    }

    const uuid = await this.activityService.create(data, event.getUser<User>())

    this.logger.info(`Activity created: ${uuid}, by user: ${String(event.getUser<User>().uuid)}`)

    return { uuid }
  }

  /**
   * Bulk create activities from CSV
   */
  @Post('/from-csv', { middleware: ['admin'] })
  @JsonHttpResponse(201)
  async createManyFromCSV (event: IncomingHttpEvent): Promise<{ uuids?: Array<string | undefined> }> {
    const tmpFile = event.getFile('file')?.[0]

    if (isEmpty(tmpFile) || !tmpFile.isValid()) {
      throw new BadRequestError('Invalid file')
    }

    const activities = convertCSVtoJSON<Array<Record<string, any>>>(tmpFile.getContent() ?? '').map<Activity>(v => {
      return {
        name: v.name,
        description: v.description,
        category: v.category,
        categoryLabel: v.categoryLabel ??  v.category,
        impact: v.impact ?? 'neutral',
        score: Number(v.score) || 0,
        badgeUuid: v.badgeUuid,
        autoConvertToBadge: v.autoConvertToBadge === 'true',
        conversionThreshold: v.conversionThreshold ? Number(v.conversionThreshold) : undefined,
        conversionWindow: v.conversionWindow,
        validityDuration: v.validityDuration ? Number(v.validityDuration) : undefined
      } as unknown as Activity
    })

    tmpFile.remove(true)

    const uuids = await this.activityService.createMany(activities, event.getUser<User>())

    this.logger.info(`Activities created: ${String(uuids.join(', '))}, by user: ${String(event.getUser<User>().uuid)}`)

    return { uuids }
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
    const data = event.getBody<Partial<Activity>>({})
    const activity = event.get<Activity>('activity', {} as unknown as ActivityModel)

    const updated = await this.activityService.update(activity, data)

    this.logger.info(`Activity updated: ${activity.uuid}, by user: ${String(event.getUser<User>().uuid)}`)

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
    const activity = event.get<Activity>('activity', {} as unknown as ActivityModel)

    await this.activityService.delete(activity)

    this.logger.info(`Activity deleted: ${activity.uuid}, by user: ${String(event.getUser<User>()?.uuid)}`)

    return { statusCode: 204 }
  }
}
