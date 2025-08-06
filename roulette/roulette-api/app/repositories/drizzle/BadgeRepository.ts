import { and, eq } from 'drizzle-orm'
import { User } from '../../models/User'
import { badges } from '../../database/schema'
import { BadgeModel } from '../../models/Badge'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { IBlueprint, isEmpty } from '@stone-js/core'
import { ListMetadataOptions } from '../../models/App'
import { IBadgeRepository } from '../contracts/IBadgeRepository'
import { IMetadataRepository } from '../contracts/IMetadataRepository'
import { IUserHistoryRepository } from '../contracts/IUserHistoryRepository'

/**
 * Badge Repository Options
 */
export interface BadgeRepositoryOptions {
  blueprint: IBlueprint
  database: LibSQLDatabase
  metadataRepository: IMetadataRepository
  userHistoryRepository: IUserHistoryRepository
}

/**
 * Badge Repository (Drizzle)
 */
export class BadgeRepository implements IBadgeRepository {
  private readonly tableName: string
  private readonly database: LibSQLDatabase
  private readonly metadataRepository: IMetadataRepository
  private readonly userHistoryRepository: IUserHistoryRepository

  constructor ({ blueprint, database, metadataRepository, userHistoryRepository }: BadgeRepositoryOptions) {
    this.database = database
    this.metadataRepository = metadataRepository
    this.userHistoryRepository = userHistoryRepository
    this.tableName = blueprint.get('drizzle.tables.badges.name', 'badges')
  }

  async list (limit?: number, page?: number | string): Promise<ListMetadataOptions<BadgeModel>> {
    page = isEmpty(page) ? 1 : Number(page)
    limit = isEmpty(limit) ? 10 : Number(limit)
    const offset = ((page ?? 1) - 1) * limit

    const items = await this.database
      .select()
      .from(badges)
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

  async listBy (conditions: Partial<BadgeModel>, limit?: number, page?: number | string): Promise<ListMetadataOptions<BadgeModel>> {
    limit ??= 10
    const whereClauses = []

    if (conditions.name) whereClauses.push(eq(badges.name, conditions.name))
    if (conditions.category) whereClauses.push(eq(badges.category, conditions.category))
    if (conditions.visibility) whereClauses.push(eq(badges.visibility, conditions.visibility))
    if (conditions.missionUuid) whereClauses.push(eq(badges.missionUuid, conditions.missionUuid))

    const offset = (Number(page) - 1) * limit

    const query = this.database
      .select()
      .from(badges)
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

  async findByUuid (uuid: string): Promise<BadgeModel | undefined> {
    const result = await this.database
      .select()
      .from(badges)
      .where(eq(badges.uuid, uuid))
      .get()

    return result ?? undefined
  }

  async findBy (conditions: Partial<BadgeModel>): Promise<BadgeModel | undefined> {
    const whereClauses = []

    if (conditions.uuid) whereClauses.push(eq(badges.uuid, conditions.uuid))
    if (conditions.name) whereClauses.push(eq(badges.name, conditions.name))
    if (conditions.category) whereClauses.push(eq(badges.category, conditions.category))
    if (conditions.missionUuid) whereClauses.push(eq(badges.missionUuid, conditions.missionUuid))

    if (whereClauses.length === 0) return undefined

    const result = await this.database
      .select()
      .from(badges)
      .where(and(...whereClauses))
      .get()

    return result ?? undefined
  }

  async create (badge: BadgeModel, author: User): Promise<string | undefined> {
    await this.database.insert(badges).values(badge)
    await this.metadataRepository.increment(this.tableName, { lastUuid: badge.uuid })
    await this.userHistoryRepository.makeHistoryEntry({
      type: 'badge',
      action: 'created',
      itemUuid: badge.uuid,
    }, author)
    return badge.uuid
  }

  async update ({ uuid }: BadgeModel, data: Partial<BadgeModel>, author: User): Promise<BadgeModel | undefined> {
    const result = await this.database
      .update(badges)
      .set(data)
      .where(eq(badges.uuid, uuid))
      .returning()
      .get()
    await this.userHistoryRepository.makeHistoryEntry({
      type: 'badge',
      itemUuid: uuid,
      action: 'updated',
    }, author)

    return result ?? undefined
  }

  async delete ({ uuid }: BadgeModel, author: User): Promise<boolean> {
    const result = await this.database
      .delete(badges)
      .where(eq(badges.uuid, uuid))
      .run()

    if (result.rowsAffected > 0) {
      await this.metadataRepository.decrement(this.tableName)
      await this.userHistoryRepository.makeHistoryEntry({
        type: 'badge',
        itemUuid: uuid,
        action: 'deleted',
      }, author)
      return true
    }

    return false
  }

  async count (): Promise<number> {
    const meta = await this.metadataRepository.get(this.tableName)
    return meta?.total ?? 0
  }
}
