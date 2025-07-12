import { User } from '../models/User'
import { randomUUID } from 'node:crypto'
import { NotFoundError } from '@stone-js/http-core'
import { Badge, BadgeModel } from '../models/Badge'
import { ListMetadataOptions } from '../models/App'
import { isNotEmpty, Service, IContainer } from '@stone-js/core'
import { IBadgeRepository } from '../repositories/contracts/IBadgeRepository'

/**
 * Badge Service Options
 */
export interface BadgeServiceOptions {
  badgeRepository: IBadgeRepository
}

/**
 * Badge Service
 */
@Service({ alias: 'badgeService' })
export class BadgeService {
  private readonly badgeRepository: IBadgeRepository

  constructor ({ badgeRepository }: BadgeServiceOptions) {
    this.badgeRepository = badgeRepository
  }

  /**
   * Resolve route binding
   */
  static async resolveRouteBinding (key: string, value: any, container: IContainer): Promise<Badge | undefined> {
    const badgeService = container.resolve<BadgeService>('badgeService')
    return await badgeService.findBy({ [key]: value })
  }

  /**
   * List all badges
   */
  async list (limit: number = 10, page?: number | string): Promise<ListMetadataOptions<Badge>> {
    const result = await this.badgeRepository.list(limit, page)
    result.items = result.items.map(v => this.toBadge(v))
    return result
  }

  /**
   * List badges by conditions
   */
  async listBy (conditions: Partial<BadgeModel>, limit: number = 10, page?: number | string): Promise<ListMetadataOptions<Badge>> {
    const result = await this.badgeRepository.listBy(conditions, limit, page)
    result.items = result.items.map(v => this.toBadge(v))
    return result
  }

  /**
   * Find badge by uuid
   */
  async findByUuid (uuid: string): Promise<Badge | undefined> {
    const model = await this.badgeRepository.findByUuid(uuid)
    if (isNotEmpty<BadgeModel>(model)) return this.toBadge(model)
  }

  /**
   * Find badge by conditions
   */
  async findBy (conditions: Partial<BadgeModel>): Promise<Badge> {
    const model = await this.badgeRepository.findBy(conditions)
    if (isNotEmpty<BadgeModel>(model)) return this.toBadge(model)
    throw new NotFoundError(`Badge not found with conditions: ${JSON.stringify(conditions)}`)
  }

  /**
   * Create badge
   */
  async create (badge: Badge, author: User): Promise<string | undefined> {
    const now = Date.now()
    return await this.badgeRepository.create({
      ...badge,
      authorUuid: author.uuid,
      uuid: randomUUID(),
      createdAt: now,
      updatedAt: now
    })
  }

  /**
   * Create many badges
   */
  async createMany (badges: Badge[], author: User): Promise<Array<string | undefined>> {
    const uuids: Array<string | undefined> = []

    for (const badge of badges) {
      uuids.push(await this.create(badge, author))
    }

    return uuids
  }

  /**
   * Update badge
   */
  async update (badge: Badge, data: Partial<Badge>): Promise<Badge> {
    data.updatedAt = Date.now()
    const model = await this.badgeRepository.update(badge, data)
    if (isNotEmpty<BadgeModel>(model)) return this.toBadge(model)
    throw new NotFoundError(`Badge with ID ${badge.uuid} not found`)
  }

  /**
   * Delete badge
   */
  async delete (badge: Badge): Promise<boolean> {
    return await this.badgeRepository.delete(badge)
  }

  /**
   * Convert BadgeModel to Badge (safe)
   */
  toBadge (model: BadgeModel, author?: User): Badge {
    return {
      ...model,
      author
    }
  }
}
