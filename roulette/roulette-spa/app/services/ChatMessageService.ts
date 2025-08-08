import { MediaService } from './MediaService'
import { ChatMessage } from '../models/Chatbot'
import { ListMetadataOptions } from '../models/App'
import { isNotEmpty, Service } from '@stone-js/core'
import { ChatMessageClient } from '../clients/ChatMessageClient'

/**
 * Chat Message Service Options
 */
export interface ChatMessageServiceOptions {
  mediaService: MediaService
  chatMessageClient: ChatMessageClient
}

/**
 * Chat Message Service
 */
@Service({ alias: 'chatMessageService' })
export class ChatMessageService {
  private readonly client: ChatMessageClient
  private readonly mediaService: MediaService
  
  /**
   * Create a new Chat Message Service
   */
  constructor ({ chatMessageClient, mediaService }: ChatMessageServiceOptions) {
    this.client = chatMessageClient
    this.mediaService = mediaService
  }

  /**
   * List all chats
   */
  async list (limit?: number, page?: string): Promise<ListMetadataOptions<ChatMessage>> {
    return await this.client.list(limit, page)
  }

  /**
   * Create a new chat
   */
  async create (data: Partial<ChatMessage>, file?: File): Promise<{ uuid?: string }> {
    const audioUrl = await this.uploadFile('chat-user-audios', file)
    return await this.client.create({ ...data, audioUrl })
  }

  /**
   * Delete all chats
   */
  async deleteAll (): Promise<void> {
    return await this.client.deleteAll()
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
