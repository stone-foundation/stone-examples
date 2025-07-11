import { ActivityModel } from "../../models/Activity"
import { ListMetadataOptions } from "../../models/App"

/**
 * Activity Repository contract
 */
export interface IActivityRepository {
  /**
   * List all activity models
   *
   * @param limit - Max number of activities
   * @param page - Pagination cursor or index
   */
  list: (limit?: number, page?: number | string) => Promise<ListMetadataOptions<ActivityModel>>

  /**
   * List activity models filtered by conditions
   *
   * @param conditions - Fields to match
   * @param limit - Max number of results
   * @param page - Pagination cursor or index
   */
  listBy: (
    conditions: Partial<ActivityModel>,
    limit?: number,
    page?: number | string
  ) => Promise<ListMetadataOptions<ActivityModel>>

  /**
   * Find one activity model by UUID
   *
   * @param uuid - UUID of the activity
   */
  findByUuid: (uuid: string) => Promise<ActivityModel | undefined>

  /**
   * Find one activity model by conditions
   *
   * @param conditions - Fields to match
   */
  findBy: (conditions: Partial<ActivityModel>) => Promise<ActivityModel | undefined>

  /**
   * Create a new activity model
   *
   * @param activity - Activity to persist
   * @returns UUID of created activity
   */
  create: (activity: ActivityModel) => Promise<string | undefined>

  /**
   * Update an existing activity
   *
   * @param activity - Existing activity
   * @param data - Fields to update
   * @returns Updated activity
   */
  update: (activity: ActivityModel, data: Partial<ActivityModel>) => Promise<ActivityModel | undefined>

  /**
   * Delete an activity model
   *
   * @param activity - Activity to delete
   * @returns True if deleted
   */
  delete: (activity: ActivityModel) => Promise<boolean>

  /**
   * Get total count of activities (from metadata)
   */
  count: () => Promise<number>
}
