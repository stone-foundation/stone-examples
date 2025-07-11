import { User } from '../models/User'
import { randomUUID } from 'node:crypto'
import { TeamService } from './TeamService'
import { UserService } from './UserService'
import { BadgeService } from './BadgeService'
import { ActivityService } from './ActivityService'
import { ListMetadataOptions } from '../models/App'
import { Service, IContainer, isNotEmpty } from '@stone-js/core'
import { NotFoundError, UnauthorizedError } from '@stone-js/http-core'
import { ActivityAssignmentModel, ActivityAssignment } from '../models/Activity'
import { IActivityAssignmentRepository } from '../repositories/contracts/IActivityAssignmentRepository'

export interface ActivityAssignmentServiceOptions {
  teamService: TeamService
  userService: UserService
  badgeService: BadgeService
  activityService: ActivityService
  activityAssignmentRepository: IActivityAssignmentRepository
}

@Service({ alias: 'activityAssignmentService' })
export class ActivityAssignmentService {
  private readonly teamService: TeamService
  private readonly userService: UserService
  private readonly badgeService: BadgeService
  private readonly activityService: ActivityService
  private readonly activityAssignmentRepository: IActivityAssignmentRepository

  constructor ({ teamService, badgeService, userService, activityService, activityAssignmentRepository }: ActivityAssignmentServiceOptions) {
    this.teamService = teamService
    this.userService = userService
    this.badgeService = badgeService
    this.activityService = activityService
    this.activityAssignmentRepository = activityAssignmentRepository
  }

  static async resolveRouteBinding (key: string, value: any, container: IContainer): Promise<ActivityAssignment | undefined> {
    const service = container.resolve<ActivityAssignmentService>('activityAssignmentService')
    return await service.findBy({ [key]: value })
  }

  async list (limit = 10, page?: number | string): Promise<ListMetadataOptions<ActivityAssignment>> {
    const result = await this.activityAssignmentRepository.list(limit, page)
    const items = await Promise.all(result.items.map(m => this.toAssignment(m)))
    return { ...result, items }
  }

  async listBy (conditions: Partial<ActivityAssignmentModel>, limit = 10, page?: number | string): Promise<ListMetadataOptions<ActivityAssignment>> {
    const result = await this.activityAssignmentRepository.listBy(conditions, limit, page)
    const items = await Promise.all(result.items.map(m => this.toAssignment(m)))
    return { ...result, items }
  }

  async findByUuid (uuid: string): Promise<ActivityAssignment | undefined> {
    const model = await this.activityAssignmentRepository.findByUuid(uuid)
    if (model) return this.toAssignment(model)
  }

  async findBy (conditions: Partial<ActivityAssignmentModel>): Promise<ActivityAssignment> {
    const model = await this.activityAssignmentRepository.findBy(conditions)
    if (!model) throw new NotFoundError(`Activity assignment not found with ${JSON.stringify(conditions)}`)
    return this.toAssignment(model)
  }

  async assignToMember (activityUuid: string, teamUuid: string, memberUuid: string, issuedBy: User): Promise<string | undefined> {
    return await this.create({ activityUuid, teamUuid, memberUuid }, issuedBy)
  }

  async assignToTeam (activityUuid: string, teamUuid: string, issuedBy: User): Promise<string | undefined> {
    return await this.create({ activityUuid, teamUuid }, issuedBy)
  }

  async create (assignment: Partial<ActivityAssignment>, issuedBy: User): Promise<string | undefined> {
    const now = Date.now()
    return await this.activityAssignmentRepository.create({
      ...assignment,
      issuedAt: now,
      uuid: randomUUID(),
      status: 'pending',
      issuedByUuid: issuedBy.uuid
    } as ActivityAssignmentModel)
  }

  async validate (assignment: ActivityAssignment, validator: User): Promise<ActivityAssignment> {
    assignment.status = 'approved'
    assignment.validatedAt = Date.now()
    assignment.validatedByUuid = validator.uuid
    return await this.update(assignment, assignment)
  }

  async contest (assignment: ActivityAssignment, user: User): Promise<ActivityAssignment> {
    if (assignment.teamUuid !== user.teamUuid) {
      throw new UnauthorizedError('Only the team member can contest this assignment')
    }

    assignment.status = 'contested'
    return await this.update(assignment, assignment)
  }

  async cancel (assignment: ActivityAssignment, actor: User): Promise<ActivityAssignment> {
    if (assignment.authorUuid !== actor.uuid) throw new UnauthorizedError('Only the issuer can cancel')
    assignment.status = 'cancelled'
    return await this.update(assignment, assignment)
  }

  async update (assignment: ActivityAssignment, data: Partial<ActivityAssignment>): Promise<ActivityAssignment> {
    data.issuedAt = Date.now()
    const model = await this.activityAssignmentRepository.update(assignment, data)
    if (isNotEmpty<ActivityAssignment>(model)) return this.toAssignment(model)
    throw new NotFoundError(`BadgeAssignment with ID ${assignment.uuid} not found`)
  }

  async delete (assignment: ActivityAssignment): Promise<boolean> {
    return await this.activityAssignmentRepository.delete(assignment)
  }

  async toAssignment (model: ActivityAssignmentModel): Promise<ActivityAssignment> {
    const team = model.teamUuid ? await this.teamService.findByUuid(model.teamUuid) : undefined
    const badge = model.badgeUuid ? await this.badgeService.findByUuid(model.badgeUuid) : undefined
    const member = model.memberUuid ? await this.userService.findByUuid(model.memberUuid) : undefined
    const issuedBy = model.authorUuid ? await this.userService.findByUuid(model.authorUuid) : undefined
    const activity = model.activityUuid ? await this.activityService.findByUuid(model.activityUuid) : undefined
    const validatedBy = model.validatedByUuid ? await this.userService.findByUuid(model.validatedByUuid) : undefined

    return {
      ...model,
      team,
      badge,
      member,
      activity,
      issuedBy,
      validatedBy
    }
  }
}
