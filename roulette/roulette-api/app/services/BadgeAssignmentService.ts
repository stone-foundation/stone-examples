import { randomUUID } from 'node:crypto'
import { TeamModel } from '../models/Team'
import { TeamService } from './TeamService'
import { UserService } from './UserService'
import { BadgeService } from './BadgeService'
import { User, UserModel } from '../models/User'
import { NotFoundError } from '@stone-js/http-core'
import { ListMetadataOptions } from '../models/App'
import { BadgeAssignment, BadgeAssignmentModel } from '../models/Badge'
import { isNotEmpty, Service, IContainer, isEmpty } from '@stone-js/core'
import { IBadgeAssignmentRepository } from '../repositories/contracts/IBadgeAssignmentRepository'

/**
 * Badge Assignment Service Options
 */
export interface BadgeAssignmentServiceOptions {
  teamService: TeamService
  userService: UserService
  badgeService: BadgeService
  badgeAssignmentRepository: IBadgeAssignmentRepository
}

/**
 * Badge Assignment Service
 */
@Service({ alias: 'badgeAssignmentService' })
export class BadgeAssignmentService {
  private readonly teamService: TeamService
  private readonly userService: UserService
  private readonly badgeService: BadgeService
  private readonly badgeAssignmentRepository: IBadgeAssignmentRepository

  constructor ({ teamService, userService, badgeService, badgeAssignmentRepository }: BadgeAssignmentServiceOptions) {
    this.teamService = teamService
    this.userService = userService
    this.badgeService = badgeService
    this.badgeAssignmentRepository = badgeAssignmentRepository
  }

  static async resolveRouteBinding (key: string, value: any, container: IContainer): Promise<BadgeAssignment | undefined> {
    const service = container.resolve<BadgeAssignmentService>('badgeAssignmentService')
    return await service.findBy({ [key]: value })
  }

  async list (limit: number = 10, page?: number | string): Promise<ListMetadataOptions<BadgeAssignment>> {
    const items = []
    const result = await this.badgeAssignmentRepository.list(limit, page)

    for (const model of result.items) {
      items.push(await this.toAssignment(model))
    }

    return { ...result, items }
  }

  async listBy (
    conditions: Partial<BadgeAssignmentModel>,
    limit: number = 10,
    page?: number | string
  ): Promise<ListMetadataOptions<BadgeAssignment>> {
    const items = []

    const result = await this.badgeAssignmentRepository.listBy(conditions, limit, page)

    for (const model of result.items) {
      items.push(await this.toAssignment(model))
    }

    return { ...result, items }
  }

  async findByUuid (uuid: string): Promise<BadgeAssignment | undefined> {
    const model = await this.badgeAssignmentRepository.findByUuid(uuid)
    if (isNotEmpty<BadgeAssignmentModel>(model)) return await this.toAssignment(model)
  }

  async findBy (conditions: Partial<BadgeAssignmentModel>): Promise<BadgeAssignment> {
    const model = await this.badgeAssignmentRepository.findBy(conditions)
    if (isNotEmpty<BadgeAssignmentModel>(model)) return await this.toAssignment(model)
    throw new NotFoundError(`Badge assignment not found with conditions: ${JSON.stringify(conditions)}`)
  }

  async assignToMember (badgeUuid: string, teamUuid: string, memberUuid: string, issuedBy: User): Promise<string | undefined> {
    return await this.create({ badgeUuid, teamUuid, memberUuid }, issuedBy)
  }

  async assignToTeam (badgeUuid: string, teamUuid: string, issuedBy: User): Promise<string | undefined> {
    return await this.create({ badgeUuid, teamUuid }, issuedBy)
  }

  async unassign (assignmentUuid: string): Promise<boolean> {
    const assignment = await this.findByUuid(assignmentUuid)
    if (assignment == null) return false
    return await this.delete(assignment)
  }

  async unassignAllFromBadge (badgeUuid?: string): Promise<number> {
    const assignments = await this.listBy({ badgeUuid })
    let count = 0
    for (const assignment of assignments.items) {
      if (await this.delete(assignment)) count++
    }
    return count
  }

  async getAssignmentsForMember (memberUuid?: string): Promise<BadgeAssignment[]> {
    const result = await this.listBy({ memberUuid })
    return result.items
  }

  async getAssignmentsForTeam (teamUuid?: string): Promise<BadgeAssignment[]> {
    const result = await this.listBy({ teamUuid })
    return result.items
  }

  async getAssignmentsForBadge (badgeUuid?: string): Promise<BadgeAssignment[]> {
    const result = await this.listBy({ badgeUuid })
    return result.items
  }

  async create (assignment: Partial<BadgeAssignment>, issuedBy: User): Promise<string | undefined> {
    const now = Date.now()
    return await this.badgeAssignmentRepository.create({
      ...assignment,
      issuedAt: now,
      revoked: false,
      uuid: randomUUID(),
      issuedByUuid: issuedBy.uuid
    } as BadgeAssignmentModel)
  }

  async createMany (assignments: BadgeAssignment[], issuedBy: User): Promise<Array<string | undefined>> {
    const uuids: Array<string | undefined> = []

    for (const assignment of assignments) {
      uuids.push(await this.create(assignment, issuedBy))
    }

    return uuids
  }

  async update (assignment: BadgeAssignment, data: Partial<BadgeAssignment>): Promise<BadgeAssignment> {
    data.issuedAt = Date.now()
    const model = await this.badgeAssignmentRepository.update(assignment, data)
    if (isNotEmpty<BadgeAssignmentModel>(model)) return await this.toAssignment(model)
    throw new NotFoundError(`BadgeAssignment with ID ${assignment.uuid} not found`)
  }

  async delete (assignment: BadgeAssignment): Promise<boolean> {
    return await this.badgeAssignmentRepository.delete(assignment)
  }

  async count (): Promise<number> {
    return await this.badgeAssignmentRepository.count()
  }

  async toAssignment (model: BadgeAssignmentModel): Promise<BadgeAssignment> {
    let team = model.teamUuid ? await this.teamService.findByUuid(model.teamUuid) : undefined
    let member = model.memberUuid ? await this.userService.findByUuid(model.memberUuid) : undefined
    const badge = model.badgeUuid ? await this.badgeService.findByUuid(model.badgeUuid) : undefined
    const issuedBy = model.issuedByUuid ? await this.userService.findByUuid(model.issuedByUuid) : undefined

    if (isEmpty(badge) || isEmpty(issuedBy)) return { ...model } as unknown as BadgeAssignment

    if (isNotEmpty<TeamModel>(team)) {
      team = this.teamService.toTeam(team)
    }

    if (isNotEmpty<UserModel>(member)) {
      member = this.userService.toUser(member)
    }

    return {
      ...model,
      team,
      member,
      issuedBy,
      badge: this.badgeService.toBadge(badge)
    }
  }
}
