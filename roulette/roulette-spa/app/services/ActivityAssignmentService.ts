import { Team } from '../models/Team'
import { Service } from '@stone-js/core'
import { ListMetadataOptions } from '../models/App'
import { ActivityAssignment, TeamsStats } from '../models/Activity'
import { ActivityAssignmentClient } from '../clients/ActivityAssignmentClient'

/**
 * Activity Assignment Service Options
 */
export interface ActivityAssignmentServiceOptions {
  activityAssignmentClient: ActivityAssignmentClient
}

/**
 * Activity Assignment Service
 */
@Service({ alias: 'activityAssignmentService' })
export class ActivityAssignmentService {
  private statsCache?: TeamsStats
  private readonly client: ActivityAssignmentClient

  /**
   * Create a new ActivityAssignmentService
   */
  constructor ({ activityAssignmentClient }: ActivityAssignmentServiceOptions) {
    this.client = activityAssignmentClient
  }

  /**
   * List all activity assignments
   */
  async list (options: Partial<ActivityAssignment> = {}, limit: number = 10, page?: string | number): Promise<ListMetadataOptions<ActivityAssignment>> {
    return await this.client.list(options, limit, page)
  }

  /**
   * List all activity assignments by team
   */
  async listByTeam (team: Team, limit?: number, page?: string): Promise<ListMetadataOptions<ActivityAssignment>> {
    return await this.client.listByTeam(team, limit, page)
  }

  /**
   * Get a single assignment by UUID
   */
  async get (uuid: string): Promise<ActivityAssignment> {
    return await this.client.get(uuid)
  }
  
  /**
   * Stats of the team
   *
   * @returns The stats of the team
   */
  async stats (options: { teamName?: string, missionUuid: string }): Promise<TeamsStats> {
    this.statsCache ??= await this.client.stats(options)
    return this.statsCache
  }

  /**
   * Create a new activity assignment
   */
  async create (assignment: Partial<ActivityAssignment>): Promise<{ uuid?: string }> {
    return await this.client.create(assignment)
  }

  /**
   * Set presence for an activity assignment
   */
  async setPresence (assignment: Partial<ActivityAssignment>): Promise<{ uuid?: string }> {
    return await this.client.setPresence(assignment)
  }

  /**
   * Update or validate an activity assignment
   */
  async update (uuid: string, partial: Partial<ActivityAssignment>): Promise<ActivityAssignment> {
    return await this.client.update(uuid, partial)
  }

  /**
   * Change the status of an assignment
   */
  async changeStatus (uuid: string, status: string): Promise<ActivityAssignment> {
    return await this.client.changeStatus(uuid, status)
  }

  /**
   * Delete an activity assignment
   */
  async delete (uuid: string): Promise<void> {
    return await this.client.delete(uuid)
  }

  /**
   * Get assignments for a team
   */
  async getAssignmentsForTeam (teamUuid: string): Promise<ActivityAssignment[]> {
    return await this.client.getByTeam(teamUuid)
  }

  /**
   * Get assignments for an activity
   */
  async getAssignmentsForActivity (activityUuid: string): Promise<ActivityAssignment[]> {
    return await this.client.getByActivity(activityUuid)
  }

  /**
   * Get assignments by status
   */
  async getAssignmentsByStatus (status: string): Promise<ActivityAssignment[]> {
    return await this.client.getByStatus(status)
  }
}
