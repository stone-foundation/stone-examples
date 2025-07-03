import { BetModel } from '../../models/Bet'

/**
 * Bet Repository contract
 */
export interface IBetRepository {
  /**
   * List bets
   *
   * @param limit - The limit of bets to list
   * @returns The list of bets
   */
  list: (limit: number) => Promise<BetModel[]>

  /**
   * Find a bet by uuid
   *
   * @param uuid - The uuid of the bet to find
   * @returns The bet or undefined if not found
   */
  findByUuid: (uuid: string) => Promise<BetModel | undefined>

  /**
   * Find a bet by dynamic conditions
   *
   * @param conditions - Conditions to match the bet
   * @returns The bet or undefined if not found
   */
  findBy: (conditions: Partial<BetModel>) => Promise<BetModel | undefined>

  /**
   * Create a bet
   *
   * @param bet - The bet to create
   * @returns The uuid of the created bet
   */
  create: (bet: BetModel) => Promise<string | undefined>
}
