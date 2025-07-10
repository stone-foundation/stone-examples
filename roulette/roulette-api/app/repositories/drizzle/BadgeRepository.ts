import { and, eq } from 'drizzle-orm'
import { IBlueprint, isEmpty } from '@stone-js/core'
import { badges } from '../../database/schema'
import { BadgeModel } from '../../models/Badge'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { ListMetadataOptions } from '../../models/App'
import { IBadgeRepository } from '../contracts/IBadgeRepository'
import { IMetadataRepository } from '../contracts/IMetadataRepository'

/**
 * Badge Repository Options
 */
export interface BadgeRepositoryOptions {
  blueprint: IBlueprint
  database: LibSQLDatabase
  metadataRepository: IMetadataRepository
}

/**
 * Badge Repository (Drizzle)
 */
export class BadgeRepository implements IBadgeRepository {
  private readonly tableName: string
  private readonly database: LibSQLDatabase
  private readonly metadataRepository: IMetadataRepository

  constructor ({ blueprint, database, metadataRepository }: BadgeRepositoryOptions) {
    this.database = database
    this.metadataRepository = metadataRepository
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

    if (conditions.authorUuid) {
      whereClauses.push(eq(badges.authorUuid, conditions.authorUuid))
    }

    if (conditions.category) {
      whereClauses.push(eq(badges.category, conditions.category))
    }

    if (conditions.visibility) {
      whereClauses.push(eq(badges.visibility, conditions.visibility))
    }

    if (conditions.name) {
      whereClauses.push(eq(badges.name, conditions.name))
    }

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

    if (conditions.uuid) {
      whereClauses.push(eq(badges.uuid, conditions.uuid))
    }

    if (conditions.name) {
      whereClauses.push(eq(badges.name, conditions.name))
    }

    if (conditions.category) {
      whereClauses.push(eq(badges.category, conditions.category))
    }

    if (whereClauses.length === 0) return undefined

    const result = await this.database
      .select()
      .from(badges)
      .where(and(...whereClauses))
      .get()

    return result ?? undefined
  }

  async create (badge: BadgeModel): Promise<string | undefined> {
    await this.database.insert(badges).values(badge)
    await this.metadataRepository.increment(this.tableName, { lastUuid: badge.uuid })
    return badge.uuid
  }

  async update ({ uuid }: BadgeModel, data: Partial<BadgeModel>): Promise<BadgeModel | undefined> {
    const result = await this.database
      .update(badges)
      .set(data)
      .where(eq(badges.uuid, uuid))
      .returning()
      .get()

    return result ?? undefined
  }

  async delete ({ uuid }: BadgeModel): Promise<boolean> {
    const result = await this.database
      .delete(badges)
      .where(eq(badges.uuid, uuid))
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
