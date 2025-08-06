import { eq, and } from 'drizzle-orm'
import { spins } from '../../database/schema'
import { SpinModel } from '../../models/Spin'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { ISpinRepository } from '../contracts/ISpinRepository'

/**
 * Spin Repository Options
 */
export interface SpinRepositoryOptions {
  database: LibSQLDatabase
}

/**
 * Spin Repository
 */
export class SpinRepository implements ISpinRepository {
  private readonly database: LibSQLDatabase

  /**
   * Create a new instance of SpinRepository
   */
  constructor ({ database }: SpinRepositoryOptions) {
    this.database = database
  }

  /**
   * List spins
   */
  async list (limit: number): Promise<SpinModel[]> {
    return await this.database.select().from(spins).limit(limit)
  }

  /**
   * Find a spin by UUID
   */
  async findByUuid (uuid: string): Promise<SpinModel | undefined> {
    const result = await this.database
      .select()
      .from(spins)
      .where(eq(spins.uuid, uuid))
      .get()
    return result ?? undefined
  }

  /**
   * Find a spin by dynamic conditions
   */
  async findBy (conditions: Partial<SpinModel>): Promise<SpinModel | undefined> {
    const whereClauses = []

    if (conditions.uuid !== undefined) whereClauses.push(eq(spins.uuid, conditions.uuid))
    if (conditions.userUuid !== undefined) whereClauses.push(eq(spins.userUuid, conditions.userUuid))
    if (conditions.teamUuid !== undefined) whereClauses.push(eq(spins.teamUuid, conditions.teamUuid))
    if (conditions.missionUuid !== undefined) whereClauses.push(eq(spins.missionUuid, conditions.missionUuid))
    if (conditions.teamMemberUuid !== undefined) whereClauses.push(eq(spins.teamMemberUuid, conditions.teamMemberUuid))


    if (whereClauses.length === 0) return undefined

    const result = await this.database
      .select()
      .from(spins)
      .where(and(...whereClauses))
      .get()

    return result ?? undefined
  }

  /**
   * Create a spin
   */
  async create (spin: SpinModel): Promise<string | undefined> {
    await this.database.insert(spins).values(spin)
    return spin.uuid
  }
}
