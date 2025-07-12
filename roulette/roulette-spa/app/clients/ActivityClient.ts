import { AxiosClient } from './AxiosClient'
import { Activity } from '../models/Activity'
import { IBlueprint, Stone } from '@stone-js/core'
import { ListMetadataOptions } from '../models/App'

/**
 * Activity Client Options
 */
export interface ActivityClientOptions {
  blueprint: IBlueprint
  httpClient: AxiosClient
}

/**
 * Activity Client
 */
@Stone({ alias: 'activityClient' })
export class ActivityClient {
  private readonly path: string
  private readonly client: AxiosClient

  constructor ({ blueprint, httpClient }: ActivityClientOptions) {
    this.client = httpClient
    this.path = blueprint.get('app.clients.activity.path', '/activities')
  }

  /**
   * List all activities
   */
  async list (limit: number = 10, page?: string): Promise<ListMetadataOptions<Activity>> {
    const query = new URLSearchParams({ limit: String(limit), ...(page ? { page } : {}) })
    return await this.client.get<ListMetadataOptions<Activity>>(`${this.path}/?${query.toString()}`)
  }

  /**
   * Get one activity by UUID
   */
  async get (uuid: string): Promise<Activity> {
    return await this.client.get<Activity>(`${this.path}/${uuid}`)
  }

  /**
   * Create a new activity
   */
  async create (activity: Partial<Activity>): Promise<{ uuid?: string }> {
    return await this.client.post<{ uuid?: string }>(`${this.path}/`, activity)
  }

  /**
   * Update an activity
   */
  async update (uuid: string, partial: Partial<Activity>): Promise<Activity> {
    return await this.client.patch<Activity>(`${this.path}/${uuid}`, partial)
  }

  /**
   * Delete an activity
   */
  async delete (uuid: string): Promise<void> {
    await this.client.delete(`${this.path}/${uuid}`)
  }
}
