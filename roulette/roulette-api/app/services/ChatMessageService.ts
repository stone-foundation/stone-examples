import { User } from '../models/User'
import { randomUUID } from 'node:crypto'
import { MediaService } from './MediaService'
import { NotFoundError } from '@stone-js/http-core'
import { ListMetadataOptions } from '../models/App'
import { IContainer, isNotEmpty, Service } from '@stone-js/core'
import { ChatMessage, ChatMessageModel } from '../models/Chatbot'
import { IChatMessageRepository } from '../repositories/contracts/IChatMessageRepository'

/**
 * ChatMessage Service Options
 */
export interface ChatMessageServiceOptions {
  mediaService: MediaService
  chatMessageRepository: IChatMessageRepository
}

/**
 * ChatMessage Service
 */
@Service({ alias: 'chatMessageService' })
export class ChatMessageService {
  private readonly mediaService: MediaService
  private readonly chatMessageRepository: IChatMessageRepository

  /**
   * Resolve route binding
   *
   * @param key - The key of the binding
   * @param value - The value of the binding
   * @param container - The container
   */
  static async resolveRouteBinding (key: string, value: any, container: IContainer): Promise<ChatMessage | undefined> {
    const chatMessageService = container.resolve<ChatMessageService>('chatMessageService')
    return await chatMessageService.findBy({ [key]: value })
  }

  /**
   * Create a new ChatMessage Service
   */
  constructor ({ chatMessageRepository, mediaService }: ChatMessageServiceOptions) {
    this.mediaService = mediaService
    this.chatMessageRepository = chatMessageRepository
  }

  /**
   * List all chat messages
   */
  async list (limit: number = 10, page?: number | string): Promise<ListMetadataOptions<ChatMessage>> {
    const result = await this.chatMessageRepository.list(limit, page)
    const items = result.items.map(v => this.toChatMessage(v))
    return { ...result, items }
  }

  /**
   * List chat messages by conditions
   */
  async listBy (conditions: Partial<ChatMessageModel>, limit: number = 10, page?: number | string): Promise<ListMetadataOptions<ChatMessage>> {
    const result = await this.chatMessageRepository.listBy(conditions, limit, page)
    const items = result.items.map(v => this.toChatMessage(v))
    return { ...result, items }
  }

  /**
   * Find a chat message
   *
   * @param conditions - The conditions to find the chat message
   * @returns The found chat message
   */
  async findBy (conditions: Record<string, any>): Promise<ChatMessage> {
    const chatMessageModel = await this.chatMessageRepository.findBy(conditions)
    if (isNotEmpty<ChatMessageModel>(chatMessageModel)) return this.toChatMessage(chatMessageModel)
    throw new NotFoundError(`The chat message with conditions ${JSON.stringify(conditions)} not found`)
  }

  /**
   * Find a chat message by uuid
   *
   * @param uuid - The uuid of the chat message to find
   * @returns The found chat message or undefined if not found
   */
  async findByUuid (uuid: string): Promise<ChatMessage | undefined> {
    const chatMessageModel = await this.chatMessageRepository.findByUuid(uuid)
    if (isNotEmpty<ChatMessageModel>(chatMessageModel)) return this.toChatMessage(chatMessageModel)
  }

  /**
   * Create a chat message
   *
   * @param chatMessage - The chat message to create
   * @param author - The user who is creating the chat message (optional for system messages)
   * @returns The uuid of the created chat message
   */
  async create (chatMessage: ChatMessage, author: User): Promise<string | undefined> {
    return await this.chatMessageRepository.create({
      ...chatMessage,
      uuid: randomUUID(),
      createdAt: Date.now(),
      authorUuid: chatMessage.authorUuid ?? author.uuid
    }, author)
  }

  /**
   * Update a chat message
   *
   * @param chatMessage - The chat message to update
   * @param data - The data to update in the chat message
   * @param author - The user who is updating the chat message
   * @returns The updated chat message
   */
  async update (chatMessage: ChatMessage, data: Partial<ChatMessage>, author: User): Promise<ChatMessage> {
    const chatMessageModel = await this.chatMessageRepository.update(chatMessage, data, author)
    if (isNotEmpty<ChatMessageModel>(chatMessageModel)) return this.toChatMessage(chatMessageModel)
    throw new NotFoundError(`Chat message with ID ${chatMessage.uuid} not found`)
  }

  /**
   * Delete a chat message
   *
   * @param chatMessage - The chat message to delete
   * @returns True if the chat message was deleted, false otherwise
   */
  async delete (chatMessage: ChatMessage, author: User): Promise<boolean> {
    await this.mediaService.deleteS3Object(chatMessage.audioUrl)
    return await this.chatMessageRepository.delete(chatMessage, author)
  }

  /**
   * Get total chat message count
   *
   * @returns The total count of chat messages
   */
  async count (): Promise<number> {
    return await this.chatMessageRepository.count()
  }

  /**
   * Get all memories from chat messages
   *
   * @returns An array of memories from chat messages
   */
  async getAssistantMemories (): Promise<string[]> {
    const messages = await this.chatMessageRepository.listBy({ role: 'assistant' }, 1000)
    return messages.items.map(m => m.memory).filter(c => isNotEmpty<string>(c))
  }

  /**
   * Convert ChatMessageModel to ChatMessage
   *
   * @param chatMessageModel - The chat message model to convert
   * @returns The converted chat message
   */
  toChatMessage (chatMessageModel: ChatMessageModel): ChatMessage {
    return { 
      ...chatMessageModel
    }
  }
}