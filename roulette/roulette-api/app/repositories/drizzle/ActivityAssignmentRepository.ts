import { eq, and } from 'drizzle-orm'
import { User } from '../../models/User'
import { isEmpty } from '@stone-js/core'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { ListMetadataOptions } from '../../models/App'
import { RepositoryOptions } from './ActivityRepository'
import { activityAssignments } from '../../database/schema'
import { ActivityAssignmentModel } from '../../models/Activity'
import { IMetadataRepository } from '../contracts/IMetadataRepository'
import { IUserHistoryRepository } from '../contracts/IUserHistoryRepository'
import { IActivityAssignmentRepository } from '../contracts/IActivityAssignmentRepository'

export class ActivityAssignmentRepository implements IActivityAssignmentRepository {
  private readonly tableName: string
  private readonly database: LibSQLDatabase
  private readonly metadataRepository: IMetadataRepository
    private readonly userHistoryRepository: IUserHistoryRepository

  constructor ({ blueprint, database, metadataRepository, userHistoryRepository }: RepositoryOptions) {
    this.database = database
    this.metadataRepository = metadataRepository
    this.userHistoryRepository = userHistoryRepository
    this.tableName = blueprint.get('drizzle.tables.activityAssignments.name', 'activityAssignments')
  }

  async list (limit?: number, page?: number | string): Promise<ListMetadataOptions<ActivityAssignmentModel>> {
    page = isEmpty(page) ? 1 : Number(page)
    limit = isEmpty(limit) ? 10 : Number(limit)
    const offset = (page - 1) * limit

    const items = await this.database.select().from(activityAssignments).limit(limit).offset(offset)
    const total = await this.count()
    const nextPage = items.length === limit ? page + 1 : undefined

    return { page, limit, total, items, nextPage }
  }

  async listBy (conditions: Partial<ActivityAssignmentModel>, limit?: number, page?: number | string): Promise<ListMetadataOptions<ActivityAssignmentModel>> {
    const whereClauses = []

    if (conditions.status) whereClauses.push(eq(activityAssignments.status, conditions.status))
    if (conditions.teamUuid) whereClauses.push(eq(activityAssignments.teamUuid, conditions.teamUuid))
    if (conditions.missionUuid) whereClauses.push(eq(activityAssignments.missionUuid, conditions.missionUuid))
    if (conditions.activityUuid) whereClauses.push(eq(activityAssignments.activityUuid, conditions.activityUuid))
    if (conditions.teamMemberUuid) whereClauses.push(eq(activityAssignments.teamMemberUuid, conditions.teamMemberUuid))

    limit ??= 10
    page = isEmpty(page) ? 1 : Number(page)
    const offset = (page - 1) * limit

    const query = this.database.select().from(activityAssignments).limit(limit).offset(offset)
    if (whereClauses.length > 0) query.where(and(...whereClauses))

    const items = await query
    const total = await this.count()
    const nextPage = items.length === limit ? page + 1 : undefined

    return { page, limit, total, items, nextPage }
  }

  async findByUuid (uuid: string): Promise<ActivityAssignmentModel | undefined> {
    return await this.database.select().from(activityAssignments).where(eq(activityAssignments.uuid, uuid)).get()
  }

  async findBy (conditions: Partial<ActivityAssignmentModel>): Promise<ActivityAssignmentModel | undefined> {
    const whereClauses = []
    if (conditions.uuid) whereClauses.push(eq(activityAssignments.uuid, conditions.uuid))
    if (conditions.status) whereClauses.push(eq(activityAssignments.status, conditions.status))
    if (conditions.teamUuid) whereClauses.push(eq(activityAssignments.teamUuid, conditions.teamUuid))
    if (conditions.missionUuid) whereClauses.push(eq(activityAssignments.missionUuid, conditions.missionUuid))
    if (conditions.activityUuid) whereClauses.push(eq(activityAssignments.activityUuid, conditions.activityUuid))
    if (conditions.teamMemberUuid) whereClauses.push(eq(activityAssignments.teamMemberUuid, conditions.teamMemberUuid))
    if (whereClauses.length === 0) return undefined

    return await this.database.select().from(activityAssignments).where(and(...whereClauses)).get()
  }

  async create (assignment: ActivityAssignmentModel, author: User): Promise<string | undefined> {
    await this.database.insert(activityAssignments).values(assignment)
    await this.metadataRepository.increment(this.tableName, { lastUuid: assignment.uuid })
    await this.userHistoryRepository.makeHistoryEntry({
      action: 'created',
      itemUuid: assignment.uuid,
      type: 'activity_assignment',
    }, author)
    return assignment.uuid
  }

  async update ({ uuid }: ActivityAssignmentModel, data: Partial<ActivityAssignmentModel>, author: User): Promise<ActivityAssignmentModel | undefined> {
    const assignment = await this.database.update(activityAssignments).set(data).where(eq(activityAssignments.uuid, uuid)).returning().get()
    await this.userHistoryRepository.makeHistoryEntry({
      itemUuid: uuid,
      action: 'updated',
      type: 'activity_assignment',
    }, author)
    return assignment
  }

  async delete ({ uuid }: ActivityAssignmentModel, author: User): Promise<boolean> {
    const result = await this.database.delete(activityAssignments).where(eq(activityAssignments.uuid, uuid)).run()
    if (result.rowsAffected > 0) {
      await this.metadataRepository.decrement(this.tableName)
      await this.userHistoryRepository.makeHistoryEntry({
        itemUuid: uuid,
        action: 'deleted',
        type: 'activity_assignment',
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
