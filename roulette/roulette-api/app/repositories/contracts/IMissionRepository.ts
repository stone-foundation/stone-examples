import { User } from '../../models/User'
import { MissionModel } from '../../models/Mission'
import { ListMetadataOptions } from '../../models/App'

/**
 * Mission Repository contract
 */
export interface IMissionRepository {
  /**
   * List all mission models
   *
   * @param limit - Maximum number of missions to return
   * @returns List of mission models
   */
  list: (limit?: number, page?: number | string) => Promise<ListMetadataOptions<MissionModel>>

  /**
   * List mission models by conditions
   *
   * @param conditions - Partial filter for mission model fields
   * @param limit - Max number of results
   * @returns Filtered mission models
   */
  listBy: (conditions: Partial<MissionModel>, limit?: number, page?: number | string) => Promise<ListMetadataOptions<MissionModel>>

  /**
   * Find a mission model by its UUID
   *
   * @param uuid - Mission UUID
   * @returns The mission model or undefined
   */
  findByUuid: (uuid: string) => Promise<MissionModel | undefined>

  /**
   * Find a mission model by conditions
   *
   * @param conditions - Partial mission model fields
   * @returns The mission model or undefined
   */
  findBy: (conditions: Partial<MissionModel>) => Promise<MissionModel | undefined>

  /**
   * Create a mission model
   *
   * @param mission - Mission model to create
   * @param author - User creating the mission
   * @returns UUID of the created mission
   */
  create: (mission: MissionModel, author: User) => Promise<string | undefined>

  /**
   * Update a mission model
   *
   * @param mission - Existing mission model
   * @param data - Fields to update
   * @param author - User performing the update
   * @returns Updated mission model or undefined
   */
  update: (mission: MissionModel, data: Partial<MissionModel>, author: User) => Promise<MissionModel | undefined>

  /**
   * Delete a mission model
   *
   * @param mission - Mission model to delete
   * @param author - User performing the deletion
   * @returns True if deleted, false otherwise
   */
  delete: (mission: MissionModel, author: User) => Promise<boolean>

  /**
   * Get total mission count (from meta, not scan)
   */
  count: () => Promise<number>
}