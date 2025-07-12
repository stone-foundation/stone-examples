import { Axios } from 'axios'
import { User } from '../models/User'
import { AxiosClient } from './AxiosClient'
import { IBlueprint, Stone } from '@stone-js/core'

/**
 * User Client Options
 */
export interface UserClientOptions {
  axios: Axios
  blueprint: IBlueprint
  httpClient: AxiosClient
}

/**
 * User Client
 */
@Stone({ alias: 'userClient' })
export class UserClient {
  private readonly axios: Axios
  private readonly path: string
  private readonly client: AxiosClient

  /**
   * Create a new User Client
   *
   * @param options - The options to create the User Client.
   */
  constructor ({ axios, blueprint, httpClient }: UserClientOptions) {
    this.axios = axios
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
   * Update an existing user
   */
  async update (uuid: string, data: Partial<User>): Promise<User> {
    return await this.client.patch<User>(`${this.path}/${uuid}`, data)
  }

  /**
   * Upload a logo for a team
   */
  async generateUploadLink (uuid: string): Promise<{ uploadUrl: string, publicUrl: string }> {
    return await this.client.post<{ uploadUrl: string, publicUrl: string }>(`${this.path}/${uuid}/upload`)
  }

  /**
   * Upload a file to a signed S3 URL
   */
  async uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
    await this.axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } })
  }
}
