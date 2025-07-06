import { UserModel } from '../../models/User'

/**
 * User Repository contract
 */
export interface IUserRepository {
  /**
   * List users
   *
   * @param limit - The limit of users to list
   * @returns The list of users
   */
  list: (limit: number) => Promise<UserModel[]>

  /**
   * List users by dynamic conditions
   *
   * @param conditions - Conditions to filter users
   * @param limit - The limit of users to list
   * @returns The list of users
   */
  listBy: (conditions: Partial<UserModel>, limit: number) => Promise<UserModel[]>

  /**
   * Find a user by uuid
   *
   * @param uuid - The uuid of the user to find
   * @returns The user or undefined if not found
   */
  findByUuid: (uuid: string) => Promise<UserModel | undefined>

  /**
   * Find a user by dynamic conditions
   *
   * @param conditions - Conditions to match the user
   * @returns The user or undefined if not found
   */
  findBy: (conditions: Partial<UserModel>) => Promise<UserModel | undefined>

  /**
   * Create a user
   *
   * @param user - The user to create
   * @returns The uuid of the created user
   */
  create: (user: UserModel) => Promise<string | undefined>

  /**
   * Update a user
   *
   * @param user - The user to update
   * @param data - The data to update in the user
   * @returns The updated user or undefined if not found
   */
  update: (user: UserModel, data: Partial<UserModel>) => Promise<UserModel | undefined>

  /**
   * Delete a user
   *
   * @param user - The user to delete
   * @returns `true` if the user was deleted, `false` if not
   */
  delete: (user: UserModel) => Promise<boolean>
}
