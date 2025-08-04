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
   * List all users
   *
   * @param limit - The maximum number of users to return
   * @returns The list of users
   */
  async list (limit: number = 50): Promise<User[]> {
    return await this.client.get<User[]>(`${this.path}/?limit=${limit}`)
  }

  /**
   * Get the current user
   *
   * @returns The current user
   */
  async currentUser (): Promise<User> {
    return await this.client.get<User>(`${this.path}/me`)
  }

  /**
   * Get a user by uuid
   *
   * @param uuid - The UUID of the user
   * @returns The user
   */
  async get (uuid: string): Promise<User> {
    return await this.client.get<User>(`${this.path}/${uuid}`)
  }

  /**
   * Create a new user
   *
   * @param data - The user data to create
   * @returns The created user
   */
  async create (data: Partial<User>): Promise<{ uuid?: string }> {
    return await this.client.post<{ uuid?: string }>(`${this.path}`, data)
  }

  /**
   * Update an existing user
   */
  async update (uuid: string, data: Partial<User>): Promise<User> {
    return await this.client.patch<User>(`${this.path}/${uuid}`, data)
  }

  /**
   * Delete a user
   *
   * @param uuid - The UUID of the user
   * @returns The deleted user
   */
  async delete (uuid: string): Promise<User> {
    return await this.client.delete<User>(`${this.path}/${uuid}`)
  }
}
