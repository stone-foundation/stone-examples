import { User } from '../models/User'
import { randomUUID } from 'node:crypto'
import { NotFoundError } from '@stone-js/http-core'
import { ListMetadataOptions } from '../models/App'
import { ActivityModel, Activity } from '../models/Activity'
import { isNotEmpty, Service, IContainer } from '@stone-js/core'
import { IBadgeRepository } from '../repositories/contracts/IBadgeRepository'
import { IActivityRepository } from '../repositories/contracts/IActivityRepository'

export interface ActivityServiceOptions {
  badgeRepository: IBadgeRepository
  activityRepository: IActivityRepository
}

@Service({ alias: 'activityService' })
export class ActivityService {
  private readonly badgeRepository: IBadgeRepository
  private readonly activityRepository: IActivityRepository

  constructor ({ activityRepository, badgeRepository }: ActivityServiceOptions) {
    this.badgeRepository = badgeRepository
    this.activityRepository = activityRepository
  }

  static async resolveRouteBinding (key: string, value: any, container: IContainer): Promise<Activity | undefined> {
    const service = container.resolve<ActivityService>('activityService')
    return await service.findBy({ [key]: value })
  }

  async list (limit: number = 10, page?: number | string): Promise<ListMetadataOptions<Activity>> {
    const result = await this.activityRepository.list(limit, page)
    const items = await this.toActivities(result.items)
    return { ...result, items }
  }

  async listBy (conditions: Partial<ActivityModel>, limit: number = 10, page?: number | string): Promise<ListMetadataOptions<Activity>> {
    const result = await this.activityRepository.listBy(conditions, limit, page)
    const items = await this.toActivities(result.items)
    return { ...result, items }
  }

  async findByUuid (uuid: string): Promise<Activity | undefined> {
    const model = await this.activityRepository.findByUuid(uuid)
    if (isNotEmpty<ActivityModel>(model)) return this.toActivity(model)
  }

  async findBy (conditions: Partial<ActivityModel>): Promise<Activity> {
    const model = await this.activityRepository.findBy(conditions)
    if (isNotEmpty<ActivityModel>(model)) return this.toActivity(model)
    throw new NotFoundError(`Activity not found with conditions: ${JSON.stringify(conditions)}`)
  }

  async create (data: Partial<ActivityModel>, author: User): Promise<string | undefined> {
    const now = Date.now()
    return await this.activityRepository.create({
      ...data,
      createdAt: now,
      updatedAt: now,
      uuid: randomUUID(),
      badgeUuid: isNotEmpty<string>(data.badgeUuid) ? data.badgeUuid : undefined
    } as ActivityModel, author)
  }

  async createMany (activities: ActivityModel[], author: User): Promise<Array<string | undefined>> {
    const uuids: Array<string | undefined> = []

    for (const activity of activities) {
      uuids.push(await this.create(activity, author))
    }

    return uuids
  }

  async update (activity: ActivityModel, data: Partial<ActivityModel>, author: User): Promise<Activity> {
    data.updatedAt = Date.now()
    const model = await this.activityRepository.update(activity, data, author)
    if (isNotEmpty<ActivityModel>(model)) return this.toActivity(model)
    throw new NotFoundError(`Activity with ID ${activity.uuid} not found`)
  }

  async delete (activity: ActivityModel, author: User): Promise<boolean> {
    return await this.activityRepository.delete(activity, author)
  }

  async toActivity (model: ActivityModel): Promise<Activity> {
    const badge = model.badgeUuid ? await this.badgeRepository.findByUuid(model.badgeUuid) : undefined
    return { ...model, badge } as Activity
  }

  async toActivities (model: ActivityModel[]): Promise<Activity[]> {
    const badgeMeta = await this.badgeRepository.list(1000)
    return model.map(item => ({ ...item, badge: badgeMeta.items.find(badge => badge.uuid === item.badgeUuid) }))
  }
}
