import { NotFoundError } from '@stone-js/http-core'
import { ListMetadataOptions } from '../models/App'
import { IContainer, isNotEmpty, Service } from '@stone-js/core'
import { User, UserHistory, UserHistoryModel } from '../models/User'
import { IUserHistoryRepository } from '../repositories/contracts/IUserHistoryRepository'

/**
 * UserHistory Service Options
 */
export interface UserHistoryServiceOptions {
  userHistoryRepository: IUserHistoryRepository
}

/**
 * UserHistory Service
 */
@Service({ alias: 'userHistoryService' })
export class UserHistoryService {
  private readonly userHistoryRepository: IUserHistoryRepository

  /**
   * Resolve route binding
   *
   * @param key - The key of the binding
   * @param value - The value of the binding
   * @param container - The container
   */
  static async resolveRouteBinding (key: string, value: any, container: IContainer): Promise<UserHistory | undefined> {
    const userHistoryService = container.resolve<UserHistoryService>('userHistoryService')
    return await userHistoryService.findBy({ [key]: value })
  }

  /**
   * Create a new UserHistory Service
   */
  constructor ({ userHistoryRepository }: UserHistoryServiceOptions) {
    this.userHistoryRepository = userHistoryRepository
  }

  /**
   * List all user history entries
   */
  async list (limit: number = 10, page?: number | string): Promise<ListMetadataOptions<UserHistory>> {
    const result = await this.userHistoryRepository.list(limit, page)
    const items = result.items.map(v => this.toUserHistory(v))
    return { ...result, items }
  }

  /**
   * List user history entries by conditions
   */
  async listBy (conditions: Partial<UserHistoryModel>, limit: number = 10, page?: number | string): Promise<ListMetadataOptions<UserHistory>> {
    const result = await this.userHistoryRepository.listBy(conditions, limit, page)
    const items = result.items.map(v => this.toUserHistory(v))
    return { ...result, items }
  }

  /**
   * Find a user history entry
   *
   * @param conditions - The conditions to find the user history entry
   * @returns The found user history entry
   */
  async findBy (conditions: Record<string, any>): Promise<UserHistory> {
    const userHistoryModel = await this.userHistoryRepository.findBy(conditions)
    if (isNotEmpty<UserHistoryModel>(userHistoryModel)) return this.toUserHistory(userHistoryModel)
    throw new NotFoundError(`The user history entry with conditions ${JSON.stringify(conditions)} not found`)
  }

  /**
   * Get user activity timeline
   *
   * @param userUuid - The uuid of the user
   * @param limit - Maximum number of results
   * @param page - Page number for pagination
   * @returns The user's activity timeline
   */
  async getUserTimeline (authorUuid: string, limit: number = 20, page?: number | string): Promise<ListMetadataOptions<UserHistory>> {
    return await this.listBy({ authorUuid }, limit, page)
  }

  /**
   * Get activity statistics for a user
   *
   * @param authorUuid - The uuid of the user
   * @returns Statistics about user's activities
   */
  async getUserActivityStats (authorUuid: string): Promise<{
    totalActions: number
    createdCount: number
    updatedCount: number
    deletedCount: number
  }> {
    const allActivities = await this.userHistoryRepository.listBy({ authorUuid }, 1000)
    const activities = allActivities.items

    return {
      totalActions: activities.length,
      createdCount: activities.filter(a => a.action === 'created').length,
      updatedCount: activities.filter(a => a.action === 'updated').length,
      deletedCount: activities.filter(a => a.action === 'deleted').length
    }
  }

  /**
   * Delete a user history entry
   *
   * @param userHistory - The user history entry to delete
   * @returns True if the entry was deleted, false otherwise
   */
  async delete (userHistory: UserHistory, author: User): Promise<boolean> {
    return await this.userHistoryRepository.delete(userHistory, author)
  }

  /**
   * Get total user history count
   *
   * @returns The total count of user history entries
   */
  async count (): Promise<number> {
    return await this.userHistoryRepository.count()
  }

  /**
   * Convert UserHistoryModel to UserHistory
   *
   * @param userHistoryModel - The user history model to convert
   * @returns The converted user history
   */
  toUserHistory (userHistoryModel: UserHistoryModel): UserHistory {
    return { ...userHistoryModel } as UserHistory
  }
}