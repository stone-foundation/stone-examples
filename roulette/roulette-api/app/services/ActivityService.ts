import { randomUUID } from 'node:crypto'
import { NotFoundError } from '@stone-js/http-core'
import { ListMetadataOptions } from '../models/App'
import { ActivityModel, Activity } from '../models/Activity'
import { isNotEmpty, Service, IContainer } from '@stone-js/core'
import { IActivityRepository } from '../repositories/contracts/IActivityRepository'

export interface ActivityServiceOptions {
  activityRepository: IActivityRepository
}

@Service({ alias: 'activityService' })
export class ActivityService {
  private readonly activityRepository: IActivityRepository

  constructor ({ activityRepository }: ActivityServiceOptions) {
    this.activityRepository = activityRepository
  }

  static async resolveRouteBinding (key: string, value: any, container: IContainer): Promise<Activity | undefined> {
    const service = container.resolve<ActivityService>('activityService')
    return await service.findBy({ [key]: value })
  }

  async list (limit: number = 10, page?: number | string): Promise<ListMetadataOptions<Activity>> {
    const result = await this.activityRepository.list(limit, page)
    return { ...result, items: result.items.map(this.toActivity) }
  }

  async listBy (conditions: Partial<ActivityModel>, limit: number = 10, page?: number | string): Promise<ListMetadataOptions<Activity>> {
    const result = await this.activityRepository.listBy(conditions, limit, page)
    return { ...result, items: result.items.map(this.toActivity) }
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

  async create (data: Partial<ActivityModel>): Promise<string | undefined> {
    const now = Date.now()
    return await this.activityRepository.create({
      ...data,
      uuid: randomUUID(),
      createdAt: now,
      updatedAt: now
    } as ActivityModel)
  }

  async update (activity: ActivityModel, data: Partial<ActivityModel>): Promise<Activity> {
    data.updatedAt = Date.now()
    const model = await this.activityRepository.update(activity, data)
    if (isNotEmpty<ActivityModel>(model)) return this.toActivity(model)
    throw new NotFoundError(`Activity with ID ${activity.uuid} not found`)
  }

  async delete (activity: ActivityModel): Promise<boolean> {
    return await this.activityRepository.delete(activity)
  }

  toActivity (model: ActivityModel): Activity {
    return { ...model } as Activity
  }
}