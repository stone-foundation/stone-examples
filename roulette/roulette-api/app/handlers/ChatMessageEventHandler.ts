import { User } from '../models/User'
import { ILogger } from '@stone-js/core'
import { ListMetadataOptions } from '../models/App'
import { ChatMessage, ChatMessageRole } from '../models/Chatbot'
import { EventHandler, Get, Post, Delete } from '@stone-js/router'
import { ChatMessageService } from '../services/ChatMessageService'
import { JsonHttpResponse, BadRequestError, IncomingHttpEvent } from '@stone-js/http-core'

/**
 * ChatMessage Event Handler Options
 */
export interface ChatMessageEventHandlerOptions {
  logger: ILogger
  chatMessageService: ChatMessageService
}

/**
 * ChatMessage Event Handler
 */
@EventHandler('/chat-messages', { name: 'chatMessages', middleware: ['admin'] })
export class ChatMessageEventHandler {
  private readonly logger: ILogger
  private readonly chatMessageService: ChatMessageService

  constructor ({ chatMessageService, logger }: ChatMessageEventHandlerOptions) {
    this.logger = logger
    this.chatMessageService = chatMessageService
  }

  /**
   * List all chat messages (admin only)
   */
  @Get('/', { name: 'list' })
  @JsonHttpResponse(200)
  async list (event: IncomingHttpEvent): Promise<ListMetadataOptions<ChatMessage>> {
    const role = event.get<ChatMessageRole>('role')
    return await this.chatMessageService.listBy({ role }, Number(event.get('limit', 20)), event.get('page'))
  }

  /**
   * Create a new chat message
   */
  @Post('/')
  @JsonHttpResponse(201)
  async create (event: IncomingHttpEvent): Promise<{ uuid?: string }> {
    const user = event.getUser<User>()
    const data = event.getBody<ChatMessage>()

    if (!data?.content) {
      throw new BadRequestError('Message content is required')
    }

    const uuid = await this.chatMessageService.create({ ...data, role: 'user' }, user)

    this.logger.info(`Chat message created: ${uuid}, role: user, by user: ${user.uuid}`)

    return { uuid }
  }

  /**
   * Delete all chat messages
   */
  @Delete('/')
  async deleteAll (event: IncomingHttpEvent): Promise<{ statusCode: number }> {
    const user = event.getUser<User>()
    const messages = await this.chatMessageService.list(Number(event.get('limit', 1000)))

    for (const message of messages.items) {
      await this.chatMessageService.delete(message, user)
    }

    this.logger.info(`Chat messages deleted, by user: ${user.uuid}`)

    return { statusCode: 204 }
  }
}
