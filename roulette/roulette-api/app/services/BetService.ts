import { User } from '../models/User'
import { Team } from '../models/Team'
import { randomUUID } from 'node:crypto'
import { BetEvent } from '../events/BetEvent'
import { Bet, BetModel } from '../models/Bet'
import { NotFoundError } from '@stone-js/http-core'
import { IBetRepository } from '../repositories/contracts/IBetRepository'
import { ITeamRepository } from '../repositories/contracts/ITeamRepository'
import { IUserRepository } from '../repositories/contracts/IUserRepository'
import { EventEmitter, IBlueprint, IContainer, isNotEmpty, Service } from '@stone-js/core'

/**
 * Bet Service Options
*/
export interface BetServiceOptions {
  blueprint: IBlueprint
  eventEmitter: EventEmitter
  betRepository: IBetRepository
  teamRepository: ITeamRepository
  userRepository: IUserRepository
}

/**
 * Bet Service
*/
@Service({ alias: 'betService' })
export class BetService {
  private readonly blueprint: IBlueprint
  private readonly eventEmitter: EventEmitter
  private readonly betRepository: IBetRepository
  private readonly teamRepository: ITeamRepository
  private readonly userRepository: IUserRepository

  /**
   * Resolve route binding
   *
   * @param key - The key of the binding
   * @param value - The value of the binding
   * @param container - The container
   */
  static async resolveRouteBinding (key: string, value: any, container: IContainer): Promise<Bet | undefined> {
    const betService = container.resolve<BetService>('betService')
    return await betService.findBy({ [key]: value })
  }

  /**
   * Create a new Bet Service
  */
  constructor ({ blueprint, eventEmitter, userRepository, betRepository, teamRepository }: BetServiceOptions) {
    this.blueprint = blueprint
    this.eventEmitter = eventEmitter
    this.betRepository = betRepository
    this.teamRepository = teamRepository
    this.userRepository = userRepository
  }

  /**
   * List bets
   *
   * @param limit - The limit of bets to list
   */
  async list (limit: number = 10): Promise<Bet[]> {
    return (await this.betRepository.list(limit)).map(v => this.toBet(v))
  }

  /**
   * Find a bet
   *
   * @param conditions - The conditions to find the bet
   * @returns The found bet
   */
  async findBy (conditions: Record<string, any>): Promise<Bet> {
    const betModel = await this.betRepository.findBy(conditions)
    if (isNotEmpty<BetModel>(betModel)) return this.toBet(betModel)
    throw new NotFoundError(`The bet with conditions ${JSON.stringify(conditions)} not found`)
  }

  /**
   * Find a bet by uuid
   *
   * @param uuid - The uuid of the bet to find
   * @returns The found bet or undefined if not found
   */
  async findByUuid (uuid: string): Promise<Bet | undefined> {
    const betModel = await this.betRepository.findByUuid(uuid)
    if (isNotEmpty<BetModel>(betModel)) return this.toBet(betModel)
  }

  /**
   * Create a bet
   *
   * @param bet - The bet to create
   */
  async create (bet: Bet): Promise<string | undefined> {
    return await this.betRepository.create({
      ...bet,
      createdAt: Date.now()
    })
  }

  /**
   * Spin a bet
   *
   * @returns The uuid of the spun bet
   * @throws NotFoundError if no bet is available to spin
   */
  async spin (user: User): Promise<Bet> {
    const limit = this.blueprint.get<number>('app.bet.limit', 100)
    const teamModels = await this.teamRepository.list(limit)
    const validTeams = teamModels.filter(v => v.totalMember > v.countMember)

    if (validTeams.length === 0) {
      throw new NotFoundError('No team available to spin')
    }

    const index = Math.floor(Math.random() * limit) % validTeams.length
    const team = validTeams[index]

    await this.userRepository.update(user, {
      teamUuid: team.uuid,
      updatedAt: Date.now()
    })

    await this.teamRepository.update(team, {
      updatedAt: Date.now(),
      countMember: team.countMember + 1
    })

    const bet = {
      color: team.color,
      uuid: randomUUID(),
      userUuid: user.uuid,
      teamUuid: team.uuid,
      value: String(index),
      createdAt: Date.now()
    }

    await this.create(bet)

    await this.eventEmitter.emit(new BetEvent(bet))

    return bet
  }

  /**
   * Convert BetModel to Bet
   *
   * @param betModel - The bet model to convert
   * @returns The converted bet
   */
  toBet (betModel: BetModel, user?: User, team?: Team): Bet {
    return { ...betModel, user, team }
  }
}
