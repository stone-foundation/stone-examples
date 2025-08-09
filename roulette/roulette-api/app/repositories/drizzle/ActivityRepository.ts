import { and, eq } from 'drizzle-orm'
import { User } from '../../models/User'
import { activities } from '../../database/schema'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { IBlueprint, isEmpty } from '@stone-js/core'
import { ActivityModel } from '../../models/Activity'
import { ListMetadataOptions } from '../../models/App'
import { IActivityRepository } from '../contracts/IActivityRepository'
import { IMetadataRepository } from '../contracts/IMetadataRepository'
import { IUserHistoryRepository } from '../contracts/IUserHistoryRepository'

export interface RepositoryOptions {
  blueprint: IBlueprint
  database: LibSQLDatabase
  metadataRepository: IMetadataRepository
  userHistoryRepository: IUserHistoryRepository
}

export class ActivityRepository implements IActivityRepository {
  private readonly tableName: string
  private readonly database: LibSQLDatabase
  private readonly metadataRepository: IMetadataRepository
  private readonly userHistoryRepository: IUserHistoryRepository

  constructor ({ blueprint, database, metadataRepository, userHistoryRepository }: RepositoryOptions) {
    this.database = database
    this.metadataRepository = metadataRepository
    this.userHistoryRepository = userHistoryRepository
    this.tableName = blueprint.get('drizzle.tables.activities.name', 'activities')
  }

  async list (limit?: number, page?: number | string): Promise<ListMetadataOptions<ActivityModel>> {
    page = isEmpty(page) ? 1 : Number(page)
    limit = isEmpty(limit) ? 10 : Number(limit)
    const offset = (page - 1) * limit

    const items = await this.database.select().from(activities).limit(limit).offset(offset)
    const total = await this.count()
    const nextPage = items.length === limit ? page + 1 : undefined

    return { page, limit, total, items, nextPage }
  }

  async listBy (conditions: Partial<ActivityModel>, limit?: number, page?: number | string): Promise<ListMetadataOptions<ActivityModel>> {
    const whereClauses = []

    if (conditions.impact) whereClauses.push(eq(activities.impact, conditions.impact))
    if (conditions.category) whereClauses.push(eq(activities.category, conditions.category))
    if (conditions.badgeUuid) whereClauses.push(eq(activities.badgeUuid, conditions.badgeUuid))
    if (conditions.missionUuid) whereClauses.push(eq(activities.missionUuid, conditions.missionUuid))

    limit ??= 10
    page = isEmpty(page) ? 1 : Number(page)
    const offset = (page - 1) * limit

    const query = this.database.select().from(activities).limit(limit).offset(offset)
    if (whereClauses.length > 0) query.where(and(...whereClauses))

    const items = await query
    const total = await this.count()
    const nextPage = items.length === limit ? page + 1 : undefined

    return { page, limit, total, items, nextPage }
  }

  async findByUuid (uuid: string): Promise<ActivityModel | undefined> {
    return await this.database.select().from(activities).where(eq(activities.uuid, uuid)).get()
  }

  async findBy (conditions: Partial<ActivityModel>): Promise<ActivityModel | undefined> {
    const whereClauses = []
    if (conditions.uuid) whereClauses.push(eq(activities.uuid, conditions.uuid))
    if (conditions.name) whereClauses.push(eq(activities.name, conditions.name))
    if (conditions.category) whereClauses.push(eq(activities.category, conditions.category))
    if (conditions.badgeUuid) whereClauses.push(eq(activities.badgeUuid, conditions.badgeUuid))
    if (conditions.missionUuid) whereClauses.push(eq(activities.missionUuid, conditions.missionUuid))
    if (whereClauses.length === 0) return undefined

    return await this.database.select().from(activities).where(and(...whereClauses)).get()
  }

  async create (activity: ActivityModel, author: User): Promise<string | undefined> {
    await this.database.insert(activities).values(activity)
    await this.metadataRepository.increment(this.tableName, { lastUuid: activity.uuid })
    await this.userHistoryRepository.makeHistoryEntry({
      type: 'activity',
      action: 'created',
      itemUuid: activity.uuid
    }, author)
    return activity.uuid
  }

  async update ({ uuid }: ActivityModel, data: Partial<ActivityModel>, author: User): Promise<ActivityModel | undefined> {
    const activity =  await this.database.update(activities).set(data).where(eq(activities.uuid, uuid)).returning().get()
    await this.userHistoryRepository.makeHistoryEntry({
      itemUuid: uuid,
      action: 'updated',
      type: 'activity',
    }, author)
    return activity
  }

  async delete ({ uuid }: ActivityModel, author: User): Promise<boolean> {
    const result = await this.database.delete(activities).where(eq(activities.uuid, uuid)).run()
    if (result.rowsAffected > 0) {
      await this.metadataRepository.decrement(this.tableName)
      await this.userHistoryRepository.makeHistoryEntry({
        itemUuid: uuid,
        type: 'activity',
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
