import { PostModel } from '../models/Post'
import { PostEvent } from '../events/PostEvent'
import { PostService } from '../services/PostService'
import { SecurityService } from '../services/SecurityService'
import { IBlueprint, IEventListener, isNotEmpty, Listener, Logger } from '@stone-js/core'

/**
 * PostEvent Listener Options
*/
export interface PostEventListenerOptions {
  blueprint: IBlueprint
  postService: PostService
  securityService: SecurityService
}

/**
 * PostEvent listener
 */
@Listener({ event: PostEvent.TIMELINE_PUBLISH })
export class PostEventListener implements IEventListener<PostEvent> {
  private readonly postService: PostService
  private readonly securityService: SecurityService

  /**
   * Create a new instance of UserEventSubscriber
   */
  constructor ({ postService, securityService }: PostEventListenerOptions) {
    this.postService = postService
    this.securityService = securityService
  }

  /**
   * Handle the PostEvent
   *
   * @param event - The event to handle
   */
  async handle (event: PostEvent): Promise<void> {
    const data = event.post
    if (isNotEmpty<PostModel>(data) && isNotEmpty(data.type) && isNotEmpty(data.visibility)) {
      await this.postService.create(data, this.securityService.getAuthUser())
    } else {
      Logger.warn('PostEvent received with invalid post data:', data)
    }
  }
}
