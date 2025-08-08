import { User } from '../models/User'
import { Team, TeamMemberModel } from '../models/Team'
import { randomUUID } from 'node:crypto'
import { SpinEvent } from '../events/SpinEvent'
import { Spin, SpinModel } from '../models/Spin'
import { NotFoundError } from '@stone-js/http-core'
import { SecurityService } from './SecurityService'
import { ISpinRepository } from '../repositories/contracts/ISpinRepository'
import { ITeamRepository } from '../repositories/contracts/ITeamRepository'
import { IUserRepository } from '../repositories/contracts/IUserRepository'
import { ITeamMemberRepository } from '../repositories/contracts/ITeamMemberRepository'
import { EventEmitter, IBlueprint, IContainer, isNotEmpty, Service } from '@stone-js/core'

/**
 * Spin Service Options
*/
export interface SpinServiceOptions {
  blueprint: IBlueprint
  eventEmitter: EventEmitter
  spinRepository: ISpinRepository
  teamRepository: ITeamRepository
  userRepository: IUserRepository
  securityService: SecurityService
  teamMemberRepository: ITeamMemberRepository
}

/**
 * Spin Service
*/
@Service({ alias: 'spinService' })
export class SpinService {
  private readonly blueprint: IBlueprint
  private readonly eventEmitter: EventEmitter
  private readonly spinRepository: ISpinRepository
  private readonly teamRepository: ITeamRepository
  private readonly userRepository: IUserRepository
  private readonly securityService: SecurityService
  private readonly teamMemberRepository: ITeamMemberRepository

  /**
   * Resolve route binding
   *
   * @param key - The key of the binding
   * @param value - The value of the binding
   * @param container - The container
   */
  static async resolveRouteBinding (key: string, value: any, container: IContainer): Promise<Spin | undefined> {
    const spinService = container.resolve<SpinService>('spinService')
    return await spinService.findBy({ [key]: value })
  }

  /**
   * Create a new Spin Service
  */
  constructor ({ blueprint, securityService, teamMemberRepository, eventEmitter, userRepository, spinRepository, teamRepository }: SpinServiceOptions) {
    this.blueprint = blueprint
    this.eventEmitter = eventEmitter
    this.spinRepository = spinRepository
    this.teamRepository = teamRepository
    this.userRepository = userRepository
    this.securityService = securityService
    this.teamMemberRepository = teamMemberRepository
  }

  /**
   * List spins
   *
   * @param limit - The limit of spins to list
   */
  async list (limit: number = 10): Promise<Spin[]> {
    return (await this.spinRepository.list(limit)).map(v => this.toSpin(v))
  }

  /**
   * Find a spin
   *
   * @param conditions - The conditions to find the spin
   * @returns The found spin
   */
  async findBy (conditions: Record<string, any>): Promise<Spin> {
    const spinModel = await this.spinRepository.findBy(conditions)
    if (isNotEmpty<SpinModel>(spinModel)) return this.toSpin(spinModel)
    throw new NotFoundError(`The spin with conditions ${JSON.stringify(conditions)} not found`)
  }

  /**
   * Find a spin by uuid
   *
   * @param uuid - The uuid of the spin to find
   * @returns The found spin or undefined if not found
   */
  async findByUuid (uuid: string): Promise<Spin | undefined> {
    const spinModel = await this.spinRepository.findByUuid(uuid)
    if (isNotEmpty<SpinModel>(spinModel)) return this.toSpin(spinModel)
  }

  /**
   * Create a spin
   *
   * @param spin - The spin to create
   */
  async create (spin: Spin, user: User): Promise<string | undefined> {
    return await this.spinRepository.create({
      ...spin,
      createdAt: Date.now()
    }, user)
  }

  /**
   * Spin
   * 
   * @param user - The user spinning
   * @param missionUuid - The mission uuid
   * @param name - The name of the team member (optional)
   * @returns The created spin
   */
  async spin (user: User, missionUuid: string, name?: string): Promise<Spin> {
    const limit = this.blueprint.get<number>('app.spin.limit', 100)
    const teamModels = await this.teamRepository.listBy({ missionUuid }, limit)
    const validTeams = teamModels.items.filter(v => v.totalMembers > v.countMembers)

    if (validTeams.length === 0) {
      throw new NotFoundError('Aucune équipe disponible pour spinner')
    }

    const index = Math.floor(Math.random() * limit) % validTeams.length
    const team = validTeams[index]

    const teamMemberUuid = await this.teamMemberRepository.create({
      isLate: false,
      isActive: true,
      role: 'member',
      isPresent: false,
      uuid: randomUUID(),
      teamUuid: team.uuid,
      userUuid: user.uuid,
      joinedAt: Date.now(),
      name: name ?? user.username,
      missionUuid: team.missionUuid
    }, user) as string

    await this.teamRepository.update(team, {
      updatedAt: Date.now(),
      countMembers: team.countMembers + 1
    }, user)

    const spin: SpinModel = {
      missionUuid,
      teamMemberUuid,
      color: team.color,
      uuid: randomUUID(),
      userUuid: user.uuid,
      teamUuid: team.uuid,
      value: String(index),
      createdAt: Date.now()
    }

    await this.create(spin, user)

    await this.eventEmitter.emit(new SpinEvent(spin))

    return spin
  }

  /**
   * Check if the user has already spun
   *
   * @param user - The user to check
   * @param missionUuid - The mission uuid
   * @returns True if the user has already spun, false otherwise
   */
  async userAlreadySpinned (user: User, missionUuid: string): Promise<boolean> {
    return isNotEmpty<boolean>(await this.spinRepository.findBy({ userUuid: user.uuid, missionUuid }))
  }

  /**
   * Check if the team member name already exists
   *
   * @param name - The name of the team member
   * @param missionUuid - The mission uuid
   * @returns True if the team member name already exists, false otherwise
   */
  async isTeamMemberNameAlreadyExists (name: string, missionUuid: string): Promise<boolean> {
    try {
      const teamMember = await this.teamMemberRepository.findBy({ name, missionUuid })
      return isNotEmpty<TeamMemberModel>(teamMember)
    } catch (error) {
      return false
    }
  }

  /**
   * Convert SpinModel to Spin
   *
   * @param spinModel - The spin model to convert
   * @returns The converted spin
   */
  toSpin (spinModel: SpinModel, user?: User, team?: Team): Spin {
    return { ...spinModel, user, team }
  }
}
