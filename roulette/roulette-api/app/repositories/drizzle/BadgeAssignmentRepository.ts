import { and, eq } from 'drizzle-orm'
import { User } from '../../models/User'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { IBlueprint, isEmpty } from '@stone-js/core'
import { ListMetadataOptions } from '../../models/App'
import { badgeAssignments } from '../../database/schema'
import { BadgeAssignmentModel } from '../../models/Badge'
import { IMetadataRepository } from '../contracts/IMetadataRepository'
import { IUserHistoryRepository } from '../contracts/IUserHistoryRepository'
import { IBadgeAssignmentRepository } from '../contracts/IBadgeAssignmentRepository'

export interface BadgeAssignmentRepositoryOptions {
  blueprint: IBlueprint
  database: LibSQLDatabase
  metadataRepository: IMetadataRepository
  userHistoryRepository: IUserHistoryRepository
}

export class BadgeAssignmentRepository implements IBadgeAssignmentRepository {
  private readonly tableName: string
  private readonly database: LibSQLDatabase
  private readonly metadataRepository: IMetadataRepository
  private readonly userHistoryRepository: IUserHistoryRepository

  constructor ({ blueprint, database, metadataRepository, userHistoryRepository }: BadgeAssignmentRepositoryOptions) {
    this.database = database
    this.metadataRepository = metadataRepository
    this.userHistoryRepository = userHistoryRepository
    this.tableName = blueprint.get('drizzle.tables.badgeAssignments.name', 'badge_assignments')
  }

  async list (limit?: number, page?: number | string): Promise<ListMetadataOptions<BadgeAssignmentModel>> {
    page = isEmpty(page) ? 1 : Number(page)
    limit = isEmpty(limit) ? 10 : Number(limit)
    const offset = ((page ?? 1) - 1) * limit

    const items = await this.database
      .select()
      .from(badgeAssignments)
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

  async listBy (conditions: Partial<BadgeAssignmentModel>, limit?: number, page?: number | string): Promise<ListMetadataOptions<BadgeAssignmentModel>> {
    limit ??= 10
    page = isEmpty(page) ? 1 : Number(page)
    const offset = (Number(page) - 1) * limit

    const whereClauses = []

    if (conditions.teamUuid) whereClauses.push(eq(badgeAssignments.teamUuid, conditions.teamUuid))
    if (conditions.badgeUuid) whereClauses.push(eq(badgeAssignments.badgeUuid, conditions.badgeUuid))
    if (conditions.missionUuid) whereClauses.push(eq(badgeAssignments.missionUuid, conditions.missionUuid))
    if (conditions.revoked !== undefined) whereClauses.push(eq(badgeAssignments.revoked, conditions.revoked))
    if (conditions.teamMemberUuid) whereClauses.push(eq(badgeAssignments.teamMemberUuid, conditions.teamMemberUuid))

    const query = this.database
      .select()
      .from(badgeAssignments)
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

  async findByUuid (uuid: string): Promise<BadgeAssignmentModel | undefined> {
    return await this.database
      .select()
      .from(badgeAssignments)
      .where(eq(badgeAssignments.uuid, uuid))
      .get()
  }

  async findBy (conditions: Partial<BadgeAssignmentModel>): Promise<BadgeAssignmentModel | undefined> {
    const whereClauses = []

    if (conditions.uuid) whereClauses.push(eq(badgeAssignments.uuid, conditions.uuid))
    if (conditions.badgeUuid) whereClauses.push(eq(badgeAssignments.badgeUuid, conditions.badgeUuid))
    if (conditions.teamUuid) whereClauses.push(eq(badgeAssignments.teamUuid, conditions.teamUuid))
    if (conditions.teamMemberUuid) whereClauses.push(eq(badgeAssignments.teamMemberUuid, conditions.teamMemberUuid))

    if (whereClauses.length === 0) return undefined

    return await this.database
      .select()
      .from(badgeAssignments)
      .where(and(...whereClauses))
      .get()
  }

  async create (assignment: BadgeAssignmentModel, author: User): Promise<string | undefined> {
    await this.database.insert(badgeAssignments).values(assignment)
    await this.metadataRepository.increment(this.tableName, { lastUuid: assignment.uuid })
    await this.userHistoryRepository.makeHistoryEntry({
      action: 'created',
      type: 'badge_assignment',
      itemUuid: assignment.uuid,
    }, author)
    return assignment.uuid
  }

  async update ({ uuid }: BadgeAssignmentModel, data: Partial<BadgeAssignmentModel>, author: User): Promise<BadgeAssignmentModel | undefined> {
    const assignment = await this.database
      .update(badgeAssignments)
      .set(data)
      .where(eq(badgeAssignments.uuid, uuid))
      .returning()
      .get()
    await this.userHistoryRepository.makeHistoryEntry({
      itemUuid: uuid,
      action: 'updated',
      type: 'badge_assignment',
    }, author)
    return assignment
  }

  async delete ({ uuid }: BadgeAssignmentModel, author: User): Promise<boolean> {
    const result = await this.database
      .delete(badgeAssignments)
      .where(eq(badgeAssignments.uuid, uuid))
      .run()

    if (result.rowsAffected > 0) {
      await this.metadataRepository.decrement(this.tableName)
      await this.userHistoryRepository.makeHistoryEntry({
        itemUuid: uuid,
        action: 'deleted',
        type: 'badge_assignment',
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
