import { User } from '../models/User'
import { IBlueprint, isEmpty } from '@stone-js/core'
import { EventHandler, Post } from '@stone-js/router'
import { MediaService } from '../services/MediaService'
import { MediaUploadUrlsPayload, MediaUploadUrlsResponse } from '../models/Media'
import { JsonHttpResponse, IncomingHttpEvent, BadRequestError } from '@stone-js/http-core'

/**
 * Media Event Handler Options
 */
export interface MediaEventHandlerOptions {
  blueprint: IBlueprint
  mediaService: MediaService
}

/**
 * Media Event Handler
 */
@EventHandler('/medias', { name: 'medias', middleware: ['auth'] })
export class MediaEventHandler {
  private readonly blueprint: IBlueprint
  private readonly mediaService: MediaService

  constructor ({ blueprint, mediaService }: MediaEventHandlerOptions) {
    this.blueprint = blueprint
    this.mediaService = mediaService
  }
  
  /**
   * Generate signed URL for media upload
   */
  @Post('/signed-url')
  @JsonHttpResponse(200)
  async generateSignedUrl (event: IncomingHttpEvent): Promise<MediaUploadUrlsResponse> {
    const user = event.getUser<User>()
    const data = event.getBody<MediaUploadUrlsPayload>()

    if (isEmpty(user) || isEmpty(data) || isEmpty(data.extension) || isEmpty(data.type) || isEmpty(data.group)) {
      throw new BadRequestError('User or data is missing')
    }

    return await this.mediaService.generateSignedUrl(data, user)
  }
}
