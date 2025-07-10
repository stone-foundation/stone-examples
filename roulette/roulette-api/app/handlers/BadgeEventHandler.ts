import { User } from '../models/User'
import { convertCSVtoJSON } from '../utils'
import { Badge, BadgeModel } from '../models/Badge'
import { ListMetadataOptions } from '../models/App'
import { BadgeService } from '../services/BadgeService'
import { ILogger, isEmpty, isNotEmpty } from '@stone-js/core'
import { EventHandler, Get, Post, Patch, Delete } from '@stone-js/router'
import { JsonHttpResponse, BadRequestError, IncomingHttpEvent } from '@stone-js/http-core'

/**
 * Badge Event Handler Options
 */
export interface BadgeEventHandlerOptions {
  logger: ILogger
  badgeService: BadgeService
}

/**
 * Badge Event Handler
 */
@EventHandler('/badges', { name: 'badges' })
export class BadgeEventHandler {
  private readonly logger: ILogger
  private readonly badgeService: BadgeService

  constructor ({ badgeService, logger }: BadgeEventHandlerOptions) {
    this.logger = logger
    this.badgeService = badgeService
  }

  /**
   * List all badges
   */
  @Get('/', { name: 'list', middleware: ['auth'] })
  @JsonHttpResponse(200)
  async list (event: IncomingHttpEvent): Promise<ListMetadataOptions<Badge>> {
    return await this.badgeService.list(event.get('limit', 10), event.get('page'))
  }

  /**
   * Show a badge by uuid
   */
  @Get('/:badge@uuid', {
    rules: { badge: /\S{30,40}/ },
    bindings: { badge: BadgeService },
    middleware: ['admin']
  })
  @JsonHttpResponse(200)
  async show (event: IncomingHttpEvent): Promise<Badge | undefined> {
    const badge = event.get<Badge>('badge')
    return isNotEmpty<BadgeModel>(badge) ? this.badgeService.toBadge(badge) : undefined
  }

  /**
   * Create a badge
   */
  @Post('/', { middleware: ['admin'] })
  @JsonHttpResponse(201)
  async create (event: IncomingHttpEvent): Promise<{ uuid?: string }> {
    const data = event.getBody<Badge>()

    if (!data?.name || !data.score) {
      throw new BadRequestError('Badge name and score are required')
    }

    const uuid = await this.badgeService.create(data, event.getUser<User>())

    this.logger.info(`Badge created: ${uuid}, by user: ${String(event.getUser<User>().uuid)}`)

    return { uuid }
  }

  /**
   * Create a user
  */
  @Post('/from-csv', { middleware: ['admin'] })
  @JsonHttpResponse(201)
  async createManyFromCSV (event: IncomingHttpEvent): Promise<{ uuids?: Array<string | undefined> }> {
    const tmpFile = event.getFile('file')?.[0]

    if (isEmpty(tmpFile) || !tmpFile.isValid()) {
      throw new BadRequestError('Invalid file')
    }

    const badges = convertCSVtoJSON<Array<Record<string, any>>>(tmpFile.getContent() ?? '').map<Badge>(v => {
      return {
        name: v.name,
        color: v.color,
        iconUrl: v.iconUrl,
        category: v.category,
        description: v.description,
        score: Number(v.score) || 0,
        categoryLabel: v.categoryLabel,
        visibility: v.visibility ?? 'public',
        maxAssignments: Number(v.maxAssignments) || 1,
      } as unknown as Badge
    })

    tmpFile.remove(true)

    const uuids = await this.badgeService.createMany(badges, event.getUser<User>())

    this.logger.info(`Badges created: ${String(uuids.join(', '))}, by user: ${String(event.getUser<User>().uuid)}`)

    return { uuids }
  }

  /**
   * Update a badge
   */
  @Patch('/:badge@uuid', {
    rules: { badge: /\S{30,40}/ },
    bindings: { badge: BadgeService },
    middleware: ['admin']
  })
  @JsonHttpResponse(200)
  async update (event: IncomingHttpEvent): Promise<Badge> {
    const data = event.getBody<Partial<Badge>>({})
    const badge = event.get<Badge>('badge', {} as unknown as BadgeModel)

    const updated = await this.badgeService.update(badge, data)

    this.logger.info(`Badge updated: ${badge.uuid}, by user: ${String(event.getUser<User>().uuid)}`)

    return updated
  }

  /**
   * Delete a badge
   */
  @Delete('/:badge@uuid', {
    rules: { badge: /\S{30,40}/ },
    bindings: { badge: BadgeService },
    middleware: ['admin']
  })
  async delete (event: IncomingHttpEvent): Promise<{ statusCode: number }> {
    const badge = event.get<Badge>('badge', {} as unknown as BadgeModel)

    await this.badgeService.delete(badge)

    this.logger.info(`Badge deleted: ${badge.uuid}, by user: ${String(event.getUser<User>()?.uuid)}`)

    return { statusCode: 204 }
  }
}
