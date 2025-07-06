import { and, eq } from 'drizzle-orm'
import { teams } from '../../database/schema'
import { TeamModel } from '../../models/Team'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { ITeamRepository } from '../contracts/ITeamRepository'

/**
 * Team Repository Options
 */
export interface TeamRepositoryOptions {
  database: LibSQLDatabase
}

/**
 * Team Repository
 */
export class TeamRepository implements ITeamRepository {
  private readonly database: LibSQLDatabase

  /**
   * Create a new instance of TeamRepository
   */
  constructor ({ database }: TeamRepositoryOptions) {
    this.database = database
  }

  /**
   * List teams
   */
  async list (limit: number): Promise<TeamModel[]> {
    return await this.database.select().from(teams).limit(limit)
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

    if (conditions.uuid !== undefined) whereClauses.push(eq(teams.uuid, conditions.uuid))
    else if (conditions.name !== undefined) whereClauses.push(eq(teams.name, conditions.name))
    else if (conditions.color !== undefined) whereClauses.push(eq(teams.color, conditions.color))

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
  async create (team: TeamModel): Promise<string | undefined> {
    await this.database.insert(teams).values(team)
    return team.uuid
  }

  /**
   * Update a team
   *
   * @param team - The team to update
   * @param data - The data to update in the team
   * @returns The updated team or undefined if not found
   */
  async update ({ uuid }: TeamModel, data: Partial<TeamModel>): Promise<TeamModel | undefined> {
    const result = await this.database
      .update(teams)
      .set(data)
      .where(eq(teams.uuid, uuid))
      .returning()
      .get()
    return result ?? undefined
  }

  /**
   * Delete a team
   *
   * @param team - The team to delete
   * @returns `true` if the team was deleted, `false` if not
   */
  async delete ({ uuid }: TeamModel): Promise<boolean> {
    const result = await this.database.delete(teams).where(eq(teams.uuid, uuid)).run()
    return result.rowsAffected > 0
  }
}
