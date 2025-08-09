import { User } from '../models/User'
import { Badge } from '../models/Badge'
import { randomUUID } from 'node:crypto'
import { TeamService } from './TeamService'
import { UserService } from './UserService'
import { BadgeService } from './BadgeService'
import { ActivityService } from './ActivityService'
import { ListMetadataOptions } from '../models/App'
import { PRESENCE_EVENT_CATEGORY } from '../constants'
import { TeamMemberService } from './TeamMemberService'
import { NotFoundError, UnauthorizedError } from '@stone-js/http-core'
import { Service, IContainer, isNotEmpty, isEmpty } from '@stone-js/core'
import { IPostRepository } from '../repositories/contracts/IPostRepository'
import { ActivityAssignmentModel, ActivityAssignment, Activity } from '../models/Activity'
import { IActivityAssignmentRepository } from '../repositories/contracts/IActivityAssignmentRepository'

export interface ActivityAssignmentServiceOptions {
  teamService: TeamService
  userService: UserService
  badgeService: BadgeService
  postRepository: IPostRepository
  activityService: ActivityService
  teamMemberService: TeamMemberService
  activityAssignmentRepository: IActivityAssignmentRepository
}

@Service({ alias: 'activityAssignmentService' })
export class ActivityAssignmentService {
  private readonly teamService: TeamService
  private readonly userService: UserService
  private readonly badgeService: BadgeService
  private readonly postRepository: IPostRepository
  private readonly activityService: ActivityService
  private readonly teamMemberService: TeamMemberService
  private readonly activityAssignmentRepository: IActivityAssignmentRepository

  constructor ({ postRepository, teamService, badgeService, userService, activityService, teamMemberService, activityAssignmentRepository }: ActivityAssignmentServiceOptions) {
    this.teamService = teamService
    this.userService = userService
    this.badgeService = badgeService
    this.postRepository = postRepository
    this.activityService = activityService
    this.teamMemberService = teamMemberService
    this.activityAssignmentRepository = activityAssignmentRepository
  }

  static async resolveRouteBinding (key: string, value: any, container: IContainer): Promise<ActivityAssignment | undefined> {
    const service = container.resolve<ActivityAssignmentService>('activityAssignmentService')
    return await service.findBy({ [key]: value })
  }

  async list (limit = 10, page?: number | string): Promise<ListMetadataOptions<ActivityAssignment>> {
    const result = await this.activityAssignmentRepository.list(limit, page)
    const items = await this.toAssignments(result.items)
    return { ...result, items }
  }

  async listBy (conditions: Partial<ActivityAssignmentModel>, limit = 10, page?: number | string): Promise<ListMetadataOptions<ActivityAssignment>> {
    const result = await this.activityAssignmentRepository.listBy(conditions, limit, page)
    const items = await this.toAssignments(result.items)
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

  async assignToMember (missionUuid: string, activityUuid: string, teamUuid: string, teamMemberUuid: string, issuedBy: User): Promise<string | undefined> {
    return await this.create({ missionUuid, activityUuid, teamUuid, teamMemberUuid }, issuedBy)
  }

  async assignToTeam (missionUuid: string, activityUuid: string, teamUuid: string, issuedBy: User): Promise<string | undefined> {
    return await this.create({ missionUuid, activityUuid, teamUuid }, issuedBy)
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
    const teamMember = await this.teamMemberService.findByUuid(assignment.teamMemberUuid ?? '')
    if (assignment.teamUuid !== teamMember?.teamUuid) {
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
    teams.items.forEach(team => {
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

    const totalTeamScores = teams.items.reduce((sum, team) => sum + (team.score ?? 0), 0)

    teams.items.sort((a, b) => b.score - a.score)

    for (const team of teams.items) {
      const members = await this.teamMemberService.listBy({ teamUuid: team.uuid })
      team.captain = members.items.find(member => Array().concat(member.role ?? [])?.includes('captain'))
      team.countMembers = members.total ?? 0
      team.rank = teams.items.findIndex(t => t.uuid === team.uuid) + 1
      team.members = members.items
      team.scorePercentage = totalTeamScores > 0 ? Math.round((team.score / totalTeamScores) * 100) : 0
    }

    const totalPosts = await this.postRepository.count()
    const totalMembers = teams.items.reduce((sum, team) => sum + (team.countMembers ?? 0), 0)

    return {
      totalPosts,
      totalScores,
      totalBadges,
      totalMembers,
      totalPresence,
      lastestBadges,
      totalActivities,
      totalBadgeScores,
      latestactivities,
      teams: teams.items,
      totalActivityScores
    }
  }

  async toAssignment (model: ActivityAssignmentModel): Promise<ActivityAssignment> {
    const team = model.teamUuid ? await this.teamService.findByUuid(model.teamUuid) : undefined
    const badge = model.badgeUuid ? await this.badgeService.findByUuid(model.badgeUuid) : undefined
    const issuedBy = model.issuedByUuid ? await this.userService.findByUuid(model.issuedByUuid) : undefined
    const activity = model.activityUuid ? await this.activityService.findByUuid(model.activityUuid) : undefined
    const validatedBy = model.validatedByUuid ? await this.userService.findByUuid(model.validatedByUuid) : undefined
    const teamMember = model.teamMemberUuid ? await this.teamMemberService.findByUuid(model.teamMemberUuid) : undefined

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

  async toAssignments (model: ActivityAssignmentModel[]): Promise<ActivityAssignment[]> {
    const teamMeta = await this.teamService.list(1000)
    const userMeta = await this.userService.list(1000)
    const badgeMeta = await this.badgeService.list(1000)
    const activityMeta = await this.activityService.list(1000)
    const teamMemberMeta = await this.teamMemberService.list(1000)

    return model.map(item => ({
      ...item,
      team: teamMeta.items.find(v => v.uuid === item.teamUuid),
      badge: badgeMeta.items.find(v => v.uuid === item.badgeUuid),
      issuedBy: userMeta.items.find(v => v.uuid === item.issuedByUuid),
      activity: activityMeta.items.find(v => v.uuid === item.activityUuid),
      validatedBy: userMeta.items.find(v => v.uuid === item.validatedByUuid),
      teamMember: teamMemberMeta.items.find(v => v.uuid === item.teamMemberUuid),
    })).filter(v => isNotEmpty<ActivityAssignment>(v))
  }
}
