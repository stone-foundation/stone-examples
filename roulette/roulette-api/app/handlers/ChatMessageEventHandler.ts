import { User } from '../models/User'
import { ILogger, isEmpty } from '@stone-js/core'
import { ListMetadataOptions } from '../models/App'
import { OpenAIService } from '../services/OpenAIService'
import { ChatMessage, ChatMessageRole } from '../models/Chatbot'
import { EventHandler, Get, Post, Delete } from '@stone-js/router'
import { ChatMessageService } from '../services/ChatMessageService'
import { JsonHttpResponse, BadRequestError, IncomingHttpEvent, NoContentHttpResponse } from '@stone-js/http-core'

/**
 * ChatMessage Event Handler Options
 */
export interface ChatMessageEventHandlerOptions {
  logger: ILogger
  openAIService: OpenAIService
  chatMessageService: ChatMessageService
}

/**
 * ChatMessage Event Handler
 */
@EventHandler('/chat-messages', { name: 'chatMessages', middleware: ['admin'] })
export class ChatMessageEventHandler {
  private readonly logger: ILogger
  private readonly openAIService: OpenAIService
  private readonly chatMessageService: ChatMessageService

  constructor ({ chatMessageService, logger, openAIService }: ChatMessageEventHandlerOptions) {
    this.logger = logger
    this.openAIService = openAIService
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
  @NoContentHttpResponse()
  async create (event: IncomingHttpEvent): Promise<void> {
    const user = event.getUser<User>()
    const data = event.getBody<ChatMessage>({} as ChatMessage)
    const memories = await this.chatMessageService.getAssistantMemories()
    data.content = isEmpty(data?.audioUrl) ? data?.content : await this.openAIService.transcribeRemoteAudio(data.audioUrl)

    if (!data?.content) {
      throw new BadRequestError('Message content is required')
    }

    const aiData = await this.openAIService.answerToUserRequest(data.content, memories)
    const userUuid = await this.chatMessageService.create({ ...data, role: 'user' }, user)
    const aiUuid = await this.chatMessageService.create(aiData, user)

    this.logger.info(`Chat message created: User uuid: ${userUuid}, AI uuid: ${aiUuid}, role: user, by user: ${user.uuid}`)
  }

  /**
   * Delete all chat messages
   */
  @Delete('/')
  @NoContentHttpResponse()
  async deleteAll (event: IncomingHttpEvent): Promise<void> {
    const user = event.getUser<User>()
    const messages = await this.chatMessageService.list(Number(event.get('limit', 1000)))

    for (const message of messages.items) {
      await this.chatMessageService.delete(message, user)
    }

    this.logger.info(`Chat messages deleted, by user: ${user.uuid}`)
  }
}
