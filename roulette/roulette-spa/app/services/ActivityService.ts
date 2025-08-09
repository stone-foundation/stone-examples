import { Service } from '@stone-js/core'
import { Activity } from '../models/Activity'
import { ListMetadataOptions } from '../models/App'
import { ActivityClient } from '../clients/ActivityClient'

/**
 * Activity Service Options
 */
export interface ActivityServiceOptions {
  activityClient: ActivityClient
}

/**
 * Activity Service
 */
@Service({ alias: 'activityService' })
export class ActivityService {
  private readonly client: ActivityClient

  /**
   * Create a new ActivityService
   */
  constructor ({ activityClient }: ActivityServiceOptions) {
    this.client = activityClient
  }

  /**
   * List all activities
   */
  async list (options: Partial<Activity> = {}, limit: number = 10, page?: string | number): Promise<ListMetadataOptions<Activity>> {
    return await this.client.list(options, limit, page)
  }

  /**
   * Get an activity by UUID
   */
  async get (uuid: string): Promise<Activity> {
    return await this.client.get(uuid)
  }

  /**
   * Create an activity
   */
  async create (activity: Partial<Activity>): Promise<{ uuid?: string }> {
    return await this.client.create(activity)
  }

  /**
   * Update an activity
   */
  async update (activity: Activity, partial: Partial<Activity>): Promise<Activity> {
    return await this.client.update(activity.uuid, partial)
  }

  /**
   * Delete an activity
   */
  async delete (activity: Activity): Promise<void> {
    return await this.client.delete(activity.uuid)
  }
}
