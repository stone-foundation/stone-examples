import { User } from '../models/User'
import { isEmpty, Service } from '@stone-js/core'
import { UserClient } from '../clients/UserClient'

/**
 * User Service Options
*/
export interface UserServiceOptions {
  userClient: UserClient
}

/**
 * User Service
*/
@Service({ alias: 'userService' })
export class UserService {
  private _currentUser?: User
  private readonly userClient: UserClient

  /**
   * Create a new User Service
  */
  constructor ({ userClient }: UserServiceOptions) {
    this.userClient = userClient
  }

  /**
   * List all users
   *
   * @param limit - The maximum number of users to return
   * @returns The list of users
  */
  async list (limit: number = 50): Promise<User[]> {
    return await this.userClient.list(limit)
  }

  /**
   * Get the current user
   */
  async current (singleton?: boolean): Promise<User> {
    if (isEmpty(this._currentUser) || singleton !== true) {
      this._currentUser = await this.userClient.currentUser()
    }

    return this._currentUser
  }

  async toggleCaptainGrade (user: User): Promise<User> {
    const roles = user.roles?.includes('captain') ? ['soldier'] : ['captain']
    return await this.userClient.update(user.uuid, { roles })
  }

  /**
   * Upload a logo for a user
   */
  async changeImage (uuid: string, file: File): Promise<void> {
    const { uploadUrl } = await this.userClient.generateUploadLink(uuid)
    await this.userClient.uploadFileToS3(uploadUrl, file)
  }
}
