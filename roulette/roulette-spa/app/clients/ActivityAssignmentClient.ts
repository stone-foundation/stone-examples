import { Team } from '../models/Team'
import { AxiosClient } from './AxiosClient'
import { IBlueprint, Stone } from '@stone-js/core'
import { ListMetadataOptions } from '../models/App'
import { ActivityAssignment, TeamsStats } from '../models/Activity'

/**
 * Activity Assignment Client Options
 */
export interface ActivityAssignmentClientOptions {
  blueprint: IBlueprint
  httpClient: AxiosClient
}

/**
 * Activity Assignment Client
 */
@Stone({ alias: 'activityAssignmentClient' })
export class ActivityAssignmentClient {
  private readonly path: string
  private readonly client: AxiosClient

  constructor ({ blueprint, httpClient }: ActivityAssignmentClientOptions) {
    this.client = httpClient
    this.path = blueprint.get('app.clients.activityAssignment.path', '/activity-assignments')
  }

  /**
   * List all assignments
   */
  async list (options: Partial<ActivityAssignment> = {}, limit: number = 10, page?: string | number): Promise<ListMetadataOptions<ActivityAssignment>> {
    const query = new URLSearchParams({
      limit: String(limit),
      ...(page && { page: String(page) }),
      ...(options.missionUuid && { missionUuid: options.missionUuid })
    })
    
    return await this.client.get<ListMetadataOptions<ActivityAssignment>>(`${this.path}/?${query.toString()}`)
  }

  /**
   * List all assignments by team
   */
  async listByTeam (team: Team, limit: number = 10, page?: string): Promise<ListMetadataOptions<ActivityAssignment>> {
    const query = new URLSearchParams({ limit: String(limit), ...(page ? { page } : {}) })
    return await this.client.get<ListMetadataOptions<ActivityAssignment>>(`${this.path}/teams/${team.uuid}?${query.toString()}`)
  }
  
  /**
   * Get the team stats
   *
   * @returns The team stats
   */
  async stats (teamName?: string): Promise<TeamsStats> {
    return await this.client.get(`${this.path}/stats/${teamName ?? ''}`)
  }

  /**
   * Get assignment by UUID
   */
  async get (uuid: string): Promise<ActivityAssignment> {
    return await this.client.get<ActivityAssignment>(`${this.path}/${uuid}`)
  }

  /**
   * Create a new assignment
   */
  async create (assignment: Partial<ActivityAssignment>): Promise<{ uuid?: string }> {
    return await this.client.post<{ uuid?: string }>(`${this.path}/`, assignment)
  }

  /**
   * Set presence for an activity assignment
   */
  async setPresence (assignment: Partial<ActivityAssignment>): Promise<{ uuid?: string }> {
    return await this.client.post<{ uuid?: string }>(`${this.path}/presence`, assignment)
  }

  /**
   * Update or validate assignment
   */
  async update (uuid: string, partial: Partial<ActivityAssignment>): Promise<ActivityAssignment> {
    return await this.client.patch<ActivityAssignment>(`${this.path}/${uuid}`, partial)
  }

  /**
   * Change assignment status
   */
  async changeStatus (uuid: string, status: string): Promise<ActivityAssignment> {
    return await this.client.patch<ActivityAssignment>(`${this.path}/${uuid}/status`, { status })
  }

  /**
   * Delete an assignment
   */
  async delete (uuid: string): Promise<void> {
    await this.client.delete(`${this.path}/${uuid}`)
  }

  /**
   * Get assignments by team
   */
  async getByTeam (teamUuid: string): Promise<ActivityAssignment[]> {
    return await this.client.get<ActivityAssignment[]>(`${this.path}/teams/${teamUuid}`)
  }

  /**
   * Get assignments by activity
   */
  async getByActivity (activityUuid: string): Promise<ActivityAssignment[]> {
    return await this.client.get<ActivityAssignment[]>(`${this.path}/activity/${activityUuid}`)
  }

  /**
   * Get assignments by status
   */
  async getByStatus (status: string): Promise<ActivityAssignment[]> {
    return await this.client.get<ActivityAssignment[]>(`${this.path}/status/${status}`)
  }
}
