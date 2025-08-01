import { BadgeModel } from '../../models/Badge'
import { ListMetadataOptions } from '../../models/App'

/**
 * Badge Repository contract
 */
export interface IBadgeRepository {
  /**
   * List all badge models
   *
   * @param limit - Maximum number of badges to return
   * @returns List of badge models
   */
  list: (limit?: number, page?: number | string) => Promise<ListMetadataOptions<BadgeModel>>

  /**
   * List badge models by conditions
   *
   * @param conditions - Partial filter for badge model fields
   * @param limit - Max number of results
   * @returns Filtered badge models
   */
  listBy: (conditions: Partial<BadgeModel>, limit?: number, page?: number | string) => Promise<ListMetadataOptions<BadgeModel>>

  /**
   * Find a badge model by its UUID
   *
   * @param uuid - Badge UUID
   * @returns The badge model or undefined
   */
  findByUuid: (uuid: string) => Promise<BadgeModel | undefined>

  /**
   * Find a badge model by conditions
   *
   * @param conditions - Partial badge model fields
   * @returns The badge model or undefined
   */
  findBy: (conditions: Partial<BadgeModel>) => Promise<BadgeModel | undefined>

  /**
   * Create a badge model
   *
   * @param badge - Badge model to create
   * @returns UUID of the created badge
   */
  create: (badge: BadgeModel) => Promise<string | undefined>

  /**
   * Update a badge model
   *
   * @param badge - Existing badge model
   * @param data - Fields to update
   * @returns Updated badge model or undefined
   */
  update: (badge: BadgeModel, data: Partial<BadgeModel>) => Promise<BadgeModel | undefined>

  /**
   * Delete a badge model
   *
   * @param badge - Badge model to delete
   * @returns True if deleted, false otherwise
   */
  delete: (badge: BadgeModel) => Promise<boolean>

  /**
   * Get total badge count (from meta, not scan)
   */
  count: () => Promise<number>
}
