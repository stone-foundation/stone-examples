import { eq, and } from 'drizzle-orm'
import { bets } from '../../database/schema'
import { BetModel } from '../../models/Bet'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { IBetRepository } from '../contracts/IBetRepository'

/**
 * Bet Repository Options
 */
export interface BetRepositoryOptions {
  database: LibSQLDatabase
}

/**
 * Bet Repository
 */
export class BetRepository implements IBetRepository {
  private readonly database: LibSQLDatabase

  /**
   * Create a new instance of BetRepository
   */
  constructor ({ database }: BetRepositoryOptions) {
    this.database = database
  }

  /**
   * List bets
   */
  async list (limit: number): Promise<BetModel[]> {
    return await this.database.select().from(bets).limit(limit)
  }

  /**
   * Find a bet by UUID
   */
  async findByUuid (uuid: string): Promise<BetModel | undefined> {
    const result = await this.database
      .select()
      .from(bets)
      .where(eq(bets.uuid, uuid))
      .get()
    return result ?? undefined
  }

  /**
   * Find a bet by dynamic conditions
   */
  async findBy (conditions: Partial<BetModel>): Promise<BetModel | undefined> {
    const whereClauses = []

    if (conditions.uuid !== undefined) {
      whereClauses.push(eq(bets.uuid, conditions.uuid))
    }

    if (conditions.userUuid !== undefined) {
      whereClauses.push(eq(bets.userUuid, conditions.userUuid))
    }

    if (conditions.teamUuid !== undefined) {
      whereClauses.push(eq(bets.teamUuid, conditions.teamUuid))
    }

    if (conditions.color !== undefined) {
      whereClauses.push(eq(bets.color, conditions.color))
    }

    if (whereClauses.length === 0) return undefined

    const result = await this.database
      .select()
      .from(bets)
      .where(and(...whereClauses))
      .get()

    return result ?? undefined
  }

  /**
   * Create a bet
   */
  async create (bet: BetModel): Promise<string | undefined> {
    await this.database.insert(bets).values(bet)
    return bet.uuid
  }
}
