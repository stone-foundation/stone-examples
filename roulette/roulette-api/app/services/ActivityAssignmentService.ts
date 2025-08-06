import { User } from '../models/User'
import { Badge } from '../models/Badge'
import { randomUUID } from 'node:crypto'
import { TeamService } from './TeamService'
import { UserService } from './UserService'
import { PostService } from './PostService'
import { BadgeService } from './BadgeService'
import { ActivityService } from './ActivityService'
import { ListMetadataOptions } from '../models/App'
import { PRESENCE_EVENT_CATEGORY } from '../constants'
import { NotFoundError, UnauthorizedError } from '@stone-js/http-core'
import { Service, IContainer, isNotEmpty, isEmpty } from '@stone-js/core'
import { ActivityAssignmentModel, ActivityAssignment, Activity } from '../models/Activity'
import { IActivityAssignmentRepository } from '../repositories/contracts/IActivityAssignmentRepository'

export interface ActivityAssignmentServiceOptions {
  teamService: TeamService
  userService: UserService
  postService: PostService
  badgeService: BadgeService
  activityService: ActivityService
  activityAssignmentRepository: IActivityAssignmentRepository
}

@Service({ alias: 'activityAssignmentService' })
export class ActivityAssignmentService {
  private readonly teamService: TeamService
  private readonly userService: UserService
  private readonly postService: PostService
  private readonly badgeService: BadgeService
  private readonly activityService: ActivityService
  private readonly activityAssignmentRepository: IActivityAssignmentRepository

  constructor ({ postService, teamService, badgeService, userService, activityService, activityAssignmentRepository }: ActivityAssignmentServiceOptions) {
    this.teamService = teamService
    this.postService = postService
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
    const items = await Promise.all(result.items.map(async m => await this.toAssignment(m)))
    return { ...result, items }
  }

  async listBy (conditions: Partial<ActivityAssignmentModel>, limit = 10, page?: number | string): Promise<ListMetadataOptions<ActivityAssignment>> {
    const result = await this.activityAssignmentRepository.listBy(conditions, limit, page)
    const items = await Promise.all(result.items.map(async m => await this.toAssignment(m)))
    return { ...result, items }
  }

  async findByUuid (uuid: string): Promise<ActivityAssignment | undefined> {
    const model = await this.activityAssignmentRepository.findByUuid(uuid)
    if (model != null) return await this.toAssignment(model)
  }

  async findBy (conditions: Partial<ActivityAssignmentModel>): Promise<ActivityAssignment> {
    const model = await this.activityAssignmentRepository.findBy(conditions)
    if (model == null) throw new NotFoundError(`Activity assignment not found with ${JSON.stringify(conditions)}`)
    return await this.toAssignment(model)
  }

  async assignToMember (activityUuid: string, teamUuid: string, teamMemberUuid: string, issuedBy: User): Promise<string | undefined> {
    return await this.create({ activityUuid, teamUuid, teamMemberUuid }, issuedBy)
  }

  async assignToTeam (activityUuid: string, teamUuid: string, issuedBy: User): Promise<string | undefined> {
    return await this.create({ activityUuid, teamUuid }, issuedBy)
  }

  async create (assignment: Partial<ActivityAssignment>, author: User): Promise<string | undefined> {
    const now = Date.now()
    return await this.activityAssignmentRepository.create({
      ...assignment,
      issuedAt: now,
      createdAt: now,
      updatedAt: now,
      status: 'pending',
      uuid: randomUUID(),
      issuedByUuid: author.uuid
    } as ActivityAssignmentModel, author)
  }

  async validate (assignment: ActivityAssignment, validator: User): Promise<ActivityAssignment> {
    assignment.status = 'approved'
    assignment.validatedAt = Date.now()
    assignment.validatedByUuid = validator.uuid
    return await this.update(assignment, assignment, validator)
  }

  async contest (assignment: ActivityAssignment, user: User): Promise<ActivityAssignment> {
    if (assignment.teamUuid !== user.teamUuid) {
      throw new UnauthorizedError('Only the team member can contest this assignment')
    }

    assignment.status = 'contested'
    return await this.update(assignment, assignment, user)
  }

  async cancel (assignment: ActivityAssignment, actor: User): Promise<ActivityAssignment> {
    if (assignment.issuedByUuid !== actor.uuid) throw new UnauthorizedError('Only the issuer can cancel')
    assignment.status = 'cancelled'
    return await this.update(assignment, assignment, actor)
  }

  async update (assignment: ActivityAssignment, data: Partial<ActivityAssignment>, author: User): Promise<ActivityAssignment> {
    data.issuedAt = Date.now()
    const model = await this.activityAssignmentRepository.update(assignment, data, author)
    if (isNotEmpty<ActivityAssignment>(model)) return await this.toAssignment(model)
    throw new NotFoundError(`BadgeAssignment with ID ${assignment.uuid} not found`)
  }

  async delete (assignment: ActivityAssignment, author: User): Promise<boolean> {
    return await this.activityAssignmentRepository.delete(assignment, author)
  }

  async statistics (conditions?: Partial<ActivityAssignmentModel>): Promise<Record<string, unknown>> {
    let meta: ListMetadataOptions<ActivityAssignmentModel>

    if (isEmpty(conditions)) {
      meta = await this.activityAssignmentRepository.list(undefined, undefined)
    } else {
      meta = await this.activityAssignmentRepository.listBy(conditions, undefined, undefined)
    }

    const assignments = meta
      .items
      .filter(item => item.status === 'approved' && item.activityUuid)
      .sort((a, b) => Number(b.validatedAt) - Number(a.validatedAt))

    const teams = await this.teamService.list(1000)

    const latestactivities = (await Promise.all(
      assignments
        .map(item => item.activityUuid)
        .filter(v => isNotEmpty<string>(v))
        .map(async uuid => await this.activityService.findByUuid(uuid))
    )).filter(activity => isNotEmpty<Activity>(activity))

    const lastestBadges = (await Promise.all(
      latestactivities
        .map(item => item.badgeUuid)
        .filter(v => isNotEmpty<string>(v))
        .map(async uuid => await this.badgeService.findByUuid(uuid))
    )).filter(badge => isNotEmpty<Badge>(badge))

    const totalBadges = lastestBadges.length
    const totalActivities = latestactivities.length
    const totalBadgeScores = lastestBadges.reduce((sum, badge) => sum + Math.abs(badge?.score ?? 0), 0)
    const totalActivityScores = latestactivities.reduce((sum, activity) => {
      const score = Math.abs(activity.score ?? 0)
      return activity?.impact === 'negative' ? sum - score : sum + score
    }, 0)
    const totalScores = totalBadgeScores + totalActivityScores
    const totalPresence = latestactivities.filter(activity => activity.category === PRESENCE_EVENT_CATEGORY).length

    // Per team statistics
    teams.forEach(team => {
      const teamAssigns = assignments.filter(item => item.teamUuid === team.uuid)
      const teamBadges = teamAssigns
        .map(item => lastestBadges.find(v => v.uuid === item.badgeUuid))
        .filter(v => isNotEmpty<Badge>(v))
      const teamActivities = teamAssigns
        .map(item => latestactivities.find(v => v.uuid === item.activityUuid))
        .filter(v => isNotEmpty<Activity>(v))
      const totalBadgeScores = teamBadges.reduce((sum, badge) => sum + Math.abs(badge?.score ?? 0), 0)
      const totalActivityScores = teamActivities.reduce((sum, activity) => {
        const score = Math.abs(activity.score ?? 0)
        return activity?.impact === 'negative' ? sum - score : sum + score
      }, 0)
      team.badges = teamBadges
      team.activities = teamActivities
      team.countBadges = teamBadges.length
      team.countActivities = teamActivities.length
      team.score = totalBadgeScores + totalActivityScores
      team.countPresences = teamActivities.filter(v => v.category === PRESENCE_EVENT_CATEGORY).length
    })

    const totalTeamScores = teams.reduce((sum, team) => sum + (team.score ?? 0), 0)

    teams.sort((a, b) => b.score - a.score)

    for (const team of teams) {
      const users = await this.userService.listBy({ teamUuid: team.uuid })
      team.captain = users.find(member => Array().concat(member.roles ?? [])?.includes('captain'))
      team.countMembers = users.length
      team.rank = teams.findIndex(t => t.uuid === team.uuid) + 1
      team.members = users.map(v => this.teamService.toTeamMember(v))
      team.scorePercentage = totalTeamScores > 0 ? Math.round((team.score / totalTeamScores) * 100) : 0
    }

    const totalPosts = await this.postService.count()
    const totalMembers = teams.reduce((sum, team) => sum + (team.countMembers ?? 0), 0)

    return {
      teams,
      totalPosts,
      totalScores,
      totalBadges,
      totalMembers,
      totalPresence,
      lastestBadges,
      totalActivities,
      totalBadgeScores,
      latestactivities,
      totalActivityScores
    }
  }

  async toAssignment (model: ActivityAssignmentModel): Promise<ActivityAssignment> {
    const team = model.teamUuid ? await this.teamService.findByUuid(model.teamUuid) : undefined
    const badge = model.badgeUuid ? await this.badgeService.findByUuid(model.badgeUuid) : undefined
    const issuedBy = model.issuedByUuid ? await this.userService.findByUuid(model.issuedByUuid) : undefined
    const activity = model.activityUuid ? await this.activityService.findByUuid(model.activityUuid) : undefined
    const teamMember = model.teamMemberUuid ? await this.userService.findByUuid(model.teamMemberUuid) : undefined
    const validatedBy = model.validatedByUuid ? await this.userService.findByUuid(model.validatedByUuid) : undefined

    if(isEmpty(activity)) {
      throw new NotFoundError(`Activity with UUID ${model.activityUuid} not found`)
    }

    return {
      ...model,
      team,
      badge,
      issuedBy,
      activity,
      teamMember,
      validatedBy
    }
  }
}
