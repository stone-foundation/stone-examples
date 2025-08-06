import { User } from '../models/User'
import { ListMetadataOptions } from '../models/App'
import { ILogger, isNotEmpty } from '@stone-js/core'
import { Mission, MissionModel } from '../models/Mission'
import { MissionService } from '../services/MissionService'
import { EventHandler, Get, Post, Patch, Delete } from '@stone-js/router'
import { JsonHttpResponse, BadRequestError, IncomingHttpEvent } from '@stone-js/http-core'

/**
 * Mission Event Handler Options
 */
export interface MissionEventHandlerOptions {
  logger: ILogger
  missionService: MissionService
}

/**
 * Mission Event Handler
 */
@EventHandler('/missions', { name: 'missions', middleware: ['auth'] })
export class MissionEventHandler {
  private readonly logger: ILogger
  private readonly missionService: MissionService

  constructor ({ missionService, logger }: MissionEventHandlerOptions) {
    this.logger = logger
    this.missionService = missionService
  }

  /**
   * List all missions
   */
  @Get('/', { name: 'list' })
  @JsonHttpResponse(200)
  async list (event: IncomingHttpEvent): Promise<ListMetadataOptions<Mission>> {
    return await this.missionService.list(Number(event.get('limit', 10)), event.get('page'))
  }

  /**
   * List active missions
   */
  @Get('/active', { name: 'listActive' })
  @JsonHttpResponse(200)
  async listActive (event: IncomingHttpEvent): Promise<ListMetadataOptions<Mission>> {
    return await this.missionService.findActiveMissions(Number(event.get('limit', 10)), event.get('page'))
  }

  /**
   * Show a single mission
   */
  @Get('/:mission@uuid', {
    rules: { mission: /\S{30,40}/ },
    bindings: { mission: MissionService }
  })
  @JsonHttpResponse(200)
  async show (event: IncomingHttpEvent): Promise<Mission | undefined> {
    const mission = event.get<Mission>('mission')
    return isNotEmpty<Mission>(mission) ? this.missionService.toMission(mission) : undefined
  }

  /**
   * Create a new mission
   */
  @Post('/', { middleware: ['admin'] })
  @JsonHttpResponse(201)
  async create (event: IncomingHttpEvent): Promise<{ uuid?: string }> {
    const user = event.getUser<User>()
    const data = event.getBody<Mission>()

    if (!data?.name || !data?.description) {
      throw new BadRequestError('Mission name and description are required')
    }

    if (data.startDate && data.endDate && data.startDate >= data.endDate) {
      throw new BadRequestError('Mission end date must be after start date')
    }

    const uuid = await this.missionService.create(data, user)

    this.logger.info(`Mission created: ${uuid}, by user: ${String(user.uuid)}`)

    return { uuid }
  }

  /**
   * Update a mission
   */
  @Patch('/:mission@uuid', {
    rules: { mission: /\S{30,40}/ },
    bindings: { mission: MissionService },
    middleware: ['admin']
  })
  @JsonHttpResponse(200)
  async update (event: IncomingHttpEvent): Promise<Mission> {
    const user = event.getUser<User>()
    const data = event.getBody<Partial<Mission>>({})
    const mission = event.get<Mission>('mission', {} as unknown as MissionModel)

    if (data.startDate && data.endDate && data.startDate >= data.endDate) {
      throw new BadRequestError('Mission end date must be after start date')
    }

    const updated = await this.missionService.update(mission, data, user)

    this.logger.info(`Mission updated: ${mission.uuid}, by user: ${String(user.uuid)}`)

    return updated
  }

  /**
   * Delete a mission
   */
  @Delete('/:mission@uuid', {
    rules: { mission: /\S{30,40}/ },
    bindings: { mission: MissionService },
    middleware: ['admin']
  })
  async delete (event: IncomingHttpEvent): Promise<{ statusCode: number }> {
    const user = event.getUser<User>()
    const mission = event.get<Mission>('mission', {} as unknown as MissionModel)

    await this.missionService.delete(mission, user)

    this.logger.info(`Mission deleted: ${mission.uuid}, by user: ${String(user.uuid)}`)

    return { statusCode: 204 }
  }
}
