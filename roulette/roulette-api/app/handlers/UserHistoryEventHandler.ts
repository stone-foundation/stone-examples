import { ILogger } from '@stone-js/core'
import { ListMetadataOptions } from '../models/App'
import { EventHandler, Get, Delete } from '@stone-js/router'
import { UserHistoryService } from '../services/UserHistoryService'
import { User, UserHistory, UserHistoryType } from '../models/User'
import { JsonHttpResponse, IncomingHttpEvent } from '@stone-js/http-core'

/**
 * UserHistory Event Handler Options
 */
export interface UserHistoryEventHandlerOptions {
  logger: ILogger
  userHistoryService: UserHistoryService
}

/**
 * UserHistory Event Handler
 */
@EventHandler('/user-histories', { name: 'userHistory', middleware: ['admin'] })
export class UserHistoryEventHandler {
  private readonly logger: ILogger
  private readonly userHistoryService: UserHistoryService

  constructor ({ userHistoryService, logger }: UserHistoryEventHandlerOptions) {
    this.logger = logger
    this.userHistoryService = userHistoryService
  }

  /**
   * List all user history entries (admin only)
   */
  @Get('/', { name: 'list' })
  @JsonHttpResponse(200)
  async list (event: IncomingHttpEvent): Promise<ListMetadataOptions<UserHistory>> {
    const action = event.get<'created' | 'updated' | 'deleted'>('action')
    return await this.userHistoryService.listBy({ action }, Number(event.get('limit', 20)), event.get('page'))
  }

  /**
   * Get current user's activity timeline
   */
  @Get('/timeline', { name: 'timeline' })
  @JsonHttpResponse(200)
  async timeline (event: IncomingHttpEvent): Promise<ListMetadataOptions<UserHistory>> {
    const user = event.getUser<User>()
    return await this.userHistoryService.getUserTimeline(user.uuid, Number(event.get('limit', 20)), event.get('page'))
  }

  /**
   * Get current user's activity statistics
   */
  @Get('/stats', { name: 'stats' })
  @JsonHttpResponse(200)
  async stats (event: IncomingHttpEvent): Promise<{
    totalActions: number
    createdCount: number
    updatedCount: number
    deletedCount: number
  }> {
    const user = event.getUser<User>()
    return await this.userHistoryService.getUserActivityStats(user.uuid)
  }

  /**
   * Get user activity timeline by user UUID (admin only)
   */
  @Get('/users/:userUuid@uuid/timeline', { 
    name: 'userTimeline',
    rules: { userUuid: /\S{30,40}/ },
    middleware: ['admin']
  })
  @JsonHttpResponse(200)
  async userTimeline (event: IncomingHttpEvent): Promise<ListMetadataOptions<UserHistory>> {
    const userUuid = event.get<string>('userUuid', '')
    return await this.userHistoryService.getUserTimeline(userUuid, Number(event.get('limit', 20)), event.get('page'))
  }

  /**
   * Get user activity statistics by user UUID (admin only)
   */
  @Get('/users/:userUuid@uuid/stats', { 
    name: 'userStats',
    rules: { userUuid: /\S{30,40}/ },
    middleware: ['admin']
  })
  @JsonHttpResponse(200)
  async userStats (event: IncomingHttpEvent): Promise<{
    totalActions: number
    createdCount: number
    updatedCount: number
    deletedCount: number
  }> {
    const userUuid = event.get<string>('userUuid', '')
    return await this.userHistoryService.getUserActivityStats(userUuid)
  }

  /**
   * Get history entries by any item (admin only)
   */
  @Get('/item/:itemUuid@uuid/:type', { 
    name: 'itemHistory',
    rules: { itemUuid: /\S{30,40}/, type: /\S+/ },
    middleware: ['admin']
  })
  @JsonHttpResponse(200)
  async itemHistory (event: IncomingHttpEvent): Promise<ListMetadataOptions<UserHistory>> {
    const itemUuid = event.get<string>('itemUuid')
    const type = event.get<UserHistoryType>('type')
    return await this.userHistoryService.listBy({ itemUuid, type }, Number(event.get('limit', 20)), event.get('page'))
  }

  /**
   * Show a single history entry (admin only)
   */
  @Get('/:history@uuid', { rules: { history: /\S{30,40}/ }, bindings: { history: UserHistoryService } })
  @JsonHttpResponse(200)
  async show (event: IncomingHttpEvent): Promise<UserHistory | undefined> {
    const history = event.get<UserHistory>('history', {} as UserHistory)
    return this.userHistoryService.toUserHistory(history)
  }

  /**
   * Delete an history entry by ID (admin only)
   *
   * Explcitily returning a status code.
  */
  @Delete('/:history@uuid', { rules: { history: /\S{30,40}/ }, bindings: { history: UserHistoryService } })
  async delete (event: IncomingHttpEvent): Promise<{ statusCode: number }> {
    const user = event.getUser<User>()
    const history = event.get<UserHistory>('history', {} as UserHistory)

    await this.userHistoryService.delete(history, user)

    this.logger.info(`History deleted: ${history.uuid}, by user: ${String(user?.uuid)}`)

    return { statusCode: 204 }
  }
}