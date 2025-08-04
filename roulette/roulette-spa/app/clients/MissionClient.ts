import { Mission } from '../models/Mission'
import { AxiosClient } from './AxiosClient'
import { IBlueprint, Stone } from '@stone-js/core'
import { ListMetadataOptions } from '../models/App'

/**
 * Mission Client Options
 */
export interface MissionClientOptions {
  blueprint: IBlueprint
  httpClient: AxiosClient
}

/**
 * Mission Client
 */
@Stone({ alias: 'missionClient' })
export class MissionClient {
  private readonly path: string
  private readonly client: AxiosClient

  constructor ({ blueprint, httpClient }: MissionClientOptions) {
    this.client = httpClient
    this.path = blueprint.get('app.clients.mission.path', '/missions')
  }

  /**
   * List all missions
   */
  async list (limit: number = 10, page?: string): Promise<ListMetadataOptions<Mission>> {
    const query = new URLSearchParams({ limit: String(limit), ...(page ? { page } : {}) })
    return await this.client.get<ListMetadataOptions<Mission>>(`${this.path}/?${query.toString()}`)
  }

  /**
   * Get a mission by uuid
   */
  async get (uuid: string): Promise<Mission> {
    return await this.client.get<Mission>(`${this.path}/${uuid}`)
  }

  /**
   * Create a new mission
   */
  async create (data: Partial<Mission>): Promise<{ uuid?: string }> {
    return await this.client.post<{ uuid?: string }>(`${this.path}`, data)
  }

  /**
   * Update a mission
   */
  async update (uuid: string, data: Partial<Mission>): Promise<Mission> {
    return await this.client.patch<Mission>(`${this.path}/${uuid}`, data)
  }

  /**
   * Delete a mission
   */
  async delete (uuid: string): Promise<void> {
    await this.client.delete(`${this.path}/${uuid}`)
  }
}
