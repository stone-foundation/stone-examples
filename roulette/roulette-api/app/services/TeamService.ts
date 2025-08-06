import { User } from '../models/User'
import { randomUUID } from 'node:crypto'
import { MediaService } from './MediaService'
import { NotFoundError } from '@stone-js/http-core'
import { ListMetadataOptions } from '../models/App'
import { Team, TeamMember, TeamModel } from '../models/Team'
import { ITeamRepository } from '../repositories/contracts/ITeamRepository'
import { IBlueprint, IContainer, isNotEmpty, Service } from '@stone-js/core'

/**
 * Team Service Options
*/
export interface TeamServiceOptions {
  blueprint: IBlueprint
  mediaService: MediaService
  teamRepository: ITeamRepository
}

/**
 * Team Service
*/
@Service({ alias: 'teamService' })
export class TeamService {
  private readonly blueprint: IBlueprint
  private readonly mediaService: MediaService
  private readonly teamRepository: ITeamRepository

  /**
   * Resolve route binding
   *
   * @param key - The key of the binding
   * @param value - The value of the binding
   * @param container - The container
   */
  static async resolveRouteBinding (key: string, value: any, container: IContainer): Promise<Team | undefined> {
    const teamService = container.resolve<TeamService>('teamService')
    return await teamService.findBy({ [key]: value })
  }

  /**
   * Create a new Team Service
  */
  constructor ({ blueprint, teamRepository, mediaService }: TeamServiceOptions) {
    this.blueprint = blueprint
    this.mediaService = mediaService
    this.teamRepository = teamRepository
  }

  /**
   * List all teams
   */
  async list (limit: number = 10, page?: number | string): Promise<ListMetadataOptions<Team>> {
    const result = await this.teamRepository.list(limit, page)
    const items = result.items.map(v => this.toTeam(v))
    return { ...result, items }
  }

  /**
   * List teams by conditions
   */
  async listBy (conditions: Partial<TeamModel>, limit: number = 10, page?: number | string): Promise<ListMetadataOptions<Team>> {
    const result = await this.teamRepository.listBy(conditions, limit, page)
    const items = result.items.map(v => this.toTeam(v))
    return { ...result, items }
  }

  /**
   * Find a team
   *
   * @param conditions - The conditions to find the team
   * @returns The found team
   */
  async findBy (conditions: Record<string, any>): Promise<Team> {
    const teamModel = await this.teamRepository.findBy(conditions)
    if (isNotEmpty<TeamModel>(teamModel)) return this.toTeam(teamModel)
    throw new NotFoundError(`The team with conditions ${JSON.stringify(conditions)} not found`)
  }

  /**
   * Find a team by uuid
   *
   * @param uuid - The uuid of the team to find
   * @returns The found team or undefined if not found
   */
  async findByUuid (uuid: string): Promise<Team | undefined> {
    const teamModel = await this.teamRepository.findByUuid(uuid)
    if (isNotEmpty<TeamModel>(teamModel)) return this.toTeam(teamModel)
  }

  /**
   * Find a team by name
   *
   * @param name - The name of the team to find
   * @returns The found team or undefined if not found
   */
  async findByName (name: string): Promise<Team | undefined> {
    const teamModel = await this.teamRepository.findBy({ name })
    if (isNotEmpty<TeamModel>(teamModel)) return this.toTeam(teamModel)
  }

  /**
   * Find a team by color
   *
   * @param color - The color of the team to find
   * @returns The found team or undefined if not found
   */
  async findByColor (color: string): Promise<Team | undefined> {
    const teamModel = await this.teamRepository.findBy({ color })
    if (isNotEmpty<TeamModel>(teamModel)) return this.toTeam(teamModel)
  }

  /**
   * Create a team
   *
   * @param team - The team to create
   * @param author - The user who is creating the team
   * @returns The created team
   */
  async create (team: Team, author: User): Promise<string | undefined> {
    const totalMembers = team.totalMembers ?? this.blueprint.get<number>('app.team.defaultTotalMembers', 10)

    return await this.teamRepository.create({
      ...team,
      totalMembers,
      countMembers: 0,
      uuid: randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }, author)
  }

  /**
   * Update a team
   *
   * @param team - The team to update
   * @param data - The data to update in the team
   * @param author - The user who is updating the team
   * @returns The updated team
   */
  async update (team: Team, data: Partial<Team>, author: User): Promise<Team> {
    const teamModel = await this.teamRepository.update(team, data, author)
    if (isNotEmpty<TeamModel>(teamModel)) return this.toTeam(teamModel)
    throw new NotFoundError(`Team with ID ${team.uuid} not found`)
  }

  /**
   * Delete a team
   *
   * @param team - The team to delete
   * @param author - The user who is deleting the team
   * @returns True if the team was deleted, false otherwise
   */
  async delete (team: Team, author: User): Promise<boolean> {
    await this.mediaService.deleteS3Object(team.logoUrl)
    await this.mediaService.deleteS3Object(team.bannerUrl)
    return await this.teamRepository.delete(team, author)
  }

  /**
   * Convert TeamModel to Team
   *
   * @param teamModel - The team model to convert
   * @returns The converted team
   */
  toTeam (teamModel: TeamModel, members: User[] = []): Team {
    return { ...teamModel, members }
  }

  /**
   * Convert Team to Partial<Team>
   *
   * @param team - The team to convert
   * @param withDetails - Whether to include detailed information like members and chat link
   * @returns The converted team
   */
  toStatTeam (team: Team, withDetails: boolean = false): Partial<Team> {
    return {
      name: team.name,
      color: team.color,
      totalMembers: team.totalMembers,
      countMembers: team.countMembers,
      members: withDetails ? team.members : undefined,
      chatLink: withDetails ? team.chatLink : undefined
    }
  }

  toTeamMember (member: User): TeamMember {
    const isCaptain = Array().concat(member.roles ?? []).includes('captain') || false

    return {
      isCaptain,
      uuid: member.uuid,
      phone: member.phone,
      isSoldier: !isCaptain,
      fullname: member.fullname,
      username: member.username,
      isPresent: false // TODO: Implement presence logic
    }
  }
}
