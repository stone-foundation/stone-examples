import { User } from '../../models/User'
import { ListMetadataOptions } from '../../models/App'
import { ChatMessageModel } from '../../models/Chatbot'

/**
 * ChatMessage Repository contract
 */
export interface IChatMessageRepository {
  /**
   * List all chat message models
   *
   * @param limit - Maximum number of chat messages to return
   * @returns List of chat message models
   */
  list: (limit?: number, page?: number | string) => Promise<ListMetadataOptions<ChatMessageModel>>

  /**
   * List chat message models by conditions
   *
   * @param conditions - Partial filter for chat message model fields
   * @param limit - Max number of results
   * @returns Filtered chat message models
   */
  listBy: (conditions: Partial<ChatMessageModel>, limit?: number, page?: number | string) => Promise<ListMetadataOptions<ChatMessageModel>>

  /**
   * Find a chat message model by its UUID
   *
   * @param uuid - ChatMessage UUID
   * @returns The chat message model or undefined
   */
  findByUuid: (uuid: string) => Promise<ChatMessageModel | undefined>

  /**
   * Find a chat message model by conditions
   *
   * @param conditions - Partial chat message model fields
   * @returns The chat message model or undefined
   */
  findBy: (conditions: Partial<ChatMessageModel>) => Promise<ChatMessageModel | undefined>

  /**
   * Create a chat message model
   *
   * @param chatMessage - ChatMessage model to create
   * @param author - User creating the chat message
   * @returns UUID of the created chat message
   */
  create: (chatMessage: ChatMessageModel, author: User) => Promise<string | undefined>

  /**
   * Update a chat message model
   *
   * @param chatMessage - Existing chat message model
   * @param data - Fields to update
   * @param author - User performing the update
   * @returns Updated chat message model or undefined
   */
  update: (chatMessage: ChatMessageModel, data: Partial<ChatMessageModel>, author: User) => Promise<ChatMessageModel | undefined>

  /**
   * Delete a chat message model
   *
   * @param chatMessage - ChatMessage model to delete
   * @param author - User performing the deletion
   * @returns True if deleted, false otherwise
   */
  delete: (chatMessage: ChatMessageModel, author: User) => Promise<boolean>

  /**
   * Get total chat message count (from meta, not scan)
   */
  count: () => Promise<number>
}