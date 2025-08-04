import { Service } from '@stone-js/core'
import { MediaClient } from '../clients/MediaClient'

/**
 * Media Service Options
*/
export interface MediaServiceOptions {
  mediaClient: MediaClient
}

/**
 * Media Service
*/
@Service({ alias: 'mediaService' })
export class MediaService {
  private readonly client: MediaClient

  /**
   * Create a new Media Service
  */
  constructor ({ mediaClient }: MediaServiceOptions) {
    this.client = mediaClient
  }

  /**
   * Upload a file to S3 using the Media Client
   */
  async uploadFile (file: File, group: string): Promise<string> {
    const payload = {
      group: group,
      type: file.type,
      extension: file.name.split('.').pop() ?? ''
    }
    const { uploadUrl, publicUrl } = await this.client.generateUploadUrls(payload)
    
    await this.client.uploadFileToS3(uploadUrl, file)
    
    return publicUrl
  }
}
