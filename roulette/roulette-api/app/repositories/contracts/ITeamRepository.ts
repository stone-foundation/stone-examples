import { TeamModel } from '../../models/Team'

/**
 * Team Repository contract
 */
export interface ITeamRepository {
  /**
   * List teams
   *
   * @param limit - The limit of teams to list
   * @returns The list of teams
   */
  list: (limit: number) => Promise<TeamModel[]>

  /**
   * Find a team by uuid
   *
   * @param uuid - The uuid of the team to find
   * @returns The team or undefined if not found
   */
  findByUuid: (uuid: string) => Promise<TeamModel | undefined>

  /**
   * Find a team by dynamic conditions
   *
   * @param conditions - Conditions to match the team
   * @returns The team or undefined if not found
   */
  findBy: (conditions: Partial<TeamModel>) => Promise<TeamModel | undefined>

  /**
   * Create a team
   *
   * @param team - The team to create
   * @returns The uuid of the created team
   */
  create: (team: TeamModel) => Promise<string | undefined>

  /**
   * Update a team
   *
   * @param team - The team to update
   * @param data - The data to update in the team
   * @returns The updated team or undefined if not found
   */
  update: (team: TeamModel, data: Partial<TeamModel>) => Promise<TeamModel | undefined>

  /**
   * Delete a team
   *
   * @param team - The team to delete
   * @returns `true` if the team was deleted, `false` if not
   */
  delete: (team: TeamModel) => Promise<boolean>
}
