import { and, eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { IBlueprint, isEmpty } from '@stone-js/core'
import { userHistories } from '../../database/schema'
import { ListMetadataOptions } from '../../models/App'
import { User, UserHistoryModel } from '../../models/User'
import { IMetadataRepository } from '../contracts/IMetadataRepository'
import { IUserHistoryRepository } from '../contracts/IUserHistoryRepository'

/**
 * UserHistory Repository Options
 */
export interface UserHistoryRepositoryOptions {
  blueprint: IBlueprint
  database: LibSQLDatabase
  metadataRepository: IMetadataRepository
}

/**
 * UserHistory Repository (Drizzle)
 */
export class UserHistoryRepository implements IUserHistoryRepository {
  private readonly tableName: string
  private readonly database: LibSQLDatabase
  private readonly metadataRepository: IMetadataRepository

  constructor ({ blueprint, database, metadataRepository }: UserHistoryRepositoryOptions) {
    this.database = database
    this.metadataRepository = metadataRepository
    this.tableName = blueprint.get('drizzle.tables.userHistories.name', 'user_histories')
  }

  async list (limit?: number, page?: number | string): Promise<ListMetadataOptions<UserHistoryModel>> {
    page = isEmpty(page) ? 1 : Number(page)
    limit = isEmpty(limit) ? 10 : Number(limit)
    const offset = ((page ?? 1) - 1) * limit

    const items = await this.database
      .select()
      .from(userHistories)
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

  async listBy (conditions: Partial<UserHistoryModel>, limit?: number, page?: number | string): Promise<ListMetadataOptions<UserHistoryModel>> {
    limit ??= 10
    const whereClauses = []

    if (conditions.type) whereClauses.push(eq(userHistories.type, conditions.type))
    if (conditions.action) whereClauses.push(eq(userHistories.action, conditions.action))
    if (conditions.createdAt) whereClauses.push(eq(userHistories.createdAt, conditions.createdAt))
    if (conditions.authorUuid) whereClauses.push(eq(userHistories.authorUuid, conditions.authorUuid))

    const offset = (Number(page) - 1) * limit

    const query = this.database
      .select()
      .from(userHistories)
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

  async findById (id: number): Promise<UserHistoryModel | undefined> {
    const result = await this.database
      .select()
      .from(userHistories)
      .where(eq(userHistories.id, id))
      .get()

    return result ?? undefined
  }

  async findBy (conditions: Partial<UserHistoryModel>): Promise<UserHistoryModel | undefined> {
    const whereClauses = []

    if (conditions.uuid) whereClauses.push(eq(userHistories.uuid, conditions.uuid))
    if (conditions.type) whereClauses.push(eq(userHistories.type, conditions.type))
    if (conditions.action) whereClauses.push(eq(userHistories.action, conditions.action))

    if (whereClauses.length === 0) return undefined

    const result = await this.database
      .select()
      .from(userHistories)
      .where(and(...whereClauses))
      .get()

    return result ?? undefined
  }

  async create (userHistory: UserHistoryModel, author: User): Promise<string | undefined> {
    await this.database.insert(userHistories).values({ ...userHistory, authorUuid: author.uuid })
    await this.metadataRepository.increment(this.tableName, { lastUuid: userHistory.uuid })

    return userHistory.uuid
  }

  async delete ({ uuid }: UserHistoryModel): Promise<boolean> {
    const result = await this.database
      .delete(userHistories)
      .where(eq(userHistories.uuid, uuid))
      .run()

    if (result.rowsAffected > 0) {
      await this.metadataRepository.decrement(this.tableName)
      return true
    }

    return false
  }

  async makeHistoryEntry (userHistory: Partial<UserHistoryModel>, author: User): Promise<string | undefined> {
    return await this.create({
      id: 0,
      itemUuid: '',
      type: 'user',
      authorUuid: '',
      action: 'created',
      ...userHistory,
      uuid: randomUUID(),
      createdAt: Date.now(),
    }, author)
  }

  async count (): Promise<number> {
    const meta = await this.metadataRepository.get(this.tableName)
    return meta?.total ?? 0
  }
}