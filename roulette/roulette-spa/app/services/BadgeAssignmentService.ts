import { Service } from '@stone-js/core'
import { BadgeAssignment } from '../models/Badge'
import { ListMetadataOptions } from '../models/App'
import { BadgeAssignmentClient } from '../clients/BadgeAssignmentClient'

/**
 * BadgeAssignment Service Options
 */
export interface BadgeAssignmentServiceOptions {
  badgeAssignmentClient: BadgeAssignmentClient
}

/**
 * BadgeAssignment Service
 */
@Service({ alias: 'badgeAssignmentService' })
export class BadgeAssignmentService {
  private readonly client: BadgeAssignmentClient

  /**
   * Create a new BadgeAssignmentService
   */
  constructor ({ badgeAssignmentClient }: BadgeAssignmentServiceOptions) {
    this.client = badgeAssignmentClient
  }

  /**
   * List all assignments
   */
  async list (limit?: number, page?: string): Promise<ListMetadataOptions<BadgeAssignment>> {
    return await this.client.list(limit, page)
  }

  /**
   * Assign a badge to a member
   */
  async assignToMember (
    badgeUuid: string,
    teamUuid: string,
    memberUuid: string
  ): Promise<{ uuid?: string }> {
    return await this.client.assignToMember(badgeUuid, teamUuid, memberUuid)
  }

  /**
   * Assign a badge to a team
   */
  async assignToTeam (
    badgeUuid: string,
    teamUuid: string
  ): Promise<{ uuid?: string }> {
    return await this.client.assignToTeam(badgeUuid, teamUuid)
  }

  /**
   * Get assignments for a member
   */
  async getAssignmentsForMember (uuid: string): Promise<BadgeAssignment[]> {
    return await this.client.getAssignmentsForMember(uuid)
  }

  /**
   * Get assignments for a team
   */
  async getAssignmentsForTeam (uuid: string): Promise<BadgeAssignment[]> {
    return await this.client.getAssignmentsForTeam(uuid)
  }

  /**
   * Get assignments for a badge
   */
  async getAssignmentsForBadge (uuid: string): Promise<BadgeAssignment[]> {
    return await this.client.getAssignmentsForBadge(uuid)
  }

  /**
   * Delete an assignment
   */
  async unassign (assignment: BadgeAssignment): Promise<void> {
    return await this.client.unassign(assignment.uuid)
  }

  /**
   * Unassign all assignments for a badge
   */
  async unassignAllFromBadge (badgeUuid: string): Promise<{ removed: number }> {
    return await this.client.unassignAllFromBadge(badgeUuid)
  }
}
