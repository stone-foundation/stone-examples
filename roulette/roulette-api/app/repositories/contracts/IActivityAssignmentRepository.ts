import { User } from '../../models/User'
import { ListMetadataOptions } from '../../models/App'
import { ActivityAssignmentModel } from '../../models/Activity'

/**
 * Activity Assignment Repository contract
 */
export interface IActivityAssignmentRepository {
  /**
   * List all activity assignments
   *
   * @param limit - Max number of results
   * @param page - Pagination key or cursor
   */
  list: (limit?: number, page?: number | string) => Promise<ListMetadataOptions<ActivityAssignmentModel>>

  /**
   * List assignments filtered by conditions
   *
   * @param conditions - Fields to match
   * @param limit - Max results
   */
  listBy: (
    conditions: Partial<ActivityAssignmentModel>,
    limit?: number,
    page?: number | string
  ) => Promise<ListMetadataOptions<ActivityAssignmentModel>>

  /**
   * Find assignment by UUID
   *
   * @param uuid - UUID of the assignment
   */
  findByUuid: (uuid: string) => Promise<ActivityAssignmentModel | undefined>

  /**
   * Find one assignment by conditions
   *
   * @param conditions - Fields to match
   */
  findBy: (conditions: Partial<ActivityAssignmentModel>) => Promise<ActivityAssignmentModel | undefined>

  /**
   * Create a new assignment (manual or system)
   *
   * @param assignment - Assignment data
   * @param author - User creating the assignment
   * @returns UUID of the new assignment
   */
  create: (assignment: ActivityAssignmentModel, author: User) => Promise<string | undefined>

  /**
   * Update an assignment (status, validation, metadata)
   *
   * @param assignment - Existing assignment
   * @param data - Fields to update
   * @param author - User performing the update
   * @returns Updated assignment model
   */
  update: (
    assignment: ActivityAssignmentModel,
    data: Partial<ActivityAssignmentModel>,
    author: User
  ) => Promise<ActivityAssignmentModel | undefined>

  /**
   * Delete an assignment (if invalid or contested)
   *
   * @param assignment - Assignment to delete
   * @param author - User performing the deletion
   * @returns True if deleted, false if not found or not allowed
   */
  delete: (assignment: ActivityAssignmentModel, author: User) => Promise<boolean>

  /**
   * Count total assignments (meta)
   */
  count: () => Promise<number>
}
