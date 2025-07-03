import { User } from '../models/User'
import { AxiosClient } from './AxiosClient'
import { IBlueprint, Stone } from '@stone-js/core'

/**
 * User Client Options
 */
export interface UserClientOptions {
  blueprint: IBlueprint
  httpClient: AxiosClient
}

/**
 * User Client
 */
@Stone({ alias: 'userClient' })
export class UserClient {
  private readonly path: string
  private readonly client: AxiosClient

  /**
   * Create a new User Client
   *
   * @param options - The options to create the User Client.
   */
  constructor ({ blueprint, httpClient }: UserClientOptions) {
    this.client = httpClient
    this.path = blueprint.get('app.clients.user.path', '/users')
  }

  /**
   * Get the current user
   *
   * @returns The current user
   */
  async currentUser (): Promise<User> {
    return await this.client.get<User>(`${this.path}/me`)
  }
}
