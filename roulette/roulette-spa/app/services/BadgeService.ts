import { Service } from '@stone-js/core'
import { Badge } from '../models/Badge'
import { ListMetadataOptions } from '../models/App'
import { BadgeClient } from '../clients/BadgeClient'

/**
 * Badge Service Options
 */
export interface BadgeServiceOptions {
  badgeClient: BadgeClient
}

/**
 * Badge Service
 */
@Service({ alias: 'badgeService' })
export class BadgeService {
  private readonly client: BadgeClient

  /**
   * Create a new Badge Service
   */
  constructor ({ badgeClient }: BadgeServiceOptions) {
    this.client = badgeClient
  }

  /**
   * List all badges
   */
  async list (limit?: number, page?: string): Promise<ListMetadataOptions<Badge>> {
    return await this.client.list(limit, page)
  }

  /**
   * Get a badge by UUID
   */
  async get (uuid: string): Promise<Badge> {
    return await this.client.get(uuid)
  }

  /**
   * Create a new badge
   */
  async create (data: Partial<Badge>): Promise<{ uuid?: string }> {
    return await this.client.create(data)
  }

  /**
   * Update a badge
   */
  async update (uuid: string, data: Partial<Badge>): Promise<Badge> {
    return await this.client.update(uuid, data)
  }

  /**
   * Delete a badge
   */
  async delete (uuid: string): Promise<void> {
    return await this.client.delete(uuid)
  }
}
