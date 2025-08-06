import { Event } from '@stone-js/core'
import { PostModel } from '../models/Post'

/**
 * Post Event
 */
export class PostEvent extends Event {
  /**
   * TIMELINE_PUBLISH Event name, fired when a internal post is published to the timeline.
   * 
   * @event PostEvent#TIMELINE_PUBLISH
   */
  static readonly TIMELINE_PUBLISH: string = 'post.timeline.publish'

  /**
   * Create a new PostEvent
   *
   * @param post - The post that was made
   */
  constructor (type: string, public readonly post: Partial<PostModel>) {
    super({ type })
  }
}
