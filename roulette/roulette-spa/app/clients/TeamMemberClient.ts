import { AxiosClient } from './AxiosClient'
import { IBlueprint, Stone } from '@stone-js/core'
import { ListMetadataOptions } from '../models/App'
import { TeamMember, TeamMemberRole } from '../models/Team'

/**
 * Team Member Client Options
 */
export interface TeamMemberClientOptions {
  blueprint: IBlueprint
  httpClient: AxiosClient
}

/**
 * Team Member Client
 */
@Stone({ alias: 'teamMemberClient' })
export class TeamMemberClient {
  private readonly path: string
  private readonly client: AxiosClient

  /**
   * Create a new Team Member Client
   *
   * @param options - The options to create the Team Member Client.
   */
  constructor ({ blueprint, httpClient }: TeamMemberClientOptions) {
    this.client = httpClient
    this.path = blueprint.get('app.clients.teamMember.path', '/team-members')
  }

  /**
   * List all team members
   *
   * @param options - Filter options
   * @param limit - The maximum number of team members to return
   * @param page - The page number
   * @returns The list of team members with metadata
   */
  async list (options: Partial<TeamMember> = {}, limit: number = 10, page?: string | number): Promise<ListMetadataOptions<TeamMember>> {
    const query = new URLSearchParams({
      limit: String(limit),
      ...(page && { page: String(page) }),
      ...(options.role && { role: options.role }),
      ...(options.teamUuid && { teamUuid: options.teamUuid }),
      ...(options.isActive !== undefined && { isActive: String(options.isActive) }),
      ...(options.missionUuid && { missionUuid: options.missionUuid })
    })
    
    return await this.client.get<ListMetadataOptions<TeamMember>>(`${this.path}/?${query.toString()}`)
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
    const query = new URLSearchParams({
      limit: String(limit),
      ...(page && { page: String(page) })
    })
    
    return await this.client.get<ListMetadataOptions<TeamMember>>(`${this.path}/teams/${teamUuid}?${query.toString()}`)
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
    const query = new URLSearchParams({
      limit: String(limit),
      ...(page && { page: String(page) }),
      ...(missionUuid && { missionUuid })
    })
    
    return await this.client.get<ListMetadataOptions<TeamMember>>(`${this.path}/users/me?${query.toString()}`)
  }

  /**
   * Get team member by user
   *
   * @param userUuid - The UUID of the user
   * @param missionUuid - The UUID of the mission (optional)
   * @returns The team member
   */
  async getByUser (userUuid: string, missionUuid?: string): Promise<TeamMember> {
    const query = new URLSearchParams({
      ...(missionUuid && { missionUuid })
    })
    
    const queryString = query.toString()
    const url = queryString ? `${this.path}/users/${userUuid}?${queryString}` : `${this.path}/users/${userUuid}`
    
    return await this.client.get<TeamMember>(url)
  }

  /**
   * Get a team member by uuid
   *
   * @param uuid - The UUID of the team member
   * @returns The team member
   */
  async get (uuid: string): Promise<TeamMember> {
    return await this.client.get<TeamMember>(`${this.path}/${uuid}`)
  }

  /**
   * Add a member to a team (captain/admin only)
   *
   * @param data - The team member data to create
   * @returns The created team member uuid
   */
  async addMember (data: Partial<TeamMember>): Promise<TeamMember> {
    return await this.client.post<TeamMember>(`${this.path}`, data)
  }

  /**
   * Update team member role (admin only)
   *
   * @param uuid - The UUID of the team member
   * @param role - The new role for the team member
   * @returns The updated team member
   */
  async updateRole (uuid: string, role: TeamMemberRole): Promise<TeamMember> {
    return await this.client.patch<TeamMember>(`${this.path}/${uuid}`, { role })
  }

  /**
   * Delete team member permanently (admin only)
   *
   * @param uuid - The UUID of the team member
   * @returns The response with status code
   */
  async delete (uuid: string): Promise<{ statusCode: number }> {
    return await this.client.delete<{ statusCode: number }>(`${this.path}/${uuid}`)
  }
}
