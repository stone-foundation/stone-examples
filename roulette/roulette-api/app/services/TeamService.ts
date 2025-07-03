import { User } from '../models/User'
import { randomUUID } from 'node:crypto'
import { Team, TeamModel } from '../models/Team'
import { NotFoundError } from '@stone-js/http-core'
import { ITeamRepository } from '../repositories/contracts/ITeamRepository'
import { IBlueprint, IContainer, isNotEmpty, Service } from '@stone-js/core'

/**
 * Team Service Options
*/
export interface TeamServiceOptions {
  blueprint: IBlueprint
  teamRepository: ITeamRepository
}

/**
 * Team Service
*/
@Service({ alias: 'teamService' })
export class TeamService {
  private readonly blueprint: IBlueprint
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
  constructor ({ blueprint, teamRepository }: TeamServiceOptions) {
    this.blueprint = blueprint
    this.teamRepository = teamRepository
  }

  /**
   * List teams
   *
   * @param limit - The limit of teams to list
   */
  async list (limit: number = 10): Promise<Team[]> {
    return (await this.teamRepository.list(limit)).map(v => this.toTeam(v))
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
   * @param uuid - The phone number of the team to find
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
   */
  async create (team: Team): Promise<string | undefined> {
    const totalMember = this.blueprint.get<number>('app.team.defaultTotalMember', team.totalMember ?? 10)

    return await this.teamRepository.create({
      ...team,
      totalMember,
      countMember: 0,
      uuid: randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
  }

  /**
   * Update a team
   *
   * @param uuid - The uuid of the team to update
   * @param team - The team data to update
   * @returns The updated team
   */
  async update (uuid: string, team: Partial<Team>): Promise<Team> {
    const teamModel = await this.teamRepository.update(uuid, team)
    if (isNotEmpty<TeamModel>(teamModel)) return this.toTeam(teamModel)
    throw new NotFoundError(`Team with ID ${uuid} not found`)
  }

  /**
   * Delete a team
   *
   * @param uuid - The uuid of the team to delete
   */
  async delete (uuid: string): Promise<boolean> {
    return await this.teamRepository.delete(uuid)
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
   * @returns The converted team
   */
  toStatTeam (team: Team, withMembers: boolean = false): Partial<Team> {
    return {
      name: team.name,
      color: team.color,
      totalMember: team.totalMember,
      countMember: team.countMember,
      members: withMembers ? team.members : undefined,
    }
  }
}
