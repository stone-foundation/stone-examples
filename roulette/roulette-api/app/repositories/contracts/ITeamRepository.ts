import { User } from '../../models/User'
import { TeamModel } from '../../models/Team'
import { ListMetadataOptions } from '../../models/App'

/**
 * Team Repository contract
 */
export interface ITeamRepository {
  /**
   * List all team models
   *
   * @param limit - Maximum number of teams to return
   * @param page - Page number for pagination
   * @returns List of team models
   */
  list: (limit?: number, page?: number | string) => Promise<ListMetadataOptions<TeamModel>>

  /**
   * List team models by conditions
   *
   * @param conditions - Partial filter for team model fields
   * @param limit - Max number of results
   * @param page - Page number for pagination
   * @returns Filtered team models
   */
  listBy: (conditions: Partial<TeamModel>, limit?: number, page?: number | string) => Promise<ListMetadataOptions<TeamModel>>

  /**
   * Find a team model by its UUID
   *
   * @param uuid - Team UUID
   * @returns The team model or undefined
   */
  findByUuid: (uuid: string) => Promise<TeamModel | undefined>

  /**
   * Find a team model by conditions
   *
   * @param conditions - Partial team model fields
   * @returns The team model or undefined
   */
  findBy: (conditions: Partial<TeamModel>) => Promise<TeamModel | undefined>

  /**
   * Create a team model
   *
   * @param team - Team model to create
   * @param author - User creating the team
   * @returns UUID of the created team
   */
  create: (team: TeamModel, author: User) => Promise<string | undefined>

  /**
   * Update a team model
   *
   * @param team - Existing team model
   * @param data - Fields to update
   * @param author - User performing the update
   * @returns Updated team model or undefined
   */
  update: (team: TeamModel, data: Partial<TeamModel>, author: User) => Promise<TeamModel | undefined>

  /**
   * Delete a team model
   *
   * @param team - Team model to delete
   * @param author - User performing the deletion
   * @returns True if deleted, false otherwise
   */
  delete: (team: TeamModel, author: User) => Promise<boolean>

  /**
   * Get total team count (from meta, not scan)
   */
  count: () => Promise<number>
}