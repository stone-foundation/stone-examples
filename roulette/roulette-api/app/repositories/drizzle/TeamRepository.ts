import { and, eq } from 'drizzle-orm'
import { User } from '../../models/User'
import { teams } from '../../database/schema'
import { TeamModel } from '../../models/Team'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { IBlueprint, isEmpty } from '@stone-js/core'
import { ListMetadataOptions } from '../../models/App'
import { ITeamRepository } from '../contracts/ITeamRepository'
import { IMetadataRepository } from '../contracts/IMetadataRepository'
import { IUserHistoryRepository } from '../contracts/IUserHistoryRepository'

/**
 * Team Repository Options
 */
export interface TeamRepositoryOptions {
  blueprint: IBlueprint
  database: LibSQLDatabase
  metadataRepository: IMetadataRepository
  userHistoryRepository: IUserHistoryRepository
}

/**
 * Team Repository (Drizzle)
 */
export class TeamRepository implements ITeamRepository {
  private readonly tableName: string
  private readonly database: LibSQLDatabase
  private readonly metadataRepository: IMetadataRepository
  private readonly userHistoryRepository: IUserHistoryRepository

  /**
   * Create a new instance of TeamRepository
   */
  constructor ({ database, metadataRepository, userHistoryRepository, blueprint }: TeamRepositoryOptions) {
    this.database = database
    this.metadataRepository = metadataRepository
    this.userHistoryRepository = userHistoryRepository
    this.tableName = blueprint.get('drizzle.tables.teams.name', 'teams')
  }

  async list (limit?: number, page?: number | string): Promise<ListMetadataOptions<TeamModel>> {
    page = isEmpty(page) ? 1 : Number(page)
    limit = isEmpty(limit) ? 10 : Number(limit)
    const offset = ((page ?? 1) - 1) * limit

    const items = await this.database
      .select()
      .from(teams)
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

  async listBy (conditions: Partial<TeamModel>, limit?: number, page?: number | string): Promise<ListMetadataOptions<TeamModel>> {
    limit ??= 10
    const whereClauses = []

    if (conditions.color) whereClauses.push(eq(teams.color, conditions.color))
    if (conditions.missionUuid) whereClauses.push(eq(teams.missionUuid, conditions.missionUuid))

    const offset = (Number(page) - 1) * limit

    const query = this.database
      .select()
      .from(teams)
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

  /**
   * Find a team by UUID
   */
  async findByUuid (uuid: string): Promise<TeamModel | undefined> {
    const result = await this.database
      .select()
      .from(teams)
      .where(eq(teams.uuid, uuid))
      .get()
    return result ?? undefined
  }

  /**
   * Find a team by dynamic conditions
   */
  async findBy (conditions: Partial<TeamModel>): Promise<TeamModel | undefined> {
    const whereClauses = []

    if (conditions.uuid) whereClauses.push(eq(teams.uuid, conditions.uuid))
    if (conditions.name) whereClauses.push(eq(teams.name, conditions.name))
    if (conditions.color) whereClauses.push(eq(teams.color, conditions.color))

    if (whereClauses.length === 0) return undefined

    const result = await this.database
      .select()
      .from(teams)
      .where(and(...whereClauses))
      .get()

    return result ?? undefined
  }

  /**
   * Create a team
   */
  async create (team: TeamModel, author: User): Promise<string | undefined> {
    await this.database.insert(teams).values(team)
    await this.metadataRepository.increment(this.tableName, { lastUuid: team.uuid })
    await this.userHistoryRepository.makeHistoryEntry({
      type: 'team',
      action: 'created',
      itemUuid: team.uuid,
    }, author)
    return team.uuid
  }

  /**
   * Update a team
   *
   * @param team - The team to update
   * @param data - The data to update in the team
   * @returns The updated team or undefined if not found
   */
  async update ({ uuid }: TeamModel, data: Partial<TeamModel>, author: User): Promise<TeamModel | undefined> {
    const result = await this.database
      .update(teams)
      .set(data)
      .where(eq(teams.uuid, uuid))
      .returning()
      .get()

    await this.userHistoryRepository.makeHistoryEntry({
      type: 'team',
      itemUuid: uuid,
      action: 'updated',
    }, author)

    return result ?? undefined
  }

  /**
   * Delete a team
   *
   * @param team - The team to delete
   * @returns `true` if the team was deleted, `false` if not
   */
  async delete ({ uuid }: TeamModel, author: User): Promise<boolean> {
    const result = await this.database
      .delete(teams)
      .where(eq(teams.uuid, uuid))
      .run()

    if (result.rowsAffected > 0) {
      await this.metadataRepository.decrement(this.tableName)
      await this.userHistoryRepository.makeHistoryEntry({
        type: 'team',
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
