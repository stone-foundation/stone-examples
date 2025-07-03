import { Bet } from '../models/Bet'
import { Event } from '@stone-js/core'

/**
 * Bet Event
 */
export class BetEvent extends Event {
  /**
   * BET Event name, fired when a user makes a bet.
   *
   * @event BetEvent#BET
   */
  static readonly BET: string = 'bet.bet'

  /**
   * Create a new BetEvent
   *
   * @param bet - The bet that was made
   */
  constructor (public readonly bet: Bet) {
    super({ type: BetEvent.BET })
  }
}
