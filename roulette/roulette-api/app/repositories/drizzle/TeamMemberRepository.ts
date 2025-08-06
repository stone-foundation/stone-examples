import { and, eq } from 'drizzle-orm'
import { User } from '../../models/User'
import { teamMembers } from '../../database/schema'
import { TeamMemberModel } from '../../models/Team'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { IBlueprint, isEmpty } from '@stone-js/core'
import { ListMetadataOptions } from '../../models/App'
import { IMetadataRepository } from '../contracts/IMetadataRepository'
import { ITeamMemberRepository } from '../contracts/ITeamMemberRepository'
import { IUserHistoryRepository } from '../contracts/IUserHistoryRepository'

/**
 * TeamMember Repository Options
 */
export interface TeamMemberRepositoryOptions {
  blueprint: IBlueprint
  database: LibSQLDatabase
  metadataRepository: IMetadataRepository
  userHistoryRepository: IUserHistoryRepository
}

/**
 * TeamMember Repository (Drizzle)
 */
export class TeamMemberRepository implements ITeamMemberRepository {
  private readonly tableName: string
  private readonly database: LibSQLDatabase
  private readonly metadataRepository: IMetadataRepository
  private readonly userHistoryRepository: IUserHistoryRepository

  constructor ({ blueprint, database, metadataRepository, userHistoryRepository }: TeamMemberRepositoryOptions) {
    this.database = database
    this.metadataRepository = metadataRepository
    this.userHistoryRepository = userHistoryRepository
    this.tableName = blueprint.get('drizzle.tables.teamMembers.name', 'team_members')
  }

  async list (limit?: number, page?: number | string): Promise<ListMetadataOptions<TeamMemberModel>> {
    page = isEmpty(page) ? 1 : Number(page)
    limit = isEmpty(limit) ? 10 : Number(limit)
    const offset = ((page ?? 1) - 1) * limit

    const items = await this.database
      .select()
      .from(teamMembers)
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

  async listBy (conditions: Partial<TeamMemberModel>, limit?: number, page?: number | string): Promise<ListMetadataOptions<TeamMemberModel>> {
    limit ??= 10
    const whereClauses = []

    if (conditions.role) whereClauses.push(eq(teamMembers.role, conditions.role))
    if (conditions.userUuid) whereClauses.push(eq(teamMembers.userUuid, conditions.userUuid))
    if (conditions.teamUuid) whereClauses.push(eq(teamMembers.teamUuid, conditions.teamUuid))
    if (conditions.missionUuid) whereClauses.push(eq(teamMembers.missionUuid, conditions.missionUuid))
    if (conditions.isActive !== undefined) whereClauses.push(eq(teamMembers.isActive, conditions.isActive))

    const offset = (Number(page) - 1) * limit

    const query = this.database
      .select()
      .from(teamMembers)
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

  async findById (id: number): Promise<TeamMemberModel | undefined> {
    const result = await this.database
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.id, id))
      .get()

    return result ?? undefined
  }

  async findBy (conditions: Partial<TeamMemberModel>): Promise<TeamMemberModel | undefined> {
    const whereClauses = []

    if (conditions.uuid) whereClauses.push(eq(teamMembers.uuid, conditions.uuid))
    if (conditions.role) whereClauses.push(eq(teamMembers.role, conditions.role))
    if (conditions.userUuid) whereClauses.push(eq(teamMembers.userUuid, conditions.userUuid))
    if (conditions.teamUuid) whereClauses.push(eq(teamMembers.teamUuid, conditions.teamUuid))
    if (conditions.missionUuid) whereClauses.push(eq(teamMembers.missionUuid, conditions.missionUuid))
    if (conditions.isActive !== undefined) whereClauses.push(eq(teamMembers.isActive, conditions.isActive))

    if (whereClauses.length === 0) return undefined

    const result = await this.database
      .select()
      .from(teamMembers)
      .where(and(...whereClauses))
      .get()

    return result ?? undefined
  }

  async create (teamMember: TeamMemberModel, author: User): Promise<string | undefined> {
    await this.database.insert(teamMembers).values(teamMember)
    await this.metadataRepository.increment(this.tableName, { lastUuid: teamMember.uuid })
    await this.userHistoryRepository.makeHistoryEntry({
      action: 'created',
      type: 'team_member',
      itemUuid: teamMember.uuid,
    }, author)
    return teamMember.uuid
  }

  async update ({ uuid }: TeamMemberModel, data: Partial<TeamMemberModel>, author: User): Promise<TeamMemberModel | undefined> {
    const result = await this.database
      .update(teamMembers)
      .set(data)
      .where(eq(teamMembers.uuid, uuid))
      .returning()
      .get()

    await this.userHistoryRepository.makeHistoryEntry({
      itemUuid: uuid,
      action: 'updated',
      type: 'team_member',
    }, author)

    return result ?? undefined
  }

  async delete ({ uuid }: TeamMemberModel, author: User): Promise<boolean> {
    const result = await this.database
      .delete(teamMembers)
      .where(eq(teamMembers.uuid, uuid))
      .run()

    if (result.rowsAffected > 0) {
      await this.metadataRepository.decrement(this.tableName)
      await this.userHistoryRepository.makeHistoryEntry({
        itemUuid: uuid,
        action: 'deleted',
        type: 'team_member',
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
