import { AxiosClient } from './AxiosClient'
import { ChatMessage } from '../models/Chatbot'
import { IBlueprint, Stone } from '@stone-js/core'
import { ListMetadataOptions } from '../models/App'

/**
 * Chat Client Options
 */
export interface ChatClientOptions {
  blueprint: IBlueprint
  httpClient: AxiosClient
}

/**
 * Chat Client
 */
@Stone({ alias: 'chatClient' })
export class ChatClient {
  private readonly path: string
  private readonly client: AxiosClient

  constructor ({ blueprint, httpClient }: ChatClientOptions) {
    this.client = httpClient
    this.path = blueprint.get('app.clients.chat.path', '/chats')
  }

  /**
   * List all chats
   */
  async list (limit: number = 10, page?: string): Promise<ListMetadataOptions<ChatMessage>> {
    const query = new URLSearchParams({ limit: String(limit), ...(page ? { page } : {}) })
    return await this.client.get<ListMetadataOptions<ChatMessage>>(`${this.path}/?${query.toString()}`)
  }

  /**
   * Create a new chat
   */
  async create (data: Partial<ChatMessage>): Promise<{ uuid?: string }> {
    return await this.client.post<{ uuid?: string }>(`${this.path}`, data)
  }

  /**
   * Delete all chats
   */
  async deleteAll (): Promise<void> {
    await this.client.delete(`${this.path}/all`)
  }
}
