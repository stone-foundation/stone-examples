import { Mission } from '../models/Mission'
import { MediaService } from './MediaService'
import { ListMetadataOptions } from '../models/App'
import { isNotEmpty, Service } from '@stone-js/core'
import { MissionClient } from '../clients/MissionClient'

/**
 * Mission Service Options
 */
export interface MissionServiceOptions {
  mediaService: MediaService
  missionClient: MissionClient
}

/**
 * Mission Service
 */
@Service({ alias: 'missionService' })
export class MissionService {
  private readonly client: MissionClient
  private readonly mediaService: MediaService
  
  /**
   * Create a new Mission Service
   */
  constructor ({ missionClient, mediaService }: MissionServiceOptions) {
    this.client = missionClient
    this.mediaService = mediaService
  }

  /**
   * List all missions
   */
  async list (limit?: number, page?: string): Promise<ListMetadataOptions<Mission>> {
    return await this.client.list(limit, page)
  }

  /**
   * Get a mission by UUID
   */
  async get (uuid: string): Promise<Mission> {
    return await this.client.get(uuid)
  }

  /**
   * Create a new mission
   */
  async create (data: Partial<Mission>, file?: File): Promise<{ uuid?: string }> {
    const imageUrl = await this.uploadFile('missions', file)
    return await this.client.create({ ...data, imageUrl })
  }

  /**
   * Update a mission
   */
  async update (uuid: string, data: Partial<Mission>, file?: File): Promise<Mission> {
    const imageUrl = await this.uploadFile('missions', file)
    return await this.client.update(uuid, { ...data, imageUrl })
  }

  /**
   * Delete a mission
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
