import { User } from '../models/User'
import { MediaService } from './MediaService'
import { UserClient } from '../clients/UserClient'
import { isEmpty, isNotEmpty, Service } from '@stone-js/core'

/**
 * User Service Options
*/
export interface UserServiceOptions {
  userClient: UserClient
  mediaService: MediaService
}

/**
 * User Service
*/
@Service({ alias: 'userService' })
export class UserService {
  private _currentUser?: User
  private readonly client: UserClient
  private readonly mediaService: MediaService

  /**
   * Create a new User Service
  */
  constructor ({ userClient, mediaService }: UserServiceOptions) {
    this.client = userClient
    this.mediaService = mediaService
  }

  /**
   * List all users
   *
   * @param limit - The maximum number of users to return
   * @returns The list of users
  */
  async list (limit: number = 50): Promise<User[]> {
    return await this.client.list(limit)
  }

  /**
   * Get the current user
   */
  async current (singleton?: boolean): Promise<User> {
    if (isEmpty(this._currentUser) || singleton !== true) {
      this._currentUser = await this.client.currentUser()
    }

    return this._currentUser
  }

  /**
   * Get a user by UUID
   *
   * @param uuid - The UUID of the user
   * @returns The user
   */
  async get (uuid: string): Promise<User> {
    return await this.client.get(uuid)
  }

  /**
   * Toggle the captain grade of a user
   * 
   * @param user - The user to toggle the captain grade for
   * @returns The updated user
   */
  async toggleCaptainGrade (user: User): Promise<User> {
    const roles = user.roles?.includes('captain') ? ['member'] : ['captain']
    return await this.client.update(user.uuid, { roles })
  }

  /**
   * Create a new user
   *
   * @param data - The data to create the user with
   * @param file - The file to upload as the user's avatar
   * @returns The created user
   */
  async create (data: Partial<User>, file?: File): Promise<{ uuid?: string }> {
    const avatarUrl = await this.uploadFile('users', file)
    return await this.client.create({ ...data, avatarUrl })
  }
  
  /**
   * Update an existing user
   *
   * @param uuid - The UUID of the user to update
   * @param data - The data to update the user with
   * @param file - The file to upload as the user's avatar
   * @returns The updated user
   */
  async update (uuid: string, data: Partial<User>, file?: File): Promise<User> {
    const avatarUrl = await this.uploadFile('users', file)
    return await this.client.update(uuid, { ...data, avatarUrl })
  }
  
  /**
   * Delete a user
   *
   * @param uuid - The UUID of the user to delete
   * @returns The deleted user
   */
  async delete (uuid: string): Promise<User> {
    return await this.client.delete(uuid)
  }

  /**
   * Upload a file to the media service
   * 
   * @param group - The group to upload the file to
   * @param file - The file to upload
   * @returns The URL of the uploaded file
   */
  private async uploadFile(group: string, file?: File): Promise<string | undefined> {
    return isNotEmpty<File>(file) ? await this.mediaService.uploadFile(file, group) : undefined
  }
}
