import { randomUUID } from 'node:crypto'
import { normalizePhone } from '../utils'
import { User, UserModel } from '../models/User'
import { NotFoundError } from '@stone-js/http-core'
import { IContainer, isNotEmpty, Service } from '@stone-js/core'
import { IUserRepository } from '../repositories/contracts/IUserRepository'

/**
 * User Service Options
*/
export interface UserServiceOptions {
  userRepository: IUserRepository
}

/**
 * User Service
*/
@Service({ alias: 'userService' })
export class UserService {
  private readonly userRepository: IUserRepository

  /**
   * Resolve route binding
   *
   * @param key - The key of the binding
   * @param value - The value of the binding
   * @param container - The container
   */
  static async resolveRouteBinding (key: string, value: any, container: IContainer): Promise<User | undefined> {
    const userService = container.resolve<UserService>('userService')
    console.debug(`Resolving route binding for key: ${String(key)}, value: ${String(value)}`)
    return await userService.findBy({ [key]: value })
  }

  /**
   * Create a new User Service
  */
  constructor ({ userRepository }: UserServiceOptions) {
    this.userRepository = userRepository
  }

  /**
   * List users
   *
   * @param limit - The limit of users to list
   */
  async list (limit: number = 10): Promise<User[]> {
    return (await this.userRepository.list(limit)).map(v => this.toUser(v))
  }

  /**
   * Sensitive list of users, without converting to User type
   * This is used only for internal purposes where sensitive data is needed.
   *
   * @param limit - The limit of users to list
   */
  async sensitiveList (limit: number = 10): Promise<UserModel[]> {
    return (await this.userRepository.list(limit))
  }

  /**
   * List users by conditions
   *
   * @param conditions - The conditions to filter users
   * @param limit - The limit of users to list
   */
  async listBy (conditions: Record<string, any>, limit: number = 10): Promise<User[]> {
    return (await this.userRepository.listBy(conditions, limit)).map(v => this.toUser(v))
  }

  /**
   * Find a user
   *
   * @param conditions - The conditions to find the user
   * @returns The found user
   */
  async findBy (conditions: Record<string, any>): Promise<User> {
    // Normalize phone number if provided
    conditions.phone = normalizePhone(conditions.phone)
    // Find the user by conditions
    const userModel = await this.userRepository.findBy(conditions)
    if (isNotEmpty<UserModel>(userModel)) return this.toUser(userModel)
    throw new NotFoundError(`The user with conditions ${JSON.stringify(conditions)} not found`)
  }

  /**
   * Find a user by uuid
   *
   * @param uuid - The uuid of the user to find
   * @returns The found user or undefined if not found
   */
  async findByUuid (uuid: string): Promise<User | undefined> {
    const userModel = await this.userRepository.findByUuid(uuid)
    if (isNotEmpty<UserModel>(userModel)) return this.toUser(userModel)
  }

  /**
   * Find a user by phone
   *
   * @param rawPhone - The phone number of the user to find
   * @returns The found user or undefined if not found
   */
  async findByPhone (rawPhone: string): Promise<User | undefined> {
    const phone = normalizePhone(rawPhone)
    const userModel = await this.userRepository.findBy({ phone })
    if (isNotEmpty<UserModel>(userModel)) return this.toUser(userModel)
  }

  /**
   * Find a user by username
   *
   * @param username - The username of the user to find
   * @returns The found user or undefined if not found
   */
  async findByUsername (username: string): Promise<User | undefined> {
    const userModel = await this.userRepository.findBy({ username })
    if (isNotEmpty<UserModel>(userModel)) return this.toUser(userModel)
  }

  /**
   * Create a user
   *
   * @param user - The user to create
   */
  async create (user: User): Promise<string | undefined> {
    user.phone = normalizePhone(user.phone, true)

    return await this.userRepository.create({
      ...user,
      isActive: false,
      isOnline: false,
      uuid: randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
  }

  /**
   * Create many users
   *
   * @param users - The users to create
   * @returns An array of user UUIDs or undefined if creation failed
   */
  async createMany (users: User[]): Promise<Array<string | undefined>> {
    return await Promise.all(users.map(async v => await this.create(v)))
  }

  /**
   * Update a user
   *
   * @param user - The user to update
   * @param data - The user data to update
   * @returns The updated user
   */
  async update (user: User, data: Partial<User>): Promise<User> {
    // Set updatedAt to current timestamp
    data.updatedAt = Date.now()
    // Normalize phone number if provided
    data.phone = normalizePhone(data.phone)
    // Save the user
    const userModel = await this.userRepository.update(user, data)
    if (isNotEmpty<UserModel>(userModel)) return this.toUser(userModel)
    throw new NotFoundError(`User with ID ${user.uuid} not found`)
  }

  /**
   * Delete a user
   *
   * @param user - The user to delete
   */
  async delete (user: User): Promise<boolean> {
    return await this.userRepository.delete(user)
  }

  /**
   * Convert UserModel to User
   *
   * @param userModel - The user model to convert
   * @returns The converted user
   */
  toUser (userModel: UserModel): User {
    return {
      ...userModel,
      otp: undefined, // Omit sensitive data
      otpCount: undefined, // Omit OTP count
      password: undefined, // Omit password
      otpExpiresAt: undefined // Omit OTP expiration time
    }
  }
}
