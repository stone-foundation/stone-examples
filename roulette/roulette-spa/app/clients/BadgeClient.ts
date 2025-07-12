import { Badge } from '../models/Badge'
import { AxiosClient } from './AxiosClient'
import { IBlueprint, Stone } from '@stone-js/core'
import { ListMetadataOptions } from '../models/App'

/**
 * Badge Client Options
 */
export interface BadgeClientOptions {
  blueprint: IBlueprint
  httpClient: AxiosClient
}

/**
 * Badge Client
 */
@Stone({ alias: 'badgeClient' })
export class BadgeClient {
  private readonly path: string
  private readonly client: AxiosClient

  constructor ({ blueprint, httpClient }: BadgeClientOptions) {
    this.client = httpClient
    this.path = blueprint.get('app.clients.badge.path', '/badges')
  }

  /**
   * List all badges
   */
  async list (limit: number = 10, page?: string): Promise<ListMetadataOptions<Badge>> {
    const query = new URLSearchParams({ limit: String(limit), ...(page ? { page } : {}) })
    return await this.client.get<ListMetadataOptions<Badge>>(`${this.path}/?${query.toString()}`)
  }

  /**
   * Get a badge by uuid
   */
  async get (uuid: string): Promise<Badge> {
    return await this.client.get<Badge>(`${this.path}/${uuid}`)
  }

  /**
   * Create a new badge
   */
  async create (data: Partial<Badge>): Promise<{ uuid?: string }> {
    return await this.client.post<{ uuid?: string }>(`${this.path}`, data)
  }

  /**
   * Update a badge
   */
  async update (uuid: string, data: Partial<Badge>): Promise<Badge> {
    return await this.client.patch<Badge>(`${this.path}/${uuid}`, data)
  }

  /**
   * Delete a badge
   */
  async delete (uuid: string): Promise<void> {
    await this.client.delete(`${this.path}/${uuid}`)
  }
}
