import { User } from '../../models/User'
import { TeamMemberModel } from '../../models/Team'
import { ListMetadataOptions } from '../../models/App'

/**
 * TeamMember Repository contract
 */
export interface ITeamMemberRepository {
  /**
   * List all team member models
   *
   * @param limit - Maximum number of team members to return
   * @returns List of team member models
   */
  list: (limit?: number, page?: number | string) => Promise<ListMetadataOptions<TeamMemberModel>>

  /**
   * List team member models by conditions
   *
   * @param conditions - Partial filter for team member model fields
   * @param limit - Max number of results
   * @returns Filtered team member models
   */
  listBy: (conditions: Partial<TeamMemberModel>, limit?: number, page?: number | string) => Promise<ListMetadataOptions<TeamMemberModel>>

  /**
   * Find a team member model by its ID
   *
   * @param id - TeamMember ID
   * @returns The team member model or undefined
   */
  findById: (id: number) => Promise<TeamMemberModel | undefined>

  /**
   * Find a team member model by conditions
   *
   * @param conditions - Partial team member model fields
   * @returns The team member model or undefined
   */
  findBy: (conditions: Partial<TeamMemberModel>) => Promise<TeamMemberModel | undefined>

  /**
   * Create a team member model
   *
   * @param teamMember - TeamMember model to create
   * @param author - User creating the team member
   * @returns ID of the created team member
   */
  create: (teamMember: TeamMemberModel, author: User) => Promise<string | undefined>

  /**
   * Update a team member model
   *
   * @param teamMember - Existing team member model
   * @param data - Fields to update
   * @param author - User performing the update
   * @returns Updated team member model or undefined
   */
  update: (teamMember: TeamMemberModel, data: Partial<TeamMemberModel>, author: User) => Promise<TeamMemberModel | undefined>

  /**
   * Delete a team member model
   *
   * @param teamMember - TeamMember model to delete
   * @param author - User performing the deletion
   * @returns True if deleted, false otherwise
   */
  delete: (teamMember: TeamMemberModel, author: User) => Promise<boolean>

  /**
   * Get total team member count (from meta, not scan)
   */
  count: () => Promise<number>
}