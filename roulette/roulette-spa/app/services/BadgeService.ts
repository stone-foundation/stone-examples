import { Badge } from '../models/Badge'
import { MediaService } from './MediaService'
import { ListMetadataOptions } from '../models/App'
import { BadgeClient } from '../clients/BadgeClient'
import { isNotEmpty, Service } from '@stone-js/core'

/**
 * Badge Service Options
 */
export interface BadgeServiceOptions {
  badgeClient: BadgeClient
  mediaService: MediaService
}

/**
 * Badge Service
 */
@Service({ alias: 'badgeService' })
export class BadgeService {
  private readonly client: BadgeClient
  private readonly mediaService: MediaService

  /**
   * Create a new Badge Service
   */
  constructor ({ badgeClient, mediaService }: BadgeServiceOptions) {
    this.client = badgeClient
    this.mediaService = mediaService
  }

  /**
   * List all badges
   */
  async list (options: Partial<Badge> = {}, limit: number = 10, page?: string | number): Promise<ListMetadataOptions<Badge>> {
    return await this.client.list(options, limit, page)
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
  async create (data: Partial<Badge>, file?: File): Promise<{ uuid?: string }> {
    const iconUrl = await this.uploadFile('badges', file)
    return await this.client.create({ ...data, iconUrl })
  }

  /**
   * Update a badge
   */
  async update (uuid: string, data: Partial<Badge>, file?: File): Promise<Badge> {
    const iconUrl = await this.uploadFile('badges', file)
    return await this.client.update(uuid, { ...data, iconUrl })
  }

  /**
   * Delete a badge
   */
  async delete (uuid: string): Promise<void> {
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
