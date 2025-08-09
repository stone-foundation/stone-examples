import { and, eq } from 'drizzle-orm'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { IBlueprint, isEmpty } from '@stone-js/core'
import { chatMessages } from '../../database/schema'
import { ListMetadataOptions } from '../../models/App'
import { ChatMessageModel } from '../../models/Chatbot'
import { IMetadataRepository } from '../contracts/IMetadataRepository'
import { IChatMessageRepository } from '../contracts/IChatMessageRepository'

/**
 * ChatMessage Repository Options
 */
export interface ChatMessageRepositoryOptions {
  blueprint: IBlueprint
  database: LibSQLDatabase
  metadataRepository: IMetadataRepository
}

/**
 * ChatMessage Repository (Drizzle)
 */
export class ChatMessageRepository implements IChatMessageRepository {
  private readonly tableName: string
  private readonly database: LibSQLDatabase
  private readonly metadataRepository: IMetadataRepository

  constructor ({ blueprint, database, metadataRepository }: ChatMessageRepositoryOptions) {
    this.database = database
    this.metadataRepository = metadataRepository
    this.tableName = blueprint.get('drizzle.tables.chatMessages.name', 'chat_messages')
  }

  async list (limit?: number, page?: number | string): Promise<ListMetadataOptions<ChatMessageModel>> {
    page = isEmpty(page) ? 1 : Number(page)
    limit = isEmpty(limit) ? 10 : Number(limit)
    const offset = ((page ?? 1) - 1) * limit

    const items = await this.database
      .select()
      .from(chatMessages)
      .limit(limit)
      .offset(offset)

    const total = await this.count()
    const nextPage = items.length === limit ? (page ?? 1) + 1 : undefined

    return {
      page,
      limit,
      total,
      items,
      nextPage
    }
  }

  async listBy (conditions: Partial<ChatMessageModel>, limit?: number, page?: number | string): Promise<ListMetadataOptions<ChatMessageModel>> {
    limit ??= 10
    const whereClauses = []

    if (conditions.role) whereClauses.push(eq(chatMessages.role, conditions.role))
    if (conditions.authorUuid) whereClauses.push(eq(chatMessages.authorUuid, conditions.authorUuid))

    const offset = (Number(page) - 1) * limit

    const query = this.database
      .select()
      .from(chatMessages)
      .limit(limit)
      .offset(offset)

    if (whereClauses.length > 0) {
      query.where(and(...whereClauses))
    }

    const items = await query
    const total = await this.count()
    const nextPage = items.length === limit ? Number(page) + 1 : undefined

    return {
      page,
      limit,
      total,
      items,
      nextPage
    }
  }

  async findByUuid (uuid: string): Promise<ChatMessageModel | undefined> {
    const result = await this.database
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.uuid, uuid))
      .get()

    return result ?? undefined
  }

  async findBy (conditions: Partial<ChatMessageModel>): Promise<ChatMessageModel | undefined> {
    const whereClauses = []

    if (conditions.uuid) whereClauses.push(eq(chatMessages.uuid, conditions.uuid))
    if (conditions.role) whereClauses.push(eq(chatMessages.role, conditions.role))
    if (conditions.authorUuid) whereClauses.push(eq(chatMessages.authorUuid, conditions.authorUuid))

    if (whereClauses.length === 0) return undefined

    const result = await this.database
      .select()
      .from(chatMessages)
      .where(and(...whereClauses))
      .get()

    return result ?? undefined
  }

  async create (chatMessage: ChatMessageModel): Promise<string | undefined> {
    await this.database.insert(chatMessages).values(chatMessage)
    await this.metadataRepository.increment(this.tableName, { lastUuid: chatMessage.uuid })
    return chatMessage.uuid
  }

  async update ({ uuid }: ChatMessageModel, data: Partial<ChatMessageModel>): Promise<ChatMessageModel | undefined> {
    const result = await this.database
      .update(chatMessages)
      .set(data)
      .where(eq(chatMessages.uuid, uuid))
      .returning()
      .get()

    return result ?? undefined
  }

  async delete ({ uuid }: ChatMessageModel): Promise<boolean> {
    const result = await this.database
      .delete(chatMessages)
      .where(eq(chatMessages.uuid, uuid))
      .run()

    if (result.rowsAffected > 0) {
      await this.metadataRepository.decrement(this.tableName)
      return true
    }

    return false
  }

  async count (): Promise<number> {
    const meta = await this.metadataRepository.get(this.tableName)
    return meta?.total ?? 0
  }
}