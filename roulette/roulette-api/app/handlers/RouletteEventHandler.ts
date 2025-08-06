import { User } from '../models/User'
import { Spin } from '../models/Spin'
import { ILogger, isEmpty } from '@stone-js/core'
import { SpinService } from '../services/SpinService'
import { EventHandler, Get, Post } from '@stone-js/router'
import { BadRequestError, IncomingHttpEvent, JsonHttpResponse } from '@stone-js/http-core'

/**
 * Roulette Event Handler Options
*/
export interface RouletteEventHandlerOptions {
  logger: ILogger
  spinService: SpinService
}

/**
 * Roulette Event Handler
*/
@EventHandler('/roulette', { name: 'Roulette', middleware: ['auth'] })
export class RouletteEventHandler {
  private readonly logger: ILogger
  private readonly spinService: SpinService

  /**
   * Create a new instance of RouletteEventHandler
   *
   * @param spinService
   * @param logger
   */
  constructor ({ logger, spinService }: RouletteEventHandlerOptions) {
    this.logger = logger
    this.spinService = spinService
  }

  /**
   * List all spins
  */
  @Get('/', { name: 'list', middleware: ['admin'] })
  async list (event: IncomingHttpEvent): Promise<Spin[]> {
    return await this.spinService.list(event.get<number>('limit', 10))
  }

  /**
   * Show a spin
   *
   * @param event - IncomingHttpEvent
   * @returns Spin
  */
  @Get('/:spin@uuid', { rules: { spin: /\S{30,40}/ }, bindings: { spin: SpinService }, middleware: ['admin'] })
  show (event: IncomingHttpEvent): Spin | undefined {
    return event.get<Spin>('spin')
  }

  /**
   * Spin the roulette
  */
  @Post(['/spin'], { name: 'spin' })
  @JsonHttpResponse(201)
  async spin (event: IncomingHttpEvent): Promise<Spin> {
    const user = event.getUser<User>()
    const { name, missionUuid } = event.getBody<{ name?: string, missionUuid?: string }>({})

    if (isEmpty(user)) {
      throw new BadRequestError('You must be logged in to spin')
    }

    if (isEmpty(missionUuid)) {
      throw new BadRequestError('You must select a mission before spinning')
    }

    if (await this.spinService.userAlreadySpinned(user, missionUuid)) {
      throw new BadRequestError('🤪 E PIYAY 🤪! Dasomann! Vous faites déjà partie d\'une équipe.')
    }

    const result = await this.spinService.spin(user, missionUuid, name)

    this.logger.info(`Spin created: ${String(result.uuid)}, by user: ${String(user.uuid)}`)

    return result
  }
}
