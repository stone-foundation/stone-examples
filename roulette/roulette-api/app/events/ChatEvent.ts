import { Event } from '@stone-js/core'
import { ChatMessageModel } from '../models/Chatbot'

/**
 * Chat Event
 */
export class ChatEvent extends Event {
  /**
   * MESSAGE_PUBLISH Event name, fired when a chat message is published.
   * 
   * @event ChatEvent#MESSAGE_PUBLISH
   */
  static readonly MESSAGE_PUBLISH: string = 'chat.message.publish'

  /**
   * Create a new ChatEvent
   *
   * @param message - The chat message that was sent
   */
  constructor(type: string, public readonly message: Partial<ChatMessageModel>) {
    super({ type })
  }
}
