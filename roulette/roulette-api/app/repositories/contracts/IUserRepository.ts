import { User, UserModel } from '../../models/User'
import { ListMetadataOptions } from '../../models/App'

/**
 * User Repository contract
 */
export interface IUserRepository {
  /**
   * List all user models
   *
   * @param limit - Maximum number of users to return
   * @param page - Page number for pagination
   * @returns List of user models
   */
  list: (limit?: number, page?: number | string) => Promise<ListMetadataOptions<UserModel>>

  /**
   * List user models by conditions
   *
   * @param conditions - Partial filter for user model fields
   * @param limit - Max number of results
   * @param page - Page number for pagination
   * @returns Filtered user models
   */
  listBy: (conditions: Partial<UserModel>, limit?: number, page?: number | string) => Promise<ListMetadataOptions<UserModel>>

  /**
   * Find a user model by its UUID
   *
   * @param uuid - User UUID
   * @returns The user model or undefined
   */
  findByUuid: (uuid: string) => Promise<UserModel | undefined>

  /**
   * Find a user model by conditions
   *
   * @param conditions - Partial user model fields
   * @returns The user model or undefined
   */
  findBy: (conditions: Partial<UserModel>) => Promise<UserModel | undefined>

  /**
   * Create a user model
   *
   * @param user - User model to create
   * @param author - User creating the user
   * @returns UUID of the created user
   */
  create: (user: UserModel, author: User) => Promise<string | undefined>

  /**
   * Update a user model
   *
   * @param user - Existing user model
   * @param data - Fields to update
   * @param author - User performing the update
   * @returns Updated user model or undefined
   */
  update: (user: UserModel, data: Partial<UserModel>, author: User) => Promise<UserModel | undefined>

  /**
   * Delete a user model
   *
   * @param user - User model to delete
   * @param author - User performing the deletion
   * @returns True if deleted, false otherwise
   */
  delete: (user: UserModel, author: User) => Promise<boolean>

  /**
   * Get total user count (from meta, not scan)
   */
  count: () => Promise<number>
}