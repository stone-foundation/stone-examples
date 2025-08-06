import { ListMetadataOptions } from '../../models/App'
import { User, UserHistoryModel } from '../../models/User'

/**
 * UserHistory Repository contract
 */
export interface IUserHistoryRepository {
  /**
   * List all user history models
   *
   * @param limit - Maximum number of user histories to return
   * @returns List of user history models
   */
  list: (limit?: number, page?: number | string) => Promise<ListMetadataOptions<UserHistoryModel>>

  /**
   * List user history models by conditions
   *
   * @param conditions - Partial filter for user history model fields
   * @param limit - Max number of results
   * @returns Filtered user history models
   */
  listBy: (conditions: Partial<UserHistoryModel>, limit?: number, page?: number | string) => Promise<ListMetadataOptions<UserHistoryModel>>

  /**
   * Find a user history model by its ID
   *
   * @param id - UserHistory ID
   * @returns The user history model or undefined
   */
  findById: (id: number) => Promise<UserHistoryModel | undefined>

  /**
   * Find a user history model by conditions
   *
   * @param conditions - Partial user history model fields
   * @returns The user history model or undefined
   */
  findBy: (conditions: Partial<UserHistoryModel>) => Promise<UserHistoryModel | undefined>

  /**
   * Create a user history model
   *
   * @param userHistory - UserHistory model to create
   * @param author - User creating the user history
   * @returns ID of the created user history
   */
  create: (userHistory: UserHistoryModel, author: User) => Promise<string | undefined>

  /**
   * Create a user history entry
   *
   * @param userHistory - Partial UserHistory model to create
   * @param author - User creating the history entry
   * @returns ID of the created user history entry
   */
  makeHistoryEntry: (userHistory: Partial<UserHistoryModel>, author: User) => Promise<string | undefined>

  /**
   * Delete a user history model
   *
   * @param userHistory - UserHistory model to delete
   * @param author - User performing the deletion
   * @returns True if deleted, false otherwise
   */
  delete: (userHistory: UserHistoryModel, author: User) => Promise<boolean>

  /**
   * Get total user history count (from meta, not scan)
   */
  count: () => Promise<number>
}