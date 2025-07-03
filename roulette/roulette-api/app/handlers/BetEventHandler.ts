import { User } from '../models/User'
import { Bet, SpinResult } from '../models/Bet'
import { BetService } from '../services/BetService'
import { EventHandler, Get, Post } from '@stone-js/router'
import { ILogger, isEmpty, isNotEmpty } from '@stone-js/core'
import { BadRequestError, IncomingHttpEvent } from '@stone-js/http-core'

/**
 * Bet Event Handler Options
*/
export interface BetEventHandlerOptions {
  logger: ILogger
  betService: BetService
}

/**
 * Bet Event Handler
*/
@EventHandler('/', { name: 'bets', middleware: ['auth'] })
export class BetEventHandler {
  private readonly logger: ILogger
  private readonly betService: BetService

  /**
   * Create a new instance of BetEventHandler
   *
   * @param betService
   * @param logger
   */
  constructor ({ logger, betService }: BetEventHandlerOptions) {
    this.logger = logger
    this.betService = betService
  }

  /**
   * List all bets
  */
  @Get('/bets', { name: 'list', middleware: ['admin'] })
  async list (event: IncomingHttpEvent): Promise<Bet[]> {
    return await this.betService.list(event.get<number>('limit', 10))
  }

  /**
   * Show a bet
   *
   * @param event - IncomingHttpEvent
   * @returns Bet
  */
  @Get('/bets/:bet@uuid', { rules: { bet: /\S{30,40}/ }, bindings: { bet: BetService }, middleware: ['admin'] })
  show (event: IncomingHttpEvent): Bet | undefined {
    return event.get<Bet>('bet')
  }

  /**
   * Spin the roulette
  */
  @Post(['/bets', '/roulette/spin'], { name: 'spin' })
  async spin (event: IncomingHttpEvent): Promise<SpinResult> {
    const user = event.getUser<User>()

    if (isEmpty(user)) {
      throw new BadRequestError('You must be logged in to spin')
    }

    if (isNotEmpty(user.teamUuid)) {
      throw new BadRequestError('Oops! Vous faites déjà partie d\'une équipe.')
    }

    const result = await this.betService.spin(user)

    this.logger.info(`Bet created: ${String(result.uuid)}, by user: ${String(event.getUser<User>()?.uuid)}`)

    return { color: result.color }
  }
}
