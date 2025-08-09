import { AxiosClient } from './AxiosClient'
import { BadgeAssignment } from '../models/Badge'
import { IBlueprint, Stone } from '@stone-js/core'
import { ListMetadataOptions } from '../models/App'

/**
 * BadgeAssignment Client Options
 */
export interface BadgeAssignmentClientOptions {
  blueprint: IBlueprint
  httpClient: AxiosClient
}

/**
 * BadgeAssignment Client
 */
@Stone({ alias: 'badgeAssignmentClient' })
export class BadgeAssignmentClient {
  private readonly path: string
  private readonly client: AxiosClient

  constructor ({ blueprint, httpClient }: BadgeAssignmentClientOptions) {
    this.client = httpClient
    this.path = blueprint.get('app.clients.badgeAssignment.path', '/badge-assignments')
  }
  
  /**
   * List all badge assignments
   */
  async list (options: Partial<BadgeAssignment> = {}, limit: number = 10, page?: string | number): Promise<ListMetadataOptions<BadgeAssignment>> {
    const query = new URLSearchParams({
      limit: String(limit),
      ...(page && { page: String(page) }),
      ...(options.missionUuid && { missionUuid: options.missionUuid })
    })

    return await this.client.get<ListMetadataOptions<BadgeAssignment>>(`${this.path}/?${query.toString()}`)
  }

  /**
   * Get one assignment by UUID
   */
  async get (uuid: string): Promise<BadgeAssignment> {
    return await this.client.get<BadgeAssignment>(`${this.path}/${uuid}`)
  }

  /**
   * Assign badge to a member
   */
  async assignToMember (badgeUuid: string, teamUuid: string, memberUuid: string): Promise<{ uuid?: string }> {
    return await this.client.post<{ uuid?: string }>(`${this.path}/assign-member`, {
      badgeUuid,
      teamUuid,
      memberUuid
    })
  }

  /**
   * Assign badge to a team
   */
  async assignToTeam (badgeUuid: string, teamUuid: string): Promise<{ uuid?: string }> {
    return await this.client.post<{ uuid?: string }>(`${this.path}/assign-team`, {
      badgeUuid,
      teamUuid
    })
  }

  /**
   * Get all assignments for a member
   */
  async getAssignmentsForMember (uuid: string): Promise<BadgeAssignment[]> {
    return await this.client.get<BadgeAssignment[]>(`${this.path}/member/${uuid}`)
  }

  /**
   * Get all assignments for a team
   */
  async getAssignmentsForTeam (uuid: string): Promise<BadgeAssignment[]> {
    return await this.client.get<BadgeAssignment[]>(`${this.path}/teams/${uuid}`)
  }

  /**
   * Get all assignments for a badge
   */
  async getAssignmentsForBadge (uuid: string): Promise<BadgeAssignment[]> {
    return await this.client.get<BadgeAssignment[]>(`${this.path}/badge/${uuid}`)
  }

  /**
   * Unassign a badge assignment by UUID
   */
  async unassign (uuid: string): Promise<void> {
    await this.client.delete(`${this.path}/${uuid}`)
  }

  /**
   * Unassign all badge assignments for a badge
   */
  async unassignAllFromBadge (badgeUuid: string): Promise<{ removed: number }> {
    return await this.client.delete<{ removed: number }>(`${this.path}/badge/${badgeUuid}`)
  }
}
