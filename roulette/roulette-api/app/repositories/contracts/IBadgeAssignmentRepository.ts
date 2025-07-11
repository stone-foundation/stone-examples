import { ListMetadataOptions } from "../../models/App"
import { BadgeAssignmentModel } from "../../models/Badge"

/**
 * Badge Assignment Repository contract
 */
export interface IBadgeAssignmentRepository {
  /**
   * List all badge assignments with pagination
   *
   * @param limit - Max number of assignments
   * @param page - Page number or cursor
   * @returns List with metadata
   */
  list: (
    limit?: number,
    page?: number | string
  ) => Promise<ListMetadataOptions<BadgeAssignmentModel>>

  /**
   * List assignments by conditions
   *
   * @param conditions - Filter by partial fields
   * @param limit - Max number
   * @param page - Page number or cursor
   * @returns Filtered list with metadata
   */
  listBy: (
    conditions: Partial<BadgeAssignmentModel>,
    limit?: number,
    page?: number | string
  ) => Promise<ListMetadataOptions<BadgeAssignmentModel>>

  /**
   * Find an assignment by UUID
   *
   * @param uuid - Assignment UUID
   * @returns Assignment or undefined
   */
  findByUuid: (
    uuid: string
  ) => Promise<BadgeAssignmentModel | undefined>

  /**
   * Find one assignment by conditions
   *
   * @param conditions - Fields to match
   * @returns Assignment or undefined
   */
  findBy: (
    conditions: Partial<BadgeAssignmentModel>
  ) => Promise<BadgeAssignmentModel | undefined>

  /**
   * Create a badge assignment
   *
   * @param assignment - Assignment to create
   * @returns UUID of created assignment
   */
  create: (
    assignment: BadgeAssignmentModel
  ) => Promise<string | undefined>

  /**
   * Update a badge assignment
   *
   * @param assignment - Current assignment
   * @param data - Fields to update
   * @returns Updated assignment or undefined
   */
  update: (
    assignment: BadgeAssignmentModel,
    data: Partial<BadgeAssignmentModel>
  ) => Promise<BadgeAssignmentModel | undefined>

  /**
   * Delete a badge assignment
   *
   * @param assignment - Assignment to delete
   * @returns True if deleted, false otherwise
   */
  delete: (
    assignment: BadgeAssignmentModel
  ) => Promise<boolean>

  /**
   * Get total number of assignments (from meta)
   */
  count: () => Promise<number>
}
