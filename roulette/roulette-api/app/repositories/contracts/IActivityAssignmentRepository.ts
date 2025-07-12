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
   * @returns UUID of the new assignment
   */
  create: (assignment: ActivityAssignmentModel) => Promise<string | undefined>

  /**
   * Update an assignment (status, validation, metadata)
   *
   * @param assignment - Existing assignment
   * @param data - Fields to update
   */
  update: (
    assignment: ActivityAssignmentModel,
    data: Partial<ActivityAssignmentModel>
  ) => Promise<ActivityAssignmentModel | undefined>

  /**
   * Delete an assignment (if invalid or contested)
   *
   * @param assignment - Assignment to delete
   */
  delete: (assignment: ActivityAssignmentModel) => Promise<boolean>

  /**
   * Count total assignments (meta)
   */
  count: () => Promise<number>
}
