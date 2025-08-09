import { User } from '../models/User'
import { randomUUID } from 'node:crypto'
import { UserService } from './UserService'
import { NotFoundError } from '@stone-js/http-core'
import { SecurityService } from './SecurityService'
import { ListMetadataOptions } from '../models/App'
import { PRESENCE_EVENT_CATEGORY } from '../constants'
import { ActivityAssignment } from '../models/Activity'
import { IContainer, isNotEmpty, Service } from '@stone-js/core'
import { Team, TeamMember, TeamMemberModel } from '../models/Team'
import { ITeamRepository } from '../repositories/contracts/ITeamRepository'
import { IMissionRepository } from '../repositories/contracts/IMissionRepository'
import { IActivityRepository } from '../repositories/contracts/IActivityRepository'
import { ITeamMemberRepository } from '../repositories/contracts/ITeamMemberRepository'
import { IActivityAssignmentRepository } from '../repositories/contracts/IActivityAssignmentRepository'

/**
 * TeamMember Service Options
 */
export interface TeamMemberServiceOptions {
  userService: UserService
  teamRepository: ITeamRepository
  securityService: SecurityService
  missionRepository: IMissionRepository
  activityRepository: IActivityRepository
  teamMemberRepository: ITeamMemberRepository
  activityAssignmentRepository: IActivityAssignmentRepository
}

/**
 * TeamMember Service
 */
@Service({ alias: 'teamMemberService' })
export class TeamMemberService {
  private readonly userService: UserService
  private readonly teamRepository: ITeamRepository
  private readonly missionRepository: IMissionRepository
  private readonly activityRepository: IActivityRepository
  private readonly teamMemberRepository: ITeamMemberRepository
  private readonly activityAssignmentRepository: IActivityAssignmentRepository

  /**
   * Resolve route binding
   *
   * @param key - The key of the binding
   * @param value - The value of the binding
   * @param container - The container
   */
  static async resolveRouteBinding (key: string, value: any, container: IContainer): Promise<TeamMember | undefined> {
    const teamMemberService = container.resolve<TeamMemberService>('teamMemberService')
    return await teamMemberService.findBy({ [key]: value })
  }

  /**
   * Create a new TeamMember Service
   */
  constructor ({ teamMemberRepository, missionRepository, activityRepository, teamRepository, userService, activityAssignmentRepository }: TeamMemberServiceOptions) {
    this.userService = userService
    this.teamRepository = teamRepository
    this.missionRepository = missionRepository
    this.activityRepository = activityRepository
    this.teamMemberRepository = teamMemberRepository
    this.activityAssignmentRepository = activityAssignmentRepository
  }

  /**
   * List all team members
   */
  async list (limit: number = 10, page?: number | string): Promise<ListMetadataOptions<TeamMember>> {
    const result = await this.teamMemberRepository.list(limit, page)
    const items = await this.toTeamMembers(result.items)
    return { ...result, items }
  }

  /**
   * List team members by conditions
   */
  async listBy (conditions: Partial<TeamMemberModel>, limit: number = 10, page?: number | string): Promise<ListMetadataOptions<TeamMember>> {
    const result = await this.teamMemberRepository.listBy(conditions, limit, page)
    const items = await this.toTeamMembers(result.items)
    return { ...result, items }
  }

  /**
   * Find a team member
   *
   * @param conditions - The conditions to find the team member
   * @returns The found team member
   */
  async findBy (conditions: Record<string, any>): Promise<TeamMember> {
    const teamMemberModel = await this.teamMemberRepository.findBy(conditions)
    if (isNotEmpty<TeamMemberModel>(teamMemberModel)) return await this.toTeamMember(teamMemberModel)
    throw new NotFoundError(`The team member with conditions ${JSON.stringify(conditions)} not found`)
  }
  
  /**
   * Find a team member by UUID
   *
   * @param uuid - The uuid of the team member to find
   * @returns The found team member or undefined if not found
   */
  async findByUuid (uuid: string): Promise<TeamMember | undefined> {
    const teamMemberModel = await this.teamMemberRepository.findBy({ uuid })
    if (isNotEmpty<TeamMemberModel>(teamMemberModel)) return await this.toTeamMember(teamMemberModel)
  }

  /**
   * Add a user to a team
   *
   * @param name - The name of the team member
   * @param userUuid - The uuid of the user to add
   * @param teamUuid - The uuid of the team
   * @param missionUuid - The uuid of the mission
   * @param role - The role of the team member
   * @param author - The user who is adding the member
   * @returns The id of the created team member
   */
  async addMember (name: string, userUuid: string, teamUuid: string, missionUuid: string, role: 'member' | 'captain' | 'admin', author: User): Promise<string | undefined> {
    const result = await this.teamMemberRepository.create({
      name,
      role,
      userUuid,
      teamUuid,
      missionUuid,
      isLate: false,
      isActive: true,
      isPresent: false,
      uuid: randomUUID(),
      joinedAt: Date.now()
    }, author)

    await this.updateTeamMemberCount(teamUuid, true, author)

    return result
  }

  /**
   * Remove a member from a team (set as inactive and set leftAt)
   *
   * @param teamMember - The team member to remove
   * @param author - The user who is removing the member
   * @returns The updated team member
   */
  async removeMember (teamMember: TeamMember, author: User): Promise<TeamMember> {
    const updateData = {
      isActive: false,
      leftAt: Date.now()
    }

    const teamMemberModel = await this.teamMemberRepository.update(teamMember, updateData, author)
    
    await this.updateTeamMemberCount(teamMember.teamUuid, false, author)

    if (isNotEmpty<TeamMemberModel>(teamMemberModel)) return await this.toTeamMember(teamMemberModel)
    throw new NotFoundError(`Team member with ID ${teamMember.uuid} not found`)
  }

  /**
   * Update a team member's role
   *
   * @param teamMember - The team member to update
   * @param role - The new role
   * @param author - The user who is updating the role
   * @returns The updated team member
   */
  async updateRole (teamMember: TeamMember, role: 'member' | 'captain' | 'admin', author: User): Promise<TeamMember> {
    const teamMemberModel = await this.teamMemberRepository.update(teamMember, { role }, author)
    if (isNotEmpty<TeamMemberModel>(teamMemberModel)) return await this.toTeamMember(teamMemberModel)
    throw new NotFoundError(`Team member with ID ${teamMember.uuid} not found`)
  }

  /**
   * Reactivate a team member
   *
   * @param teamMember - The team member to reactivate
   * @param author - The user who is reactivating the member
   * @returns The updated team member
   */
  async reactivateMember (teamMember: TeamMember, author: User): Promise<TeamMember> {
    const updateData = {
      isActive: true,
      leftAt: undefined
    }

    const teamMemberModel = await this.teamMemberRepository.update(teamMember, updateData, author)
    if (isNotEmpty<TeamMemberModel>(teamMemberModel)) return await this.toTeamMember(teamMemberModel)
    throw new NotFoundError(`Team member with ID ${teamMember.uuid} not found`)
  }

  /**
   * Delete a team member permanently
   *
   * @param teamMember - The team member to delete
   * @returns True if the team member was deleted, false otherwise
   */
  async delete (teamMember: TeamMember, author: User): Promise<boolean> {
    return await this.teamMemberRepository.delete(teamMember, author)
  }

  /**
   * Get total team member count
   *
   * @returns The total count of team members
   */
  async count (): Promise<number> {
    return await this.teamMemberRepository.count()
  }

  /**
   * Check if team member is currently active
   *
   * @param teamMember - The team member to check
   * @returns True if active, false otherwise
   */
  isActive (teamMember: TeamMember): boolean {
    return teamMember.isActive && !teamMember.leftAt
  }

  /**
   * Update the team member count for a team
   *
   * @param teamUuid - The UUID of the team
   * @param increment - Whether to increment (true) or decrement (false) the count
   * @param author - The user performing the update
   */
  private updateTeamMemberCount = async (teamUuid: string, increment: boolean, author: User): Promise<void> => {
    const team = await this.teamRepository.findByUuid(teamUuid)
    if (isNotEmpty<Team>(team)) {
      const newCount = increment ? team.countMembers + 1 : Math.max(0, team.countMembers - 1)
      await this.teamRepository.update(team, { countMembers: newCount }, author)
    }
  }

  /**
   * Convert TeamMemberModel to TeamMember
   *
   * @param teamMemberModel - The team member model to convert
   * @returns The converted team member
   */
  async toTeamMember (teamMemberModel: TeamMemberModel): Promise<TeamMember> {
    const presence = await this.getTeamMemberPresence(teamMemberModel)
    const user = await this.userService.findByUuid(teamMemberModel.userUuid)
    const team = await this.teamRepository.findByUuid(teamMemberModel.teamUuid)

    return {
      ...teamMemberModel,
      ...presence,
      user,
      team,
    }
  }

  /**
   * Convert an array of TeamMemberModel to TeamMember
   * 
   * @param teamMemberModel - The array of team member models to convert
   * @returns The converted array of team members
   */
  async toTeamMembers (teamMemberModel: TeamMemberModel[]): Promise<TeamMember[]> {
    const userMeta = await this.userService.list(1000)
    const teamMeta = await this.teamRepository.list(1000)
    const result: TeamMember[] = []

    for (const member of teamMemberModel) {
      const presence = await this.getTeamMemberPresence(member)
      const user = userMeta.items.find(user => user.uuid === member.userUuid)
      const team = teamMeta.items.find(team => team.uuid === member.teamUuid)
      result.push({
        ...member,
        ...presence,
        team,
        user,
      })
    }

    return result
  }

  /**
   * Get the presence status of a team member
   *
   * @param teamMember - The team member to check
   * @returns An object containing presence and lateness status
   */
  private async getTeamMemberPresence (teamMember: TeamMember): Promise<{ isPresent: boolean, isLate: boolean }> {
    const activity = await this.activityRepository.findBy({
      category: PRESENCE_EVENT_CATEGORY,
      missionUuid: teamMember.missionUuid
    })
    const mission = await this.missionRepository.findByUuid(teamMember.missionUuid)
    const activityAssignment = (await this.activityAssignmentRepository.listBy({
      activityUuid: activity?.uuid,
      teamUuid: teamMember.teamUuid,
      teamMemberUuid: teamMember.uuid,
      missionUuid: teamMember.missionUuid,
    })).items.find(v => v.status === 'approved')

    if (isNotEmpty<ActivityAssignment>(activityAssignment)) {
      return {
        isPresent: true,
        isLate: activityAssignment.createdAt > (mission?.startDate ?? 0) ? true : false
      }
    }

    return {
      isLate: true,
      isPresent: false,
    }
  }
}