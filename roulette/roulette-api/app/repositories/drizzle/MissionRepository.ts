import { and, eq } from 'drizzle-orm'
import { User } from '../../models/User'
import { missions } from '../../database/schema'
import { MissionModel } from '../../models/Mission'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { IBlueprint, isEmpty } from '@stone-js/core'
import { ListMetadataOptions } from '../../models/App'
import { IMissionRepository } from '../contracts/IMissionRepository'
import { IMetadataRepository } from '../contracts/IMetadataRepository'
import { IUserHistoryRepository } from '../contracts/IUserHistoryRepository'

/**
 * Mission Repository Options
 */
export interface MissionRepositoryOptions {
  blueprint: IBlueprint
  database: LibSQLDatabase
  metadataRepository: IMetadataRepository
  userHistoryRepository: IUserHistoryRepository
}

/**
 * Mission Repository (Drizzle)
 */
export class MissionRepository implements IMissionRepository {
  private readonly tableName: string
  private readonly database: LibSQLDatabase
  private readonly metadataRepository: IMetadataRepository
  private readonly userHistoryRepository: IUserHistoryRepository

  constructor ({ blueprint, database, metadataRepository, userHistoryRepository }: MissionRepositoryOptions) {
    this.database = database
    this.metadataRepository = metadataRepository
    this.userHistoryRepository = userHistoryRepository
    this.tableName = blueprint.get('drizzle.tables.missions.name', 'missions')
  }

  async list (limit?: number, page?: number | string): Promise<ListMetadataOptions<MissionModel>> {
    page = isEmpty(page) ? 1 : Number(page)
    limit = isEmpty(limit) ? 10 : Number(limit)
    const offset = ((page ?? 1) - 1) * limit

    const items = await this.database
      .select()
      .from(missions)
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

  async listBy (conditions: Partial<MissionModel>, limit?: number, page?: number | string): Promise<ListMetadataOptions<MissionModel>> {
    limit ??= 10
    const whereClauses = []

    if (conditions.name) whereClauses.push(eq(missions.name, conditions.name))
    if (conditions.visibility) whereClauses.push(eq(missions.visibility, conditions.visibility))

    const offset = (Number(page) - 1) * limit

    const query = this.database
      .select()
      .from(missions)
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

  async findByUuid (uuid: string): Promise<MissionModel | undefined> {
    const result = await this.database
      .select()
      .from(missions)
      .where(eq(missions.uuid, uuid))
      .get()

    return result ?? undefined
  }

  async findBy (conditions: Partial<MissionModel>): Promise<MissionModel | undefined> {
    const whereClauses = []

    if (conditions.uuid) whereClauses.push(eq(missions.uuid, conditions.uuid))
    if (conditions.name) whereClauses.push(eq(missions.name, conditions.name))
    if (conditions.visibility) whereClauses.push(eq(missions.visibility, conditions.visibility))

    if (whereClauses.length === 0) return undefined

    const result = await this.database
      .select()
      .from(missions)
      .where(and(...whereClauses))
      .get()

    return result ?? undefined
  }

  async create (mission: MissionModel, author: User): Promise<string | undefined> {
    await this.database.insert(missions).values(mission)
    await this.metadataRepository.increment(this.tableName, { lastUuid: mission.uuid })
    await this.userHistoryRepository.makeHistoryEntry({
      type: 'mission',
      action: 'created',
      itemUuid: mission.uuid,
    }, author)
    return mission.uuid
  }

  async update ({ uuid }: MissionModel, data: Partial<MissionModel>, author: User): Promise<MissionModel | undefined> {
    const result = await this.database
      .update(missions)
      .set(data)
      .where(eq(missions.uuid, uuid))
      .returning()
      .get()

    await this.userHistoryRepository.makeHistoryEntry({
      itemUuid: uuid,
      type: 'mission',
      action: 'updated'
    }, author)

    return result ?? undefined
  }

  async delete ({ uuid }: MissionModel, author: User): Promise<boolean> {
    const result = await this.database
      .delete(missions)
      .where(eq(missions.uuid, uuid))
      .run()

    if (result.rowsAffected > 0) {
      await this.metadataRepository.decrement(this.tableName)
      await this.userHistoryRepository.makeHistoryEntry({
        itemUuid: uuid,
        type: 'mission',
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
