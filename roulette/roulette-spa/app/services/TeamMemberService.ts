import { Service } from '@stone-js/core'
import { ListMetadataOptions } from '../models/App'
import { TeamMember, TeamMemberRole } from '../models/Team'
import { TeamMemberClient } from '../clients/TeamMemberClient'

/**
 * Team Member Service Options
 */
export interface TeamMemberServiceOptions {
  teamMemberClient: TeamMemberClient
}

/**
 * Team Member Service
 */
@Service({ alias: 'teamMemberService' })
export class TeamMemberService {
  private readonly client: TeamMemberClient

  /**
   * Create a new Team Member Service
   *
   * @param options - The options to create the Team Member Service
   */
  constructor ({ teamMemberClient }: TeamMemberServiceOptions) {
    this.client = teamMemberClient
  }

  /**
   * List all team members (admin only)
   *
   * @param options - Filter options
   * @param limit - The maximum number of team members to return
   * @param page - The page number
   * @returns The list of team members with metadata
   */
  async list (options: Partial<TeamMember> = {}, limit: number = 10, page?: string | number): Promise<ListMetadataOptions<TeamMember>> {
    return await this.client.list(options, limit, page)
  }

  /**
   * List team members by team
   *
   * @param teamUuid - The UUID of the team
   * @param limit - The maximum number of team members to return
   * @param page - The page number
   * @returns The list of team members with metadata
   */
  async listByTeam (teamUuid: string, limit: number = 10, page?: string | number): Promise<ListMetadataOptions<TeamMember>> {
    return await this.client.listByTeam(teamUuid, limit, page)
  }

  /**
   * List team members by current user
   *
   * @param missionUuid - The UUID of the mission (optional)
   * @param limit - The maximum number of team members to return
   * @param page - The page number
   * @returns The list of team members with metadata
   */
  async listByCurrentUser (missionUuid?: string, limit: number = 10, page?: string | number): Promise<ListMetadataOptions<TeamMember>> {
    return await this.client.listByCurrentUser(missionUuid, limit, page)
  }

  /**
   * Get team member by user
   *
   * @param userUuid - The UUID of the user
   * @param missionUuid - The UUID of the mission (optional)
   * @returns The team member
   */
  async getByUser (userUuid: string, missionUuid?: string): Promise<TeamMember> {
    return await this.client.getByUser(userUuid, missionUuid)
  }

  /**
   * Get a team member by uuid
   *
   * @param uuid - The UUID of the team member
   * @returns The team member
   */
  async get (uuid: string): Promise<TeamMember> {
    return await this.client.get(uuid)
  }

  /**
   * Add a member to a team (captain/admin only)
   *
   * @param data - The team member data to create
   * @returns The created team member
   */
  async addMember (data: Partial<TeamMember>): Promise<TeamMember> {
    return await this.client.addMember(data)
  }

  /**
   * Update team member role (admin only)
   *
   * @param uuid - The UUID of the team member
   * @param role - The new role for the team member
   * @returns The updated team member
   */
  async updateRole (uuid: string, role: TeamMemberRole): Promise<TeamMember> {
    return await this.client.updateRole(uuid, role)
  }

  /**
   * Delete team member permanently (admin only)
   *
   * @param uuid - The UUID of the team member
   * @returns The response with status code
   */
  async delete (uuid: string): Promise<{ statusCode: number }> {
    return await this.client.delete(uuid)
  }

  /**
   * Check if user is team member
   *
   * @param userUuid - The UUID of the user
   * @param teamUuid - The UUID of the team
   * @returns Whether the user is a member of the team
   */
  async isTeamMember (userUuid: string, teamUuid: string): Promise<boolean> {
    try {
      const teamMember = await this.client.getByUser(userUuid)
      return teamMember.teamUuid === teamUuid && teamMember.isActive
    } catch (error) {
      return false
    }
  }

  /**
   * Check if user has captain role or higher
   *
   * @param userUuid - The UUID of the user
   * @param teamUuid - The UUID of the team (optional)
   * @returns Whether the user has captain role or higher
   */
  async hasCapitainRole (userUuid: string, teamUuid?: string): Promise<boolean> {
    try {
      const teamMember = await this.client.getByUser(userUuid)
      if (teamUuid && teamMember.teamUuid !== teamUuid) {
        return false
      }
      return teamMember.isActive && (teamMember.role === 'captain' || teamMember.role === 'admin')
    } catch (error) {
      return false
    }
  }

  /**
   * Get team members count by team
   *
   * @param teamUuid - The UUID of the team
   * @returns The count of active team members
   */
  async getTeamMembersCount (teamUuid: string): Promise<number> {
    try {
      const result = await this.client.listByTeam(teamUuid, 1)
      return result.total ?? 0
    } catch (error) {
      return 0
    }
  }
}
