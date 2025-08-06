import { User } from '../models/User'
import { randomUUID } from 'node:crypto'
import { NotFoundError } from '@stone-js/http-core'
import { ListMetadataOptions } from '../models/App'
import { IContainer, isNotEmpty, Service } from '@stone-js/core'
import { Team, TeamMember, TeamMemberModel } from '../models/Team'
import { ITeamMemberRepository } from '../repositories/contracts/ITeamMemberRepository'

/**
 * TeamMember Service Options
 */
export interface TeamMemberServiceOptions {
  teamMemberRepository: ITeamMemberRepository
}

/**
 * TeamMember Service
 */
@Service({ alias: 'teamMemberService' })
export class TeamMemberService {
  private readonly teamMemberRepository: ITeamMemberRepository

  /**
   * Resolve route binding
   *
   * @param key - The key of the binding
   * @param value - The value of the binding
   * @param container - The container
   */
  static async resolveRouteBinding (key: string, value: any, container: IContainer): Promise<TeamMember | undefined> {
    const teamMemberService = container.resolve<TeamMemberService>('teamMemberService')
    return await teamMemberService.findBy({ [key]: value })
  }

  /**
   * Create a new TeamMember Service
   */
  constructor ({ teamMemberRepository }: TeamMemberServiceOptions) {
    this.teamMemberRepository = teamMemberRepository
  }

  /**
   * List all team members
   */
  async list (limit: number = 10, page?: number | string): Promise<ListMetadataOptions<TeamMember>> {
    const result = await this.teamMemberRepository.list(limit, page)
    const items = result.items.map(v => this.toTeamMember(v))
    return { ...result, items }
  }

  /**
   * List team members by conditions
   */
  async listBy (conditions: Partial<TeamMemberModel>, limit: number = 10, page?: number | string): Promise<ListMetadataOptions<TeamMember>> {
    const result = await this.teamMemberRepository.listBy(conditions, limit, page)
    const items = result.items.map(v => this.toTeamMember(v))
    return { ...result, items }
  }

  /**
   * Find a team member
   *
   * @param conditions - The conditions to find the team member
   * @returns The found team member
   */
  async findBy (conditions: Record<string, any>): Promise<TeamMember> {
    const teamMemberModel = await this.teamMemberRepository.findBy(conditions)
    if (isNotEmpty<TeamMemberModel>(teamMemberModel)) return this.toTeamMember(teamMemberModel)
    throw new NotFoundError(`The team member with conditions ${JSON.stringify(conditions)} not found`)
  }
  
  /**
   * Find a team member by UUID
   *
   * @param uuid - The uuid of the team member to find
   * @returns The found team member or undefined if not found
   */
  async findByUuid (uuid: string): Promise<TeamMember | undefined> {
    const teamMemberModel = await this.teamMemberRepository.findBy({ uuid })
    if (isNotEmpty<TeamMemberModel>(teamMemberModel)) return this.toTeamMember(teamMemberModel)
  }

  /**
   * Add a user to a team
   *
   * @param userUuid - The uuid of the user to add
   * @param teamUuid - The uuid of the team
   * @param missionUuid - The uuid of the mission
   * @param role - The role of the team member
   * @param author - The user who is adding the member
   * @returns The id of the created team member
   */
  async addMember (userUuid: string, teamUuid: string, missionUuid: string, role: 'member' | 'captain' | 'admin', author: User): Promise<string | undefined> {
    return await this.teamMemberRepository.create({
      role,
      userUuid,
      teamUuid,
      missionUuid,
      isActive: true,
      uuid: randomUUID(),
      joinedAt: Date.now()
    }, author)
  }

  /**
   * Remove a member from a team (set as inactive and set leftAt)
   *
   * @param teamMember - The team member to remove
   * @param author - The user who is removing the member
   * @returns The updated team member
   */
  async removeMember (teamMember: TeamMember, author: User): Promise<TeamMember> {
    const updateData = {
      isActive: false,
      leftAt: Date.now()
    }

    const teamMemberModel = await this.teamMemberRepository.update(teamMember, updateData, author)
    if (isNotEmpty<TeamMemberModel>(teamMemberModel)) return this.toTeamMember(teamMemberModel)
    throw new NotFoundError(`Team member with ID ${teamMember.uuid} not found`)
  }

  /**
   * Update a team member's role
   *
   * @param teamMember - The team member to update
   * @param role - The new role
   * @param author - The user who is updating the role
   * @returns The updated team member
   */
  async updateRole (teamMember: TeamMember, role: 'member' | 'captain' | 'admin', author: User): Promise<TeamMember> {
    const teamMemberModel = await this.teamMemberRepository.update(teamMember, { role }, author)
    if (isNotEmpty<TeamMemberModel>(teamMemberModel)) return this.toTeamMember(teamMemberModel)
    throw new NotFoundError(`Team member with ID ${teamMember.uuid} not found`)
  }

  /**
   * Reactivate a team member
   *
   * @param teamMember - The team member to reactivate
   * @param author - The user who is reactivating the member
   * @returns The updated team member
   */
  async reactivateMember (teamMember: TeamMember, author: User): Promise<TeamMember> {
    const updateData = {
      isActive: true,
      leftAt: undefined
    }

    const teamMemberModel = await this.teamMemberRepository.update(teamMember, updateData, author)
    if (isNotEmpty<TeamMemberModel>(teamMemberModel)) return this.toTeamMember(teamMemberModel)
    throw new NotFoundError(`Team member with ID ${teamMember.uuid} not found`)
  }

  /**
   * Delete a team member permanently
   *
   * @param teamMember - The team member to delete
   * @returns True if the team member was deleted, false otherwise
   */
  async delete (teamMember: TeamMember, author: User): Promise<boolean> {
    return await this.teamMemberRepository.delete(teamMember, author)
  }

  /**
   * Get total team member count
   *
   * @returns The total count of team members
   */
  async count (): Promise<number> {
    return await this.teamMemberRepository.count()
  }

  /**
   * Check if team member is currently active
   *
   * @param teamMember - The team member to check
   * @returns True if active, false otherwise
   */
  isActive (teamMember: TeamMember): boolean {
    return teamMember.isActive && !teamMember.leftAt
  }

  /**
   * Convert TeamMemberModel to TeamMember
   *
   * @param teamMemberModel - The team member model to convert
   * @returns The converted team member
   */
  toTeamMember (teamMemberModel: TeamMemberModel, user: User, team: Team): TeamMember {
    return { ...teamMemberModel, user, team }
  }
}